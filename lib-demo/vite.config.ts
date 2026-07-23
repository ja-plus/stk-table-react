import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Minimal config to build/serve the lib-consumption demo.
// The demo imports the BUILT artifact from ../lib to verify it is usable.
export default defineConfig({
    plugins: [react()],
    server: {
        fs: {
            // allow serving the built lib from the parent directory
            allow: ['..'],
        },
    },
});
