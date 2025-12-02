/**
 * Authentication helper for E2E tests
 *
 * Provides login functionality using test credentials from environment variables.
 */

import { Page } from '@playwright/test';

// Test credentials must be provided via environment variables
// Never commit real credentials to source code
const email = process.env.TEST_USER_EMAIL;
const password = process.env.TEST_USER_PASSWORD;

if (!email || !password) {
  throw new Error(
    'E2E tests require TEST_USER_EMAIL and TEST_USER_PASSWORD environment variables. ' +
    'Set them in your .env file or CI secrets.'
  );
}

export const TEST_USER = {
  email,
  password,
};

/**
 * Login to the app using test credentials
 */
export async function login(page: Page): Promise<void> {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // Click login button
  await page.getByRole('button', { name: /Anmelden/i }).click();

  // Wait for auth modal
  await page.locator('.auth-modal').first().waitFor({ state: 'visible' });

  // Fill in credentials
  await page.getByPlaceholder('deine@email.de').fill(TEST_USER.email);
  await page.locator('input[type="password"]').fill(TEST_USER.password);

  // Submit login (click the submit button with the key emoji)
  await page.locator('button[type="submit"]:has-text("Anmelden")').click();

  // Wait for login to complete (topics should appear)
  await page.waitForSelector('h2:has-text("Themen")', { timeout: 15000 });
}

/**
 * Check if user is logged in
 */
export async function isLoggedIn(page: Page): Promise<boolean> {
  const logoutButton = page.getByRole('button', { name: /Abmelden/i });
  return await logoutButton.isVisible().catch(() => false);
}
