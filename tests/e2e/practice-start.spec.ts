import { test, expect } from '@playwright/test';

/**
 * Test to verify practice session can be started without React errors
 * This specifically tests the fix for React Error #310 (hook order violation)
 */
test('can start a practice session without errors', async ({ page, browserName }) => {
  // Listen for console errors
  const consoleErrors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  // Listen for page errors
  const pageErrors: Error[] = [];
  page.on('pageerror', error => {
    pageErrors.push(error);
  });

  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // Click on a topic to open it
  await page.getByText('Mathematik').click();
  await page.waitForLoadState('networkidle');

  // Click on "Lernpfad starten" button to go to configuration
  const startButton = page.getByRole('button', { name: /Lernpfad starten/i }).first();
  await expect(startButton).toBeVisible({ timeout: 10000 });
  await startButton.click();

  // Wait for configuration page
  await page.waitForLoadState('networkidle');
  await expect(page.getByText('Sitzung konfigurieren')).toBeVisible({ timeout: 5000 });

  // Click "Sitzung starten" to start the actual practice session
  const sessionStartButton = page.getByRole('button', { name: /Sitzung starten/i });
  await expect(sessionStartButton).toBeVisible({ timeout: 5000 });
  await sessionStartButton.click();

  // Wait for practice session to load
  await page.waitForTimeout(3000);

  // Verify no React errors occurred
  const reactErrors = consoleErrors.filter(
    error => error.includes('Minified React error') ||
             error.includes('React has detected') ||
             error.includes('Too many re-renders')
  );

  expect(reactErrors).toHaveLength(0);
  expect(pageErrors).toHaveLength(0);

  // The main test is that no errors occurred - practice session loading is secondary
  console.log('✓ No React hook errors detected');
});
