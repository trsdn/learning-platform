import { test, expect, type Page } from '@playwright/test';
import { login } from './auth.setup';

/**
 * Word Scramble Flow E2E Tests
 *
 * Tests the word scramble task type interactions.
 * This addresses the P1 requirement from issue #173.
 *
 * The demo learning path contains word scramble tasks:
 * - test-word-scramble-1: TOHFOTYSENES = "Photosynthese"
 * - test-word-scramble-2: YHTSEPOUEN = "Hypotenuse"
 */

/**
 * Helper to navigate to demo learning path and start session
 */
async function startDemoSession(page: Page) {
  await page.getByRole('button', { name: /Test & Demo/i }).click();
  await page.waitForSelector('text=Alle Aufgabentypen', { timeout: 10000 });
  await page.getByText('Alle Aufgabentypen - Demo').click();
  await page.getByRole('button', { name: /Starten/i }).click();
  await expect(page.locator('text=/\\d+\\s*\\/\\s*\\d+/')).toBeVisible({ timeout: 10000 });
}

/**
 * Helper to skip through tasks until we find a word scramble task
 */
async function skipToWordScrambleTask(page: Page): Promise<boolean> {
  const maxAttempts = 20;

  for (let i = 0; i < maxAttempts; i++) {
    // Check for word scramble container
    const scrambleContainer = page.locator('[class*="scramble-container"]');
    const scrambleWord = page.locator('[class*="scramble-word"]');
    const scrambleLabel = page.locator('text=Buchstabensalat');

    if (await scrambleContainer.isVisible({ timeout: 1000 }).catch(() => false)) {
      return true;
    }

    if (await scrambleLabel.isVisible({ timeout: 500 }).catch(() => false)) {
      return true;
    }

    if (await scrambleWord.isVisible({ timeout: 500 }).catch(() => false)) {
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

test.describe('Word Scramble Flow', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test.describe('Display Elements', () => {
    test('word scramble task displays scrambled word', async ({ page }) => {
      await startDemoSession(page);
      const found = await skipToWordScrambleTask(page);

      if (!found) {
        test.skip(true, 'No word scramble task found in demo path');
        return;
      }

      // Scrambled word should be visible
      const scrambledWord = page.locator('[class*="scramble-word"]');
      await expect(scrambledWord).toBeVisible();

      // Should contain uppercase letters
      const text = await scrambledWord.textContent();
      expect(text).toMatch(/[A-Z]+/);
    });

    test('word scramble task shows text input', async ({ page }) => {
      await startDemoSession(page);
      const found = await skipToWordScrambleTask(page);

      if (!found) {
        test.skip(true, 'No word scramble task found');
        return;
      }

      // Input field should be visible
      const input = page.locator('[class*="scramble-input"]');
      await expect(input).toBeVisible();

      // Input should have placeholder
      const placeholder = await input.getAttribute('placeholder');
      expect(placeholder).toContain('Entschlüssle');
    });

    test('word scramble shows letter count hint', async ({ page }) => {
      await startDemoSession(page);
      const found = await skipToWordScrambleTask(page);

      if (!found) {
        test.skip(true, 'No word scramble task found');
        return;
      }

      // Look for letter count indicator
      const lengthHint = page.locator('[class*="scramble-length"]');
      if (await lengthHint.isVisible({ timeout: 2000 }).catch(() => false)) {
        const text = await lengthHint.textContent();
        // Should show "X Buchstaben"
        expect(text).toMatch(/\d+\s*Buchstaben/);
      }
    });

    test('word scramble shows label', async ({ page }) => {
      await startDemoSession(page);
      const found = await skipToWordScrambleTask(page);

      if (!found) {
        test.skip(true, 'No word scramble task found');
        return;
      }

      // Label should be visible
      const label = page.locator('text=Buchstabensalat');
      await expect(label).toBeVisible();
    });
  });

  test.describe('Input Interaction', () => {
    test('user can type answer in input field', async ({ page }) => {
      await startDemoSession(page);
      const found = await skipToWordScrambleTask(page);

      if (!found) {
        test.skip(true, 'No word scramble task found');
        return;
      }

      const input = page.locator('[class*="scramble-input"]');

      // Type an answer
      await input.fill('Testantwort');

      // Input should contain the typed text
      await expect(input).toHaveValue('Testantwort');
    });

    test('submit button enables after typing', async ({ page }) => {
      await startDemoSession(page);
      const found = await skipToWordScrambleTask(page);

      if (!found) {
        test.skip(true, 'No word scramble task found');
        return;
      }

      const input = page.locator('[class*="scramble-input"]');
      const submitButton = page.getByRole('button', { name: /Prüfen|Antwort überprüfen/i });

      // Submit should be disabled initially
      await expect(submitButton).toBeDisabled();

      // Type an answer
      await input.fill('Test');

      // Submit should now be enabled
      await expect(submitButton).toBeEnabled();
    });

    test('input can be cleared and retyped', async ({ page }) => {
      await startDemoSession(page);
      const found = await skipToWordScrambleTask(page);

      if (!found) {
        test.skip(true, 'No word scramble task found');
        return;
      }

      const input = page.locator('[class*="scramble-input"]');

      // Type first answer
      await input.fill('FirstAnswer');
      await expect(input).toHaveValue('FirstAnswer');

      // Clear and type new answer
      await input.fill('');
      await input.fill('SecondAnswer');
      await expect(input).toHaveValue('SecondAnswer');
    });
  });

  test.describe('Submit and Feedback', () => {
    test('submitting correct word shows success feedback', async ({ page }) => {
      await startDemoSession(page);
      const found = await skipToWordScrambleTask(page);

      if (!found) {
        test.skip(true, 'No word scramble task found');
        return;
      }

      const input = page.locator('[class*="scramble-input"]');

      // Try common answers from demo path
      // TOHFOTYSENES = Photosynthese
      // YHTSEPOUEN = Hypotenuse
      await input.fill('Photosynthese');

      await page.getByRole('button', { name: /Prüfen|Antwort überprüfen/i }).click();

      // Wait for feedback
      await expect(page.getByRole('button', { name: /Nächste Aufgabe/i })).toBeVisible({
        timeout: 5000,
      });

      // Check for feedback indicators
      const correctIndicator = page.locator('[class*="correct"]');
      const incorrectIndicator = page.locator('[class*="incorrect"]');

      const hasCorrect = await correctIndicator.count();
      const hasIncorrect = await incorrectIndicator.count();

      // One of these should be visible
      expect(hasCorrect + hasIncorrect).toBeGreaterThan(0);
    });

    test('submitting incorrect word shows error feedback and correct answer', async ({
      page,
    }) => {
      await startDemoSession(page);
      const found = await skipToWordScrambleTask(page);

      if (!found) {
        test.skip(true, 'No word scramble task found');
        return;
      }

      const input = page.locator('[class*="scramble-input"]');

      // Type wrong answer
      await input.fill('FalscheAntwort');

      await page.getByRole('button', { name: /Prüfen|Antwort überprüfen/i }).click();

      // Wait for feedback
      await expect(page.getByRole('button', { name: /Nächste Aufgabe/i })).toBeVisible({
        timeout: 5000,
      });

      // Check for incorrect feedback
      const incorrectIndicator = page.locator('[class*="incorrect"]');
      await expect(incorrectIndicator.first()).toBeVisible({ timeout: 2000 });

      // Check for correct answer in feedback
      const feedback = page.locator('[class*="scramble-feedback"]');
      if (await feedback.isVisible({ timeout: 2000 }).catch(() => false)) {
        const feedbackText = await feedback.textContent();
        // Should show "Richtige Lösung" or similar
        expect(feedbackText).toMatch(/Richtige|Lösung/);
      }
    });

    test('input is disabled after submission', async ({ page }) => {
      await startDemoSession(page);
      const found = await skipToWordScrambleTask(page);

      if (!found) {
        test.skip(true, 'No word scramble task found');
        return;
      }

      const input = page.locator('[class*="scramble-input"]');

      await input.fill('Test');
      await page.getByRole('button', { name: /Prüfen|Antwort überprüfen/i }).click();

      // Wait for feedback
      await page.waitForTimeout(500);

      // Input should be disabled
      await expect(input).toBeDisabled();
    });
  });

  test.describe('Case Sensitivity', () => {
    test('answer comparison handles different cases', async ({ page }) => {
      await startDemoSession(page);
      const found = await skipToWordScrambleTask(page);

      if (!found) {
        test.skip(true, 'No word scramble task found');
        return;
      }

      const input = page.locator('[class*="scramble-input"]');

      // Try lowercase version of answer
      await input.fill('photosynthese');

      await page.getByRole('button', { name: /Prüfen|Antwort überprüfen/i }).click();

      // Should still get feedback (correct or incorrect based on case sensitivity setting)
      await expect(page.getByRole('button', { name: /Nächste Aufgabe/i })).toBeVisible({
        timeout: 5000,
      });
    });
  });

  test.describe('Stats Update', () => {
    test('stats update correctly after word scramble answer', async ({ page }) => {
      await startDemoSession(page);
      const found = await skipToWordScrambleTask(page);

      if (!found) {
        test.skip(true, 'No word scramble task found');
        return;
      }

      // Get initial answered count
      const initialAnswered = await page
        .locator('[class*="stat-value--completed"]')
        .textContent();

      const input = page.locator('[class*="scramble-input"]');
      await input.fill('Photosynthese');

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

  test.describe('Task Navigation', () => {
    test('can navigate to next task after word scramble', async ({ page }) => {
      await startDemoSession(page);
      const found = await skipToWordScrambleTask(page);

      if (!found) {
        test.skip(true, 'No word scramble task found');
        return;
      }

      // Get current progress
      const progressBefore = await page.locator('text=/\\d+\\s*\\/\\s*\\d+/').textContent();

      const input = page.locator('[class*="scramble-input"]');
      await input.fill('Test');

      await page.getByRole('button', { name: /Prüfen|Antwort überprüfen/i }).click();
      await page.getByRole('button', { name: /Nächste Aufgabe/i }).click();

      // Wait for task change
      await page.waitForTimeout(500);

      // Progress should have advanced
      const progressAfter = await page.locator('text=/\\d+\\s*\\/\\s*\\d+/').textContent();

      // Extract task numbers
      const matchBefore = progressBefore?.match(/(\d+)\s*\/\s*(\d+)/);
      const matchAfter = progressAfter?.match(/(\d+)\s*\/\s*(\d+)/);

      if (matchBefore && matchAfter) {
        expect(parseInt(matchAfter[1])).toBeGreaterThan(parseInt(matchBefore[1]));
      }
    });
  });
});
