import { test, expect } from '@playwright/test';

test.describe('TopicCard Keyboard Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for app to load
    await page.waitForSelector('h1:has-text("MindForge Academy")');
  });

  test('Tab navigates through all topic cards in sequence', async ({ page }) => {
    // Focus first topic card
    await page.keyboard.press('Tab');

    // Get all topic cards
    const cards = page.locator('button[aria-label*="Thema"]');
    const count = await cards.count();

    expect(count).toBeGreaterThan(0);

    // Verify we can tab through each card
    for (let i = 0; i < count; i++) {
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toHaveAttribute('aria-label', /.*/);

      if (i < count - 1) {
        await page.keyboard.press('Tab');
      }
    }
  });

  test('Enter key activates focused card and navigates', async ({ page }) => {
    // Tab to first topic card
    await page.keyboard.press('Tab');

    // Verify a card is focused
    const focusedCard = page.locator(':focus');
    await expect(focusedCard).toHaveAttribute('aria-label', /.*/);

    // Press Enter to activate
    await page.keyboard.press('Enter');

    // Should navigate to topic learning paths view
    await expect(page.locator('text=Lernpfade')).toBeVisible({ timeout: 5000 });
  });

  test('Space key activates focused card and navigates', async ({ page }) => {
    // Tab to first topic card
    await page.keyboard.press('Tab');

    // Verify a card is focused
    const focusedCard = page.locator(':focus');
    await expect(focusedCard).toHaveAttribute('aria-label', /.*/);

    // Press Space to activate
    await page.keyboard.press('Space');

    // Should navigate to topic learning paths view
    await expect(page.locator('text=Lernpfade')).toBeVisible({ timeout: 5000 });
  });

  test('Focus indicator is visible when using keyboard', async ({ page }) => {
    // Tab to first topic card
    await page.keyboard.press('Tab');

    const focusedCard = page.locator(':focus');

    // Check that focus indicator is visible (has outline or border)
    const outline = await focusedCard.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        outline: styles.outline,
        outlineWidth: styles.outlineWidth,
        outlineStyle: styles.outlineStyle,
      };
    });

    // Should have visible outline (not 'none' and width > 0)
    expect(outline.outlineStyle).not.toBe('none');
    expect(parseInt(outline.outlineWidth || '0')).toBeGreaterThan(0);
  });

  test('Shift+Tab navigates backwards through cards', async ({ page }) => {
    // Tab forward to second card
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    const secondCard = page.locator(':focus');
    const secondLabel = await secondCard.getAttribute('aria-label');

    // Tab backwards
    await page.keyboard.press('Shift+Tab');

    const firstCard = page.locator(':focus');
    const firstLabel = await firstCard.getAttribute('aria-label');

    // Should be on different card
    expect(firstLabel).not.toBe(secondLabel);
  });
});
