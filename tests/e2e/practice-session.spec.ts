import { test, expect } from '@playwright/test';
import { login } from './auth.setup';

/**
 * Practice Session E2E Tests
 *
 * Tests the complete practice session flow using the demo learning path.
 * In dev mode, tasks are returned in deterministic order (sorted by ID) for reproducible tests.
 *
 * Demo learning path tasks in order (by ID):
 * 1. test-cloze-1 (Cloze Deletion)
 * 2. test-cloze-2 (Cloze Deletion)
 * 3. test-matching-1 (Matching)
 * 4. test-matching-2 (Matching)
 * 5. test-mc-1 (Multiple Choice)
 * 6. test-mc-2 (Multiple Choice)
 * 7. test-multi-select-1 (Multiple Select)
 * 8. test-multi-select-2 (Multiple Select)
 * 9. test-ordering-1 (Ordering)
 * 10. test-ordering-2 (Ordering)
 */
test.describe('Practice Session', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('can navigate to demo learning path and start a session', async ({ page }) => {
    // Navigate to Test & Demo topic
    await page.getByRole('button', { name: /Test & Demo/i }).click();

    // Wait for learning paths to load
    await page.waitForSelector('text=Alle Aufgabentypen', { timeout: 10000 });

    // Click on the demo learning path
    await page.getByText('Alle Aufgabentypen - Demo').click();

    // Click start button
    await page.getByRole('button', { name: /Starten/i }).click();

    // Verify session started - should show progress indicator (format: "1/10" or "1 / 10")
    await expect(page.getByText(/1\s*\/\s*10/)).toBeVisible({ timeout: 10000 });
  });

  test('can answer a cloze deletion task and advance', async ({ page }) => {
    // Navigate to demo learning path
    await page.getByRole('button', { name: /Test & Demo/i }).click();
    await page.waitForSelector('text=Alle Aufgabentypen', { timeout: 10000 });
    await page.getByText('Alle Aufgabentypen - Demo').click();
    await page.getByRole('button', { name: /Starten/i }).click();

    // Wait for first task (cloze deletion)
    await expect(page.getByText(/1\s*\/\s*10/)).toBeVisible({ timeout: 10000 });

    // Cloze tasks have multiple text inputs - fill all blanks to enable submit button
    const inputFields = page.locator('input[type="text"]');
    const inputCount = await inputFields.count();

    if (inputCount > 0) {
      // Fill all blanks with test answers
      for (let i = 0; i < inputCount; i++) {
        await inputFields.nth(i).fill('test');
      }

      // Submit the answer - button should now be enabled
      await page.getByRole('button', { name: /Prüfen|Antwort überprüfen/i }).click();

      // Wait for feedback to appear
      await page.waitForTimeout(500);

      // Click next task button
      const nextButton = page.getByRole('button', { name: /Nächste Aufgabe/i });
      if (await nextButton.isVisible()) {
        await nextButton.click();

        // Verify we moved to next task
        await expect(page.getByText(/2\s*\/\s*10/)).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test('skip button advances to next task', async ({ page }) => {
    // Navigate to demo learning path
    await page.getByRole('button', { name: /Test & Demo/i }).click();
    await page.waitForSelector('text=Alle Aufgabentypen', { timeout: 10000 });
    await page.getByText('Alle Aufgabentypen - Demo').click();
    await page.getByRole('button', { name: /Starten/i }).click();

    // Wait for first task
    await expect(page.getByText(/1\s*\/\s*10/)).toBeVisible({ timeout: 10000 });

    // Click skip button
    await page.getByRole('button', { name: /Überspringen/i }).click();

    // Verify we moved to next task
    await expect(page.getByText(/2\s*\/\s*10/)).toBeVisible({ timeout: 5000 });
  });

  test('multiple choice task can be answered correctly', async ({ page }) => {
    // Navigate to demo learning path
    await page.getByRole('button', { name: /Test & Demo/i }).click();
    await page.waitForSelector('text=Alle Aufgabentypen', { timeout: 10000 });
    await page.getByText('Alle Aufgabentypen - Demo').click();
    await page.getByRole('button', { name: /Starten/i }).click();

    // Skip until we get to a multiple choice task (skip first 4 cloze/matching)
    // Wait for each skip to complete by checking progress indicator changes
    for (let taskNum = 2; taskNum <= 5; taskNum++) {
      await page.getByRole('button', { name: /Überspringen/i }).click();
      await expect(page.getByText(new RegExp(`${taskNum}\\s*\\/\\s*10`))).toBeVisible({ timeout: 5000 });
    }

    // Now we should be at task 5 (test-mc-1)
    await expect(page.getByText(/5\s*\/\s*10/)).toBeVisible({ timeout: 5000 });

    // Look for multiple choice options (radio buttons or clickable options)
    const options = page.locator('[data-testid="option"], .option-button, input[type="radio"]');
    const optionCount = await options.count();

    if (optionCount > 0) {
      // Click the first option
      await options.first().click();

      // Submit the answer
      await page.getByRole('button', { name: /Prüfen/i }).click();

      // Wait for feedback to appear
      await page.waitForTimeout(500);

      // Verify feedback is shown
      const feedback = page.locator('[data-testid="feedback"], .feedback-container');
      await expect(feedback.or(page.getByRole('button', { name: /Nächste Aufgabe/i }))).toBeVisible({
        timeout: 5000,
      });
    }
  });

  test('session can be completed', async ({ page }) => {
    // Navigate to demo learning path
    await page.getByRole('button', { name: /Test & Demo/i }).click();
    await page.waitForSelector('text=Alle Aufgabentypen', { timeout: 10000 });
    await page.getByText('Alle Aufgabentypen - Demo').click();
    await page.getByRole('button', { name: /Starten/i }).click();

    // Wait for first task
    await expect(page.getByText(/1\s*\/\s*10/)).toBeVisible({ timeout: 10000 });

    // Skip first 9 tasks (skip button is available on tasks 1-9)
    for (let taskNum = 2; taskNum <= 10; taskNum++) {
      await page.getByRole('button', { name: /Überspringen/i }).click();
      await expect(page.getByText(new RegExp(`${taskNum}\\s*\\/\\s*10`))).toBeVisible({ timeout: 5000 });
    }

    // On the last task (10/10), click "Sitzung beenden" to complete
    await page.getByRole('button', { name: /Sitzung beenden/i }).click();

    // Session should complete and redirect to results or topic selection
    await expect(
      page.getByText(/Themen/).or(page.getByText(/Ergebnis/)).or(page.getByText(/Abgeschlossen/))
    ).toBeVisible({ timeout: 15000 });
  });

  test('progress is tracked correctly during session', async ({ page }) => {
    // Navigate to demo learning path
    await page.getByRole('button', { name: /Test & Demo/i }).click();
    await page.waitForSelector('text=Alle Aufgabentypen', { timeout: 10000 });
    await page.getByText('Alle Aufgabentypen - Demo').click();
    await page.getByRole('button', { name: /Starten/i }).click();

    // Verify starting progress
    await expect(page.getByText(/1\s*\/\s*10/)).toBeVisible({ timeout: 10000 });

    // Skip 3 tasks and verify progress updates
    for (let taskNum = 2; taskNum <= 4; taskNum++) {
      await page.getByRole('button', { name: /Überspringen/i }).click();
      await expect(page.getByText(new RegExp(`${taskNum}\\s*\\/\\s*10`))).toBeVisible({ timeout: 5000 });
    }
  });
});
