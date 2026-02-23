import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
    const isAdmin = mode === 'admin' || mode === 'development';
    const isPortal = mode === 'portal';

    const input: Record<string, string> = {};
    if (isAdmin || (!isPortal)) {
        input.admin = path.resolve(__dirname, 'src/admin/main.tsx');
    }
    if (isPortal || (!isAdmin) || mode === 'development') {
        input.portal = path.resolve(__dirname, 'src/portal/main.tsx');
    }

    return {
        plugins: [react()],
        resolve: {
            alias: {
                '@shared': path.resolve(__dirname, 'src/shared'),
                '@admin': path.resolve(__dirname, 'src/admin'),
                '@portal': path.resolve(__dirname, 'src/portal'),
            },
        },
        build: {
            outDir: 'assets',
            emptyOutDir: true,
            manifest: true,
            rollupOptions: {
                input,
                output: {
                    entryFileNames: '[name]/[name].js',
                    chunkFileNames: '[name]/chunks/[name]-[hash].js',
                    assetFileNames: (assetInfo) => {
                        if (assetInfo.name?.endsWith('.css')) {
                            return '[name]/[name][extname]';
                        }
                        return '[name]/assets/[name]-[hash][extname]';
                    },
                },
            },
        },
        define: {
            'process.env.NODE_ENV': JSON.stringify(mode === 'development' ? 'development' : 'production'),
        },
    };
});
