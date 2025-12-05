import { defineConfig, devices } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env.local'), override: true });
dotenv.config({ path: path.resolve(__dirname, '.env.development'), override: true });

const testDir = defineBddConfig({
  features: 'features/**/*.feature',
  steps: ['features/**/step-definitions/*.ts', 'features/support/*.ts'],
});

export default defineConfig({
  testDir,
  testMatch: ['**/*.spec.js'],
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [
    ['html', { outputFolder: 'tests/bdd-report' }],
    ['json', { outputFile: 'tests/bdd-report/results.json' }],
  ],
  timeout: 60000,
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  outputDir: 'tests/artifacts/bdd',
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 60000,
  },
});
