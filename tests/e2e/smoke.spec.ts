import { test, expect } from '@playwright/test';

/**
 * Simple smoke test to verify the app loads and basic functionality works
 */
test('app loads and displays topics', async ({ page }) => {
  await page.goto('/');

  // Wait for app to load
  await page.waitForLoadState('networkidle');

  // Verify title
  await expect(page.locator('h1')).toContainText('MindForge Academy');

  // Verify topics are visible
  await expect(page.getByText('Mathematik')).toBeVisible();
  await expect(page.getByText('Biologie')).toBeVisible();
});
