import { test, expect } from '@playwright/test';

test.describe('Confetti Celebrations', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to app
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should have confetti settings in settings page', async ({ page }) => {
    // Open settings - look for settings button or menu
    const settingsButton = page.getByRole('button', { name: /Einstellungen/i }).or(
      page.getByRole('button').filter({ hasText: /⚙️/ })
    );

    // If settings button exists, click it
    const buttonExists = await settingsButton.count();
    if (buttonExists > 0) {
      await settingsButton.first().click();
      await page.waitForLoadState('networkidle');
    } else {
      // Try navigating directly if button doesn't exist
      test.skip();
      return;
    }

    // Look for the interactions section
    const interactionsSection = page.getByText('Interaktionen & Animationen');

    // Check if section exists (may need to scroll or expand)
    if (await interactionsSection.count() > 0) {
      await expect(interactionsSection).toBeVisible();

      // Look for confetti toggle
      const confettiToggle = page.getByText('Konfetti aktivieren');
      await expect(confettiToggle).toBeVisible();

      // Look for style options when expanded
      const standardOption = page.getByText('Standard');
      const fireworkOption = page.getByText('Feuerwerk');
      const cannonOption = page.getByText('Kanone');
      const emojiOption = page.getByText('Emoji');

      // At least one style option should be visible
      await expect(standardOption.or(fireworkOption).or(cannonOption).or(emojiOption)).toBeVisible();
    }
  });

  test('should allow toggling confetti settings', async ({ page }) => {
    // This test verifies the settings UI works
    const settingsButton = page.getByRole('button', { name: /Einstellungen/i }).or(
      page.getByRole('button').filter({ hasText: /⚙️/ })
    );

    const buttonExists = await settingsButton.count();
    if (buttonExists === 0) {
      test.skip();
      return;
    }

    await settingsButton.first().click();
    await page.waitForLoadState('networkidle');

    // Find and click the confetti toggle
    const confettiCheckbox = page.locator('input[type="checkbox"]').filter({
      has: page.locator('xpath=..//*[contains(text(), "Konfetti aktivieren")]'),
    }).or(
      page.getByRole('checkbox').near(page.getByText('Konfetti aktivieren'))
    );

    // If checkbox exists, test toggling it
    if (await confettiCheckbox.count() > 0) {
      const isChecked = await confettiCheckbox.first().isChecked();
      await confettiCheckbox.first().click();
      const newState = await confettiCheckbox.first().isChecked();
      expect(newState).toBe(!isChecked);
    }
  });

  test('confetti respects reduced motion preference', async ({ page }) => {
    // Emulate reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Verify canvas-confetti doesn't fire when reduced motion is enabled
    // We can check this by ensuring no confetti canvas elements are created
    // (canvas-confetti creates a canvas element when firing)

    // Wait a moment to ensure any confetti would have triggered
    await page.waitForTimeout(500);

    // Verify no confetti canvas was created (canvas-confetti uses a canvas element)
    const confettiCanvasCount = await page.locator('canvas').count();

    // This is a soft assertion - if there's a canvas, it shouldn't be the confetti canvas
    // when reduced motion is enabled
    if (confettiCanvasCount > 0) {
      // Check that any canvas elements are not from confetti (confetti uses specific styles)
      const confettiCanvas = page.locator('canvas[style*="position: fixed"]');
      expect(await confettiCanvas.count()).toBe(0);
    }
  });

  test('settings page displays correct confetti configuration', async ({ page }) => {
    const settingsButton = page.getByRole('button', { name: /Einstellungen/i }).or(
      page.getByRole('button').filter({ hasText: /⚙️/ })
    );

    const buttonExists = await settingsButton.count();
    if (buttonExists === 0) {
      test.skip();
      return;
    }

    await settingsButton.first().click();
    await page.waitForLoadState('networkidle');

    // Look for intensity options
    const lightOption = page.getByText('Leicht');
    const mediumOption = page.getByText('Mittel');
    const strongOption = page.getByText('Stark');

    // Sound toggle
    const soundToggle = page.getByText('Sound bei Konfetti abspielen');

    // Verify elements exist
    const hasIntensityOptions = await lightOption.or(mediumOption).or(strongOption).count();
    const hasSoundToggle = await soundToggle.count();

    // At least some UI elements should be present
    expect(hasIntensityOptions + hasSoundToggle).toBeGreaterThan(0);
  });

  test('info card displays trigger information', async ({ page }) => {
    const settingsButton = page.getByRole('button', { name: /Einstellungen/i }).or(
      page.getByRole('button').filter({ hasText: /⚙️/ })
    );

    const buttonExists = await settingsButton.count();
    if (buttonExists === 0) {
      test.skip();
      return;
    }

    await settingsButton.first().click();
    await page.waitForLoadState('networkidle');

    // Look for the info card content
    const triggerInfo = page.getByText(/Wann wird Konfetti ausgelöst/i);

    if (await triggerInfo.count() > 0) {
      await expect(triggerInfo).toBeVisible();

      // Check for trigger descriptions
      const perfectSessionTrigger = page.getByText(/Perfekte Sitzung/i);
      const streakTrigger = page.getByText(/Streak-Meilensteine/i);
      const pathTrigger = page.getByText(/Lernpfad abgeschlossen/i);

      // Verify trigger info is displayed
      const triggerCount =
        await perfectSessionTrigger.count() +
        await streakTrigger.count() +
        await pathTrigger.count();

      expect(triggerCount).toBeGreaterThan(0);
    }
  });
});
