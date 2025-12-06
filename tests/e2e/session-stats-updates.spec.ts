import { test, expect, type Page } from '@playwright/test';
import { login } from './auth.setup';

/**
 * Session Stats Updates E2E Tests
 *
 * Tests that session statistics (beantwortet, richtig, genau) update correctly
 * during a practice session. This addresses the P0 requirement from issue #173.
 *
 * Bug reference: Stats were not updating properly, causing confusion about progress.
 */

/**
 * Helper to navigate to demo learning path and start session
 */
async function startDemoSession(page: Page) {
  await page.getByRole('button', { name: /Test & Demo/i }).click();
  await page.waitForSelector('text=Alle Aufgabentypen', { timeout: 10000 });
  await page.getByText('Alle Aufgabentypen - Demo').click();
  await page.getByRole('button', { name: /Starten/i }).click();
  await expect(page.getByText(/1\s*\/\s*10/)).toBeVisible({ timeout: 10000 });
}

/**
 * Helper to get current stats values from the UI
 */
async function getStats(page: Page): Promise<{ answered: number; correct: number; accuracy: number }> {
  // Find the stats container
  const statsContainer = page.locator('[class*="practice-session__stats"]');
  await expect(statsContainer).toBeVisible();

  // Get values by finding stat-value elements adjacent to their labels
  const answeredValue = await page
    .locator('[class*="stat-value--completed"]')
    .textContent();
  const correctValue = await page
    .locator('[class*="stat-value--correct"]')
    .textContent();
  const accuracyValue = await page
    .locator('[class*="stat-value--accuracy"]')
    .textContent();

  return {
    answered: parseInt(answeredValue || '0', 10),
    correct: parseInt(correctValue || '0', 10),
    accuracy: parseInt(accuracyValue?.replace('%', '') || '0', 10),
  };
}

/**
 * Helper to skip to a specific task number in demo session
 */
async function skipToTask(page: Page, taskNum: number) {
  for (let i = 2; i <= taskNum; i++) {
    await page.getByRole('button', { name: /Überspringen/i }).click();
    await expect(page.getByText(new RegExp(`${i}\\s*\\/\\s*10`))).toBeVisible({ timeout: 5000 });
  }
}

/**
 * Helper to answer a multiple choice question correctly
 */
async function answerMultipleChoiceCorrectly(page: Page) {
  // For task 5 (test-mc-1), the correct answer for "Welche Farbe hat der Himmel?" is "Blau"
  await page.getByRole('button', { name: /Option.*Blau/i }).click();
  await page.getByRole('button', { name: /Prüfen|Antwort überprüfen/i }).click();
  await expect(page.getByRole('button', { name: /Nächste Aufgabe/i })).toBeVisible({ timeout: 5000 });
}

/**
 * Helper to answer a multiple choice question incorrectly
 */
async function answerMultipleChoiceIncorrectly(page: Page) {
  // For task 5, "Rot" is wrong for "Welche Farbe hat der Himmel?"
  await page.getByRole('button', { name: /Option.*Rot/i }).click();
  await page.getByRole('button', { name: /Prüfen|Antwort überprüfen/i }).click();
  await expect(page.getByRole('button', { name: /Nächste Aufgabe/i })).toBeVisible({ timeout: 5000 });
}

test.describe('Session Stats Updates', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test.describe('Initial State', () => {
    test('stats show zero at session start', async ({ page }) => {
      await startDemoSession(page);

      const stats = await getStats(page);
      expect(stats.answered).toBe(0);
      expect(stats.correct).toBe(0);
      expect(stats.accuracy).toBe(0);
    });
  });

  test.describe('Stats Update on Correct Answer', () => {
    test('stats update after answering correctly', async ({ page }) => {
      await startDemoSession(page);
      await skipToTask(page, 5); // Go to multiple choice task

      // Verify initial stats
      const initialStats = await getStats(page);
      expect(initialStats.answered).toBe(0);
      expect(initialStats.correct).toBe(0);

      // Answer correctly
      await answerMultipleChoiceCorrectly(page);

      // Navigate to next task to trigger stats update
      await page.getByRole('button', { name: /Nächste Aufgabe/i }).click();
      await expect(page.getByText(/6\s*\/\s*10/)).toBeVisible({ timeout: 5000 });

      // Verify stats updated
      const newStats = await getStats(page);
      expect(newStats.answered).toBe(1);
      expect(newStats.correct).toBe(1);
      expect(newStats.accuracy).toBe(100);
    });
  });

  test.describe('Stats Update on Incorrect Answer', () => {
    test('stats update after answering incorrectly', async ({ page }) => {
      await startDemoSession(page);
      await skipToTask(page, 5);

      // Answer incorrectly
      await answerMultipleChoiceIncorrectly(page);

      // Navigate to next task
      await page.getByRole('button', { name: /Nächste Aufgabe/i }).click();
      await expect(page.getByText(/6\s*\/\s*10/)).toBeVisible({ timeout: 5000 });

      // Verify stats updated
      const stats = await getStats(page);
      expect(stats.answered).toBe(1);
      expect(stats.correct).toBe(0);
      expect(stats.accuracy).toBe(0);
    });
  });

  test.describe('Mixed Answers', () => {
    test('stats show correct percentage after mixed answers', async ({ page }) => {
      await startDemoSession(page);
      await skipToTask(page, 5); // Go to first multiple choice task

      // Answer first question correctly
      await answerMultipleChoiceCorrectly(page);
      await page.getByRole('button', { name: /Nächste Aufgabe/i }).click();
      await expect(page.getByText(/6\s*\/\s*10/)).toBeVisible({ timeout: 5000 });

      // Verify stats after first correct answer
      let stats = await getStats(page);
      expect(stats.answered).toBe(1);
      expect(stats.correct).toBe(1);
      expect(stats.accuracy).toBe(100);

      // Answer second question incorrectly (task 6 is test-mc-2)
      // Click any option and submit
      const options = page.getByRole('button', { name: /Option \d+:/ });
      await options.first().click();
      await page.getByRole('button', { name: /Prüfen|Antwort überprüfen/i }).click();
      await expect(page.getByRole('button', { name: /Nächste Aufgabe/i })).toBeVisible({ timeout: 5000 });
      await page.getByRole('button', { name: /Nächste Aufgabe/i }).click();
      await expect(page.getByText(/7\s*\/\s*10/)).toBeVisible({ timeout: 5000 });

      // Verify stats after second answer
      stats = await getStats(page);
      expect(stats.answered).toBe(2);
      // Correct count could be 1 or 2 depending on whether first option was correct
      expect(stats.correct).toBeLessThanOrEqual(2);
      expect(stats.correct).toBeGreaterThanOrEqual(1);
      // Accuracy should be either 50% (1/2) or 100% (2/2)
      expect([50, 100]).toContain(stats.accuracy);
    });
  });

  test.describe('Stats Persistence', () => {
    test('stats persist during session (no reset on task change)', async ({ page }) => {
      await startDemoSession(page);
      await skipToTask(page, 5);

      // Answer correctly
      await answerMultipleChoiceCorrectly(page);
      await page.getByRole('button', { name: /Nächste Aufgabe/i }).click();
      await expect(page.getByText(/6\s*\/\s*10/)).toBeVisible({ timeout: 5000 });

      // Verify stats
      const statsAfterFirst = await getStats(page);
      expect(statsAfterFirst.answered).toBe(1);

      // Skip to next task without answering
      await page.getByRole('button', { name: /Überspringen/i }).click();
      await expect(page.getByText(/7\s*\/\s*10/)).toBeVisible({ timeout: 5000 });

      // Stats should NOT have changed from skipping
      const statsAfterSkip = await getStats(page);
      expect(statsAfterSkip.answered).toBe(1);
      expect(statsAfterSkip.correct).toBe(1);
    });
  });

  test.describe('Flashcard Self-Assessment Stats', () => {
    test('flashcard Gewusst updates stats correctly', async ({ page }) => {
      // Navigate to Spanish flashcard learning path
      await page.getByRole('button', { name: /Spanisch/i }).click();
      await page.waitForSelector('text=Vokabeltest - Karteikarten', { timeout: 10000 });
      await page.getByText('Vokabeltest - Karteikarten').click();
      await page.getByRole('button', { name: /Starten/i }).click();
      await expect(page.getByText(/1\s*\/\s*98/)).toBeVisible({ timeout: 10000 });

      // Initial stats should be 0
      const initialStats = await getStats(page);
      expect(initialStats.answered).toBe(0);

      // Reveal flashcard
      await page.getByRole('button', { name: /Ergebnis anzeigen/i }).click();
      await expect(page.getByRole('button', { name: /Gewusst/i })).toBeVisible({ timeout: 2000 });

      // Click "Gewusst" (known)
      await page.getByRole('button', { name: /Gewusst/i }).click();

      // Wait for auto-advance to next task
      await expect(page.getByText(/2\s*\/\s*98/)).toBeVisible({ timeout: 3000 });

      // Verify stats updated
      const stats = await getStats(page);
      expect(stats.answered).toBe(1);
      expect(stats.correct).toBe(1);
      expect(stats.accuracy).toBe(100);
    });

    test('flashcard Nicht gewusst updates stats correctly', async ({ page }) => {
      // Navigate to Spanish flashcard learning path
      await page.getByRole('button', { name: /Spanisch/i }).click();
      await page.waitForSelector('text=Vokabeltest - Karteikarten', { timeout: 10000 });
      await page.getByText('Vokabeltest - Karteikarten').click();
      await page.getByRole('button', { name: /Starten/i }).click();
      await expect(page.getByText(/1\s*\/\s*98/)).toBeVisible({ timeout: 10000 });

      // Reveal flashcard
      await page.getByRole('button', { name: /Ergebnis anzeigen/i }).click();
      await expect(page.getByRole('button', { name: /Nicht gewusst/i })).toBeVisible({ timeout: 2000 });

      // Click "Nicht gewusst" (not known)
      await page.getByRole('button', { name: /Nicht gewusst/i }).click();

      // Wait for auto-advance
      await expect(page.getByText(/2\s*\/\s*98/)).toBeVisible({ timeout: 3000 });

      // Verify stats updated
      const stats = await getStats(page);
      expect(stats.answered).toBe(1);
      expect(stats.correct).toBe(0);
      expect(stats.accuracy).toBe(0);
    });

    test('flashcard stats update correctly after multiple cards', async ({ page }) => {
      // Navigate to Spanish flashcard learning path
      await page.getByRole('button', { name: /Spanisch/i }).click();
      await page.waitForSelector('text=Vokabeltest - Karteikarten', { timeout: 10000 });
      await page.getByText('Vokabeltest - Karteikarten').click();
      await page.getByRole('button', { name: /Starten/i }).click();
      await expect(page.getByText(/1\s*\/\s*98/)).toBeVisible({ timeout: 10000 });

      // Answer 3 flashcards: correct, incorrect, correct (should be 67% accuracy)
      const answers = [true, false, true]; // Gewusst, Nicht gewusst, Gewusst

      for (let i = 0; i < answers.length; i++) {
        await page.getByRole('button', { name: /Ergebnis anzeigen/i }).click();

        if (answers[i]) {
          await page.getByRole('button', { name: /Gewusst/i }).click();
        } else {
          await page.getByRole('button', { name: /Nicht gewusst/i }).click();
        }

        // Wait for next card
        await expect(page.getByText(new RegExp(`${i + 2}\\s*\\/\\s*98`))).toBeVisible({ timeout: 3000 });
      }

      // Verify final stats
      const stats = await getStats(page);
      expect(stats.answered).toBe(3);
      expect(stats.correct).toBe(2);
      expect(stats.accuracy).toBe(67); // 2/3 = 66.67% rounds to 67%
    });
  });
});
