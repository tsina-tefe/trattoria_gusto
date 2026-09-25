import '../css/app.css';
import './echo';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { initializeTheme } from './hooks/use-appearance';
import { OfflineProvider } from './hooks/use-offline';
import { syncService } from './lib/syncService';
import { registerSW } from 'virtual:pwa-register';

const appName = 'Kaldis coffee';

createInertiaApp({
    title: (title) => title ? `${title} - ${appName}` : appName,
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <OfflineProvider>
                <App {...props} />
            </OfflineProvider>
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();

// Initialize sync service
syncService.init().then(() => {
    console.log('Sync service initialized');
}).catch((error) => {
    console.error('Failed to initialize sync service:', error);
});

// Register service worker for PWA
if ('serviceWorker' in navigator) {
    registerSW({
        immediate: true,
        onRegisteredSW(swUrl, registration) {
            console.log('Service Worker registered:', swUrl);

            // Check for updates every hour
            if (registration) {
                setInterval(() => {
                    registration.update();
                }, 60 * 60 * 1000);
            }
        },
        onOfflineReady() {
            console.log('App is ready for offline use');
        },
        onNeedRefresh() {
            if (confirm('New content available. Reload to update?')) {
                window.location.reload();
            }
        },
        onRegisterError(error) {
            console.error('Service Worker registration error:', error);
        },
    });
}
