/**
 * Sync Queue Manager for offline operations
 */

import { db, STORES, SyncQueueItem } from './indexedDB';

export class SyncQueueManager {
    /**
     * Add an operation to the sync queue
     */
    async addToQueue(
        type: SyncQueueItem['type'],
        entity: SyncQueueItem['entity'],
        data: any,
    ): Promise<number> {
        const item: SyncQueueItem = {
            type,
            entity,
            data,
            timestamp: Date.now(),
            status: 'pending',
            attempts: 0,
        };

        const id = await db.add(STORES.SYNC_QUEUE, item);
        console.log(`Added to sync queue [${type}]:`, entity, data);
        return id as number;
    }

    /**
     * Get all pending items in the queue
     */
    async getPendingItems(): Promise<SyncQueueItem[]> {
        const items = await db.getAllByIndex<SyncQueueItem>(STORES.SYNC_QUEUE, 'status', 'pending');
        return items.sort((a, b) => a.timestamp - b.timestamp);
    }

    /**
     * Get all items in the queue
     */
    async getAllItems(): Promise<SyncQueueItem[]> {
        return db.getAll<SyncQueueItem>(STORES.SYNC_QUEUE);
    }

    /**
     * Update item status
     */
    async updateItemStatus(
        id: number,
        status: SyncQueueItem['status'],
        error?: string,
    ): Promise<void> {
        const item = await db.get<SyncQueueItem>(STORES.SYNC_QUEUE, id);
        if (item) {
            item.status = status;
            item.attempts += 1;
            if (error) {
                item.error = error;
            }
            await db.put(STORES.SYNC_QUEUE, item);
        }
    }

    /**
     * Remove an item from the queue
     */
    async removeItem(id: number): Promise<void> {
        await db.delete(STORES.SYNC_QUEUE, id);
    }

    /**
     * Clear all completed items
     */
    async clearCompleted(): Promise<void> {
        const allItems = await db.getAll<SyncQueueItem>(STORES.SYNC_QUEUE);
        for (const item of allItems) {
            if (item.id && item.status === 'completed') {
                await db.delete(STORES.SYNC_QUEUE, item.id);
            }
        }
    }

    /**
     * Get count of pending items
     */
    async getPendingCount(): Promise<number> {
        const items = await this.getPendingItems();
        return items.length;
    }

    /**
     * Retry failed items (reset to pending)
     */
    async retryFailed(): Promise<void> {
        const allItems = await db.getAll<SyncQueueItem>(STORES.SYNC_QUEUE);
        for (const item of allItems) {
            if (item.id && item.status === 'failed' && item.attempts < 5) {
                item.status = 'pending';
                await db.put(STORES.SYNC_QUEUE, item);
            }
        }
    }

    /**
     * Clear all items from the queue
     */
    async clearAll(): Promise<void> {
        await db.clear(STORES.SYNC_QUEUE);
    }
}

// Singleton instance
export const syncQueue = new SyncQueueManager();
