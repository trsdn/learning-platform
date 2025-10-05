import { test, expect } from '@playwright/test';

/**
 * Test to capture all console errors and warnings during practice session
 */
test('capture console errors during practice session', async ({ page }) => {
  const consoleMessages: Array<{ type: string; text: string }> = [];

  page.on('console', msg => {
    consoleMessages.push({
      type: msg.type(),
      text: msg.text()
    });
  });

  const pageErrors: Error[] = [];
  page.on('pageerror', error => {
    pageErrors.push(error);
  });

  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // Click on Mathematik
  await page.getByText('Mathematik').click();
  await page.waitForLoadState('networkidle');

  // Click on first learning path
  const startButton = page.getByRole('button', { name: /Lernpfad starten/i }).first();
  await expect(startButton).toBeVisible({ timeout: 10000 });
  await startButton.click();

  // Wait for configuration page
  await page.waitForLoadState('networkidle');
  await expect(page.getByText('Sitzung konfigurieren')).toBeVisible({ timeout: 5000 });

  // Start session
  const sessionStartButton = page.getByRole('button', { name: /Sitzung starten/i });
  await expect(sessionStartButton).toBeVisible({ timeout: 5000 });
  await sessionStartButton.click();

  // Wait for practice session to load
  await page.waitForTimeout(3000);

  // Print all console messages
  console.log('\n=== CONSOLE MESSAGES ===');
  consoleMessages.forEach(msg => {
    console.log(`[${msg.type.toUpperCase()}] ${msg.text}`);
  });

  console.log('\n=== PAGE ERRORS ===');
  pageErrors.forEach(err => {
    console.log(`[ERROR] ${err.message}`);
    console.log(err.stack);
  });

  // Filter for errors and warnings
  const errors = consoleMessages.filter(m => m.type === 'error');
  const warnings = consoleMessages.filter(m => m.type === 'warning');

  console.log(`\n=== SUMMARY ===`);
  console.log(`Total errors: ${errors.length}`);
  console.log(`Total warnings: ${warnings.length}`);
  console.log(`Total page errors: ${pageErrors.length}`);

  // List all errors
  if (errors.length > 0) {
    console.log('\n=== ALL ERRORS ===');
    errors.forEach(err => console.log(err.text));
  }

  if (warnings.length > 0) {
    console.log('\n=== ALL WARNINGS ===');
    warnings.forEach(warn => console.log(warn.text));
  }
});
