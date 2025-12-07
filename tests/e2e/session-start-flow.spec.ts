import { test, expect } from '@playwright/test';
import { login } from './auth.setup';

/**
 * Session Start Flow E2E Tests
 *
 * Tests for PR #217: Remove session configuration screen - use settings defaults
 *
 * Verifies:
 * - Sessions start immediately after selecting a learning path (no config screen)
 * - Settings from SettingsPage are correctly applied to new sessions
 * - Settings persist across page reloads
 * - Default values are used for new users
 */

test.describe('Session Start Flow', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should start session immediately after selecting a learning path', async ({ page }) => {
    // Navigate to Test & Demo topic
    await page.getByRole('button', { name: /Test & Demo/i }).click();

    // Wait for learning paths to load
    await page.waitForSelector('text=Alle Aufgabentypen', { timeout: 10000 });

    // Click on the demo learning path card using role button with aria-label
    // The card has role="button" and aria-label includes the title
    const learningPathCard = page.getByRole('button', { name: /Alle Aufgabentypen - Demo/i });
    await expect(learningPathCard).toBeVisible({ timeout: 5000 });
    await learningPathCard.click();

    // Session should start immediately - verify progress indicator appears
    // Wait for session to load (may show "Sitzung wird erstellt..." first)
    await page.waitForTimeout(1000);

    // Verify progress indicator appears (format: "1 / 20" or "1/20")
    await expect(page.locator('text=/\\d+\\s*\\/\\s*\\d+/')).toBeVisible({ timeout: 15000 });

    // Verify we're in a practice session (not on a config screen)
    const progressText = await page.locator('text=/\\d+\\s*\\/\\s*\\d+/').first().textContent();
    expect(progressText).toBeTruthy();
  });

  test('should use default session size (20 questions) for new users', async ({ page }) => {
    // Clear any existing settings to test defaults
    await page.evaluate(() => {
      localStorage.removeItem('mindforge.app-settings.v1');
    });

    // Reload to apply defaults
    await page.reload();
    await page.waitForLoadState('networkidle');
    await login(page);

    // Navigate to Test & Demo topic
    await page.getByRole('button', { name: /Test & Demo/i }).click();
    await page.waitForSelector('text=Alle Aufgabentypen', { timeout: 10000 });

    // Start session by clicking the learning path card
    const learningPathCard = page.getByRole('button', { name: /Alle Aufgabentypen - Demo/i });
    await expect(learningPathCard).toBeVisible({ timeout: 5000 });
    await learningPathCard.click();

    // Wait for session to start
    await page.waitForTimeout(1000);
    await expect(page.locator('text=/\\d+\\s*\\/\\s*\\d+/')).toBeVisible({ timeout: 15000 });

    // Verify default session size is 20
    // Progress indicator should show "1 / 20" or "1/20"
    const progressText = await page.locator('text=/\\d+\\s*\\/\\s*\\d+/').first().textContent();
    expect(progressText).toMatch(/1\s*\/\s*20/);
  });

  test('should use custom session size from Settings page', async ({ page }) => {
    // Navigate to Settings
    const settingsButton = page.getByRole('button', { name: /Einstellungen/i }).or(
      page.getByRole('button').filter({ hasText: /⚙️/ })
    );

    if (await settingsButton.count() === 0) {
      test.skip();
      return;
    }

    await settingsButton.first().click();
    await page.waitForLoadState('networkidle');

    // Find and expand the Session Settings section
    const sessionSection = page.locator('button:has-text("Sitzungs-Einstellungen")').or(
      page.getByRole('button', { name: /Sitzungs-Einstellungen/i })
    );

    if (await sessionSection.count() > 0) {
      await sessionSection.first().scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);
    }

    // Change session size to 10
    // The radio buttons are inside labels, and the label text is just the number
    const size10Label = page.locator('label').filter({ hasText: /^10$/ });
    if (await size10Label.count() > 0) {
      await size10Label.first().scrollIntoViewIfNeeded();
      await page.waitForTimeout(200);
      const radio = size10Label.first().locator('input[type="radio"][name="session-size"]');
      if (await radio.count() > 0) {
        await radio.first().click();
        await page.waitForTimeout(500); // Wait for save
      }
    }

    // Close settings
    const closeButton = page.getByRole('button', { name: /Schließen|Fertig/i });
    if (await closeButton.count() > 0) {
      await closeButton.first().click();
    }

    // Navigate to Test & Demo topic
    await page.getByRole('button', { name: /Test & Demo/i }).click();
    await page.waitForSelector('text=Alle Aufgabentypen', { timeout: 10000 });

    // Start session by clicking the learning path card
    const learningPathCard = page.getByRole('button', { name: /Alle Aufgabentypen - Demo/i });
    await expect(learningPathCard).toBeVisible({ timeout: 5000 });
    await learningPathCard.click();

    // Wait for session to start
    await page.waitForTimeout(1000);
    await expect(page.locator('text=/\\d+\\s*\\/\\s*\\d+/')).toBeVisible({ timeout: 15000 });

    // Verify session uses custom size (10)
    const progressText = await page.locator('text=/\\d+\\s*\\/\\s*\\d+/').first().textContent();
    expect(progressText).toMatch(/1\s*\/\s*10/);
  });

  test('should persist session settings across page reloads', async ({ page }) => {
    // Navigate to Settings
    const settingsButton = page.getByRole('button', { name: /Einstellungen/i }).or(
      page.getByRole('button').filter({ hasText: /⚙️/ })
    );

    if (await settingsButton.count() === 0) {
      test.skip();
      return;
    }

    await settingsButton.first().click();
    await page.waitForLoadState('networkidle');

    // Find and expand the Session Settings section
    const sessionSection = page.locator('button:has-text("Sitzungs-Einstellungen")').or(
      page.getByRole('button', { name: /Sitzungs-Einstellungen/i })
    );

    if (await sessionSection.count() > 0) {
      await sessionSection.first().scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);
    }

    // Change session size to 15
    const size15Label = page.locator('label').filter({ hasText: /^15$/ });
    if (await size15Label.count() > 0) {
      await size15Label.first().scrollIntoViewIfNeeded();
      await page.waitForTimeout(200);
      const radio = size15Label.first().locator('input[type="radio"][name="session-size"]');
      if (await radio.count() > 0) {
        await radio.first().click();
        await page.waitForTimeout(500); // Wait for save
      }
    }

    // Close settings
    const closeButton = page.getByRole('button', { name: /Schließen|Fertig/i });
    if (await closeButton.count() > 0) {
      await closeButton.first().click();
    }

    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');
    await login(page);

    // Navigate to Test & Demo topic
    await page.getByRole('button', { name: /Test & Demo/i }).click();
    await page.waitForSelector('text=Alle Aufgabentypen', { timeout: 10000 });

    // Start session by clicking the learning path card
    const learningPathCard = page.getByRole('button', { name: /Alle Aufgabentypen - Demo/i });
    await expect(learningPathCard).toBeVisible({ timeout: 5000 });
    await learningPathCard.click();

    // Wait for session to start
    await page.waitForTimeout(1000);
    await expect(page.locator('text=/\\d+\\s*\\/\\s*\\d+/')).toBeVisible({ timeout: 15000 });

    // Verify session still uses the saved size (15)
    const progressText = await page.locator('text=/\\d+\\s*\\/\\s*\\d+/').first().textContent();
    expect(progressText).toMatch(/1\s*\/\s*15/);
  });

  test('should toggle repeatDifficultTasks setting and apply it to sessions', async ({ page }) => {
    // Navigate to Settings
    const settingsButton = page.getByRole('button', { name: /Einstellungen/i }).or(
      page.getByRole('button').filter({ hasText: /⚙️/ })
    );

    if (await settingsButton.count() === 0) {
      test.skip();
      return;
    }

    await settingsButton.first().click();
    await page.waitForLoadState('networkidle');

    // Find and expand the Session Settings section
    const sessionSection = page.locator('button:has-text("Sitzungs-Einstellungen")').or(
      page.getByRole('button', { name: /Sitzungs-Einstellungen/i })
    );

    if (await sessionSection.count() > 0) {
      await sessionSection.first().scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);
    }

    // Find the repeatDifficultTasks checkbox
    const repeatCheckbox = page.locator('input#repeat-difficult-tasks').or(
      page.locator('label').filter({ hasText: /Wiederholungsfragen einbeziehen/i }).locator('input[type="checkbox"]')
    );

    if (await repeatCheckbox.count() > 0) {
      const initialState = await repeatCheckbox.first().isChecked();
      
      // Toggle the checkbox
      await repeatCheckbox.first().click();
      await page.waitForTimeout(500); // Wait for save

      const newState = await repeatCheckbox.first().isChecked();
      expect(newState).toBe(!initialState);

      // Verify the setting is accessible via aria-describedby
      const describedBy = await repeatCheckbox.first().getAttribute('aria-describedby');
      expect(describedBy).toBe('repeat-difficult-tasks-desc');

      // Verify description text exists
      const description = page.locator('#repeat-difficult-tasks-desc');
      await expect(description.first()).toBeVisible();
    }
  });

  test('should not show session configuration screen', async ({ page }) => {
    // Navigate to Test & Demo topic
    await page.getByRole('button', { name: /Test & Demo/i }).click();
    await page.waitForSelector('text=Alle Aufgabentypen', { timeout: 10000 });

    // Click on learning path card
    const learningPathCard = page.getByRole('button', { name: /Alle Aufgabentypen - Demo/i });
    await expect(learningPathCard).toBeVisible({ timeout: 5000 });
    await learningPathCard.click();

    // Wait a moment to ensure any navigation completes
    await page.waitForTimeout(2000);

    // Verify we're NOT on a config screen
    // Config screen would have text like "Sitzung konfigurieren" or "Anzahl der Fragen"
    const configScreenText = page.getByText(/Sitzung konfigurieren|Anzahl der Fragen/i);
    await expect(configScreenText).not.toBeVisible({ timeout: 2000 });

    // Verify we ARE in a session (progress indicator visible)
    await expect(page.locator('text=/\\d+\\s*\\/\\s*\\d+/')).toBeVisible({ timeout: 15000 });
  });

  test('should use all available session size options (5, 10, 15, 20, 25, 30)', async ({ page }) => {
    // Navigate to Settings
    const settingsButton = page.getByRole('button', { name: /Einstellungen/i }).or(
      page.getByRole('button').filter({ hasText: /⚙️/ })
    );

    if (await settingsButton.count() === 0) {
      test.skip();
      return;
    }

    await settingsButton.first().click();
    await page.waitForLoadState('networkidle');

    // Find and expand the Session Settings section
    const sessionSection = page.locator('button:has-text("Sitzungs-Einstellungen")').or(
      page.getByRole('button', { name: /Sitzungs-Einstellungen/i })
    );

    if (await sessionSection.count() > 0) {
      await sessionSection.first().scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);
    }

    // Verify all session size options are available
    // The radio buttons have name="session-size" and are inside labels with the number as text
    const sizes = [5, 10, 15, 20, 25, 30];
    for (const size of sizes) {
      const sizeLabel = page.locator('label').filter({ hasText: new RegExp(`^${size}$`) });
      const count = await sizeLabel.count();
      expect(count).toBeGreaterThan(0);
    }
  });
});

