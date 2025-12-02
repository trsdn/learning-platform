/**
 * Issue #50 - Mobile UX Enhancements Test Suite
 *
 * Tests for:
 * - Safe area CSS variables in stylesheets
 * - Button active states in CSS
 * - Tap highlight removal
 * - PWA manifest icons
 * - Viewport meta tag
 *
 * Note: These tests check the CSS/HTML directly without requiring
 * the full React app to render (which needs Supabase credentials).
 */

import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// Mobile viewport configuration
test.use({
  viewport: { width: 393, height: 852 },
  isMobile: true,
  hasTouch: true,
});

test.describe('Issue #50: Mobile UX Enhancements', () => {
  test('Test 1: Viewport meta tag has viewport-fit=cover', async ({ page }) => {
    await page.goto('/');

    const viewportMeta = await page.evaluate(() => {
      const meta = document.querySelector('meta[name="viewport"]');
      return meta?.getAttribute('content') || '';
    });

    expect(viewportMeta).toContain('viewport-fit=cover');
  });

  test('Test 2: PWA manifest contains maskable icon', async ({ page }) => {
    const response = await page.goto('/manifest.webmanifest');

    expect(response).not.toBeNull();
    expect(response!.status()).toBe(200);

    const manifest = await response!.json();

    // Check for maskable icon
    const hasMaskableIcon = manifest.icons?.some(
      (icon: { purpose?: string }) => icon.purpose === 'maskable'
    );
    expect(hasMaskableIcon).toBe(true);

    // Check for 180x180 icon (Apple touch icon size)
    const has180Icon = manifest.icons?.some(
      (icon: { sizes?: string }) => icon.sizes === '180x180'
    );
    expect(has180Icon).toBe(true);
  });

  test('Test 3: Safe area CSS variables exist in variables.css', async () => {
    const cssPath = path.join(process.cwd(), 'src/modules/ui/styles/variables.css');
    const cssContent = fs.readFileSync(cssPath, 'utf-8');

    // Check for safe-area custom properties
    expect(cssContent).toContain('--safe-area-top');
    expect(cssContent).toContain('--safe-area-bottom');
    expect(cssContent).toContain('--safe-area-left');
    expect(cssContent).toContain('--safe-area-right');
    expect(cssContent).toContain('env(safe-area-inset-');
  });

  test('Test 4: Button active states exist in Button.module.css', async () => {
    const cssPath = path.join(process.cwd(), 'src/modules/ui/components/common/Button.module.css');
    const cssContent = fs.readFileSync(cssPath, 'utf-8');

    // Check for :active pseudo-class with transform
    expect(cssContent).toContain(':active');
    expect(cssContent).toContain('scale(0.97)');
  });

  test('Test 5: IconButton active states exist in IconButton.module.css', async () => {
    const cssPath = path.join(
      process.cwd(),
      'src/modules/ui/components/common/IconButton.module.css'
    );
    const cssContent = fs.readFileSync(cssPath, 'utf-8');

    // Check for :active pseudo-class with transform
    expect(cssContent).toContain(':active');
    expect(cssContent).toContain('scale(0.95)');
  });

  test('Test 6: Tap highlight removal in global.css', async () => {
    const cssPath = path.join(process.cwd(), 'src/modules/ui/styles/global.css');
    const cssContent = fs.readFileSync(cssPath, 'utf-8');

    // Check for tap highlight removal
    expect(cssContent).toContain('-webkit-tap-highlight-color');
    expect(cssContent).toContain('transparent');
  });

  test('Test 7: Safe area padding applied in main-fallback.module.css', async () => {
    const cssPath = path.join(process.cwd(), 'src/styles/main-fallback.module.css');
    const cssContent = fs.readFileSync(cssPath, 'utf-8');

    // Check for safe-area variable usage
    expect(cssContent).toContain('var(--safe-area-');
  });

  test('Test 8: Vibration service exists and exports patterns', async () => {
    const servicePath = path.join(
      process.cwd(),
      'src/modules/core/services/vibration-service.ts'
    );
    const serviceContent = fs.readFileSync(servicePath, 'utf-8');

    // Check for vibration patterns
    expect(serviceContent).toContain('PATTERNS');
    expect(serviceContent).toContain('success');
    expect(serviceContent).toContain('error');
    expect(serviceContent).toContain('tap');
    expect(serviceContent).toContain('sessionComplete');
    expect(serviceContent).toContain('VibrationService');
  });

  test('Test 9: Share button component includes share functionality', async () => {
    const componentPath = path.join(
      process.cwd(),
      'src/modules/ui/components/session-results.tsx'
    );
    const componentContent = fs.readFileSync(componentPath, 'utf-8');

    // Check for share functionality
    expect(componentContent).toContain('navigator.share');
    expect(componentContent).toContain('navigator.clipboard');
    expect(componentContent).toContain('Ergebnis teilen');
  });
});
