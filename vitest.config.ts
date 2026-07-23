import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
    plugins: [
        react({
            jsxRuntime: 'automatic',
            jsxImportSource: 'react',
        }),
    ],
    esbuild: {
        jsx: 'automatic',
        jsxImportSource: 'react',
        tsconfigRaw: {
            compilerOptions: {
                jsx: 'react-jsx',
                jsxImportSource: 'react',
            },
        },
    },
    resolve: {
        alias: {
            '@': path.resolve('src'),
        },
    },
    test: {
        include: ['src/StkTable/**/*.test.{ts,tsx}', 'test/**/*.test.{ts,tsx}'],
        environment: 'jsdom',
        globals: true,
        setupFiles: ['src/StkTable/test/setup.ts'],
    },
});
