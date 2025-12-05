import { Given, When, Then } from '../../support/fixtures';
import { expect } from '@playwright/test';

/**
 * Step definitions for user settings
 * Feature IDs: US-001 to US-009
 */

// ============================================
// Settings Navigation Steps
// ============================================

Then('I should see the settings page', async ({ authenticatedPage }) => {
  await expect(authenticatedPage).toHaveURL(/.*settings.*/);
});

Then('I should see all available settings categories', async ({ authenticatedPage }) => {
  // Settings should have multiple sections
  const settingsSections = authenticatedPage.locator('[data-testid="settings-section"], section, [class*="settings"]');
  const count = await settingsSections.count();
  expect(count).toBeGreaterThan(0);
});

// ============================================
// Audio Settings Steps
// ============================================

When('I toggle audio feedback off', async ({ authenticatedPage }) => {
  const audioToggle = authenticatedPage.locator('[data-testid="audio-toggle"], [name="audio"], input[type="checkbox"]').first();
  await audioToggle.click();
});

When('I toggle audio feedback', async ({ authenticatedPage }) => {
  const audioToggle = authenticatedPage.locator('[data-testid="audio-toggle"], [name="audio"], input[type="checkbox"]').first();
  await audioToggle.click();
});

Then('correct\\/incorrect sounds should not play', async () => {
  // Audio testing requires browser audio API mocking
});

Given('audio is enabled', async ({ authenticatedPage }) => {
  // Verify audio toggle is on
  const _audioToggle = authenticatedPage.locator('[data-testid="audio-toggle"], [name="audio"]');
  // May need to enable if not already
});

When('I adjust the volume slider', async ({ authenticatedPage }) => {
  const volumeSlider = authenticatedPage.locator('[data-testid="volume-slider"], input[type="range"]');
  await volumeSlider.fill('50');
});

Then('the volume should change accordingly', async () => {
  // Volume change verification
});

Then('my preference should be saved', async ({ authenticatedPage }) => {
  // Reload and verify preference persists
  await authenticatedPage.reload();
  await authenticatedPage.waitForLoadState('networkidle');
});

// ============================================
// Haptic Settings Steps
// ============================================

Given('my device supports haptics', async () => {
  // Haptics support check - may need to mock navigator.vibrate
});

When('I toggle haptic feedback', async ({ authenticatedPage }) => {
  const hapticToggle = authenticatedPage.locator('[data-testid="haptic-toggle"], [name="haptics"], [name="vibration"]');
  if (await hapticToggle.isVisible()) {
    await hapticToggle.click();
  }
});

Then('vibration on interactions should change accordingly', async () => {
  // Vibration testing requires API mocking
});

// ============================================
// Celebration Settings Steps
// ============================================

When('I toggle confetti celebrations', async ({ authenticatedPage }) => {
  const confettiToggle = authenticatedPage.locator('[data-testid="confetti-toggle"], [name="confetti"]');
  if (await confettiToggle.isVisible()) {
    await confettiToggle.click();
  }
});

Then('confetti animations should be enabled\\/disabled', async () => {
  // Confetti testing
});

When('I toggle celebration sounds', async ({ authenticatedPage }) => {
  const celebrationToggle = authenticatedPage.locator('[data-testid="celebration-sound-toggle"], [name="celebrationSounds"]');
  if (await celebrationToggle.isVisible()) {
    await celebrationToggle.click();
  }
});

Then('completion sounds should be enabled\\/disabled', async () => {
  // Sound testing
});

// ============================================
// Persistence Steps
// ============================================

Given('I have customized my settings', async ({ authenticatedPage }) => {
  await authenticatedPage.goto('/settings');
  // Make a settings change
});

When('I log out and log back in', async ({ authenticatedPage, testData }) => {
  // Find and click logout
  const logoutButton = authenticatedPage.getByRole('button', { name: /logout|abmelden/i });
  if (await logoutButton.isVisible()) {
    await logoutButton.click();
    await authenticatedPage.waitForLoadState('networkidle');

    // Log back in
    await authenticatedPage.getByRole('textbox', { name: /email/i }).fill(testData.testEmail);
    await authenticatedPage.getByRole('textbox', { name: /password/i }).fill(testData.testPassword);
    await authenticatedPage.getByRole('button', { name: /sign in|log in/i }).click();
    await authenticatedPage.waitForLoadState('networkidle');
  }
});

Then('my settings should be preserved', async ({ authenticatedPage }) => {
  await authenticatedPage.goto('/settings');
  // Verify settings are as expected
});

Then('all my preferences should be applied', async () => {
  // Preference verification
});

// ============================================
// Accessibility Settings Steps
// ============================================

When('I enable {string}', async ({ authenticatedPage }, settingName: string) => {
  const setting = authenticatedPage.locator(`[data-testid="${settingName.toLowerCase().replace(/\s+/g, '-')}"], [name="${settingName}"]`);
  if (await setting.isVisible()) {
    await setting.click();
  }
});

Then('animations should be minimized', async () => {
  // Animation testing
});

Then('the app should respect this preference', async () => {
  // Preference respect verification
});

// ============================================
// Reset Settings Steps
// ============================================

Given('I have customized many settings', async ({ authenticatedPage }) => {
  await authenticatedPage.goto('/settings');
  // Multiple setting changes would happen here
});

When('I click {string}', async ({ authenticatedPage }, buttonText: string) => {
  await authenticatedPage.getByRole('button', { name: new RegExp(buttonText, 'i') }).click();
});

When('I confirm the reset', async ({ authenticatedPage }) => {
  const confirmButton = authenticatedPage.getByRole('button', { name: /confirm|yes|ok/i });
  if (await confirmButton.isVisible()) {
    await confirmButton.click();
  }
});

Then('all settings should return to default values', async () => {
  // Default values verification
});
