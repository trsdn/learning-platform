import { test, expect } from '@playwright/test';
import { login } from './auth.setup';

/**
 * E2E Tests for Hint Functionality in Practice Sessions
 *
 * Tests the hint feature implementation in PracticeSessionContainer.tsx (lines 408-426):
 * - Hint button visibility when task has hint
 * - Hint text show/hide toggle
 * - Hint hidden during feedback display
 * - Keyboard shortcut (H key) for toggling hint
 *
 * Issue #160
 */
test.describe('Hint Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);

    // Navigate to demo learning path (all tasks have hints)
    await page.getByRole('button', { name: /Test & Demo/i }).click();
    await page.waitForSelector('text=Alle Aufgabentypen', { timeout: 10000 });
    await page.getByText('Alle Aufgabentypen - Demo').click();
    await page.getByRole('button', { name: /Starten/i }).click();

    // Wait for session to start
    await expect(page.getByText(/1\s*\/\s*\d+/)).toBeVisible({ timeout: 10000 });
  });

  test('hint button is visible when task has hint', async ({ page }) => {
    // The demo learning path tasks all have hints
    // Look for the hint button with text "Hinweis anzeigen (H)"
    const hintButton = page.getByRole('button', { name: /Hinweis anzeigen/i });

    await expect(hintButton).toBeVisible({ timeout: 5000 });
    await expect(hintButton).toContainText('(H)');
  });

  test('clicking hint button shows hint text', async ({ page }) => {
    // Click the hint button to show the hint
    const hintButton = page.getByRole('button', { name: /Hinweis anzeigen/i });
    await hintButton.click();

    // Verify hint text is displayed with the hint icon and label
    const hintDisplay = page.locator('text=Hinweis:');
    await expect(hintDisplay).toBeVisible({ timeout: 3000 });

    // Button text should change to "Hinweis verbergen"
    await expect(page.getByRole('button', { name: /Hinweis verbergen/i })).toBeVisible();
  });

  test('clicking hint button again hides hint text', async ({ page }) => {
    // Show the hint first
    const showHintButton = page.getByRole('button', { name: /Hinweis anzeigen/i });
    await showHintButton.click();

    // Verify hint is visible
    await expect(page.locator('text=Hinweis:')).toBeVisible({ timeout: 3000 });

    // Click hide button
    const hideHintButton = page.getByRole('button', { name: /Hinweis verbergen/i });
    await hideHintButton.click();

    // Verify hint is hidden
    await expect(page.locator('text=Hinweis:')).not.toBeVisible({ timeout: 3000 });

    // Button text should change back to "Hinweis anzeigen"
    await expect(page.getByRole('button', { name: /Hinweis anzeigen/i })).toBeVisible();
  });

  test('hint is hidden when feedback is shown', async ({ page }) => {
    // Show the hint first
    const hintButton = page.getByRole('button', { name: /Hinweis anzeigen/i });
    await hintButton.click();

    // Verify hint is visible before submitting
    await expect(page.locator('text=Hinweis:')).toBeVisible({ timeout: 3000 });

    // Submit an answer to trigger feedback
    // First task is multiple-choice in sorted order (test-cloze-1 actually)
    // Let's fill in something and submit
    const inputFields = page.locator('input[type="text"]');
    const inputCount = await inputFields.count();

    if (inputCount > 0) {
      // Cloze deletion task - fill all blanks
      for (let i = 0; i < inputCount; i++) {
        await inputFields.nth(i).fill('test');
      }
    } else {
      // Multiple choice or other task type - click first option
      const options = page.locator('[data-testid="option"], .option-button, input[type="radio"]');
      if ((await options.count()) > 0) {
        await options.first().click();
      }
    }

    // Click submit/check button
    const submitButton = page.getByRole('button', { name: /Prüfen|Antwort überprüfen/i });
    if (await submitButton.isVisible()) {
      await submitButton.click();

      // Wait for feedback to appear
      await page.waitForTimeout(500);

      // Verify hint button and hint text are both hidden during feedback
      await expect(page.getByRole('button', { name: /Hinweis anzeigen|Hinweis verbergen/i })).not.toBeVisible();
      await expect(page.locator('text=Hinweis:')).not.toBeVisible();
    }
  });

  test('H key toggles hint visibility', async ({ page }) => {
    // Initially hint should not be visible
    await expect(page.locator('text=Hinweis:')).not.toBeVisible();

    // Press H to show hint
    await page.keyboard.press('h');

    // Verify hint is now visible
    await expect(page.locator('text=Hinweis:')).toBeVisible({ timeout: 3000 });
    await expect(page.getByRole('button', { name: /Hinweis verbergen/i })).toBeVisible();

    // Press H again to hide hint
    await page.keyboard.press('h');

    // Verify hint is hidden again
    await expect(page.locator('text=Hinweis:')).not.toBeVisible({ timeout: 3000 });
    await expect(page.getByRole('button', { name: /Hinweis anzeigen/i })).toBeVisible();
  });

  test('each task shows its own hint content', async ({ page }) => {
    // Show hint on first task
    await page.getByRole('button', { name: /Hinweis anzeigen/i }).click();
    await expect(page.locator('text=Hinweis:')).toBeVisible({ timeout: 3000 });

    // Get the hint text for the first task
    const hintElement = page.locator('[class*="practice-session__hint"]');
    const firstHintText = await hintElement.textContent();
    expect(firstHintText).toContain('Hinweis:');

    // Hide hint before navigating
    await page.getByRole('button', { name: /Hinweis verbergen/i }).click();
    await expect(page.locator('text=Hinweis:')).not.toBeVisible();

    // Skip to next task
    await page.getByRole('button', { name: /Überspringen/i }).click();

    // Wait for task change
    await expect(page.getByText(/2\s*\/\s*\d+/)).toBeVisible({ timeout: 5000 });

    // Show hint on second task
    await page.getByRole('button', { name: /Hinweis anzeigen/i }).click();
    await expect(page.locator('text=Hinweis:')).toBeVisible({ timeout: 3000 });

    // Verify hint content is different (different task, different hint)
    const secondHintText = await hintElement.textContent();
    expect(secondHintText).toContain('Hinweis:');
    expect(secondHintText).not.toBe(firstHintText);
  });
});
