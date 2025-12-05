import { Given, When, Then } from './fixtures';
import { expect } from '@playwright/test';

/**
 * Common step definitions used across multiple features
 */

// ============================================
// Authentication Steps
// ============================================

Given('I am logged in as a learner', async ({ authenticatedPage }) => {
  // authenticatedPage fixture handles login
  await expect(authenticatedPage).toHaveURL('/');
});

Given('I am not logged in', async ({ page }) => {
  // Clear any existing session
  await page.context().clearCookies();
  await page.goto('/');
});

When('I log out', async ({ page }) => {
  // Find and click logout button (adjust selector as needed)
  await page.getByRole('button', { name: /logout|abmelden/i }).click();
});

// ============================================
// Navigation Steps
// ============================================

Given('I am on the dashboard', async ({ authenticatedPage }) => {
  await authenticatedPage.goto('/');
  await authenticatedPage.waitForLoadState('networkidle');
});

Given('I am on the settings page', async ({ authenticatedPage }) => {
  await authenticatedPage.goto('/settings');
  await authenticatedPage.waitForLoadState('networkidle');
});

Given('I am on any page', async ({ authenticatedPage }) => {
  // Just ensure we're authenticated and on some page
  await expect(authenticatedPage).toHaveURL(/\/.*/);
});

When('I navigate to settings', async ({ authenticatedPage }) => {
  await authenticatedPage.getByRole('link', { name: /settings|einstellungen/i }).click();
});

When('I refresh the page', async ({ page }) => {
  await page.reload();
  await page.waitForLoadState('networkidle');
});

// ============================================
// Visibility Assertions
// ============================================

Then('I should see {string}', async ({ page }, text: string) => {
  await expect(page.getByText(text)).toBeVisible();
});

Then('I should not see {string}', async ({ page }, text: string) => {
  await expect(page.getByText(text)).not.toBeVisible();
});

Then('I should see a button {string}', async ({ page }, buttonText: string) => {
  await expect(page.getByRole('button', { name: new RegExp(buttonText, 'i') })).toBeVisible();
});

// ============================================
// Wait Steps
// ============================================

When('I wait for {int} seconds', async ({ page }, seconds: number) => {
  await page.waitForTimeout(seconds * 1000);
});

When('I wait for the page to load', async ({ page }) => {
  await page.waitForLoadState('networkidle');
});
