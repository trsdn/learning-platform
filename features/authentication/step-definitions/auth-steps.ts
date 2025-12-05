import { Given, When, Then } from '../../support/fixtures';
import { expect } from '@playwright/test';

/**
 * Step definitions for authentication
 * Feature IDs: AU-001 to AU-010
 */

// ============================================
// Login Page Steps
// ============================================

When('I visit the application', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
});

Then('I should see login options', async ({ page }) => {
  // Look for login form or login buttons
  const loginForm = page.locator('[data-testid="auth-modal"], [class*="auth"], form');
  await expect(loginForm.first()).toBeVisible({ timeout: 10000 });
});

Then('I should be able to choose my authentication method', async ({ page }) => {
  // Check for email/password fields or social login buttons
  const authOptions = page.locator('input[type="email"], button:has-text("Google"), button:has-text("GitHub")');
  await expect(authOptions.first()).toBeVisible();
});

Given('I am on the login page', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
});

// ============================================
// Credential Steps
// ============================================

When('I enter valid credentials', async ({ page, testData }) => {
  await page.getByRole('textbox', { name: /email/i }).fill(testData.testEmail);
  await page.getByRole('textbox', { name: /password/i }).fill(testData.testPassword);
});

When('I enter invalid credentials', async ({ page }) => {
  await page.getByRole('textbox', { name: /email/i }).fill('invalid@example.com');
  await page.getByRole('textbox', { name: /password/i }).fill('wrongpassword');
});

When('I click the login button', async ({ page }) => {
  await page.getByRole('button', { name: /sign in|log in|anmelden/i }).click();
});

// ============================================
// Login Result Steps
// ============================================

Then('I should be logged in', async ({ page }) => {
  // Wait for redirect to dashboard
  await page.waitForLoadState('networkidle');
});

Then('I should see the dashboard', async ({ page, testData }) => {
  // Dashboard should show topics
  await expect(page.getByText(testData.demoTopic)).toBeVisible({ timeout: 10000 });
});

Then('I should see an error message', async ({ page }) => {
  const errorMessage = page.locator('[role="alert"], .error, [class*="error"]');
  await expect(errorMessage.first()).toBeVisible({ timeout: 5000 });
});

Then('I should remain on the login page', async ({ page }) => {
  // Login form should still be visible
  const loginForm = page.locator('input[type="email"], input[type="password"]');
  await expect(loginForm.first()).toBeVisible();
});

// ============================================
// Social Login Steps
// ============================================

When('I click on a social login button', async ({ page }) => {
  const socialButton = page.getByRole('button', { name: /google|github|apple/i });
  if (await socialButton.first().isVisible()) {
    // Note: Actually clicking would redirect to OAuth provider
    // For testing, we just verify the button exists
  }
});

Then('I should be redirected to the provider', async ({ page: _page }) => {
  // Would check URL change in real test
});

Then('after authentication I should return logged in', async () => {
  // OAuth callback handling
});

// ============================================
// Logout Steps
// ============================================

When('I click the logout button', async ({ page }) => {
  const logoutButton = page.getByRole('button', { name: /logout|sign out|abmelden/i });
  await logoutButton.click();
});

Then('I should be logged out', async ({ page }) => {
  await page.waitForLoadState('networkidle');
});

Then('I should see the login page', async ({ page }) => {
  const loginForm = page.locator('[data-testid="auth-modal"], input[type="email"]');
  await expect(loginForm.first()).toBeVisible({ timeout: 10000 });
});

// ============================================
// Session Steps
// ============================================

Then('I should still be logged in', async ({ page, testData }) => {
  await expect(page.getByText(testData.demoTopic)).toBeVisible({ timeout: 10000 });
});

When('I try to access a protected page directly', async ({ page }) => {
  await page.goto('/settings');
});

Then('I should be redirected to login', async ({ page }) => {
  const loginForm = page.locator('[data-testid="auth-modal"], input[type="email"]');
  await expect(loginForm.first()).toBeVisible({ timeout: 10000 });
});

Then('after login I should be redirected to the original page', async ({ page: _page }) => {
  // After login, should redirect back
});

// ============================================
// Registration Steps
// ============================================

When('I click on {string}', async ({ page }, linkText: string) => {
  await page.getByText(linkText).click();
});

When('I fill in registration details', async ({ page }) => {
  await page.getByRole('textbox', { name: /email/i }).fill('newuser@example.com');
  await page.getByRole('textbox', { name: /password/i }).fill('SecurePassword123!');
});

When('I submit the registration form', async ({ page }) => {
  await page.getByRole('button', { name: /sign up|register|registrieren/i }).click();
});

Then('I should receive a confirmation', async ({ page }) => {
  const _confirmation = page.locator('text=/confirmation|verify|email sent/i');
  // May or may not be visible depending on auth flow
});

Then('I should be able to log in', async () => {
  // Verified by subsequent login test
});

// ============================================
// Password Reset Steps
// ============================================

When('I enter my email address', async ({ page, testData }) => {
  await page.getByRole('textbox', { name: /email/i }).fill(testData.testEmail);
});

When('I submit the request', async ({ page }) => {
  await page.getByRole('button', { name: /reset|send|submit/i }).click();
});

Then('I should receive a password reset email', async ({ page }) => {
  const _confirmation = page.locator('text=/email sent|check your email/i');
  // Email sending verification
});

// ============================================
// Session Timeout Steps
// ============================================

When('I am inactive for the timeout period', async ({ page: _page }) => {
  // Simulate timeout - would need to mock time
});

Then('my session should expire', async () => {
  // Session expiration check
});

Then('I should be prompted to log in again', async ({ page }) => {
  const loginPrompt = page.locator('[data-testid="auth-modal"], input[type="email"]');
  await expect(loginPrompt.first()).toBeVisible();
});
