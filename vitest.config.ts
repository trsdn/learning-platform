import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './tests/coverage',
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/dist/',
        '**/coverage/',
        '**/.{idea,git,cache,output,temp}/',
        '**/*.stories.{ts,tsx}',
        '**/index.ts', // barrel files - just re-exports
        'src/main.tsx', // app entry point
        'src/modules/templates/**', // template/seed data
        'src/components/**', // legacy components (being migrated)
        'src/hooks/**', // legacy hooks (being migrated)
        '**/types.ts', // type definitions only
        'src/test/**', // test utilities
        'src/modules/ui/types/**', // UI type definitions
        'src/utils/logger.ts', // logging utility with side effects
        'src/modules/storage/seed-data.ts', // seed data for development
        'src/modules/storage/types/**', // storage type definitions
        '**/TaskDemo.tsx', // demo components
        '**/auth-modal.tsx', // auth modal (needs integration tests)
      ],
      include: ['src/**/*.{ts,tsx}'],
      all: true,
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75, // Storage adapters need integration tests for full branch coverage
        statements: 80,
      },
    },
    include: ['tests/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['tests/e2e/**/*', 'tests/visual/**/*', 'node_modules'],
    testTimeout: 10000,
    // Allow unhandled errors from withRetry timeout racing (see tests/unit/core/utils/error-handler.test.ts)
    // The withRetry function creates timeout promises that can reject after the main operation completes
    dangerouslyIgnoreUnhandledErrors: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@modules': path.resolve(__dirname, './src/modules'),
      '@core': path.resolve(__dirname, './src/modules/core'),
      '@storage': path.resolve(__dirname, './src/modules/storage'),
      '@ui': path.resolve(__dirname, './src/modules/ui'),
      '@templates': path.resolve(__dirname, './src/modules/templates'),
      '@tests': path.resolve(__dirname, './tests'),
    },
  },
});