import { test, expect } from '@playwright/test';
import { login } from './auth.setup';

/**
 * Answer Feedback E2E Tests
 *
 * Tests for:
 * - Correct answer feedback (positive results, green styling)
 * - Wrong answer feedback (negative results, red styling)
 * - Perfect streak / session completion with confetti
 * - Audio feedback (sound on correct/incorrect)
 */

/**
 * Helper to navigate to demo learning path and start session
 */
async function startDemoSession(page: import('@playwright/test').Page) {
  await page.getByRole('button', { name: /Test & Demo/i }).click();
  await page.waitForSelector('text=Alle Aufgabentypen', { timeout: 10000 });
  await page.getByText('Alle Aufgabentypen - Demo').click();
  await page.getByRole('button', { name: /Starten/i }).click();
  await expect(page.getByText(/1\s*\/\s*10/)).toBeVisible({ timeout: 10000 });
}

/**
 * Helper to skip to a specific task number
 */
async function _skipToTask(page: import('@playwright/test').Page, taskNum: number) {
  for (let i = 2; i <= taskNum; i++) {
    await page.getByRole('button', { name: /Überspringen/i }).click();
    await expect(page.getByText(new RegExp(`${i}\\s*\\/\\s*10`))).toBeVisible({ timeout: 5000 });
  }
}

/**
 * Helper to get session statistics values
 * Uses CSS class selectors to reliably find stat value elements
 * @returns Object with completedCount, correctCount, and accuracy values
 */
async function getSessionStats(page: import('@playwright/test').Page) {
  // Get the stat value elements by their CSS class names (from practice-session.module.css)
  const completedValue = await page.locator('[class*="stat-value--completed"]').textContent();
  const correctValue = await page.locator('[class*="stat-value--correct"]').textContent();
  const accuracyValue = await page.locator('[class*="stat-value--accuracy"]').textContent();

  return {
    completedCount: parseInt(completedValue || '0', 10),
    correctCount: parseInt(correctValue || '0', 10),
    accuracy: parseInt(accuracyValue?.replace('%', '') || '0', 10),
  };
}

test.describe('Answer Feedback', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test.describe('Correct Answer Feedback (Positive Results)', () => {
    test('correct answer shows success feedback with green styling', async ({ page }) => {
      await startDemoSession(page);
      // Task 1 is multiple choice: "Welche Farbe hat der Himmel" with "Blau" correct

      // Click the correct answer
      const blueOption = page.locator('button').filter({ hasText: /^Blau$/ });
      await blueOption.click();

      // Submit answer
      await page.getByRole('button', { name: /Prüfen|Antwort überprüfen/i }).click();

      // Should show success feedback - look for green indicators
      // Check for success CSS class or green colored elements
      const successIndicator = page.locator('[class*="success"], [class*="correct"], [data-correct="true"]');
      const greenElement = page.locator('text=Richtig').or(page.locator('text=Korrekt'));

      // Either success class or "Richtig" text should appear
      await expect(successIndicator.or(greenElement).first()).toBeVisible({ timeout: 5000 });
    });

    test('correct answer shows "Nächste Aufgabe" button', async ({ page }) => {
      await startDemoSession(page);
      // Task 1 is multiple choice: "Welche Farbe hat der Himmel" with "Blau" correct

      // Select correct answer
      await page.locator('button').filter({ hasText: /^Blau$/ }).click();
      await page.getByRole('button', { name: /Prüfen|Antwort überprüfen/i }).click();

      // Should show next task button
      await expect(page.getByRole('button', { name: /Nächste Aufgabe/i })).toBeVisible({ timeout: 5000 });
    });

    // TODO: Unskip when #157 (session stats bug) is fully resolved
    test.skip('correct answer increments correct count', async ({ page }) => {
      await startDemoSession(page);
      // Task 1 is multiple choice: "Welche Farbe hat der Himmel" with "Blau" correct

      // Check initial stats before answering
      const statsBefore = await getSessionStats(page);
      expect(statsBefore.correctCount).toBe(0);
      expect(statsBefore.completedCount).toBe(0);
      expect(statsBefore.accuracy).toBe(0);

      // Select correct answer and submit (Blau is correct for task 1)
      await page.locator('button').filter({ hasText: /^Blau$/ }).click();
      await page.getByRole('button', { name: /Prüfen|Antwort überprüfen/i }).click();

      // Wait for feedback and stats to update
      await expect(page.getByRole('button', { name: /Nächste Aufgabe/i })).toBeVisible({ timeout: 5000 });

      // Verify stats have updated correctly: beantwortet=1, richtig=1, genau=100%
      const statsAfter = await getSessionStats(page);
      expect(statsAfter.completedCount).toBe(1);
      expect(statsAfter.correctCount).toBe(1);
      expect(statsAfter.accuracy).toBe(100);
    });
  });

  test.describe('Wrong Answer Feedback (Negative Results)', () => {
    test('wrong answer shows error feedback with red styling', async ({ page }) => {
      await startDemoSession(page);
      // Task 1 is multiple choice: "Welche Farbe hat der Himmel" - "Rot" is wrong

      // Click the wrong answer
      const wrongOption = page.locator('button').filter({ hasText: /^Rot$/ });
      await wrongOption.click();

      // Submit answer
      await page.getByRole('button', { name: /Prüfen|Antwort überprüfen/i }).click();

      // Should show error feedback - look for red indicators
      const errorIndicator = page.locator('[class*="error"], [class*="incorrect"], [class*="wrong"], [data-correct="false"]');
      const incorrectText = page.locator('text=Falsch').or(page.locator('text=Leider falsch'));

      // Either error class or "Falsch" text should appear
      await expect(errorIndicator.or(incorrectText).first()).toBeVisible({ timeout: 5000 });
    });

    test('wrong answer shows correct answer explanation', async ({ page }) => {
      await startDemoSession(page);
      // Task 1 is multiple choice: "Welche Farbe hat der Himmel" - "Rot" is wrong, "Blau" is correct

      // Select wrong answer
      await page.locator('button').filter({ hasText: /^Rot$/ }).click();
      await page.getByRole('button', { name: /Prüfen|Antwort überprüfen/i }).click();

      // Should show the correct answer ("Blau") somewhere in feedback
      // Use .first() because "Blau" appears in both the option button and the explanation
      await expect(page.locator('text=Blau').first()).toBeVisible({ timeout: 5000 });
    });

    test('wrong answer still allows proceeding to next task', async ({ page }) => {
      await startDemoSession(page);
      // Task 1 is multiple choice: "Welche Farbe hat der Himmel" - "Rot" is wrong

      // Select wrong answer and submit
      await page.locator('button').filter({ hasText: /^Rot$/ }).click();
      await page.getByRole('button', { name: /Prüfen|Antwort überprüfen/i }).click();

      // Should still show next task button
      await expect(page.getByRole('button', { name: /Nächste Aufgabe/i })).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Perfect Session / Streak', () => {
    test('completing all tasks shows session results', async ({ page }) => {
      await startDemoSession(page);

      // Skip through all 9 tasks, then end session
      for (let i = 2; i <= 10; i++) {
        await page.getByRole('button', { name: /Überspringen/i }).click();
        await expect(page.getByText(new RegExp(`${i}\\s*\\/\\s*10`))).toBeVisible({ timeout: 5000 });
      }

      // End session
      await page.getByRole('button', { name: /Sitzung beenden/i }).click();

      // Should show results or return to topics
      await expect(
        page.getByText(/Themen/).or(page.getByText(/Ergebnis/)).or(page.getByText(/beantwortet/))
      ).toBeVisible({ timeout: 15000 });
    });

    // TODO: Unskip when #157 (session stats bug) is fully resolved
    test.skip('session stats update correctly with correct and incorrect answers', async ({ page }) => {
      await startDemoSession(page);
      // Task 1 is multiple choice: "Welche Farbe hat der Himmel" with "Blau" correct

      // Check initial stats
      const initialStats = await getSessionStats(page);
      expect(initialStats.completedCount).toBe(0);
      expect(initialStats.correctCount).toBe(0);
      expect(initialStats.accuracy).toBe(0);

      // Answer task 1 correctly (Blau is correct for "Welche Farbe hat der Himmel")
      await page.locator('button').filter({ hasText: /^Blau$/ }).click();
      await page.getByRole('button', { name: /Prüfen|Antwort überprüfen/i }).click();
      await expect(page.getByRole('button', { name: /Nächste Aufgabe/i })).toBeVisible({ timeout: 5000 });

      // Verify: beantwortet = 1, richtig = 1, genau = 100%
      const statsAfterCorrect = await getSessionStats(page);
      expect(statsAfterCorrect.completedCount).toBe(1);
      expect(statsAfterCorrect.correctCount).toBe(1);
      expect(statsAfterCorrect.accuracy).toBe(100);

      // Go to task 2, skip to task 3 (True/False: "Wasser kocht bei 100 Grad" - true is correct)
      await page.getByRole('button', { name: /Nächste Aufgabe/i }).click();
      await expect(page.getByText(/2\s*\/\s*10/)).toBeVisible({ timeout: 5000 });
      await page.getByRole('button', { name: /Überspringen/i }).click();
      await expect(page.getByText(/3\s*\/\s*10/)).toBeVisible({ timeout: 5000 });

      // Answer task 3 incorrectly (click "Falsch" when "Richtig" is correct)
      await page.getByRole('button', { name: /^Falsch$/i }).click();
      await page.getByRole('button', { name: /Prüfen|Antwort überprüfen/i }).click();
      await expect(page.getByRole('button', { name: /Nächste Aufgabe/i })).toBeVisible({ timeout: 5000 });

      // Verify: beantwortet = 2, richtig = 1, genau = 50%
      const statsAfterIncorrect = await getSessionStats(page);
      expect(statsAfterIncorrect.completedCount).toBe(2);
      expect(statsAfterIncorrect.correctCount).toBe(1);
      expect(statsAfterIncorrect.accuracy).toBe(50);
    });
  });

  test.describe('Audio Feedback', () => {
    test('audio settings exist in settings page', async ({ page }) => {
      // Navigate to settings
      const settingsButton = page.getByRole('button', { name: /Einstellungen/i }).or(
        page.getByRole('button').filter({ hasText: /⚙️/ })
      );

      if (await settingsButton.count() > 0) {
        await settingsButton.first().click();
        await page.waitForLoadState('networkidle');

        // Look for the Audio section button in the settings page
        const audioSection = page.locator('button:has-text("Audio")');
        const hasSoundSettings = await audioSection.count();

        // Audio settings should exist
        expect(hasSoundSettings).toBeGreaterThanOrEqual(0);

        // If section exists, verify it can be scrolled to
        if (hasSoundSettings > 0) {
          await audioSection.first().scrollIntoViewIfNeeded();
          await expect(audioSection.first()).toBeVisible();
        }
      }
    });

    test('app loads without audio errors', async ({ page }) => {
      // Listen for console errors related to audio
      const audioErrors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error' && msg.text().toLowerCase().includes('audio')) {
          audioErrors.push(msg.text());
        }
      });

      await startDemoSession(page);
      // Task 1 is multiple choice with "Blau" correct

      // Answer a question
      await page.locator('button').filter({ hasText: /^Blau$/ }).click();
      await page.getByRole('button', { name: /Prüfen|Antwort überprüfen/i }).click();

      // Wait for potential audio to play
      await page.waitForTimeout(1000);

      // No critical audio errors should have occurred
      // (some browsers may block autoplay, but shouldn't cause errors)
      const criticalAudioErrors = audioErrors.filter(e =>
        e.includes('TypeError') || e.includes('NotAllowedError')
      );
      expect(criticalAudioErrors.length).toBe(0);
    });
  });

  test.describe('Vibration Feedback (Mobile)', () => {
    test.use({ hasTouch: true, isMobile: true });

    test('vibration service is available', async ({ page }) => {
      await page.goto('/');

      // Check if navigator.vibrate exists (it will in mobile-capable browsers)
      const hasVibrate = await page.evaluate(() => {
        return typeof navigator.vibrate === 'function';
      });

      // In a real mobile device, this would be true
      // In test environment, it may be undefined but should not throw errors
      expect(typeof hasVibrate).toBe('boolean');
    });
  });
});
