import { test, expect } from '@playwright/test';

/**
 * E2E tests for password-protected learning paths
 *
 * Feature: Shared Password Authentication (Issue #35)
 */

test.describe('Password Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('protected learning path displays lock icon', async ({ page }) => {
    // Navigate to Test topic
    await page.getByText('Test / Demo').click();
    await page.waitForLoadState('networkidle');

    // Find the protected learning path card
    const protectedCard = page.locator('text=🔒 Passwortgeschützter Lernpfad').locator('..');

    // Verify it's visible
    await expect(protectedCard).toBeVisible();

    // Verify lock icon is present
    await expect(page.locator('text=🔒')).toBeVisible();
  });

  test('clicking protected path shows password prompt', async ({ page }) => {
    // Navigate to Test topic
    await page.getByText('Test / Demo').click();
    await page.waitForLoadState('networkidle');

    // Click on password-protected learning path
    await page.getByText('Lernpfad starten').first().click();

    // Wait for password prompt to appear
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });

    // Verify password prompt is displayed
    await expect(page.getByText('🔒 Passwort erforderlich')).toBeVisible();
    await expect(page.getByText('Passwortgeschützter Lernpfad')).toBeVisible();
    await expect(page.getByTestId('password-input')).toBeVisible();
    await expect(page.getByTestId('password-submit-button')).toBeVisible();
    await expect(page.getByTestId('password-cancel-button')).toBeVisible();
  });

  test('entering wrong password shows error message', async ({ page }) => {
    // Navigate to Test topic and open protected path
    await page.getByText('Test / Demo').click();
    await page.waitForLoadState('networkidle');

    // Click the first "Lernpfad starten" button (should be the protected one if it's first)
    const startButtons = page.getByText('Lernpfad starten');
    const protectedButton = await startButtons.all();

    // Find the button inside the protected learning path card
    for (const button of protectedButton) {
      const cardText = await button.locator('..').locator('..').textContent();
      if (cardText?.includes('Passwortgeschützt')) {
        await button.click();
        break;
      }
    }

    // Wait for password prompt
    await page.waitForSelector('[role="dialog"]');

    // Enter wrong password
    await page.getByTestId('password-input').fill('wrongpassword');
    await page.getByTestId('password-submit-button').click();

    // Verify error message appears
    await expect(page.getByTestId('password-error')).toBeVisible();
    await expect(page.getByText('Falsches Passwort')).toBeVisible();

    // Verify still on password prompt (not navigated away)
    await expect(page.getByTestId('password-input')).toBeVisible();
  });

  test('entering correct password grants access to learning path', async ({ page }) => {
    // Navigate to Test topic
    await page.getByText('Test / Demo').click();
    await page.waitForLoadState('networkidle');

    // Find and click the password-protected learning path
    const startButtons = page.getByText('Lernpfad starten');
    const buttons = await startButtons.all();

    for (const button of buttons) {
      const cardText = await button.locator('..').locator('..').textContent();
      if (cardText?.includes('Passwortgeschützt')) {
        await button.click();
        break;
      }
    }

    // Wait for password prompt
    await page.waitForSelector('[role="dialog"]');

    // Enter correct password (test123 as per example file)
    await page.getByTestId('password-input').fill('test123');
    await page.getByTestId('password-submit-button').click();

    // Wait for navigation to session config
    await page.waitForSelector('text=Sitzung konfigurieren', { timeout: 5000 });

    // Verify we're now on the session configuration screen
    await expect(page.getByText('Sitzung konfigurieren')).toBeVisible();
    await expect(page.getByText('Passwortgeschützter Lernpfad')).toBeVisible();
  });

  test('authentication persists across page reloads', async ({ page }) => {
    // First, authenticate
    await page.getByText('Test / Demo').click();
    await page.waitForLoadState('networkidle');

    const startButtons = page.getByText('Lernpfad starten');
    const buttons = await startButtons.all();

    for (const button of buttons) {
      const cardText = await button.locator('..').locator('..').textContent();
      if (cardText?.includes('Passwortgeschützt')) {
        await button.click();
        break;
      }
    }

    await page.waitForSelector('[role="dialog"]');
    await page.getByTestId('password-input').fill('test123');
    await page.getByTestId('password-submit-button').click();

    // Wait for session config
    await page.waitForSelector('text=Sitzung konfigurieren');

    // Go back to topics
    await page.getByText('← Zurück').click();
    await page.waitForLoadState('networkidle');

    // Now click the same learning path again
    const startButtons2 = page.getByText('Lernpfad starten');
    const buttons2 = await startButtons2.all();

    for (const button of buttons2) {
      const cardText = await button.locator('..').locator('..').textContent();
      if (cardText?.includes('Passwortgeschützt')) {
        await button.click();
        break;
      }
    }

    // Should go directly to session config without password prompt
    await expect(page.getByText('Sitzung konfigurieren')).toBeVisible({ timeout: 3000 });

    // Verify password prompt did NOT appear
    await expect(page.getByText('🔒 Passwort erforderlich')).not.toBeVisible();
  });

  test('cancel button closes password prompt', async ({ page }) => {
    // Navigate to Test topic
    await page.getByText('Test / Demo').click();
    await page.waitForLoadState('networkidle');

    // Click protected learning path
    const startButtons = page.getByText('Lernpfad starten');
    const buttons = await startButtons.all();

    for (const button of buttons) {
      const cardText = await button.locator('..').locator('..').textContent();
      if (cardText?.includes('Passwortgeschützt')) {
        await button.click();
        break;
      }
    }

    // Wait for password prompt
    await page.waitForSelector('[role="dialog"]');

    // Click cancel button
    await page.getByTestId('password-cancel-button').click();

    // Verify prompt is closed and we're back on learning paths screen
    await expect(page.getByText('Lernpfade')).toBeVisible();
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('escape key closes password prompt', async ({ page }) => {
    // Navigate to Test topic
    await page.getByText('Test / Demo').click();
    await page.waitForLoadState('networkidle');

    // Click protected learning path
    const startButtons = page.getByText('Lernpfad starten');
    const buttons = await startButtons.all();

    for (const button of buttons) {
      const cardText = await button.locator('..').locator('..').textContent();
      if (cardText?.includes('Passwortgeschützt')) {
        await button.click();
        break;
      }
    }

    // Wait for password prompt
    await page.waitForSelector('[role="dialog"]');

    // Press Escape key
    await page.keyboard.press('Escape');

    // Verify prompt is closed
    await expect(page.getByText('Lernpfade')).toBeVisible();
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('password input is masked (type=password)', async ({ page }) => {
    // Navigate to Test topic
    await page.getByText('Test / Demo').click();
    await page.waitForLoadState('networkidle');

    // Click protected learning path
    const startButtons = page.getByText('Lernpfad starten');
    const buttons = await startButtons.all();

    for (const button of buttons) {
      const cardText = await button.locator('..').locator('..').textContent();
      if (cardText?.includes('Passwortgeschützt')) {
        await button.click();
        break;
      }
    }

    // Wait for password prompt
    await page.waitForSelector('[role="dialog"]');

    // Verify input type is password
    const passwordInput = page.getByTestId('password-input');
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });
});
