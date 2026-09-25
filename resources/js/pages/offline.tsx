import { Head } from '@inertiajs/react';
import { WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Offline() {
    const handleRetry = () => {
        window.location.reload();
    };

    return (
        <>
            <Head title="You're Offline" />
            <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
                <div className="text-center">
                    <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                        <WifiOff className="h-12 w-12 text-gray-400 dark:text-gray-500" />
                    </div>
                    <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
                        You're Offline
                    </h1>
                    <p className="mb-6 text-gray-600 dark:text-gray-400 max-w-md">
                        It looks like you've lost your internet connection. 
                        Please check your connection and try again.
                    </p>
                    <Button onClick={handleRetry} className="gap-2">
                        <RefreshCw className="h-4 w-4" />
                        Try Again
                    </Button>
                </div>
                <div className="mt-8 text-sm text-gray-500 dark:text-gray-400">
                    <p>Some features may be available offline once cached.</p>
                </div>
            </div>
        </>
    );
}
