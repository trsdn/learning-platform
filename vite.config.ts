import { defineConfig, loadEnv, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Vite plugin to inject CSP meta tag with environment-specific Supabase URL
 */
function cspPlugin(supabaseUrl: string, isDev: boolean): Plugin {
  const cspContent = [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline' 'unsafe-eval'${isDev ? ' https://vercel.live' : ''}`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' data: https://fonts.gstatic.com",
    "img-src 'self' data: https:",
    `connect-src 'self' ${supabaseUrl}${isDev ? ' https://*.vercel.live wss://*.vercel.live' : ''}`,
    "worker-src 'self'",
    "manifest-src 'self'",
    "media-src 'self' blob: data:",
    isDev ? "frame-src https://vercel.live" : null,
  ].filter(Boolean).join(';');

  return {
    name: 'vite-plugin-csp',
    transformIndexHtml(html) {
      const cspMeta = `<meta http-equiv="Content-Security-Policy" content="${cspContent.replace(/"/g, '&quot;')}">`;
      const placeholder = '<!-- CSP is injected dynamically by Vite based on VITE_SUPABASE_URL -->';
      // Insert CSP meta tag after the comment placeholder
      if (!html.includes(placeholder)) {
        throw new Error('CSP placeholder comment not found in index.html');
      }
      return html.replace(
        placeholder,
        `<!-- CSP injected by Vite -->\n    ${cspMeta}`
      );
    },
  };
}

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');

  // Get Supabase URL from environment or use default
  const supabaseUrl = env.VITE_SUPABASE_URL || 'https://knzjdckrtewoigosaxoh.supabase.co';
  const isDevelopment = env.VITE_ENV === 'development' || mode === 'development';

  // Deployment: Vercel only
  // Always use root path (/)
  return {
  base: env.VITE_BASE_PATH || '/',
  define: {
    'import.meta.env.VITE_DB_NAME': JSON.stringify(env.VITE_DB_NAME || 'mindforge-academy'),
    'import.meta.env.VITE_ENV': JSON.stringify(env.VITE_ENV || 'production'),
  },
  plugins: [
    cspPlugin(supabaseUrl, isDevelopment),
    tsconfigPaths(),
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
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: 'apple-touch-icon.png',
            sizes: '180x180',
            type: 'image/png'
          }
        ],
      },
      workbox: {
        // Cache versioning strategy - critical fix
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,
        // Selective caching patterns for better performance
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,mp3}'],
        // Implement different caching strategies for different resource types
        runtimeCaching: [
          // Network-first for API calls with 3s timeout
          {
            urlPattern: /\/api\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache-v2',
              networkTimeoutSeconds: 3,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 5 * 60, // 5 minutes
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          // Cache-first for Google Fonts
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-stylesheets-v2',
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
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts-v2',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          // Cache-first for images with expiration
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache-v2',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
          // Stale-while-revalidate for static assets
          {
            urlPattern: /\.(?:js|css|woff2?)$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'static-resources-v2',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
              },
            },
          },
          // Cache-first for audio pronunciation files (T024)
          {
            urlPattern: /\/audio\/.*\.mp3$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'audio-pronunciations',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
      devOptions: {
        enabled: true,
        type: 'module',
      },
    }),
  ],
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
};
});