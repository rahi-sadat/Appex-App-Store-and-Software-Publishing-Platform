import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';

export default defineConfig({
    plugins: [
        laravel({
           
            input: [
                'resources/css/app.css', 
                'resources/css/pages/home.css',
                'resources/css/pages/discover.css',
                'resources/css/pages/about.css',
                'resources/css/pages/auth.css',
                'resources/css/pages/developer.css',
                'resources/css/pages/admin.css',
                'resources/css/pages/api.css',
                'resources/css/pages/user-dashboard.css',
                'resources/js/core.js',
                'resources/js/marketplace.js',
                'resources/js/developer.js',
                'resources/js/admin.js'
            ],
            refresh: true, // Auto-refreshes your browser when you save a blade file
        }),
    ],
});