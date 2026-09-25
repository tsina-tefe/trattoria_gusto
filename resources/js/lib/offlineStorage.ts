/**
 * Offline storage helpers for evaluations
 */

import { db, STORES } from './indexedDB';
import { syncQueue } from './syncQueue';

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

// Singleton instance
export const offlineEvaluation = new OfflineEvaluationService();
