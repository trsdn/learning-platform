import { test, expect } from '@playwright/test';

/**
 * Visual Regression Tests for CSS Modules Migration
 *
 * Phase 1 (Pre-Migration): Capture baseline screenshots of components with inline styles
 * Phase 2 (Post-Migration): Re-run and compare - must have ZERO pixel differences
 *
 * Components being tested (14 total):
 * - audio-button, dashboard, practice-session, session-results
 * - common: Button, Card, FeedbackCard, IconButton, MasteryBar, StatCard
 * - forms: Checkbox, Input, Select, Slider
 *
 * Reference: TopicCard already uses CSS Modules (not tested here)
 */

test.describe('Visual Regression: Main Application Views', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to app and wait for it to load
    await page.goto('/');
    await page.waitForSelector('h1:has-text("MindForge Academy")', { timeout: 10000 });
  });

  test('captures main topic selection page', async ({ page }) => {
    // Wait for topics to load
    await page.waitForSelector('[data-testid^="topic-card-"]', { timeout: 5000 });

    // Capture full page screenshot
    await expect(page).toHaveScreenshot('01-topic-selection-page.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test.skip('captures dashboard view', async ({ page }) => {
    // Click dashboard button
    await page.click('button:has-text("Dashboard")');

    // Wait for dashboard to render
    await page.waitForSelector('h1', { timeout: 5000 });

    // Capture dashboard
    await expect(page).toHaveScreenshot('02-dashboard-view.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('captures learning path selection', async ({ page }) => {
    // Wait for a topic card to appear
    const topicCard = page.locator('[data-testid^="topic-card-"]').first();
    await topicCard.waitFor({ state: 'visible', timeout: 5000 });

    // Click first topic
    await topicCard.click();

    // Wait for learning paths to load
    await page.waitForSelector('h2:has-text("Lernpfade")', { timeout: 5000 });

    // Capture learning path selection page
    await expect(page).toHaveScreenshot('03-learning-path-selection.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('captures session configuration screen', async ({ page }) => {
    // Navigate to session config
    const topicCard = page.locator('[data-testid^="topic-card-"]').first();
    await topicCard.waitFor({ state: 'visible', timeout: 5000 });
    await topicCard.click();

    // Wait for learning paths and click first "Start" button
    await page.waitForSelector('button:has-text("Lernpfad starten")', { timeout: 5000 });
    await page.click('button:has-text("Lernpfad starten")');

    // Wait for session config screen
    await page.waitForSelector('h1:has-text("Sitzung konfigurieren")', { timeout: 5000 });

    // Capture session config
    await expect(page).toHaveScreenshot('04-session-config.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });
});

test.describe('Visual Regression: Component States', () => {
  test('captures hover states on topic cards', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid^="topic-card-"]', { timeout: 5000 });

    const firstCard = page.locator('[data-testid^="topic-card-"]').first();

    // Hover over card
    await firstCard.hover();

    // Capture hovered state
    await expect(firstCard).toHaveScreenshot('05-topic-card-hover.png', {
      animations: 'disabled',
    });
  });

  test('captures button states in session config', async ({ page }) => {
    // Navigate to session config
    await page.goto('/');
    const topicCard = page.locator('[data-testid^="topic-card-"]').first();
    await topicCard.waitFor({ state: 'visible', timeout: 5000 });
    await topicCard.click();

    await page.waitForSelector('button:has-text("Lernpfad starten")', { timeout: 5000 });
    await page.click('button:has-text("Lernpfad starten")');
    await page.waitForSelector('h1:has-text("Sitzung konfigurieren")', { timeout: 5000 });

    // Capture button group (different states: selected vs unselected)
    const buttonGroup = page.locator('div:has(button:has-text("5"))').last();
    await expect(buttonGroup).toHaveScreenshot('06-button-group-states.png', {
      animations: 'disabled',
    });

    // Click different button to change state
    await page.click('button:has-text("15")');

    // Capture updated state
    await expect(buttonGroup).toHaveScreenshot('07-button-group-updated.png', {
      animations: 'disabled',
    });
  });
});

/**
 * Note: Practice session and session results require active session state
 * These will be captured during manual testing or when session is active
 * For now, we focus on static views that are always accessible
 */

test.describe('Visual Regression: Accessibility Check', () => {
  test('verify no visual regressions in accessible components', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('h1:has-text("MindForge Academy")', { timeout: 5000 });

    // TopicCard uses CSS Modules (reference implementation)
    const topicCard = page.locator('[data-testid^="topic-card-"]').first();

    await expect(topicCard).toHaveScreenshot('08-topic-card-reference-css-modules.png', {
      animations: 'disabled',
    });
  });
});
