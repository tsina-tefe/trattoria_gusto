/**
 * Offline Banner Component
 */

import { Alert, AlertDescription } from '@/components/ui/alert';
import { useOffline } from '@/hooks/use-offline';
import { WifiOff, Wifi } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';

export function OfflineBanner() {
    const { isOffline, isOnline } = useOffline();
    const [showOnlineBanner, setShowOnlineBanner] = useState(false);

    useEffect(() => {
        if (isOnline && showOnlineBanner) {
            // Auto-hide online banner after 3 seconds
            const timer = setTimeout(() => {
                setShowOnlineBanner(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [isOnline, showOnlineBanner]);

    // Show the online banner only when we transition from offline -> online
    const prevIsOffline = useRef<boolean | null>(null);

    useEffect(() => {
        if (prevIsOffline.current === null) {
            // initialize previous state
            prevIsOffline.current = isOffline;
            return;
        }

        // If we were offline previously and now we're online, show the banner
        if (prevIsOffline.current === true && !isOffline) {
            setShowOnlineBanner(true);
        }

        prevIsOffline.current = isOffline;
    }, [isOffline]);

    if (isOffline) {
        return (
            <Alert className="rounded-none border-x-0 border-t-0 bg-orange-50 dark:bg-orange-950">
                <WifiOff className="h-4 w-4" />
                <AlertDescription>
                    You're currently offline. Your changes will be saved locally and synced when
                    you're back online.
                </AlertDescription>
            </Alert>
        );
    }

    if (showOnlineBanner) {
        return (
            <Alert className="rounded-none border-x-0 border-t-0 bg-green-50 dark:bg-green-950">
                <Wifi className="h-4 w-4" />
                <AlertDescription>
                    You're back online! Your changes are being synced.
                </AlertDescription>
            </Alert>
        );
    }

    return null;
}
