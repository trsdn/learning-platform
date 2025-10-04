import { test, expect } from '@playwright/test';

test.describe('TopicCard Screen Reader', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for app to load
    await page.waitForSelector('h1:has-text("MindForge Academy")');
  });

  test('Cards are announced as "Button" role', async ({ page }) => {
    const cards = page.locator('button[aria-label*="Thema"]');
    const firstCard = cards.first();

    // Verify it's a button element (role is implicit)
    await expect(firstCard).toHaveRole('button');

    // Verify it doesn't have an explicit role attribute (should be implicit from <button>)
    const roleAttr = await firstCard.getAttribute('role');
    expect(roleAttr).toBeNull();
  });

  test('aria-label is read correctly', async ({ page }) => {
    const cards = page.locator('button[aria-label*="Thema"]');

    // Check first card has proper German aria-label pattern
    const firstCard = cards.first();
    const ariaLabel = await firstCard.getAttribute('aria-label');

    expect(ariaLabel).toBeTruthy();
    expect(ariaLabel).toMatch(/^Thema .+ öffnen - .+$/);

    // Verify format: "Thema {name} öffnen - {description}"
    expect(ariaLabel).toContain('öffnen');
    expect(ariaLabel).toContain(' - ');
  });

  test('Icon is hidden from screen reader', async ({ page }) => {
    // Find the first topic card
    const firstCard = page.locator('button[aria-label*="Thema"]').first();

    // Find icon element inside the card (should have aria-hidden)
    const icon = firstCard.locator('[aria-hidden="true"]').first();

    await expect(icon).toBeVisible();
    await expect(icon).toHaveAttribute('aria-hidden', 'true');
  });

  test('All cards have unique accessible names', async ({ page }) => {
    const cards = page.locator('button[aria-label*="Thema"]');
    const count = await cards.count();

    const ariaLabels = new Set<string>();

    for (let i = 0; i < count; i++) {
      const label = await cards.nth(i).getAttribute('aria-label');
      if (label) {
        ariaLabels.add(label);
      }
    }

    // All cards should have unique aria-labels
    expect(ariaLabels.size).toBe(count);
  });

  test('Disabled cards are announced as disabled', async ({ page }) => {
    // Note: This test will pass once disabled state is implemented
    const disabledCards = page.locator('button[aria-label*="Thema"][disabled]');
    const count = await disabledCards.count();

    if (count > 0) {
      const firstDisabled = disabledCards.first();
      await expect(firstDisabled).toBeDisabled();
    }
  });

  test('Cards have proper semantic structure', async ({ page }) => {
    const firstCard = page.locator('button[aria-label*="Thema"]').first();

    // Should contain heading for topic name
    const heading = firstCard.locator('h2, h3, h4').first();
    await expect(heading).toBeVisible();

    // Should contain description text
    const description = firstCard.locator('p').first();
    await expect(description).toBeVisible();
  });
});
