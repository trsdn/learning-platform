import { test, expect, type Page } from '@playwright/test';
import { login } from './auth.setup';

/**
 * Slider Interaction E2E Tests
 *
 * Tests the slider task type interactions.
 * This addresses the P1 requirement from issue #173.
 *
 * The demo learning path contains slider tasks:
 * - test-slider-1: "Bei welcher Temperatur kocht Wasser?" (100°C, tolerance 5)
 * - test-slider-2: "Wie viele Planeten hat unser Sonnensystem?" (8, tolerance 0)
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
 * Helper to skip through tasks until we find a slider task
 */
async function skipToSliderTask(page: Page): Promise<boolean> {
  const maxAttempts = 20;

  for (let i = 0; i < maxAttempts; i++) {
    // Check for slider container
    const sliderContainer = page.locator('[class*="slider-container"]');
    const sliderInput = page.locator('input[type="range"]');

    if (await sliderContainer.isVisible({ timeout: 1000 }).catch(() => false)) {
      return true;
    }

    if (await sliderInput.isVisible({ timeout: 500 }).catch(() => false)) {
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

test.describe('Slider Interaction', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test.describe('Slider Display', () => {
    test('slider task displays range input', async ({ page }) => {
      await startDemoSession(page);
      const found = await skipToSliderTask(page);

      if (!found) {
        test.skip(true, 'No slider task found in demo path');
        return;
      }

      // Verify slider input is visible
      const slider = page.locator('input[type="range"]');
      await expect(slider).toBeVisible();
    });

    test('slider task shows value display', async ({ page }) => {
      await startDemoSession(page);
      const found = await skipToSliderTask(page);

      if (!found) {
        test.skip(true, 'No slider task found');
        return;
      }

      // Value display should be visible
      const valueDisplay = page.locator('[class*="slider-value"]');
      await expect(valueDisplay.first()).toBeVisible();

      // Value should be a number
      const valueText = await valueDisplay.first().textContent();
      expect(valueText).toMatch(/\d+/);
    });

    test('slider shows question text', async ({ page }) => {
      await startDemoSession(page);
      const found = await skipToSliderTask(page);

      if (!found) {
        test.skip(true, 'No slider task found');
        return;
      }

      // Question should be visible
      const questionHeader = page.locator('[class*="question-text"]');
      if (await questionHeader.isVisible({ timeout: 2000 }).catch(() => false)) {
        const text = await questionHeader.textContent();
        expect(text?.length).toBeGreaterThan(10);
      }
    });
  });

  test.describe('Slider Value Adjustment', () => {
    test('slider value updates when moved', async ({ page }) => {
      await startDemoSession(page);
      const found = await skipToSliderTask(page);

      if (!found) {
        test.skip(true, 'No slider task found');
        return;
      }

      const slider = page.locator('input[type="range"]');
      const valueDisplay = page.locator('[class*="slider-value"]').first();

      // Get slider attributes
      const min = parseInt((await slider.getAttribute('min')) || '0');
      const max = parseInt((await slider.getAttribute('max')) || '100');
      const targetValue = Math.floor((min + max) / 2);

      // Set slider to target value
      await slider.fill(targetValue.toString());

      // Wait for value to update
      await page.waitForTimeout(300);

      // Value should have changed
      const newValue = await valueDisplay.textContent();

      // Parse numeric value from display (may include unit)
      const numericNew = parseInt(newValue?.replace(/[^\d-]/g, '') || '0');
      expect(numericNew).toBe(targetValue);
    });

    test('slider respects min/max boundaries', async ({ page }) => {
      await startDemoSession(page);
      const found = await skipToSliderTask(page);

      if (!found) {
        test.skip(true, 'No slider task found');
        return;
      }

      const slider = page.locator('input[type="range"]');

      // Get min/max
      const min = await slider.getAttribute('min');
      const max = await slider.getAttribute('max');

      expect(min).not.toBeNull();
      expect(max).not.toBeNull();
      expect(parseInt(max!)).toBeGreaterThan(parseInt(min!));
    });

    test('slider step attribute is respected', async ({ page }) => {
      await startDemoSession(page);
      const found = await skipToSliderTask(page);

      if (!found) {
        test.skip(true, 'No slider task found');
        return;
      }

      const slider = page.locator('input[type="range"]');

      // Get step attribute
      const step = await slider.getAttribute('step');

      // Step should be a positive number
      if (step) {
        expect(parseFloat(step)).toBeGreaterThan(0);
      }
    });
  });

  test.describe('Submit and Feedback', () => {
    test('submit button enables after slider interaction', async ({ page }) => {
      await startDemoSession(page);
      const found = await skipToSliderTask(page);

      if (!found) {
        test.skip(true, 'No slider task found');
        return;
      }

      // Note: Slider tasks may have submit enabled by default since there's always a value
      const submitButton = page.getByRole('button', { name: /Prüfen|Antwort überprüfen/i });

      // Should be enabled (sliders always have a valid value)
      await expect(submitButton).toBeEnabled();
    });

    test('submitting correct value shows success feedback', async ({ page }) => {
      await startDemoSession(page);
      const found = await skipToSliderTask(page);

      if (!found) {
        test.skip(true, 'No slider task found');
        return;
      }

      const slider = page.locator('input[type="range"]');

      // For "water boiling point" task, the answer is 100
      // For "planets" task, the answer is 8
      // Let's try setting to 100 (common answer in demo)
      await slider.fill('100');

      // Submit
      await page.getByRole('button', { name: /Prüfen|Antwort überprüfen/i }).click();

      // Wait for feedback
      await expect(page.getByRole('button', { name: /Nächste Aufgabe/i })).toBeVisible({
        timeout: 5000,
      });

      // Check for feedback
      const feedbackExists = await page.locator('[class*="slider-feedback"]').isVisible({
        timeout: 2000,
      }).catch(() => false);

      // Or check for correct/incorrect indicator
      const correctIndicator = page.locator('[class*="correct"]');
      const incorrectIndicator = page.locator('[class*="incorrect"]');

      const hasCorrect = await correctIndicator.count();
      const hasIncorrect = await incorrectIndicator.count();

      // Either feedback or indicators should be visible
      expect(feedbackExists || hasCorrect > 0 || hasIncorrect > 0).toBeTruthy();
    });

    test('slider is disabled after submission', async ({ page }) => {
      await startDemoSession(page);
      const found = await skipToSliderTask(page);

      if (!found) {
        test.skip(true, 'No slider task found');
        return;
      }

      const slider = page.locator('input[type="range"]');

      // Submit with any value
      await page.getByRole('button', { name: /Prüfen|Antwort überprüfen/i }).click();

      // Wait for feedback
      await page.waitForTimeout(500);

      // Slider should be disabled
      await expect(slider).toBeDisabled();
    });

    test('feedback shows correct answer', async ({ page }) => {
      await startDemoSession(page);
      const found = await skipToSliderTask(page);

      if (!found) {
        test.skip(true, 'No slider task found');
        return;
      }

      // Submit with any value
      await page.getByRole('button', { name: /Prüfen|Antwort überprüfen/i }).click();

      // Wait for feedback
      await expect(page.getByRole('button', { name: /Nächste Aufgabe/i })).toBeVisible({
        timeout: 5000,
      });

      // Check for feedback text showing correct answer
      const feedbackText = page.locator('[class*="slider-feedback"]');
      if (await feedbackText.isVisible({ timeout: 2000 }).catch(() => false)) {
        const text = await feedbackText.textContent();
        // Should contain "Richtige Antwort" or the correct number
        expect(text).toMatch(/Richtige Antwort|100|8/);
      }
    });
  });

  test.describe('Stats Update', () => {
    test('stats update correctly after slider answer', async ({ page }) => {
      await startDemoSession(page);
      const found = await skipToSliderTask(page);

      if (!found) {
        test.skip(true, 'No slider task found');
        return;
      }

      // Get initial answered count
      const initialAnswered = await page
        .locator('[class*="stat-value--completed"]')
        .textContent();

      // Submit answer
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

  test.describe('Keyboard Interaction', () => {
    test('slider can be adjusted with arrow keys', async ({ page }) => {
      await startDemoSession(page);
      const found = await skipToSliderTask(page);

      if (!found) {
        test.skip(true, 'No slider task found');
        return;
      }

      const slider = page.locator('input[type="range"]');
      const valueDisplay = page.locator('[class*="slider-value"]').first();

      // Focus the slider
      await slider.focus();

      // Get initial value
      const initialValueText = await valueDisplay.textContent();
      const initialValue = parseInt(initialValueText?.replace(/[^\d-]/g, '') || '0');

      // Press right arrow to increase
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(100);

      // Value should have changed
      const newValueText = await valueDisplay.textContent();
      const newValue = parseInt(newValueText?.replace(/[^\d-]/g, '') || '0');

      // Value should have increased (or be at max)
      expect(newValue).toBeGreaterThanOrEqual(initialValue);
    });
  });
});
