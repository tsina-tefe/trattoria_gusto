/**
 * Offline storage helpers for inventory counts and evaluations
 */

import { db, STORES } from './indexedDB';
import { syncQueue } from './syncQueue';

export interface OfflineInventoryCount {
    localId?: number;
    id?: number;
    inventory_period_id: number;
    product_id: number;
    branch_id: number;
    child_category_id: number;
    count: number;
    unit_price?: number;
    total_price?: number;
    synced: boolean;
    syncedAt?: number;
    createdAt: number;
    updatedAt: number;
}

export interface OfflineEvaluationResponse {
    localId?: number;
    id?: number;
    evaluation_id: number;
    evaluates_id?: number;
    responses: Array<{
        question_id: number;
        response: string | number;
    }>;
    synced: boolean;
    syncedAt?: number;
    createdAt: number;
    updatedAt: number;
}

/**
 * Inventory Count Offline Operations
 */
export class OfflineInventoryService {
    /**
     * Save inventory count (works offline)
     */
    async saveCount(data: Omit<OfflineInventoryCount, 'localId' | 'synced' | 'createdAt' | 'updatedAt'>): Promise<number> {
        const now = Date.now();
        
        // Check if count already exists
        const existing = await this.getCountByProductAndPeriod(
            data.product_id,
            data.inventory_period_id,
            data.branch_id
        );

        const countData: OfflineInventoryCount = {
            ...data,
            synced: false,
            createdAt: existing?.createdAt || now,
            updatedAt: now,
        };

        let localId: number;

        if (existing) {
            // Update existing
            countData.localId = existing.localId;
            countData.id = existing.id;
            localId = (await db.put(STORES.INVENTORY_COUNTS, countData)) as number;
            
            // Add to sync queue
            await syncQueue.addToQueue('update', STORES.INVENTORY_COUNTS, {
                ...countData,
                localId,
            });
        } else {
            // Create new
            localId = (await db.add(STORES.INVENTORY_COUNTS, countData)) as number;
            
            // Add to sync queue
            await syncQueue.addToQueue('create', STORES.INVENTORY_COUNTS, {
                ...countData,
                localId,
            });
        }

        return localId;
    }

    /**
     * Get count by product and period
     */
    async getCountByProductAndPeriod(
        productId: number,
        periodId: number,
        branchId: number
    ): Promise<OfflineInventoryCount | null> {
        const allCounts = await db.getAll<OfflineInventoryCount>(STORES.INVENTORY_COUNTS);
        const count = allCounts.find(
            (c) =>
                c.product_id === productId &&
                c.inventory_period_id === periodId &&
                c.branch_id === branchId
        );
        return count || null;
    }

    /**
     * Get all counts for a period and branch
     */
    async getCountsByPeriodAndBranch(
        periodId: number,
        branchId: number
    ): Promise<OfflineInventoryCount[]> {
        const allCounts = await db.getAll<OfflineInventoryCount>(STORES.INVENTORY_COUNTS);
        return allCounts.filter(
            (c) => c.inventory_period_id === periodId && c.branch_id === branchId
        );
    }

    /**
     * Get unsynced counts
     */
    async getUnsyncedCounts(): Promise<OfflineInventoryCount[]> {
        return db.getAllByIndex<OfflineInventoryCount>(STORES.INVENTORY_COUNTS, 'synced', false);
    }

    /**
     * Delete count (works offline)
     */
    async deleteCount(localId: number): Promise<void> {
        const count = await db.get<OfflineInventoryCount>(STORES.INVENTORY_COUNTS, localId);
        
        if (count) {
            if (count.synced && count.id) {
                // If already synced, add delete to queue
                await syncQueue.addToQueue('delete', STORES.INVENTORY_COUNTS, {
                    id: count.id,
                });
            }
            // Delete from local storage
            await db.delete(STORES.INVENTORY_COUNTS, localId);
        }
    }

    /**
     * Clear all local counts
     */
    async clearAll(): Promise<void> {
        await db.clear(STORES.INVENTORY_COUNTS);
    }
}

/**
 * Evaluation Offline Operations
 */
export class OfflineEvaluationService {
    /**
     * Save evaluation response (works offline)
     */
    async saveResponse(data: Omit<OfflineEvaluationResponse, 'localId' | 'synced' | 'createdAt' | 'updatedAt'>): Promise<number> {
        const now = Date.now();

        // Check if response already exists
        const existing = await this.getResponseByEvaluation(data.evaluation_id);

        const responseData: OfflineEvaluationResponse = {
            ...data,
            synced: false,
            createdAt: existing?.createdAt || now,
            updatedAt: now,
        };

        let localId: number;

        if (existing) {
            // Update existing
            responseData.localId = existing.localId;
            responseData.id = existing.id;
            localId = (await db.put(STORES.EVALUATIONS, responseData)) as number;
            
            // Add to sync queue
            await syncQueue.addToQueue('update', STORES.EVALUATIONS, {
                ...responseData,
                localId,
            });
        } else {
            // Create new
            localId = (await db.add(STORES.EVALUATIONS, responseData)) as number;
            
            // Add to sync queue
            await syncQueue.addToQueue('create', STORES.EVALUATIONS, {
                ...responseData,
                localId,
            });
        }

        return localId;
    }

    /**
     * Get response by evaluation ID
     */
    async getResponseByEvaluation(evaluationId: number): Promise<OfflineEvaluationResponse | null> {
        const allResponses = await db.getAll<OfflineEvaluationResponse>(STORES.EVALUATIONS);
        const response = allResponses.find((r) => r.evaluation_id === evaluationId);
        return response || null;
    }

    /**
     * Get unsynced responses
     */
    async getUnsyncedResponses(): Promise<OfflineEvaluationResponse[]> {
        return db.getAllByIndex<OfflineEvaluationResponse>(STORES.EVALUATIONS, 'synced', false);
    }

    /**
     * Clear all local responses
     */
    async clearAll(): Promise<void> {
        await db.clear(STORES.EVALUATIONS);
    }
}

// Singleton instances
export const offlineInventory = new OfflineInventoryService();
export const offlineEvaluation = new OfflineEvaluationService();
