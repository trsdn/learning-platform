import { test, expect } from '@playwright/test';

/**
 * End-to-end tests for PWA and offline functionality
 * Tests service worker, offline mode, and data sync
 */

test.describe('PWA and Offline Functionality', () => {
  test('app installs as PWA', async ({ page, context }) => {
    await page.goto('/');

    // Wait for service worker to register
    await page.waitForFunction(() => 'serviceWorker' in navigator);

    // Check if service worker is registered
    const swRegistered = await page.evaluate(async () => {
      const registration = await navigator.serviceWorker.getRegistration();
      return registration !== undefined;
    });

    expect(swRegistered).toBe(true);
  });

  test('app works offline after initial visit', async ({ page, context }) => {
    // First visit with network
    await page.goto('/');
    await expect(page.getByText('Mathematik')).toBeVisible();

    // Wait for content to be cached
    await page.waitForTimeout(2000);

    // Go offline
    await context.setOffline(true);

    // Reload page
    await page.reload();

    // Should still load app shell
    await expect(page.getByRole('main')).toBeVisible();

    // Should show offline indicator
    await expect(page.getByText(/Offline/i)).toBeVisible();

    // Should still display cached content
    await expect(page.getByText('Mathematik')).toBeVisible();
  });

  test('user can complete session offline', async ({ page, context }) => {
    // Visit app online
    await page.goto('/');

    // Start a session
    await page.getByText('Mathematik').click();
    await page.getByRole('button', { name: /Lernpfad starten/i }).first().click();

    // Go offline before starting session
    await context.setOffline(true);

    // Should still be able to start session with cached data
    await page.getByRole('button', { name: /Session starten/i }).click();

    // Should see offline indicator
    await expect(page.getByText(/Offline-Modus aktiv/i)).toBeVisible();

    // Answer questions offline
    for (let i = 0; i < 3; i++) {
      await page.getByRole('radio').first().check();
      await page.getByRole('button', { name: /Antwort bestätigen/i }).click();

      if (i < 2) {
        await page.getByRole('button', { name: /Weiter/i }).click();
      }
    }

    // Progress should be saved locally
    await expect(page.getByText(/Lokal gespeichert/i)).toBeVisible();
  });

  test('data syncs when coming back online', async ({ page, context }) => {
    // Start offline
    await context.setOffline(true);
    await page.goto('/');

    // Complete some actions offline (if possible with cached data)
    // This assumes the app has been visited before

    // Come back online
    await context.setOffline(false);

    // Trigger sync (might be automatic)
    await page.reload();

    // Should see sync indicator
    await expect(
      page.getByText(/Synchronisierung|Daten werden synchronisiert/i)
    ).toBeVisible({ timeout: 5000 });

    // Should eventually show sync complete
    await expect(
      page.getByText(/Synchronisiert|Aktuell/i)
    ).toBeVisible({ timeout: 10000 });
  });

  test('app shows appropriate offline fallback for unavailable features', async ({
    page,
    context,
  }) => {
    // Visit online
    await page.goto('/');

    // Go offline
    await context.setOffline(true);
    await page.reload();

    // Try to access feature that requires network
    // (e.g., loading new content that wasn't cached)
    await page.getByText(/Neue Inhalte laden/i).click();

    // Should show offline message
    await expect(
      page.getByText(/Offline|Keine Internetverbindung/i)
    ).toBeVisible();

    // Should offer to retry when back online
    await expect(
      page.getByRole('button', { name: /Erneut versuchen/i })
    ).toBeVisible();
  });

  test('PWA manifest is correctly configured', async ({ page }) => {
    await page.goto('/');

    // Check manifest link
    const manifestLink = await page.locator('link[rel="manifest"]');
    await expect(manifestLink).toHaveAttribute('href', '/manifest.json');

    // Fetch and validate manifest
    const manifestUrl = await manifestLink.getAttribute('href');
    const manifestResponse = await page.request.get(manifestUrl!);
    const manifest = await manifestResponse.json();

    expect(manifest.name).toBe('German Learning Platform');
    expect(manifest.short_name).toBe('Lernplattform');
    expect(manifest.lang).toBe('de');
    expect(manifest.display).toBe('standalone');
    expect(manifest.theme_color).toBeDefined();
    expect(manifest.icons).toHaveLength(3);
  });

  test('service worker caches critical assets', async ({ page }) => {
    await page.goto('/');

    // Wait for service worker to be active
    await page.waitForFunction(() => {
      return navigator.serviceWorker.controller !== null;
    });

    // Check cache contents
    const cachedAssets = await page.evaluate(async () => {
      const cacheNames = await caches.keys();
      const assets: string[] = [];

      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const requests = await cache.keys();
        assets.push(...requests.map((req) => req.url));
      }

      return assets;
    });

    // Should have cached key assets
    expect(cachedAssets.some((url) => url.includes('index.html'))).toBe(true);
    expect(cachedAssets.some((url) => url.includes('.js'))).toBe(true);
    expect(cachedAssets.some((url) => url.includes('.css'))).toBe(true);
  });

  test('app handles quota exceeded gracefully', async ({ page }) => {
    await page.goto('/');

    // Simulate quota exceeded error
    await page.evaluate(() => {
      // Override IndexedDB to simulate quota error
      const originalOpen = indexedDB.open;
      (indexedDB as any).open = function (...args: any[]) {
        const request = originalOpen.apply(this, args);
        setTimeout(() => {
          const error = new Error('QuotaExceededError');
          error.name = 'QuotaExceededError';
          request.error = error as any;
          if (request.onerror) {
            request.onerror(new Event('error'));
          }
        }, 0);
        return request;
      };
    });

    // Try to save data
    await page.getByText('Mathematik').click();
    await page.getByRole('button', { name: /Lernpfad starten/i }).first().click();
    await page.getByRole('button', { name: /Session starten/i }).click();

    // Should show quota error message
    await expect(
      page.getByText(/Speicherplatz|Speicher voll/i)
    ).toBeVisible({ timeout: 5000 });

    // Should offer cleanup option
    await expect(
      page.getByRole('button', { name: /Aufräumen|Platz schaffen/i })
    ).toBeVisible();
  });

  test('background sync queues actions while offline', async ({ page, context }) => {
    // Start online
    await page.goto('/');

    // Begin a session
    await page.getByText('Mathematik').click();
    await page.getByRole('button', { name: /Lernpfad starten/i }).first().click();
    await page.getByRole('button', { name: /Session starten/i }).click();

    // Go offline
    await context.setOffline(true);

    // Answer a question
    await page.getByRole('radio').first().check();
    await page.getByRole('button', { name: /Antwort bestätigen/i }).click();

    // Should show pending sync indicator
    await expect(page.getByText(/Ausstehend|Warteschlange/i)).toBeVisible();

    // Come back online
    await context.setOffline(false);

    // Should automatically sync
    await expect(
      page.getByText(/Synchronisiert/i)
    ).toBeVisible({ timeout: 10000 });
  });

  test('app handles flaky connection gracefully', async ({ page, context }) => {
    await page.goto('/');

    // Simulate flaky connection
    for (let i = 0; i < 3; i++) {
      await context.setOffline(true);
      await page.waitForTimeout(1000);
      await context.setOffline(false);
      await page.waitForTimeout(1000);
    }

    // App should remain functional
    await expect(page.getByText('Mathematik')).toBeVisible();
    await expect(page.getByRole('main')).toBeVisible();

    // Should show connection status
    await expect(
      page.locator('[data-testid="connection-status"]')
    ).toBeVisible();
  });

  test('cached content updates when new version available', async ({ page }) => {
    await page.goto('/');

    // Wait for service worker
    await page.waitForFunction(() => navigator.serviceWorker.controller);

    // Simulate new version available
    await page.evaluate(() => {
      navigator.serviceWorker.controller?.postMessage({
        type: 'SKIP_WAITING',
      });
    });

    // Should show update notification
    await expect(
      page.getByText(/Neue Version|Aktualisierung verfügbar/i)
    ).toBeVisible({ timeout: 5000 });

    // Should offer to reload
    const reloadButton = page.getByRole('button', { name: /Aktualisieren|Neu laden/i });
    await expect(reloadButton).toBeVisible();
  });
});