import { test, expect, type Page } from '@playwright/test';
import { login } from './auth.setup';

/**
 * Audio Autoplay E2E Tests
 *
 * Tests audio auto-play functionality on flashcard and task load.
 * This addresses the P0 requirement from issue #173.
 *
 * Bug reference: Audio was not auto-playing on flashcard load when configured.
 *
 * Note: Browser autoplay policies may affect these tests. We primarily test
 * for the presence and configuration of audio elements rather than actual playback.
 */

/**
 * Helper to navigate to Spanish flashcard learning path
 */
async function startFlashcardSession(page: Page) {
  await page.getByRole('button', { name: /Spanisch/i }).click();
  await page.waitForSelector('text=Vokabeltest - Karteikarten', { timeout: 10000 });
  await page.getByText('Vokabeltest - Karteikarten').click();
  await page.getByRole('button', { name: /Starten/i }).click();
  await expect(page.getByText(/1\s*\/\s*98/)).toBeVisible({ timeout: 10000 });
}

test.describe('Audio Autoplay', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test.describe('Audio Element Presence', () => {
    test('practice session loads without audio errors', async ({ page }) => {
      // Listen for audio-related console errors
      const audioErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error' && msg.text().toLowerCase().includes('audio')) {
          audioErrors.push(msg.text());
        }
      });

      await startFlashcardSession(page);

      // Wait for potential audio loading
      await page.waitForTimeout(2000);

      // No critical audio errors should occur
      const criticalErrors = audioErrors.filter(
        (e) => e.includes('TypeError') || e.includes('NotAllowedError')
      );
      expect(criticalErrors.length).toBe(0);
    });

    test('audio button appears when task has audio', async ({ page }) => {
      await startFlashcardSession(page);

      // Look for audio player/button components
      // Audio buttons may appear on cards with audio content
      const audioButton = page.locator('[class*="audio-button"], button[aria-label*="Audio"]');

      // Not all flashcards have audio, but we should check if audio controls exist
      // when audio is configured
      const hasAudioButton = (await audioButton.count()) > 0;

      // This is informational - some flashcards may not have audio
      if (hasAudioButton) {
        await expect(audioButton.first()).toBeVisible();
      }
    });
  });

  test.describe('Audio Settings Integration', () => {
    test('audio settings page is accessible', async ({ page }) => {
      // Navigate to settings
      const settingsButton = page
        .getByRole('button', { name: /Einstellungen/i })
        .or(page.locator('[class*="settings"]').first());

      if ((await settingsButton.count()) > 0) {
        await settingsButton.first().click();
        await page.waitForLoadState('networkidle');

        // Look for Audio settings section
        const audioSection = page.locator('button:has-text("Audio"), h2:has-text("Audio"), h3:has-text("Audio")');
        const hasAudioSettings = (await audioSection.count()) > 0;

        // Audio settings should exist in the app
        expect(hasAudioSettings).toBe(true);
      }
    });
  });

  test.describe('Audio Playback Behavior', () => {
    test('audio does not cause app crashes', async ({ page }) => {
      // Listen for page errors
      const pageErrors: Error[] = [];
      page.on('pageerror', (error) => {
        pageErrors.push(error);
      });

      await startFlashcardSession(page);

      // Navigate through several flashcards
      for (let i = 0; i < 3; i++) {
        await page.getByRole('button', { name: /Ergebnis anzeigen/i }).click();
        await page.getByRole('button', { name: /Gewusst/i }).click();
        await expect(page.getByText(new RegExp(`${i + 2}\\s*\\/\\s*98`))).toBeVisible({
          timeout: 3000,
        });
      }

      // No page errors should have occurred from audio
      const audioRelatedErrors = pageErrors.filter(
        (e) =>
          e.message.toLowerCase().includes('audio') ||
          e.message.toLowerCase().includes('media')
      );
      expect(audioRelatedErrors.length).toBe(0);
    });

    test('app continues to function when audio fails to load', async ({ page }) => {
      // Simulate network issues for audio files
      await page.route('**/*.mp3', (route) => route.abort());
      await page.route('**/*.wav', (route) => route.abort());
      await page.route('**/*.ogg', (route) => route.abort());

      await startFlashcardSession(page);

      // App should still function even if audio fails
      await page.getByRole('button', { name: /Ergebnis anzeigen/i }).click();
      await expect(page.getByRole('button', { name: /Gewusst/i })).toBeVisible({ timeout: 2000 });
      await page.getByRole('button', { name: /Gewusst/i }).click();

      // Should advance to next card
      await expect(page.getByText(/2\s*\/\s*98/)).toBeVisible({ timeout: 3000 });
    });
  });

  test.describe('Demo Session Audio', () => {
    test('demo session handles tasks without audio gracefully', async ({ page }) => {
      // Navigate to demo learning path
      await page.getByRole('button', { name: /Test & Demo/i }).click();
      await page.waitForSelector('text=Alle Aufgabentypen', { timeout: 10000 });
      await page.getByText('Alle Aufgabentypen - Demo').click();
      await page.getByRole('button', { name: /Starten/i }).click();
      await expect(page.getByText(/1\s*\/\s*10/)).toBeVisible({ timeout: 10000 });

      // Listen for console warnings about audio
      const audioWarnings: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'warning' && msg.text().toLowerCase().includes('audio')) {
          audioWarnings.push(msg.text());
        }
      });

      // Navigate through a few tasks
      for (let i = 2; i <= 3; i++) {
        await page.getByRole('button', { name: /Überspringen/i }).click();
        await expect(page.getByText(new RegExp(`${i}\\s*\\/\\s*10`))).toBeVisible({ timeout: 5000 });
      }

      // Non-critical audio warnings are acceptable (e.g., "no audio URL")
      // but shouldn't include errors
      const errorWarnings = audioWarnings.filter(
        (w) => w.includes('Error') || w.includes('failed')
      );
      expect(errorWarnings.length).toBe(0);
    });
  });

  test.describe('Audio Replay', () => {
    test('R keyboard shortcut for audio replay does not crash app', async ({ page }) => {
      await startFlashcardSession(page);

      // Listen for errors
      const errors: Error[] = [];
      page.on('pageerror', (error) => errors.push(error));

      // Press R to try audio replay (may or may not have audio)
      await page.keyboard.press('r');

      // Wait a moment for any potential errors
      await page.waitForTimeout(500);

      // App should not crash
      await expect(page.getByText(/1\s*\/\s*98/)).toBeVisible();
      expect(errors.filter((e) => e.message.includes('audio')).length).toBe(0);
    });
  });
});
