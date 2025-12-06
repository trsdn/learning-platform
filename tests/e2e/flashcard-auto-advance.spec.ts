import { test, expect } from '@playwright/test';
import { login } from './auth.setup';

/**
 * Flashcard Auto-Advance E2E Tests
 *
 * Tests that flashcard tasks auto-advance after self-assessment.
 * This is a regression test for issue #152 (fixed in PR #156).
 *
 * Uses the Spanish flashcard learning path which has 98 flashcard tasks.
 */

/**
 * Helper to navigate to Spanish flashcard learning path and start session
 */
async function startFlashcardSession(page: import('@playwright/test').Page) {
  // Click on Spanisch topic
  await page.getByRole('button', { name: /Spanisch/i }).click();
  await page.waitForSelector('text=Vokabeltest - Karteikarten', { timeout: 10000 });

  // Select the flashcard learning path
  await page.getByText('Vokabeltest - Karteikarten').click();

  // Start the session
  await page.getByRole('button', { name: /Starten/i }).click();

  // Wait for first task to load (progress indicator shows 1/98)
  await expect(page.getByText(/1\s*\/\s*98/)).toBeVisible({ timeout: 10000 });
}

test.describe('Flashcard Auto-Advance', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test.describe('Reveal Button', () => {
    test('flashcard reveal button shows answer before self-assessment', async ({ page }) => {
      await startFlashcardSession(page);

      // Verify reveal button is visible initially
      const revealButton = page.getByRole('button', { name: /Ergebnis anzeigen/i });
      await expect(revealButton).toBeVisible({ timeout: 5000 });

      // Self-assessment buttons should NOT be visible before reveal
      await expect(page.getByRole('button', { name: /Gewusst/i })).not.toBeVisible();
      await expect(page.getByRole('button', { name: /Nicht gewusst/i })).not.toBeVisible();

      // Click reveal button
      await revealButton.click();

      // After reveal, the reveal button should be hidden
      await expect(revealButton).not.toBeVisible({ timeout: 2000 });

      // Self-assessment buttons should now be visible
      await expect(page.getByRole('button', { name: /Gewusst/i })).toBeVisible({ timeout: 2000 });
      await expect(page.getByRole('button', { name: /Nicht gewusst/i })).toBeVisible();
    });
  });

  test.describe('Self-Assessment Auto-Advance', () => {
    test('clicking Gewusst advances to next task', async ({ page }) => {
      await startFlashcardSession(page);

      // Verify we're on task 1
      await expect(page.getByText(/1\s*\/\s*98/)).toBeVisible();

      // Click reveal to show answer
      await page.getByRole('button', { name: /Ergebnis anzeigen/i }).click();

      // Wait for self-assessment buttons to appear
      const gewusstButton = page.getByRole('button', { name: /Gewusst/i });
      await expect(gewusstButton).toBeVisible({ timeout: 2000 });

      // Click "Gewusst" (known)
      await gewusstButton.click();

      // Wait for auto-advance (300ms delay + render time)
      // Should now be on task 2/98
      await expect(page.getByText(/2\s*\/\s*98/)).toBeVisible({ timeout: 3000 });

      // Reveal button should be visible again for the new task
      await expect(page.getByRole('button', { name: /Ergebnis anzeigen/i })).toBeVisible({ timeout: 2000 });
    });

    test('clicking Nicht gewusst advances to next task', async ({ page }) => {
      await startFlashcardSession(page);

      // Verify we're on task 1
      await expect(page.getByText(/1\s*\/\s*98/)).toBeVisible();

      // Click reveal to show answer
      await page.getByRole('button', { name: /Ergebnis anzeigen/i }).click();

      // Wait for self-assessment buttons to appear
      const nichtGewusstButton = page.getByRole('button', { name: /Nicht gewusst/i });
      await expect(nichtGewusstButton).toBeVisible({ timeout: 2000 });

      // Click "Nicht gewusst" (not known)
      await nichtGewusstButton.click();

      // Wait for auto-advance (300ms delay + render time)
      // Should now be on task 2/98
      await expect(page.getByText(/2\s*\/\s*98/)).toBeVisible({ timeout: 3000 });

      // Reveal button should be visible again for the new task
      await expect(page.getByRole('button', { name: /Ergebnis anzeigen/i })).toBeVisible({ timeout: 2000 });
    });

    test('multiple flashcards can be completed in sequence', async ({ page }) => {
      await startFlashcardSession(page);

      // Complete 3 flashcards in sequence to verify consistent behavior
      for (let i = 1; i <= 3; i++) {
        // Verify current task number
        await expect(page.getByText(new RegExp(`${i}\\s*\\/\\s*98`))).toBeVisible({ timeout: 3000 });

        // Reveal answer
        await page.getByRole('button', { name: /Ergebnis anzeigen/i }).click();

        // Alternate between Gewusst and Nicht gewusst
        if (i % 2 === 1) {
          await page.getByRole('button', { name: /Gewusst/i }).click();
        } else {
          await page.getByRole('button', { name: /Nicht gewusst/i }).click();
        }

        // Wait for transition to next task (unless we've finished)
        if (i < 3) {
          await expect(page.getByText(new RegExp(`${i + 1}\\s*\\/\\s*98`))).toBeVisible({ timeout: 3000 });
        }
      }

      // Should now be on task 4
      await expect(page.getByText(/4\s*\/\s*98/)).toBeVisible({ timeout: 3000 });
    });
  });
});
