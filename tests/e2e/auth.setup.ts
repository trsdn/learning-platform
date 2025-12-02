/**
 * Authentication helper for E2E tests
 *
 * Provides login functionality using test credentials from environment variables.
 */

import { Page } from '@playwright/test';

export const TEST_USER = {
  email: process.env.TEST_USER_EMAIL || 'torsten.mahr@me.com',
  password: process.env.TEST_USER_PASSWORD || 'xibrox-jYsdag-7zitbu',
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
