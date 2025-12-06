import { test, expect, type Page } from '@playwright/test';
import { login } from './auth.setup';

/**
 * Practice Session Keyboard Shortcuts E2E Tests
 *
 * Tests keyboard navigation and shortcuts during practice sessions.
 * This is a regression test for issue #159.
 *
 * Shortcuts tested:
 * - Enter: Submit answer / Next task
 * - Escape: Cancel session / Hide hint / Close shortcuts overlay
 * - H: Toggle hint visibility
 * - ?: Show/hide keyboard shortcuts overlay
 *
 * Uses the test learning path "Alle Aufgabentypen - Demo" which has tasks with hints.
 */

/**
 * Helper to navigate to test learning path and start a session
 */
async function startTestSession(page: Page) {
  // Navigate to Test topic
  await page.getByRole('button', { name: /Test/i }).click();
  await page.waitForSelector('text=Alle Aufgabentypen', { timeout: 10000 });

  // Select the demo learning path
  await page.getByText('Alle Aufgabentypen').click();

  // Start the session
  await page.getByRole('button', { name: /Starten/i }).click();

  // Wait for first task to load (progress indicator visible)
  await expect(page.getByText(/1\s*\/\s*\d+/)).toBeVisible({ timeout: 10000 });
}

/**
 * Helper to select an answer for multiple choice task
 */
async function selectMultipleChoiceAnswer(page: Page) {
  // Wait for options to be visible and click the first one
  const option = page.locator('[data-testid="option-0"], button:has-text("Blau")').first();
  await option.waitFor({ state: 'visible', timeout: 5000 });
  await option.click();
}

test.describe('Practice Session Keyboard Shortcuts', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test.describe('Keyboard Shortcuts Overlay', () => {
    test('? key shows keyboard shortcuts overlay', async ({ page }) => {
      await startTestSession(page);

      // Verify shortcuts overlay is NOT visible initially
      await expect(page.getByRole('dialog', { name: /Tastaturkürzel/i })).not.toBeVisible();

      // Press ? to show shortcuts
      await page.keyboard.press('Shift+?');

      // Verify shortcuts overlay is visible
      await expect(page.getByRole('dialog', { name: /Tastaturkürzel/i })).toBeVisible({ timeout: 2000 });
      await expect(page.getByText('Tastaturkürzel')).toBeVisible();

      // Verify some shortcuts are listed
      await expect(page.getByText('Sitzung abbrechen')).toBeVisible();
      await expect(page.getByText('Antwort überprüfen')).toBeVisible();
    });

    test('Escape closes keyboard shortcuts overlay', async ({ page }) => {
      await startTestSession(page);

      // Open shortcuts overlay
      await page.keyboard.press('Shift+?');
      await expect(page.getByRole('dialog', { name: /Tastaturkürzel/i })).toBeVisible({ timeout: 2000 });

      // Press Escape to close
      await page.keyboard.press('Escape');

      // Verify overlay is closed
      await expect(page.getByRole('dialog', { name: /Tastaturkürzel/i })).not.toBeVisible({ timeout: 2000 });

      // Verify we're still in the session (task is visible)
      await expect(page.getByText(/1\s*\/\s*\d+/)).toBeVisible();
    });

    test('? key toggles shortcuts overlay off', async ({ page }) => {
      await startTestSession(page);

      // Open shortcuts overlay
      await page.keyboard.press('Shift+?');
      await expect(page.getByRole('dialog', { name: /Tastaturkürzel/i })).toBeVisible({ timeout: 2000 });

      // Press ? again to close
      await page.keyboard.press('Shift+?');

      // Verify overlay is closed
      await expect(page.getByRole('dialog', { name: /Tastaturkürzel/i })).not.toBeVisible({ timeout: 2000 });
    });
  });

  test.describe('Enter Key - Submit and Navigate', () => {
    test('Enter submits answer when task is complete', async ({ page }) => {
      await startTestSession(page);

      // Wait for task to load and select an answer
      await selectMultipleChoiceAnswer(page);

      // Wait for submit button to be enabled (answer selected)
      await expect(page.getByRole('button', { name: /Überprüfen/i })).toBeEnabled({ timeout: 3000 });

      // Press Enter to submit
      await page.keyboard.press('Enter');

      // Verify feedback is shown (correct/incorrect indicator)
      await expect(
        page.locator('[class*="feedback"], [class*="correct"], [class*="incorrect"], text=/Richtig|Falsch|Korrekt|Weiter/i')
      ).toBeVisible({ timeout: 3000 });
    });

    test('Enter advances to next task after feedback', async ({ page }) => {
      await startTestSession(page);

      // Verify we're on task 1
      await expect(page.getByText(/1\s*\/\s*\d+/)).toBeVisible();

      // Select answer and submit
      await selectMultipleChoiceAnswer(page);
      await page.keyboard.press('Enter');

      // Wait for feedback to be shown
      await expect(page.getByRole('button', { name: /Weiter/i })).toBeVisible({ timeout: 3000 });

      // Press Enter to advance to next task
      await page.keyboard.press('Enter');

      // Verify we're on task 2
      await expect(page.getByText(/2\s*\/\s*\d+/)).toBeVisible({ timeout: 3000 });
    });
  });

  test.describe('Escape Key - Cancel Session', () => {
    test('Escape key cancels session and returns to topic', async ({ page }) => {
      await startTestSession(page);

      // Verify we're in a session
      await expect(page.getByText(/1\s*\/\s*\d+/)).toBeVisible();

      // Press Escape to cancel
      await page.keyboard.press('Escape');

      // Should show confirmation or return to topic view
      // Wait for either confirmation dialog or topic view
      await expect(
        page.locator('text=Lernpfade, text=Themen, [role="dialog"]:has-text("abbrechen")').first()
      ).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('H Key - Hint Toggle', () => {
    test('H key toggles hint visibility', async ({ page }) => {
      await startTestSession(page);

      // First task should have a hint ("Denke an einen sonnigen Tag")
      // Verify hint is NOT visible initially
      await expect(page.getByText(/Denke an einen sonnigen Tag/i)).not.toBeVisible();

      // Press H to show hint
      await page.keyboard.press('h');

      // Verify hint is visible (the hint content or hint container)
      await expect(
        page.locator('[class*="hint"]:visible, text=/Denke an|Hinweis/i')
      ).toBeVisible({ timeout: 2000 });

      // Press H again to hide hint
      await page.keyboard.press('h');

      // Verify hint is hidden
      await expect(page.getByText(/Denke an einen sonnigen Tag/i)).not.toBeVisible({ timeout: 2000 });
    });
  });

  test.describe('Escape Key - Hide Hint', () => {
    test('Escape hides hint when visible instead of canceling session', async ({ page }) => {
      await startTestSession(page);

      // Show hint first
      await page.keyboard.press('h');
      await expect(
        page.locator('[class*="hint"]:visible, text=/Denke an|Hinweis/i')
      ).toBeVisible({ timeout: 2000 });

      // Press Escape - should hide hint, NOT cancel session
      await page.keyboard.press('Escape');

      // Verify hint is hidden
      await expect(page.getByText(/Denke an einen sonnigen Tag/i)).not.toBeVisible({ timeout: 2000 });

      // Verify we're still in the session
      await expect(page.getByText(/1\s*\/\s*\d+/)).toBeVisible();
    });
  });

  test.describe('Keyboard Shortcut Integration', () => {
    test('complete task workflow using only keyboard', async ({ page }) => {
      await startTestSession(page);

      // Verify on task 1
      await expect(page.getByText(/1\s*\/\s*\d+/)).toBeVisible();

      // Show shortcuts to verify they work
      await page.keyboard.press('Shift+?');
      await expect(page.getByRole('dialog', { name: /Tastaturkürzel/i })).toBeVisible({ timeout: 2000 });
      await page.keyboard.press('Escape');
      await expect(page.getByRole('dialog', { name: /Tastaturkürzel/i })).not.toBeVisible({ timeout: 2000 });

      // Show hint
      await page.keyboard.press('h');
      await expect(
        page.locator('[class*="hint"]:visible, text=/Denke an|Hinweis/i')
      ).toBeVisible({ timeout: 2000 });

      // Hide hint with Escape
      await page.keyboard.press('Escape');

      // Select answer (need to use mouse for option selection)
      await selectMultipleChoiceAnswer(page);

      // Submit with Enter
      await page.keyboard.press('Enter');

      // Wait for feedback
      await expect(page.getByRole('button', { name: /Weiter/i })).toBeVisible({ timeout: 3000 });

      // Advance with Enter
      await page.keyboard.press('Enter');

      // Verify on task 2
      await expect(page.getByText(/2\s*\/\s*\d+/)).toBeVisible({ timeout: 3000 });
    });
  });
});
