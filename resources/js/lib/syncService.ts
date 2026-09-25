/**
 * Sync Service for background synchronization
 */

import axios from 'axios';
import { db, STORES, SyncQueueItem } from './indexedDB';
import { syncQueue } from './syncQueue';

export class SyncService {
    private isSyncing = false;
    private syncInterval: number | null = null;

    /**
     * Initialize sync service
     */
    async init() {
        // Listen for online event
        window.addEventListener('online', () => {
            console.log('Device back online, triggering sync...');
            this.syncAll();
        });

        // Periodic sync check (every 5 minutes when online)
        this.syncInterval = window.setInterval(
            () => {
                if (navigator.onLine) {
                    this.syncAll();
                }
            },
            5 * 60 * 1000,
        );

        // Initial sync if online
        if (navigator.onLine) {
            setTimeout(() => this.syncAll(), 2000);
        }
    }

    /**
     * Sync all pending items
     */
    async syncAll(): Promise<void> {
        if (this.isSyncing) {
            console.log('Sync already in progress, skipping...');
            return;
        }

        if (!navigator.onLine) {
            console.log('Device offline, skipping sync');
            return;
        }

        this.isSyncing = true;
        console.log('Starting sync process...');

        try {
            const pendingItems = await syncQueue.getPendingItems();
            console.log(`Found ${pendingItems.length} pending items to sync`);

            for (const item of pendingItems) {
                if (item.id) {
                    await this.syncItem(item);
                }
            }

            // Clean up completed items
            await syncQueue.clearCompleted();
            console.log('Sync process completed');

            // Dispatch custom event for UI updates
            window.dispatchEvent(new CustomEvent('sync-completed', { detail: { itemsSync: pendingItems.length } }));
        } catch (error) {
            console.error('Sync process failed:', error);
        } finally {
            this.isSyncing = false;
        }
    }

    /**
     * Sync a single item
     */
    private async syncItem(item: SyncQueueItem): Promise<void> {
        if (!item.id) return;

        try {
            await syncQueue.updateItemStatus(item.id, 'syncing');

            switch (item.entity) {
                case STORES.INVENTORY_COUNTS:
                    await this.syncInventoryCount(item);
                    break;
                case STORES.EVALUATIONS:
                    await this.syncEvaluation(item);
                    break;
                default:
                    throw new Error(`Unknown entity type: ${item.entity}`);
            }

            await syncQueue.updateItemStatus(item.id, 'completed');
            console.log(`Successfully synced item ${item.id}`);
        } catch (error: any) {
            console.error(`Failed to sync item ${item.id}:`, error);
            await syncQueue.updateItemStatus(
                item.id,
                'failed',
                error.message || 'Unknown error',
            );
        }
    }

    /**
     * Sync inventory count item
     */
    private async syncInventoryCount(item: SyncQueueItem): Promise<void> {
        const endpoint = '/sync/inventory-counts';

        try {
            const response = await axios.post(endpoint, {
                type: item.type,
                data: item.data,
                timestamp: item.timestamp,
            });

            // Update local storage with server response
            if (response.data.id && item.data.localId) {
                const localItem = await db.get(STORES.INVENTORY_COUNTS, item.data.localId);
                if (localItem) {
                    await db.put(STORES.INVENTORY_COUNTS, {
                        ...localItem,
                        id: response.data.id,
                        synced: true,
                        syncedAt: Date.now(),
                    });
                }
            }
        } catch (error: any) {
            // Handle conflict (409) - item already exists
            if (error.response?.status === 409) {
                console.log('Item already synced, marking as completed');
                if (item.data.localId) {
                    const localItem = await db.get(STORES.INVENTORY_COUNTS, item.data.localId);
                    if (localItem) {
                        await db.put(STORES.INVENTORY_COUNTS, {
                            ...localItem,
                            synced: true,
                            syncedAt: Date.now(),
                        });
                    }
                }
                return;
            }
            throw error;
        }
    }

    /**
     * Sync evaluation item
     */
    private async syncEvaluation(item: SyncQueueItem): Promise<void> {
        const endpoint = '/sync/evaluations';

        try {
            const response = await axios.post(endpoint, {
                type: item.type,
                data: item.data,
                timestamp: item.timestamp,
            });

            // Update local storage with server response
            if (response.data.id && item.data.localId) {
                const localItem = await db.get(STORES.EVALUATIONS, item.data.localId);
                if (localItem) {
                    await db.put(STORES.EVALUATIONS, {
                        ...localItem,
                        id: response.data.id,
                        synced: true,
                        syncedAt: Date.now(),
                    });
                }
            }
        } catch (error: any) {
            // Handle conflict
            if (error.response?.status === 409) {
                console.log('Evaluation already synced, marking as completed');
                if (item.data.localId) {
                    const localItem = await db.get(STORES.EVALUATIONS, item.data.localId);
                    if (localItem) {
                        await db.put(STORES.EVALUATIONS, {
                            ...localItem,
                            synced: true,
                            syncedAt: Date.now(),
                        });
                    }
                }
                return;
            }
            throw error;
        }
    }

    /**
     * Manually trigger sync
     */
    async manualSync(): Promise<void> {
        console.log('Manual sync triggered');
        await this.syncAll();
    }

    /**
     * Get sync status
     */
    getSyncStatus(): { isSyncing: boolean; pendingCount: number } {
        return {
            isSyncing: this.isSyncing,
            pendingCount: 0, // Will be updated by caller
        };
    }

    /**
     * Stop sync service
     */
    destroy(): void {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
    }
}

// Singleton instance
export const syncService = new SyncService();
