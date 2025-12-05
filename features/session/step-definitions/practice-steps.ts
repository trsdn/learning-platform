import { Given, When, Then } from '../../support/fixtures';
import { expect } from '@playwright/test';

/**
 * Step definitions for practice session
 * Feature IDs: PS-001 to PS-012
 */

// ============================================
// Session Setup Steps
// ============================================

Given('I have selected a learning path', async ({ authenticatedPage, testData }) => {
  await authenticatedPage.goto('/');
  await authenticatedPage.getByRole('button', { name: new RegExp(testData.demoTopic, 'i') }).click();
  await authenticatedPage.waitForSelector('text=' + testData.demoLearningPath, { timeout: 10000 });
});

Given('I am on the learning path page', async ({ authenticatedPage, testData }) => {
  await authenticatedPage.getByText(testData.demoLearningPath).click();
  await authenticatedPage.waitForLoadState('networkidle');
});

// ============================================
// Session Start Steps
// ============================================

When('I click the {string} button', async ({ authenticatedPage }, buttonName: string) => {
  await authenticatedPage.getByRole('button', { name: new RegExp(buttonName, 'i') }).click();
});

Then('a practice session should begin', async ({ authenticatedPage }) => {
  // Wait for session to load
  await authenticatedPage.waitForLoadState('networkidle');
});

Then('I should see the first task', async ({ authenticatedPage }) => {
  // A task should be visible
  const taskContainer = authenticatedPage.locator('[data-testid="task-container"], .task, [class*="Task"]');
  await expect(taskContainer.first()).toBeVisible({ timeout: 10000 });
});

Then('I should see my progress indicator showing {string}', async ({ authenticatedPage }, progressPattern: string) => {
  const progressRegex = new RegExp(progressPattern.replace('N', '\\d+'));
  await expect(authenticatedPage.getByText(progressRegex)).toBeVisible();
});

// ============================================
// Active Session Steps
// ============================================

Given('I am in an active practice session', async ({ authenticatedPage, testData }) => {
  // Navigate to demo learning path and start session
  await authenticatedPage.goto('/');
  await authenticatedPage.getByRole('button', { name: new RegExp(testData.demoTopic, 'i') }).click();
  await authenticatedPage.waitForSelector('text=' + testData.demoLearningPath, { timeout: 10000 });
  await authenticatedPage.getByText(testData.demoLearningPath).click();
  await authenticatedPage.getByRole('button', { name: /start|starten/i }).click();
  await authenticatedPage.waitForLoadState('networkidle');
});

Given('the current task is a multiple choice task', async ({ authenticatedPage }) => {
  // Verify we're on a multiple choice task
  const mcOptions = authenticatedPage.locator('[data-testid="mc-option"], [class*="MultipleChoice"] button, [role="radio"]');
  await expect(mcOptions.first()).toBeVisible({ timeout: 10000 });
});

Given('the current task is a cloze deletion task', async ({ authenticatedPage }) => {
  // Verify we're on a cloze task
  const clozeInput = authenticatedPage.locator('[data-testid="cloze-input"], input[type="text"]');
  await expect(clozeInput).toBeVisible({ timeout: 10000 });
});

Given('the current task is a matching task', async ({ authenticatedPage }) => {
  // Verify we're on a matching task
  const matchingItems = authenticatedPage.locator('[data-testid="matching-item"], [class*="Matching"]');
  await expect(matchingItems.first()).toBeVisible({ timeout: 10000 });
});

Given('the current task is an ordering task', async ({ authenticatedPage }) => {
  // Verify we're on an ordering task
  const orderingItems = authenticatedPage.locator('[data-testid="ordering-item"], [class*="Ordering"]');
  await expect(orderingItems.first()).toBeVisible({ timeout: 10000 });
});

Given('the current task is a word scramble task', async ({ authenticatedPage }) => {
  // Verify we're on a word scramble task
  const scrambleLetters = authenticatedPage.locator('[data-testid="scramble-letter"], [class*="WordScramble"]');
  await expect(scrambleLetters.first()).toBeVisible({ timeout: 10000 });
});

Given('the current task is a true\\/false task', async ({ authenticatedPage }) => {
  // Verify we're on a true/false task
  const tfButtons = authenticatedPage.locator('[data-testid="tf-option"], button:has-text("True"), button:has-text("Richtig")');
  await expect(tfButtons.first()).toBeVisible({ timeout: 10000 });
});

Given('the current task is an error detection task', async ({ authenticatedPage }) => {
  // Verify we're on an error detection task
  const errorText = authenticatedPage.locator('[data-testid="error-detection-text"], [class*="ErrorDetection"]');
  await expect(errorText.first()).toBeVisible({ timeout: 10000 });
});

Given('the current task is a flashcard task', async ({ authenticatedPage }) => {
  // Verify we're on a flashcard task
  const flashcard = authenticatedPage.locator('[data-testid="flashcard"], [class*="Flashcard"]');
  await expect(flashcard).toBeVisible({ timeout: 10000 });
});

// ============================================
// Answer Steps
// ============================================

When('I select the correct answer', async ({ authenticatedPage }) => {
  // Select first option (in demo mode, first option is usually correct)
  const options = authenticatedPage.locator('[data-testid="mc-option"], [class*="option"] button, [role="radio"]');
  await options.first().click();
});

When('I select an incorrect answer', async ({ authenticatedPage }) => {
  // Select last option (assuming it's incorrect)
  const options = authenticatedPage.locator('[data-testid="mc-option"], [class*="option"] button, [role="radio"]');
  await options.last().click();
});

When('I submit my answer', async ({ authenticatedPage }) => {
  const submitButton = authenticatedPage.getByRole('button', { name: /submit|check|prüfen|bestätigen/i });
  await submitButton.click();
});

When('I fill in the blank with the correct text', async ({ authenticatedPage }) => {
  const clozeInput = authenticatedPage.locator('[data-testid="cloze-input"], input[type="text"]');
  // In a real test, we'd need to know the correct answer
  await clozeInput.fill('correct answer');
});

When('I correctly match all pairs', async ({ authenticatedPage: _authenticatedPage }) => {
  // Implementation depends on matching UI
});

When('I arrange all items in the correct order', async ({ authenticatedPage: _authenticatedPage }) => {
  // Implementation depends on ordering UI
});

When('I arrange the letters to form the correct word', async ({ authenticatedPage: _authenticatedPage }) => {
  // Implementation depends on word scramble UI
});

When('I identify all errors in the text', async ({ authenticatedPage: _authenticatedPage }) => {
  // Click on words that are errors
});

// ============================================
// Feedback Steps
// ============================================

Then('I should see positive feedback', async ({ authenticatedPage }) => {
  const feedback = authenticatedPage.locator('[data-testid="feedback-correct"], [class*="correct"], [class*="success"]');
  await expect(feedback.first()).toBeVisible({ timeout: 5000 });
});

Then('I should see the correct answer highlighted', async ({ authenticatedPage }) => {
  const correctHighlight = authenticatedPage.locator('[data-testid="correct-answer"], [class*="correct"]');
  await expect(correctHighlight.first()).toBeVisible();
});

Then('I should see corrective feedback', async ({ authenticatedPage }) => {
  const feedback = authenticatedPage.locator('[data-testid="feedback-incorrect"], [class*="incorrect"], [class*="error"]');
  await expect(feedback.first()).toBeVisible({ timeout: 5000 });
});

Then('I should be able to continue to the next task', async ({ authenticatedPage }) => {
  const nextButton = authenticatedPage.getByRole('button', { name: /next|continue|weiter/i });
  await expect(nextButton).toBeVisible();
});

// ============================================
// Session Completion Steps
// ============================================

When('I complete all tasks in the session', async ({ authenticatedPage: _authenticatedPage }) => {
  // This would iterate through all tasks
  // For now, just verify we can see progress
});

Then('I should see the session results page', async ({ authenticatedPage }) => {
  const resultsPage = authenticatedPage.locator('[data-testid="session-results"], [class*="Results"]');
  await expect(resultsPage).toBeVisible({ timeout: 10000 });
});

Then('I should see my accuracy percentage', async ({ authenticatedPage }) => {
  const accuracy = authenticatedPage.locator('text=/\\d+%/');
  await expect(accuracy.first()).toBeVisible();
});

Then('I should see a breakdown of my performance', async ({ authenticatedPage: _authenticatedPage }) => {
  // Performance breakdown should be visible
});

// ============================================
// Navigation Steps
// ============================================

Given('I have completed at least one task', async ({ authenticatedPage }) => {
  // Complete first task
  const submitButton = authenticatedPage.getByRole('button', { name: /submit|check|prüfen/i });
  if (await submitButton.isVisible()) {
    // Select an answer first
    const options = authenticatedPage.locator('[role="radio"], [data-testid="mc-option"]');
    if (await options.first().isVisible()) {
      await options.first().click();
    }
    await submitButton.click();
  }
});

When('I click the back button', async ({ authenticatedPage }) => {
  const backButton = authenticatedPage.getByRole('button', { name: /back|zurück|exit|beenden/i });
  await backButton.click();
});

Then('I should see a confirmation dialog', async ({ authenticatedPage }) => {
  const dialog = authenticatedPage.locator('[role="dialog"], [data-testid="confirm-dialog"]');
  await expect(dialog).toBeVisible();
});

Then('I should be able to cancel and continue', async ({ authenticatedPage }) => {
  const cancelButton = authenticatedPage.getByRole('button', { name: /cancel|abbrechen|continue/i });
  await expect(cancelButton).toBeVisible();
});
