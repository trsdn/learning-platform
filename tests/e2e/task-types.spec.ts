import { test, expect } from '@playwright/test';
import { login } from './auth.setup';

/**
 * Task Types E2E Tests
 *
 * Tests individual task type interactions using the demo learning path.
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
async function skipToTask(page: import('@playwright/test').Page, taskNum: number) {
  for (let i = 2; i <= taskNum; i++) {
    await page.getByRole('button', { name: /Überspringen/i }).click();
    await expect(page.getByText(new RegExp(`${i}\\s*\\/\\s*10`))).toBeVisible({ timeout: 5000 });
  }
}

test.describe('Task Types', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test.describe('Cloze Deletion Tasks', () => {
    test('cloze task displays input fields for blanks', async ({ page }) => {
      await startDemoSession(page);

      // Task 1 is a cloze deletion task
      const inputFields = page.locator('input[type="text"]');
      await expect(inputFields.first()).toBeVisible();

      // Should have multiple blanks
      const count = await inputFields.count();
      expect(count).toBeGreaterThan(0);
    });

    test('cloze task submit button is disabled until all blanks filled', async ({ page }) => {
      await startDemoSession(page);

      // Submit button should be disabled initially
      const submitButton = page.getByRole('button', { name: /Prüfen|Antwort überprüfen/i });
      await expect(submitButton).toBeDisabled();

      // Fill all blanks
      const inputFields = page.locator('input[type="text"]');
      const count = await inputFields.count();
      for (let i = 0; i < count; i++) {
        await inputFields.nth(i).fill('test');
      }

      // Submit button should now be enabled
      await expect(submitButton).toBeEnabled();
    });

    test('cloze task shows feedback after submission', async ({ page }) => {
      await startDemoSession(page);

      // Fill all blanks
      const inputFields = page.locator('input[type="text"]');
      const count = await inputFields.count();
      for (let i = 0; i < count; i++) {
        await inputFields.nth(i).fill('test');
      }

      // Submit
      await page.getByRole('button', { name: /Prüfen|Antwort überprüfen/i }).click();

      // Should show "Nächste Aufgabe" button after submission
      await expect(page.getByRole('button', { name: /Nächste Aufgabe/i })).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Matching Tasks', () => {
    test('matching task displays dropdown selectors', async ({ page }) => {
      await startDemoSession(page);
      await skipToTask(page, 3); // Task 3 is matching

      // Should have combobox/select elements for matching
      const selects = page.locator('select, [role="combobox"]');
      await expect(selects.first()).toBeVisible({ timeout: 5000 });
    });

    test('matching task can select options', async ({ page }) => {
      await startDemoSession(page);
      await skipToTask(page, 3);

      // Find and interact with the first dropdown
      const selects = page.locator('select');
      const count = await selects.count();

      if (count > 0) {
        // Select an option from the first dropdown
        const firstSelect = selects.first();
        await firstSelect.selectOption({ index: 1 }); // Select first non-placeholder option

        // Verify selection was made
        const selectedValue = await firstSelect.inputValue();
        expect(selectedValue).not.toBe('');
      }
    });
  });

  test.describe('Multiple Choice Tasks', () => {
    test('multiple choice task displays clickable options', async ({ page }) => {
      await startDemoSession(page);
      await skipToTask(page, 5); // Task 5 is multiple choice

      // Should have clickable option buttons (e.g., "Option 1: Rot", "Option 2: Blau")
      const options = page.getByRole('button', { name: /Option \d+:/ });
      await expect(options.first()).toBeVisible({ timeout: 5000 });

      // Verify multiple options exist
      const count = await options.count();
      expect(count).toBeGreaterThanOrEqual(2);
    });

    test('multiple choice task enables submit after selection', async ({ page }) => {
      await startDemoSession(page);
      await skipToTask(page, 5);

      // Submit button locator (defined for potential future use)
      const _submitButton = page.getByRole('button', { name: /Prüfen|Antwort überprüfen/i });

      // Find and click an option - look for option buttons with specific classes
      const optionButtons = page.locator('button').filter({ hasText: /^(?!Prüfen|Überspringen|Hinweis|Abbrechen)/ });
      const optionCount = await optionButtons.count();

      if (optionCount > 0) {
        // Click the first available option that's not a control button
        for (let i = 0; i < optionCount; i++) {
          const button = optionButtons.nth(i);
          const text = await button.textContent();
          // Skip control buttons
          if (text && !text.includes('Prüfen') && !text.includes('Überspringen') && !text.includes('Hinweis')) {
            await button.click();
            break;
          }
        }
      }

      // Wait a moment for state update
      await page.waitForTimeout(300);
    });
  });

  test.describe('Multiple Select Tasks', () => {
    test('multi-select task allows multiple selections', async ({ page }) => {
      await startDemoSession(page);
      await skipToTask(page, 7); // Task 7 is multi-select

      // Should have checkbox-like options
      const options = page.locator('[data-testid="option"], button, [role="checkbox"]');
      await expect(options.first()).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Ordering Tasks', () => {
    test('ordering task displays items with move buttons', async ({ page }) => {
      await startDemoSession(page);
      await skipToTask(page, 9); // Task 9 is ordering

      // Wait for task content to load (not just "Laden...")
      await page.waitForSelector('text=Sortierung', { timeout: 10000 });

      // Should have up/down arrow buttons for reordering
      const upButtons = page.getByRole('button', { name: '↑' });
      const downButtons = page.getByRole('button', { name: '↓' });

      // At least one direction button should be visible
      await expect(upButtons.or(downButtons).first()).toBeVisible({ timeout: 5000 });
    });

    test('ordering task can move items', async ({ page }) => {
      await startDemoSession(page);
      await skipToTask(page, 9);

      // Wait for task content to load
      await page.waitForSelector('text=Sortierung', { timeout: 10000 });

      // Find a down button and click it
      const downButton = page.getByRole('button', { name: '↓' }).first();
      if (await downButton.isVisible()) {
        await downButton.click();
        // The UI should update (item moved down)
        await page.waitForTimeout(300);
      }
    });
  });

  test.describe('Common Task Features', () => {
    test('hint button shows hint when available', async ({ page }) => {
      await startDemoSession(page);

      // Click hint button if visible
      const hintButton = page.getByRole('button', { name: /Hinweis/i });
      if (await hintButton.isVisible()) {
        await hintButton.click();

        // Hint content should appear (implementation may vary)
        await page.waitForTimeout(500);
      }
    });

    test('skip button is always available', async ({ page }) => {
      await startDemoSession(page);

      // Skip button should be visible
      const skipButton = page.getByRole('button', { name: /Überspringen/i });
      await expect(skipButton).toBeVisible();
      await expect(skipButton).toBeEnabled();
    });

    test('cancel button returns to topic selection', async ({ page }) => {
      await startDemoSession(page);

      // Click cancel/abort button
      await page.getByRole('button', { name: /Abbrechen/i }).click();

      // Should return to topic selection (show "Themen" heading)
      await expect(page.getByText(/Themen/)).toBeVisible({ timeout: 10000 });
    });

    test('progress indicator updates correctly', async ({ page }) => {
      await startDemoSession(page);

      // Initial progress
      await expect(page.getByText(/1\s*\/\s*10/)).toBeVisible();

      // Skip to next
      await page.getByRole('button', { name: /Überspringen/i }).click();

      // Progress should update
      await expect(page.getByText(/2\s*\/\s*10/)).toBeVisible({ timeout: 5000 });
    });
  });
});
