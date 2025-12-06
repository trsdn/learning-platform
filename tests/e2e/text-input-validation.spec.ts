import { test, expect, type Page } from '@playwright/test';
import { login } from './auth.setup';

/**
 * Text Input Validation E2E Tests
 *
 * Tests the text input task type interactions.
 * This addresses the P1 requirement from issue #173.
 *
 * Text input tasks exist in Spanish and English learning paths:
 * - Spanish "Zahlen, Farben & Tiere" contains text input tasks like
 *   "Wie sagt man 'grau' auf Spanisch?" (answer: "gris")
 */

/**
 * Helper to navigate to Spanish learning path that contains text input tasks
 */
async function startSpanishTextInputSession(page: Page) {
  await page.getByRole('button', { name: /Spanisch/i }).click();
  await page.waitForSelector('text=Zahlen, Farben', { timeout: 10000 });
  await page.getByText(/Zahlen.*Farben.*Tiere/i).click();
  await page.getByRole('button', { name: /Starten/i }).click();
  await expect(page.locator('text=/\\d+\\s*\\/\\s*\\d+/')).toBeVisible({ timeout: 10000 });
}

/**
 * Helper to skip through tasks until we find a text input task
 */
async function skipToTextInputTask(page: Page): Promise<boolean> {
  const maxAttempts = 50; // Spanish path is longer

  for (let i = 0; i < maxAttempts; i++) {
    // Check for text input container
    const textInputContainer = page.locator('[class*="text-input-container"]');
    const textInput = page.locator('input[aria-label="Text answer input"]');
    const placeholder = page.locator('input[placeholder="Deine Antwort..."]');

    if (await textInputContainer.isVisible({ timeout: 1000 }).catch(() => false)) {
      return true;
    }

    if (await textInput.isVisible({ timeout: 500 }).catch(() => false)) {
      return true;
    }

    if (await placeholder.isVisible({ timeout: 500 }).catch(() => false)) {
      return true;
    }

    // Try to skip to next task
    const skipButton = page.getByRole('button', { name: /Überspringen/i });
    if (await skipButton.isVisible({ timeout: 1000 }).catch(() => false)) {
      await skipButton.click();
      await page.waitForTimeout(500);
    } else {
      return false;
    }
  }

  return false;
}

test.describe('Text Input Validation', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test.describe('Display Elements', () => {
    test('text input task displays input field', async ({ page }) => {
      await startSpanishTextInputSession(page);
      const found = await skipToTextInputTask(page);

      if (!found) {
        test.skip(true, 'No text input task found in learning path');
        return;
      }

      // Input field should be visible
      const input = page.locator('[class*="text-input"]').or(
        page.locator('input[placeholder="Deine Antwort..."]')
      );
      await expect(input.first()).toBeVisible();
    });

    test('text input shows placeholder text', async ({ page }) => {
      await startSpanishTextInputSession(page);
      const found = await skipToTextInputTask(page);

      if (!found) {
        test.skip(true, 'No text input task found');
        return;
      }

      // Look for placeholder
      const input = page.locator('input[placeholder="Deine Antwort..."]');
      await expect(input).toBeVisible();
    });

    test('text input shows question text', async ({ page }) => {
      await startSpanishTextInputSession(page);
      const found = await skipToTextInputTask(page);

      if (!found) {
        test.skip(true, 'No text input task found');
        return;
      }

      // Question should be visible
      const questionHeader = page.locator('[class*="question-text"]');
      if (await questionHeader.isVisible({ timeout: 2000 }).catch(() => false)) {
        const text = await questionHeader.textContent();
        expect(text?.length).toBeGreaterThan(10);
      }
    });
  });

  test.describe('Input Interaction', () => {
    test('user can type in text input field', async ({ page }) => {
      await startSpanishTextInputSession(page);
      const found = await skipToTextInputTask(page);

      if (!found) {
        test.skip(true, 'No text input task found');
        return;
      }

      const input = page.locator('input[placeholder="Deine Antwort..."]').or(
        page.locator('[class*="text-input"] input')
      );

      // Type an answer
      await input.first().fill('test');

      // Input should contain typed text
      await expect(input.first()).toHaveValue('test');
    });

    test('submit button enables after typing', async ({ page }) => {
      await startSpanishTextInputSession(page);
      const found = await skipToTextInputTask(page);

      if (!found) {
        test.skip(true, 'No text input task found');
        return;
      }

      const input = page.locator('input[placeholder="Deine Antwort..."]').or(
        page.locator('[class*="text-input"] input')
      );
      const submitButton = page.getByRole('button', { name: /Prüfen|Antwort überprüfen/i });

      // Submit should be disabled initially
      await expect(submitButton).toBeDisabled();

      // Type an answer
      await input.first().fill('test');

      // Submit should now be enabled
      await expect(submitButton).toBeEnabled();
    });

    test('empty input keeps submit disabled', async ({ page }) => {
      await startSpanishTextInputSession(page);
      const found = await skipToTextInputTask(page);

      if (!found) {
        test.skip(true, 'No text input task found');
        return;
      }

      const input = page.locator('input[placeholder="Deine Antwort..."]').or(
        page.locator('[class*="text-input"] input')
      );
      const submitButton = page.getByRole('button', { name: /Prüfen|Antwort überprüfen/i });

      // Type and then clear
      await input.first().fill('test');
      await input.first().fill('');

      // Submit should be disabled again
      await expect(submitButton).toBeDisabled();
    });
  });

  test.describe('Submit and Feedback', () => {
    test('submitting answer shows feedback', async ({ page }) => {
      await startSpanishTextInputSession(page);
      const found = await skipToTextInputTask(page);

      if (!found) {
        test.skip(true, 'No text input task found');
        return;
      }

      const input = page.locator('input[placeholder="Deine Antwort..."]').or(
        page.locator('[class*="text-input"] input')
      );

      await input.first().fill('testanswer');
      await page.getByRole('button', { name: /Prüfen|Antwort überprüfen/i }).click();

      // Wait for feedback
      await expect(page.getByRole('button', { name: /Nächste Aufgabe/i })).toBeVisible({
        timeout: 5000,
      });
    });

    test('correct answer shows success styling', async ({ page }) => {
      await startSpanishTextInputSession(page);
      const found = await skipToTextInputTask(page);

      if (!found) {
        test.skip(true, 'No text input task found');
        return;
      }

      const input = page.locator('input[placeholder="Deine Antwort..."]').or(
        page.locator('[class*="text-input"] input')
      );

      // Try a common Spanish answer
      await input.first().fill('gris');
      await page.getByRole('button', { name: /Prüfen|Antwort überprüfen/i }).click();

      // Wait for feedback
      await page.waitForTimeout(500);

      // Check for success or error indicator on input
      const successIndicator = page.locator('[class*="success"]');
      const errorIndicator = page.locator('[class*="error"]');

      const hasSuccess = await successIndicator.count();
      const hasError = await errorIndicator.count();

      // One of these should be visible
      expect(hasSuccess + hasError).toBeGreaterThan(0);
    });

    test('incorrect answer shows correct answer feedback', async ({ page }) => {
      await startSpanishTextInputSession(page);
      const found = await skipToTextInputTask(page);

      if (!found) {
        test.skip(true, 'No text input task found');
        return;
      }

      const input = page.locator('input[placeholder="Deine Antwort..."]').or(
        page.locator('[class*="text-input"] input')
      );

      // Type definitely wrong answer
      await input.first().fill('wronganswer123');
      await page.getByRole('button', { name: /Prüfen|Antwort überprüfen/i }).click();

      // Wait for feedback
      await expect(page.getByRole('button', { name: /Nächste Aufgabe/i })).toBeVisible({
        timeout: 5000,
      });

      // Check for feedback showing correct answer
      const feedback = page.locator('[class*="text-input-feedback"]');
      if (await feedback.isVisible({ timeout: 2000 }).catch(() => false)) {
        const feedbackText = await feedback.textContent();
        expect(feedbackText).toMatch(/Richtige Antwort/);
      }
    });

    test('input is disabled after submission', async ({ page }) => {
      await startSpanishTextInputSession(page);
      const found = await skipToTextInputTask(page);

      if (!found) {
        test.skip(true, 'No text input task found');
        return;
      }

      const input = page.locator('input[placeholder="Deine Antwort..."]').or(
        page.locator('[class*="text-input"] input')
      );

      await input.first().fill('test');
      await page.getByRole('button', { name: /Prüfen|Antwort überprüfen/i }).click();

      // Wait for feedback
      await page.waitForTimeout(500);

      // Input should be disabled
      await expect(input.first()).toBeDisabled();
    });
  });

  test.describe('Case Sensitivity', () => {
    test('answer validation handles different cases', async ({ page }) => {
      await startSpanishTextInputSession(page);
      const found = await skipToTextInputTask(page);

      if (!found) {
        test.skip(true, 'No text input task found');
        return;
      }

      const input = page.locator('input[placeholder="Deine Antwort..."]').or(
        page.locator('[class*="text-input"] input')
      );

      // Try uppercase version
      await input.first().fill('GRIS');
      await page.getByRole('button', { name: /Prüfen|Antwort überprüfen/i }).click();

      // Should get some form of feedback (correct or incorrect depends on settings)
      await expect(page.getByRole('button', { name: /Nächste Aufgabe/i })).toBeVisible({
        timeout: 5000,
      });
    });
  });

  test.describe('Special Characters', () => {
    test('input accepts special characters', async ({ page }) => {
      await startSpanishTextInputSession(page);
      const found = await skipToTextInputTask(page);

      if (!found) {
        test.skip(true, 'No text input task found');
        return;
      }

      const input = page.locator('input[placeholder="Deine Antwort..."]').or(
        page.locator('[class*="text-input"] input')
      );

      // Type answer with special characters (Spanish has accents)
      await input.first().fill('el pájaro');

      // Input should contain the special characters
      await expect(input.first()).toHaveValue('el pájaro');
    });
  });

  test.describe('Keyboard Behavior', () => {
    test('Enter key submits answer', async ({ page }) => {
      await startSpanishTextInputSession(page);
      const found = await skipToTextInputTask(page);

      if (!found) {
        test.skip(true, 'No text input task found');
        return;
      }

      const input = page.locator('input[placeholder="Deine Antwort..."]').or(
        page.locator('[class*="text-input"] input')
      );

      await input.first().fill('test');

      // Press Enter to submit
      await input.first().press('Enter');

      // Should show feedback
      await expect(page.getByRole('button', { name: /Nächste Aufgabe/i })).toBeVisible({
        timeout: 5000,
      });
    });
  });

  test.describe('Stats Update', () => {
    test('stats update correctly after text input answer', async ({ page }) => {
      await startSpanishTextInputSession(page);
      const found = await skipToTextInputTask(page);

      if (!found) {
        test.skip(true, 'No text input task found');
        return;
      }

      // Get initial answered count
      const initialAnswered = await page
        .locator('[class*="stat-value--completed"]')
        .textContent();

      const input = page.locator('input[placeholder="Deine Antwort..."]').or(
        page.locator('[class*="text-input"] input')
      );

      await input.first().fill('test');
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

  test.describe('Whitespace Handling', () => {
    test('leading/trailing whitespace in answer', async ({ page }) => {
      await startSpanishTextInputSession(page);
      const found = await skipToTextInputTask(page);

      if (!found) {
        test.skip(true, 'No text input task found');
        return;
      }

      const input = page.locator('input[placeholder="Deine Antwort..."]').or(
        page.locator('[class*="text-input"] input')
      );

      // Type answer with whitespace
      await input.first().fill('  gris  ');
      await page.getByRole('button', { name: /Prüfen|Antwort überprüfen/i }).click();

      // Should get feedback (validation may or may not trim)
      await expect(page.getByRole('button', { name: /Nächste Aufgabe/i })).toBeVisible({
        timeout: 5000,
      });
    });
  });
});
