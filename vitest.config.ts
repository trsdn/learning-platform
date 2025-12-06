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
      ],
      include: ['src/**/*.{ts,tsx}'],
      all: true,
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
    include: ['tests/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['tests/e2e/**/*', 'tests/visual/**/*', 'node_modules'],
    testTimeout: 10000,
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