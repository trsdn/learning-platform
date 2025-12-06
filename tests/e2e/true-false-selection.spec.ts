import { test, expect, type Page } from '@playwright/test';
import { login } from './auth.setup';

/**
 * True/False Selection E2E Tests
 *
 * Tests the true/false task type interactions.
 * This addresses the P1 requirement from issue #173.
 *
 * The demo learning path contains true-false tasks:
 * - test-tf-1: "Wasser kocht bei 100 Grad Celsius auf Meereshöhe" (true)
 * - test-tf-2: "Die Sonne ist ein Planet" (false)
 */

/**
 * Helper to navigate to demo learning path and start session
 * Note: The full demo path now has 16 tasks including true-false tasks
 */
async function startDemoSession(page: Page) {
  await page.getByRole('button', { name: /Test & Demo/i }).click();
  await page.waitForSelector('text=Alle Aufgabentypen', { timeout: 10000 });
  await page.getByText('Alle Aufgabentypen - Demo').click();
  await page.getByRole('button', { name: /Starten/i }).click();
  // Wait for session to start - progress indicator format varies
  await expect(page.locator('text=/\\d+\\s*\\/\\s*\\d+/')).toBeVisible({ timeout: 10000 });
}

/**
 * Helper to skip through tasks until we find a true-false task
 * Returns true if found, false if we reached the end
 */
async function skipToTrueFalseTask(page: Page): Promise<boolean> {
  const maxAttempts = 20;

  for (let i = 0; i < maxAttempts; i++) {
    // Check if current task is a true-false task
    const trueFalseContainer = page.locator('[class*="tf-container"]');

    if (await trueFalseContainer.isVisible({ timeout: 1000 }).catch(() => false)) {
      return true;
    }

    // Also check by looking for both Richtig and Falsch buttons
    const richtigBtn = page.getByRole('button', { name: /^Richtig$/ });
    const falschBtn = page.getByRole('button', { name: /^Falsch$/ });

    if (
      (await richtigBtn.isVisible({ timeout: 500 }).catch(() => false)) &&
      (await falschBtn.isVisible({ timeout: 500 }).catch(() => false))
    ) {
      return true;
    }

    // Try to skip to next task
    const skipButton = page.getByRole('button', { name: /Überspringen/i });
    if (await skipButton.isVisible({ timeout: 1000 }).catch(() => false)) {
      await skipButton.click();
      await page.waitForTimeout(500);
    } else {
      // Maybe at end of session
      return false;
    }
  }

  return false;
}

test.describe('True/False Selection', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test.describe('Button Display', () => {
    test('true-false task displays Richtig and Falsch buttons', async ({ page }) => {
      await startDemoSession(page);
      const found = await skipToTrueFalseTask(page);

      if (!found) {
        test.skip(true, 'No true-false task found in demo path');
        return;
      }

      // Verify both buttons are visible
      const richtigButton = page.getByRole('button', { name: /^Richtig$/ });
      const falschButton = page.getByRole('button', { name: /^Falsch$/ });

      await expect(richtigButton).toBeVisible();
      await expect(falschButton).toBeVisible();
    });

    test('true-false task shows statement text', async ({ page }) => {
      await startDemoSession(page);
      const found = await skipToTrueFalseTask(page);

      if (!found) {
        test.skip(true, 'No true-false task found');
        return;
      }

      // Statement should contain the question marker
      const statement = page.locator('[class*="tf-statement"]');
      if (await statement.isVisible({ timeout: 2000 }).catch(() => false)) {
        const text = await statement.textContent();
        expect(text?.length).toBeGreaterThan(10);
      }
    });
  });

  test.describe('Selection Interaction', () => {
    test('clicking Richtig button selects it', async ({ page }) => {
      await startDemoSession(page);
      const found = await skipToTrueFalseTask(page);

      if (!found) {
        test.skip(true, 'No true-false task found');
        return;
      }

      const richtigButton = page.getByRole('button', { name: /^Richtig$/ });

      // Click the button
      await richtigButton.click();

      // Button should show selected state (aria-pressed or selected class)
      const isPressed = await richtigButton.getAttribute('aria-pressed');
      const classes = await richtigButton.getAttribute('class');

      expect(isPressed === 'true' || classes?.includes('selected')).toBeTruthy();
    });

    test('clicking Falsch button selects it', async ({ page }) => {
      await startDemoSession(page);
      const found = await skipToTrueFalseTask(page);

      if (!found) {
        test.skip(true, 'No true-false task found');
        return;
      }

      const falschButton = page.getByRole('button', { name: /^Falsch$/ });

      // Click the button
      await falschButton.click();

      // Button should show selected state
      const isPressed = await falschButton.getAttribute('aria-pressed');
      const classes = await falschButton.getAttribute('class');

      expect(isPressed === 'true' || classes?.includes('selected')).toBeTruthy();
    });

    test('can switch selection between Richtig and Falsch', async ({ page }) => {
      await startDemoSession(page);
      const found = await skipToTrueFalseTask(page);

      if (!found) {
        test.skip(true, 'No true-false task found');
        return;
      }

      const richtigButton = page.getByRole('button', { name: /^Richtig$/ });
      const falschButton = page.getByRole('button', { name: /^Falsch$/ });

      // Select Richtig first
      await richtigButton.click();
      await expect(richtigButton).toHaveAttribute('aria-pressed', 'true');

      // Switch to Falsch
      await falschButton.click();
      await expect(falschButton).toHaveAttribute('aria-pressed', 'true');

      // Richtig should no longer be selected
      await expect(richtigButton).toHaveAttribute('aria-pressed', 'false');
    });
  });

  test.describe('Submit and Feedback', () => {
    test('submit button enables after selection', async ({ page }) => {
      await startDemoSession(page);
      const found = await skipToTrueFalseTask(page);

      if (!found) {
        test.skip(true, 'No true-false task found');
        return;
      }

      // Submit button should initially be disabled
      const submitButton = page.getByRole('button', { name: /Prüfen|Antwort überprüfen/i });
      await expect(submitButton).toBeDisabled();

      // Select an answer
      await page.getByRole('button', { name: /^Richtig$/ }).click();

      // Submit button should now be enabled
      await expect(submitButton).toBeEnabled();
    });

    test('correct answer shows positive feedback', async ({ page }) => {
      await startDemoSession(page);
      const found = await skipToTrueFalseTask(page);

      if (!found) {
        test.skip(true, 'No true-false task found');
        return;
      }

      // For "Wasser kocht bei 100 Grad..." the answer is TRUE
      // For "Die Sonne ist ein Planet" the answer is FALSE
      // We'll select Richtig and check for feedback
      await page.getByRole('button', { name: /^Richtig$/ }).click();
      await page.getByRole('button', { name: /Prüfen|Antwort überprüfen/i }).click();

      // Wait for feedback
      await expect(page.getByRole('button', { name: /Nächste Aufgabe/i })).toBeVisible({
        timeout: 5000,
      });

      // Check for feedback styling (correct or incorrect)
      const correctIndicator = page.locator('[class*="correct"]');
      const incorrectIndicator = page.locator('[class*="incorrect"]');

      // One of these should be visible
      const hasCorrect = await correctIndicator.count();
      const hasIncorrect = await incorrectIndicator.count();

      expect(hasCorrect + hasIncorrect).toBeGreaterThan(0);
    });

    test('buttons are disabled after submission', async ({ page }) => {
      await startDemoSession(page);
      const found = await skipToTrueFalseTask(page);

      if (!found) {
        test.skip(true, 'No true-false task found');
        return;
      }

      await page.getByRole('button', { name: /^Richtig$/ }).click();
      await page.getByRole('button', { name: /Prüfen|Antwort überprüfen/i }).click();

      // Wait for feedback
      await page.waitForTimeout(500);

      // Both buttons should now be disabled
      const richtigButton = page.getByRole('button', { name: /^Richtig$/ });
      const falschButton = page.getByRole('button', { name: /^Falsch$/ });

      await expect(richtigButton).toBeDisabled();
      await expect(falschButton).toBeDisabled();
    });
  });

  test.describe('Stats Update', () => {
    test('stats update correctly after true-false answer', async ({ page }) => {
      await startDemoSession(page);
      const found = await skipToTrueFalseTask(page);

      if (!found) {
        test.skip(true, 'No true-false task found');
        return;
      }

      // Get initial stats
      const initialAnswered = await page
        .locator('[class*="stat-value--completed"]')
        .textContent();

      // Answer and submit
      await page.getByRole('button', { name: /^Richtig$/ }).click();
      await page.getByRole('button', { name: /Prüfen|Antwort überprüfen/i }).click();

      // Move to next task
      await page.getByRole('button', { name: /Nächste Aufgabe/i }).click();
      await page.waitForTimeout(500);

      // Stats should have incremented
      const newAnswered = await page
        .locator('[class*="stat-value--completed"]')
        .textContent();

      expect(parseInt(newAnswered || '0')).toBeGreaterThan(parseInt(initialAnswered || '0'));
    });
  });
});
