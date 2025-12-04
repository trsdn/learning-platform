import { test, expect } from '@playwright/test';
import { login } from './auth.setup';

/**
 * Error Detection Task E2E Tests
 *
 * Tests the error-detection task type interactions using the demo learning path.
 * Uses a dynamic approach to find error-detection tasks rather than relying on fixed positions,
 * since review tasks may be inserted at the start of sessions.
 */

/**
 * Helper to navigate to demo learning path and start session
 */
async function startDemoSession(page: import('@playwright/test').Page) {
  await page.getByRole('button', { name: /Test & Demo/i }).click();
  await page.waitForSelector('text=Alle Aufgabentypen', { timeout: 10000 });
  await page.getByText('Alle Aufgabentypen - Demo').click();
  await page.getByRole('button', { name: /Starten/i }).click();
  // Wait for the practice session to start (use getByText for reliable matching)
  await expect(page.getByText('Übungssitzung')).toBeVisible({ timeout: 10000 });
}

/**
 * Helper to skip until we find an error-detection task
 * Uses the task ID displayed in the header which contains the task type
 * Returns true if found, false if we ran out of tasks
 */
async function skipToErrorDetectionTask(page: import('@playwright/test').Page): Promise<boolean> {
  const maxAttempts = 20; // Max tasks to check before giving up

  for (let i = 0; i < maxAttempts; i++) {
    // Check if current task is error-detection by looking for the container
    const errorDetectionContainer = page.locator('div[class*="error-detection__container"]');

    try {
      // Wait briefly for any task type indicator
      await page.waitForTimeout(500);

      // Check if this is an error-detection task
      if (await errorDetectionContainer.isVisible({ timeout: 1000 })) {
        return true;
      }

      // Not an error-detection task, skip to next
      const skipButton = page.getByRole('button', { name: /Überspringen/i });
      if (await skipButton.isVisible({ timeout: 1000 })) {
        await skipButton.click();
        await page.waitForTimeout(500);
      } else {
        // No skip button means we're at the end
        return false;
      }
    } catch {
      // If we can't find elements, try skipping
      const skipButton = page.getByRole('button', { name: /Überspringen/i });
      if (await skipButton.isVisible({ timeout: 500 })) {
        await skipButton.click();
        await page.waitForTimeout(500);
      } else {
        return false;
      }
    }
  }

  return false;
}

/**
 * Helper to skip to the second error-detection task
 */
async function skipToSecondErrorDetectionTask(page: import('@playwright/test').Page): Promise<boolean> {
  // First find the first error-detection task
  const foundFirst = await skipToErrorDetectionTask(page);
  if (!foundFirst) return false;

  // Skip past it
  const skipButton = page.getByRole('button', { name: /Überspringen/i });
  if (await skipButton.isVisible({ timeout: 1000 })) {
    await skipButton.click();
    await page.waitForTimeout(500);
  } else {
    return false;
  }

  // Now find the second one
  return await skipToErrorDetectionTask(page);
}

test.describe('Error Detection Tasks', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('error detection task displays clickable segments', async ({ page }) => {
    await startDemoSession(page);
    const found = await skipToErrorDetectionTask(page);
    expect(found).toBe(true);

    // Should have clickable segments
    const segments = page.locator('[class*="error-detection__segment"]');
    await expect(segments.first()).toBeVisible({ timeout: 5000 });

    // Verify multiple segments exist
    const count = await segments.count();
    expect(count).toBeGreaterThan(0);
  });

  test('error detection task shows error count instruction', async ({ page }) => {
    await startDemoSession(page);
    const found = await skipToErrorDetectionTask(page);
    expect(found).toBe(true);

    // Should show instruction with error count (e.g., "Find 2 errors")
    await expect(page.getByText(/Find \d+ errors/)).toBeVisible({ timeout: 5000 });
  });

  test('error detection task allows selecting segments', async ({ page }) => {
    await startDemoSession(page);
    const found = await skipToErrorDetectionTask(page);
    expect(found).toBe(true);

    // Find and click a segment
    const segment = page.locator('[class*="error-detection__segment"]').first();
    await segment.click();

    // Segment should now be selected (have selected class)
    await expect(segment).toHaveClass(/selected/);
  });

  test('error detection task toggle selection on second click', async ({ page }) => {
    await startDemoSession(page);
    const found = await skipToErrorDetectionTask(page);
    expect(found).toBe(true);

    // Find and click a segment
    const segment = page.locator('[class*="error-detection__segment"]').first();
    await segment.click();

    // Should be selected
    await expect(segment).toHaveClass(/selected/);

    // Click again to deselect
    await segment.click();

    // Should no longer have selected class
    await expect(segment).not.toHaveClass(/selected/);
  });

  test('error detection task submit button is always enabled', async ({ page }) => {
    await startDemoSession(page);
    const found = await skipToErrorDetectionTask(page);
    expect(found).toBe(true);

    // Submit button should be enabled even without selections (for "no errors" scenario)
    const submitButton = page.getByRole('button', { name: /Prüfen|Antwort überprüfen/i });
    await expect(submitButton).toBeEnabled();
  });

  test('error detection task can be submitted', async ({ page }) => {
    await startDemoSession(page);
    const found = await skipToErrorDetectionTask(page);
    expect(found).toBe(true);

    // Verify submit button exists and is enabled
    const submitButton = page.getByRole('button', { name: /Prüfen|Antwort überprüfen/i });
    await expect(submitButton).toBeVisible({ timeout: 5000 });
    await expect(submitButton).toBeEnabled();

    // Click submit - the button should work
    await submitButton.click();

    // After submission, either the button text changes, a new button appears,
    // or the segments show feedback state
    await page.waitForTimeout(1500);

    // Check for any of these indicators that submission happened:
    // 1. "Next" button appears, OR
    // 2. Segments have feedback classes, OR
    // 3. The submit button is now disabled or changed
    const hasNextButton = await page.getByRole('button', { name: /Nächste|Next|Weiter/i }).isVisible({ timeout: 1000 }).catch(() => false);
    const hasFeedbackSegment = await page.locator('[class*="correct"], [class*="incorrect"], [class*="missed"]').first().isVisible({ timeout: 1000 }).catch(() => false);
    const submitStillEnabled = await submitButton.isEnabled({ timeout: 500 }).catch(() => false);

    // At least one indicator should be present after submission
    expect(hasNextButton || hasFeedbackSegment || !submitStillEnabled).toBe(true);
  });

  test('error detection task displays selection counter', async ({ page }) => {
    await startDemoSession(page);
    const found = await skipToErrorDetectionTask(page);
    expect(found).toBe(true);

    // Should display a selection counter (e.g., "Selected: 0 / 2 errors")
    const selectionText = page.getByText(/Selected:|Ausgewählt:|\/\s*\d+\s*error/i);
    await expect(selectionText.first()).toBeVisible({ timeout: 5000 });
  });

  test('error detection task shows score after submission', async ({ page }) => {
    await startDemoSession(page);
    const found = await skipToErrorDetectionTask(page);
    expect(found).toBe(true);

    // Find and click on error segments if visible
    const sydneySegment = page.locator('[class*="error-detection__segment"]', { hasText: 'Sydney' });
    const yearSegment = page.locator('[class*="error-detection__segment"]', { hasText: '1888' });

    if (await sydneySegment.isVisible({ timeout: 1000 })) {
      await sydneySegment.click();
    }
    if (await yearSegment.isVisible({ timeout: 1000 })) {
      await yearSegment.click();
    }

    // Submit
    await page.getByRole('button', { name: /Prüfen|Antwort überprüfen/i }).click();

    // Wait for feedback
    await page.waitForTimeout(1000);

    // Should show score - look for score text pattern or feedback section
    // The score might be displayed as "X/Y" or percentage
    const scoreText = page.getByText(/\d+\s*\/\s*\d+|Score|Punkte|errors found/i);
    await expect(scoreText.first()).toBeVisible({ timeout: 5000 });
  });

  test('error detection keyboard navigation works', async ({ page }) => {
    await startDemoSession(page);
    const found = await skipToErrorDetectionTask(page);
    expect(found).toBe(true);

    // Focus the content area
    const contentArea = page.locator('[class*="error-detection__content"]');
    await contentArea.focus();

    // Press arrow right to move to first segment
    await page.keyboard.press('ArrowRight');

    // Press Space or Enter to select
    await page.keyboard.press('Space');

    // First segment should now be selected
    const firstSegment = page.locator('[class*="error-detection__segment"]').first();
    await expect(firstSegment).toHaveClass(/selected/);
  });

  test('error detection hint is displayed', async ({ page }) => {
    await startDemoSession(page);
    const found = await skipToErrorDetectionTask(page);
    expect(found).toBe(true);

    // The hint is displayed in a dedicated hint area within the error-detection component
    // Look for the hint element within the container
    const hintElement = page.locator('div[class*="error-detection__hint"]');
    await expect(hintElement).toBeVisible({ timeout: 5000 });
  });

  test('error detection second task works correctly', async ({ page }) => {
    await startDemoSession(page);
    const found = await skipToSecondErrorDetectionTask(page);
    expect(found).toBe(true);

    // Should show instruction about finding errors
    await expect(page.getByText(/Find \d+ errors/)).toBeVisible({ timeout: 5000 });

    // Should have segments (any content about Statue of Liberty, LA, England etc.)
    const container = page.locator('div[class*="error-detection__container"]');
    await expect(container).toBeVisible({ timeout: 5000 });
  });
});
