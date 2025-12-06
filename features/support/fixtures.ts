import { test as base, createBdd } from 'playwright-bdd';
import { Page } from '@playwright/test';

/**
 * Custom fixtures for BDD tests
 */
export interface TestFixtures {
  authenticatedPage: Page;
  testData: {
    testEmail: string;
    testPassword: string;
    demoTopic: string;
    demoLearningPath: string;
  };
}

export const test = base.extend<TestFixtures>({
  // eslint-disable-next-line no-empty-pattern
  testData: async ({}, use) => {
    await use({
      testEmail: process.env.E2E_TEST_EMAIL || 'test@example.com',
      testPassword: process.env.E2E_TEST_PASSWORD || 'testpassword123',
      demoTopic: 'Test & Demo',
      demoLearningPath: 'Alle Aufgabentypen - Demo',
    });
  },

  authenticatedPage: async ({ page, testData }, use) => {
    try {
      // Navigate to app
      await page.goto('/');

      // Wait for auth modal or dashboard
      await page.waitForLoadState('networkidle');

      // Check if already logged in
      const isLoggedIn = await page.getByText(testData.demoTopic).isVisible().catch(() => false);

      if (!isLoggedIn) {
        // Find and fill login form
        const emailInput = page.getByRole('textbox', { name: /email/i });
        const passwordInput = page.getByRole('textbox', { name: /password/i });

        if (await emailInput.isVisible()) {
          await emailInput.fill(testData.testEmail);
          await passwordInput.fill(testData.testPassword);
          await page.getByRole('button', { name: /sign in|log in|anmelden/i }).click();
          await page.waitForURL('**/', { timeout: 10000 });
        }
      }

      await use(page);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Authentication fixture failed: ${errorMessage}. Check test credentials and login form selectors.`);
    }
  },
});

export const { Given, When, Then } = createBdd(test);
