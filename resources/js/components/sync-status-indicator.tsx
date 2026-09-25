/**
 * Sync Status Indicator Component
 */

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useOffline } from '@/hooks/use-offline';
import { useSync } from '@/hooks/use-sync';
import { Cloud, CloudOff, RefreshCw, Loader2, CheckCircle2, WifiOff } from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

export function SyncStatusIndicator() {
    const { isOffline } = useOffline();
    const { isSyncing, pendingCount, lastSyncTime, manualSync } = useSync();

    const formatLastSync = (timestamp: number | null) => {
        if (!timestamp) return 'Never';
        const seconds = Math.floor((Date.now() - timestamp) / 1000);
        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        return `${Math.floor(seconds / 86400)}d ago`;
    };

    const getStatusInfo = () => {
        if (isOffline) {
            return {
                icon: <WifiOff className="h-4 w-4" />,
                text: 'Offline Mode',
                color: 'bg-orange-500',
                tooltip: `You're offline. ${pendingCount} changes pending sync.`,
            };
        }

        if (isSyncing) {
            return {
                icon: <Loader2 className="h-4 w-4 animate-spin" />,
                text: 'Syncing...',
                color: 'bg-blue-500',
                tooltip: 'Syncing your changes with the server...',
            };
        }

        if (pendingCount > 0) {
            return {
                icon: <CloudOff className="h-4 w-4" />,
                text: `${pendingCount} Pending`,
                color: 'bg-yellow-500',
                tooltip: `${pendingCount} changes waiting to sync`,
            };
        }

        return {
            icon: <CheckCircle2 className="h-4 w-4" />,
            text: 'Synced',
            color: 'bg-green-500',
            tooltip: `All changes synced. Last: ${formatLastSync(lastSyncTime)}`,
        };
    };

    const status = getStatusInfo();

    return (
        <div className="flex items-center gap-2">
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Badge
                            variant="outline"
                            className="flex items-center gap-1.5 cursor-pointer"
                        >
                            <span className={`h-2 w-2 rounded-full ${status.color}`} />
                            {status.icon}
                            <span className="text-xs">{status.text}</span>
                        </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{status.tooltip}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>

            {!isOffline && pendingCount > 0 && !isSyncing && (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={manualSync}
                                className="h-8 w-8 p-0"
                            >
                                <RefreshCw className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Sync now</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            )}
        </div>
    );
}
