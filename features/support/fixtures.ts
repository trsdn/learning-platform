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
      await page.waitForLoadState('networkidle');

      // Wait for either topics grid OR login button - indicates page is loaded
      const topicsGrid = page.locator('[class*="topicsGrid"], [class*="grid"]');
      const loginButton = page.getByRole('button', { name: /Anmelden|Login|Sign in/i });
      
      // Wait for either element to appear to know page is loaded
      await Promise.race([
        topicsGrid.first().waitFor({ state: 'visible', timeout: 5000 }).catch(() => null),
        loginButton.waitFor({ state: 'visible', timeout: 5000 }).catch(() => null),
      ]);

      // Check if already logged in by looking for topic cards (not just text)
      const isLoggedIn = await topicsGrid.first().isVisible().catch(() => false);

      if (!isLoggedIn) {
        // Click login button to open auth modal
        await loginButton.click();

        // Wait for auth modal
        const authModal = page.locator('.auth-modal');
        await authModal.waitFor({ state: 'visible', timeout: 10000 });

        // Fill in credentials using auth modal IDs
        await page.locator('#login-email').fill(testData.testEmail);
        await page.locator('#login-password').fill(testData.testPassword);

        // Click submit button
        await page.locator('button[type="submit"]:has-text("Anmelden")').click();

        // Wait for topics grid to appear after login
        await topicsGrid.first().waitFor({ state: 'visible', timeout: 20000 });
      }

      // Final verification - wait for the demo topic button to be clickable
      await page.getByRole('button', { name: new RegExp(testData.demoTopic, 'i') }).waitFor({ state: 'visible', timeout: 20000 });

      await use(page);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Authentication fixture failed: ${errorMessage}. Check test credentials and login form selectors.`);
    }
  },
});

export const { Given, When, Then } = createBdd(test);
