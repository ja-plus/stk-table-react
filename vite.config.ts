import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import dts from 'vite-plugin-dts';
import pkg from './package.json';
import banner from 'vite-plugin-banner';

// https://vitejs.dev/config/
export default defineConfig({
    build: {
        minify: false,
        outDir: path.join('./lib'),
        target: ['chrome84'],
        lib: {
            entry: path.join('./src/StkTable/index.ts'),
            formats: ['es'],
        },
        rollupOptions: {
            external: [/^react($|\/)/, /^react-dom($|\/)/],
            output: {
                assetFileNames: assetInfo => {
                    if (assetInfo.name && assetInfo.name.endsWith('.css')) {
                        return 'style.css';
                    }
                    return '[name].[ext]';
                },
            },
        },
        cssCodeSplit: true,
    },
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
        extensions: ['.ts', '.tsx'],
    },
    plugins: [
        react({
            jsxRuntime: 'automatic',
            jsxImportSource: 'react',
        }),
        banner(
            [
                '/**',
                ` * name: ${pkg.name}`,
                ` * version: v${pkg.version}`,
                ` * description: ${pkg.description}`,
                ` * author: ${pkg.author}`,
                ` * homepage: ${pkg.homepage}`,
                ` * license: ${pkg.license}`,
                ' */',
            ].join('\n'),
        ),
        ...(process.env.NODE_ENV === 'production' ? [dts({ exclude: ['**/test/**', '**/demo/**'] })] : []),
    ],
    server: {
        port: 5199,
        open: true,
    },
});
