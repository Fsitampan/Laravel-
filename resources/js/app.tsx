import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { initializeTheme } from './hooks/use-appearance';
import { AuthProvider } from './components/AuthContext';
import { BPSProvider } from './components/BPSContext';

const appName = import.meta.env.VITE_APP_NAME || 'Rehan';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => resolvePageComponent(`./Pages/${name}.tsx`, import.meta.glob('./Pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <AuthProvider>
                <BPSProvider>
                    <App {...props} />
                </BPSProvider>
            </AuthProvider>
        );
    },
    progress: {
        color: '#4B5563',
        showSpinner: true,
    },
});

initializeTheme();