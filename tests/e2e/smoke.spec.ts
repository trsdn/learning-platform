import { test, expect } from '@playwright/test';
import { login } from './auth.setup';

/**
 * Smoke tests to verify the app loads correctly
 */
test.describe('App Smoke Tests', () => {
  test('app loads and displays login page for unauthenticated users', async ({ page }) => {
    await page.goto('/');

    // Wait for app to load
    await page.waitForLoadState('networkidle');

    // Verify title
    await expect(page.locator('h1')).toContainText('MindForge Academy');

    // Verify login prompt is shown (app requires authentication)
    await expect(page.getByText('Bitte melden Sie sich an')).toBeVisible();
    await expect(page.getByRole('button', { name: /Anmelden/i })).toBeVisible();
  });

  test('login button opens auth modal', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Click login button
    await page.getByRole('button', { name: /Anmelden/i }).click();

    // Auth modal should appear (use .first() since there are multiple matching elements)
    await expect(page.locator('.auth-modal').first()).toBeVisible({
      timeout: 5000,
    });
  });

  test('authenticated user can see topics', async ({ page }) => {
    // Login with test credentials
    await login(page);

    // Verify topics heading is visible
    await expect(page.getByText('Themen auswählen')).toBeVisible();

    // Verify at least one topic is visible
    await expect(page.getByRole('button', { name: /Abmelden/i })).toBeVisible();
  });
});
