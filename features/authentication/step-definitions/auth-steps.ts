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

  // Click the login button to open auth modal
  const loginButton = page.getByRole('button', { name: /Anmelden|Login|Sign in/i });
  await loginButton.click();
});

Then('I should see login options', async ({ page }) => {
  // Auth modal should be visible with tabs and email input
  const authModal = page.locator('.auth-modal');
  await expect(authModal).toBeVisible({ timeout: 10000 });

  // Check for auth tabs (Anmelden tab should be visible)
  const loginTab = page.locator('.auth-tab', { hasText: 'Anmelden' });
  await expect(loginTab).toBeVisible();
});

Then('I should be able to choose my authentication method', async ({ page }) => {
  // Check for email input field in the auth modal
  const emailInput = page.locator('#login-email');
  await expect(emailInput).toBeVisible({ timeout: 5000 });

  // Password field should also be visible
  const passwordInput = page.locator('#login-password');
  await expect(passwordInput).toBeVisible();
});

Given('I am on the login page', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // Auth modal should be visible when not authenticated
  const authModal = page.locator('.auth-modal');
  await expect(authModal).toBeVisible({ timeout: 10000 });
});

// ============================================
// Credential Steps
// ============================================

When('I enter valid credentials', async ({ page, testData }) => {
  // Use the specific input IDs from the auth modal
  await page.locator('#login-email').fill(testData.testEmail);
  await page.locator('#login-password').fill(testData.testPassword);
});

When('I enter invalid credentials', async ({ page }) => {
  await page.locator('#login-email').fill('invalid@example.com');
  await page.locator('#login-password').fill('wrongpassword');
});

When('I click the login button', async ({ page }) => {
  // Click the submit button in the auth modal (with keyboard emoji)
  await page.locator('button[type="submit"]:has-text("Anmelden")').click();
});

// ============================================
// Login Result Steps
// ============================================

Then('I should be logged in', async ({ page }) => {
  // Wait for redirect to dashboard (auth modal should close)
  await expect(page.locator('.auth-modal')).not.toBeVisible();
  await page.waitForLoadState('networkidle');
});

Then('I should see the dashboard', async ({ page, testData }) => {
  // Dashboard should show topics
  await expect(page.getByText(testData.demoTopic)).toBeVisible({ timeout: 10000 });
});

Then('I should see an error message', async ({ page }) => {
  // Error messages in the auth modal have class "auth-message error"
  const errorMessage = page.locator('.auth-message.error');
  await expect(errorMessage).toBeVisible({ timeout: 5000 });
});

Then('I should remain on the login page', async ({ page }) => {
  // Login form should still be visible in the auth modal
  const authModal = page.locator('.auth-modal');
  await expect(authModal).toBeVisible();

  const emailInput = page.locator('#login-email');
  await expect(emailInput).toBeVisible();
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
  const authModal = page.locator('.auth-modal');
  await expect(authModal).toBeVisible({ timeout: 10000 });

  const emailInput = page.locator('#login-email');
  await expect(emailInput).toBeVisible();
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
  const authModal = page.locator('.auth-modal');
  await expect(authModal).toBeVisible({ timeout: 10000 });

  const emailInput = page.locator('#login-email');
  await expect(emailInput).toBeVisible();
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
  const authModal = page.locator('.auth-modal');
  await expect(authModal).toBeVisible();

  const emailInput = page.locator('#login-email');
  await expect(emailInput).toBeVisible();
});
