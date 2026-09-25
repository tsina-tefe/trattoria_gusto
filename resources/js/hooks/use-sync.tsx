/**
 * Sync status hook
 */

import { useEffect, useState } from 'react';
import { syncQueue } from '@/lib/syncQueue';
import { syncService } from '@/lib/syncService';

export interface SyncStatus {
    isSyncing: boolean;
    pendingCount: number;
    lastSyncTime: number | null;
}

export function useSync() {
    const [status, setStatus] = useState<SyncStatus>({
        isSyncing: false,
        pendingCount: 0,
        lastSyncTime: null,
    });

    const updateStatus = async () => {
        const pendingCount = await syncQueue.getPendingCount();
        const syncStatus = syncService.getSyncStatus();
        
        setStatus((prev) => ({
            ...prev,
            isSyncing: syncStatus.isSyncing,
            pendingCount,
        }));
    };

    useEffect(() => {
        // Initial status check
        updateStatus();

        // Listen for sync events
        const handleSyncStart = () => {
            setStatus((prev) => ({ ...prev, isSyncing: true }));
        };

        const handleSyncComplete = () => {
            setStatus((prev) => ({
                ...prev,
                isSyncing: false,
                lastSyncTime: Date.now(),
            }));
            updateStatus();
        };

        window.addEventListener('sync-started', handleSyncStart);
        window.addEventListener('sync-completed', handleSyncComplete);

        // Periodic status update
        const interval = setInterval(updateStatus, 10000); // Every 10 seconds

        return () => {
            window.removeEventListener('sync-started', handleSyncStart);
            window.removeEventListener('sync-completed', handleSyncComplete);
            clearInterval(interval);
        };
    }, []);

    const manualSync = async () => {
        await syncService.manualSync();
        await updateStatus();
    };

    return {
        ...status,
        manualSync,
    };
}
