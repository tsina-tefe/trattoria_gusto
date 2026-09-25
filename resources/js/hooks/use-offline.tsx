/**
 * Offline detection hook and context
 */

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface OfflineContextType {
    isOffline: boolean;
    isOnline: boolean;
}

const OfflineContext = createContext<OfflineContextType>({
    isOffline: !navigator.onLine,
    isOnline: navigator.onLine,
});

export function OfflineProvider({ children }: { children: ReactNode }) {
    const [isOffline, setIsOffline] = useState(!navigator.onLine);

    useEffect(() => {
        const handleOnline = () => {
            console.log('Network: Online');
            setIsOffline(false);
        };

        const handleOffline = () => {
            console.log('Network: Offline');
            setIsOffline(true);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    return (
        <OfflineContext.Provider value={{ isOffline, isOnline: !isOffline }}>
            {children}
        </OfflineContext.Provider>
    );
}

export function useOffline() {
    const context = useContext(OfflineContext);
    if (context === undefined) {
        throw new Error('useOffline must be used within an OfflineProvider');
    }
    return context;
}
