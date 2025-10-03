import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/learning-platform/' : '/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt'],
      manifest: {
        name: 'MindForge Academy',
        short_name: 'MindForge',
        description: 'Wissenschaftlich optimiertes Lernen mit Spaced Repetition',
        theme_color: '#2563eb',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        lang: 'de',
        icons: [],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
        ],
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,
      },
      devOptions: {
        enabled: true,
        type: 'module',
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@modules': path.resolve(__dirname, './src/modules'),
      '@core': path.resolve(__dirname, './src/modules/core'),
      '@storage': path.resolve(__dirname, './src/modules/storage'),
      '@ui': path.resolve(__dirname, './src/modules/ui'),
      '@templates': path.resolve(__dirname, './src/modules/templates'),
    },
  },
  build: {
    target: 'es2022',
    outDir: 'dist',
    sourcemap: true,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          i18n: ['react-i18next', 'i18next'],
          storage: ['dexie', 'dexie-react-hooks'],
          utils: ['date-fns', 'zustand'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    assetsInlineLimit: 0, // Don't inline JSON files
  },
  assetsInclude: ['**/*.json'], // Include JSON files as assets
  server: {
    port: 5173,
    strictPort: false,
    host: true,
    open: false,
  },
  preview: {
    port: 4173,
    strictPort: false,
    host: true,
  },
});