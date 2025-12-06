import { test, expect, type Page } from '@playwright/test';
import { login } from './auth.setup';

/**
 * Task Content Changes E2E Tests
 *
 * Tests that task content changes correctly after submission without page reload.
 * This addresses the P0 requirement from issue #173.
 *
 * Bug reference: Task content was not changing after submit, requiring page reload.
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
 * Helper to skip to a specific task number
 */
async function skipToTask(page: Page, taskNum: number) {
  for (let i = 2; i <= taskNum; i++) {
    await page.getByRole('button', { name: /Überspringen/i }).click();
    await expect(page.getByText(new RegExp(`${i}\\s*\\/\\s*10`))).toBeVisible({ timeout: 5000 });
  }
}

/**
 * Helper to get the current task question text
 */
async function getQuestionText(page: Page): Promise<string | null> {
  // Try to get question from question header
  const questionHeader = page.locator('[class*="question-text"]');
  if (await questionHeader.count() > 0) {
    return await questionHeader.first().textContent();
  }

  // For flashcards, get the front content
  const flashcardFront = page.locator('[class*="flashcard__front"]');
  if (await flashcardFront.count() > 0) {
    return await flashcardFront.textContent();
  }

  return null;
}


test.describe('Task Content Changes', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test.describe('Content Refresh After Submit', () => {
    test('task content changes after correct answer submission', async ({ page }) => {
      await startDemoSession(page);
      await skipToTask(page, 5); // Go to multiple choice task

      // Capture current question text
      const initialQuestion = await getQuestionText(page);
      expect(initialQuestion).not.toBeNull();

      // Answer the question correctly
      await page.getByRole('button', { name: /Option.*Blau/i }).click();
      await page.getByRole('button', { name: /Prüfen|Antwort überprüfen/i }).click();

      // Feedback should display
      await expect(page.getByRole('button', { name: /Nächste Aufgabe/i })).toBeVisible({ timeout: 5000 });

      // Verify question text is still visible during feedback
      // (this was a bug where content would disappear)
      const questionDuringFeedback = await getQuestionText(page);
      expect(questionDuringFeedback).not.toBeNull();

      // Move to next task
      await page.getByRole('button', { name: /Nächste Aufgabe/i }).click();

      // Wait for new task to load
      await expect(page.getByText(/6\s*\/\s*10/)).toBeVisible({ timeout: 5000 });

      // Verify new question is different
      const newQuestion = await getQuestionText(page);
      expect(newQuestion).not.toBeNull();
      expect(newQuestion).not.toBe(initialQuestion);
    });

    test('task content changes after incorrect answer submission', async ({ page }) => {
      await startDemoSession(page);
      await skipToTask(page, 5);

      // Capture current question text
      const initialQuestion = await getQuestionText(page);

      // Answer incorrectly
      await page.getByRole('button', { name: /Option.*Rot/i }).click();
      await page.getByRole('button', { name: /Prüfen|Antwort überprüfen/i }).click();

      // Feedback should show incorrect
      await expect(page.getByRole('button', { name: /Nächste Aufgabe/i })).toBeVisible({ timeout: 5000 });

      // Move to next task
      await page.getByRole('button', { name: /Nächste Aufgabe/i }).click();

      // Wait for new task
      await expect(page.getByText(/6\s*\/\s*10/)).toBeVisible({ timeout: 5000 });

      // Verify new question is different
      const newQuestion = await getQuestionText(page);
      expect(newQuestion).not.toBe(initialQuestion);
    });
  });

  test.describe('No Page Reload', () => {
    test('page does not reload when advancing to next task', async ({ page }) => {
      await startDemoSession(page);
      await skipToTask(page, 5);

      // Inject a marker into the DOM to detect reload
      await page.evaluate(() => {
        (window as unknown as Record<string, boolean>).__testMarker = true;
      });

      // Verify marker exists
      const markerBefore = await page.evaluate(() => {
        return (window as unknown as Record<string, boolean>).__testMarker;
      });
      expect(markerBefore).toBe(true);

      // Answer and advance
      await page.getByRole('button', { name: /Option.*Blau/i }).click();
      await page.getByRole('button', { name: /Prüfen|Antwort überprüfen/i }).click();
      await page.getByRole('button', { name: /Nächste Aufgabe/i }).click();

      // Wait for new task
      await expect(page.getByText(/6\s*\/\s*10/)).toBeVisible({ timeout: 5000 });

      // Verify marker still exists (no reload occurred)
      const markerAfter = await page.evaluate(() => {
        return (window as unknown as Record<string, boolean>).__testMarker;
      });
      expect(markerAfter).toBe(true);
    });

    test('stats container persists across task transitions', async ({ page }) => {
      await startDemoSession(page);
      await skipToTask(page, 5);

      // Get reference to stats container
      const statsContainer = page.locator('[class*="practice-session__stats"]');
      await expect(statsContainer).toBeVisible();

      // Get initial bounding box
      const initialBox = await statsContainer.boundingBox();
      expect(initialBox).not.toBeNull();

      // Answer and advance
      await page.getByRole('button', { name: /Option.*Blau/i }).click();
      await page.getByRole('button', { name: /Prüfen|Antwort überprüfen/i }).click();
      await page.getByRole('button', { name: /Nächste Aufgabe/i }).click();

      // Wait for new task
      await expect(page.getByText(/6\s*\/\s*10/)).toBeVisible({ timeout: 5000 });

      // Stats container should still be visible
      await expect(statsContainer).toBeVisible();
    });
  });

  test.describe('Feedback Display', () => {
    test('feedback appears after submission without page reload', async ({ page }) => {
      await startDemoSession(page);
      await skipToTask(page, 5);

      // Inject reload detection marker
      await page.evaluate(() => {
        (window as unknown as Record<string, boolean>).__feedbackTestMarker = true;
      });

      // Answer the question
      await page.getByRole('button', { name: /Option.*Blau/i }).click();
      await page.getByRole('button', { name: /Prüfen|Antwort überprüfen/i }).click();

      // Feedback button should appear
      await expect(page.getByRole('button', { name: /Nächste Aufgabe/i })).toBeVisible({ timeout: 5000 });

      // Verify no reload during feedback
      const markerIntact = await page.evaluate(() => {
        return (window as unknown as Record<string, boolean>).__feedbackTestMarker;
      });
      expect(markerIntact).toBe(true);
    });

    test('correct answer shows success indicator', async ({ page }) => {
      await startDemoSession(page);
      await skipToTask(page, 5);

      // Answer correctly
      await page.getByRole('button', { name: /Option.*Blau/i }).click();
      await page.getByRole('button', { name: /Prüfen|Antwort überprüfen/i }).click();

      // Should show success feedback
      const successIndicators = page.locator(
        '[class*="success"], [class*="correct"], text=Richtig, text=Korrekt'
      );
      await expect(successIndicators.first()).toBeVisible({ timeout: 5000 });
    });

    test('incorrect answer shows error indicator', async ({ page }) => {
      await startDemoSession(page);
      await skipToTask(page, 5);

      // Answer incorrectly
      await page.getByRole('button', { name: /Option.*Rot/i }).click();
      await page.getByRole('button', { name: /Prüfen|Antwort überprüfen/i }).click();

      // Should show error feedback
      const errorIndicators = page.locator(
        '[class*="error"], [class*="incorrect"], [class*="wrong"], text=Falsch, text=Leider'
      );
      await expect(errorIndicators.first()).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Task Type Transitions', () => {
    test('different task types can appear in sequence', async ({ page }) => {
      await startDemoSession(page);

      // Demo learning path has mixed task types:
      // 1-2: Cloze, 3-4: Matching, 5-6: Multiple Choice, 7-8: Multi-Select, 9-10: Ordering

      // Start on task 1 (cloze deletion)
      const clozeInputs = page.locator('input[type="text"]');
      await expect(clozeInputs.first()).toBeVisible({ timeout: 5000 });

      // Skip to task 3 (matching)
      await skipToTask(page, 3);
      const matchingSelects = page.locator('select, [role="combobox"]');
      await expect(matchingSelects.first()).toBeVisible({ timeout: 5000 });

      // Skip to task 5 (multiple choice)
      await page.getByRole('button', { name: /Überspringen/i }).click();
      await expect(page.getByText(/4\s*\/\s*10/)).toBeVisible({ timeout: 5000 });
      await page.getByRole('button', { name: /Überspringen/i }).click();
      await expect(page.getByText(/5\s*\/\s*10/)).toBeVisible({ timeout: 5000 });

      const mcOptions = page.getByRole('button', { name: /Option \d+:/ });
      await expect(mcOptions.first()).toBeVisible({ timeout: 5000 });

      // Skip to task 9 (ordering)
      for (let i = 6; i <= 9; i++) {
        await page.getByRole('button', { name: /Überspringen/i }).click();
        await expect(page.getByText(new RegExp(`${i}\\s*\\/\\s*10`))).toBeVisible({ timeout: 5000 });
      }

      // Verify ordering task elements (up/down arrows)
      await page.waitForSelector('text=Sortierung', { timeout: 10000 });
      const orderingButtons = page.getByRole('button', { name: /[↑↓]/ });
      await expect(orderingButtons.first()).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Flashcard Content Changes', () => {
    test('flashcard content changes after self-assessment', async ({ page }) => {
      // Navigate to Spanish flashcard path
      await page.getByRole('button', { name: /Spanisch/i }).click();
      await page.waitForSelector('text=Vokabeltest - Karteikarten', { timeout: 10000 });
      await page.getByText('Vokabeltest - Karteikarten').click();
      await page.getByRole('button', { name: /Starten/i }).click();
      await expect(page.getByText(/1\s*\/\s*98/)).toBeVisible({ timeout: 10000 });

      // Get initial flashcard content
      const initialContent = await page.locator('[class*="flashcard"]').first().textContent();

      // Reveal and assess
      await page.getByRole('button', { name: /Ergebnis anzeigen/i }).click();
      await page.getByRole('button', { name: /Gewusst/i }).click();

      // Wait for next card
      await expect(page.getByText(/2\s*\/\s*98/)).toBeVisible({ timeout: 3000 });

      // Verify content changed
      const newContent = await page.locator('[class*="flashcard"]').first().textContent();
      expect(newContent).not.toBe(initialContent);
    });
  });
});
