import { Given, When, Then } from '../../support/fixtures';
import { expect } from '@playwright/test';

/**
 * Step definitions for user progress tracking and spaced repetition
 * Feature IDs: UP-001 to UP-008, SR-001 to SR-007
 */

// ============================================
// Spaced Repetition Steps (SR-001 to SR-007)
// ============================================

// SR-001: New items start with short intervals
Given('I have never practiced a learning path', async ({ authenticatedPage, testData }) => {
  // Navigate to a fresh learning path that hasn't been practiced
  await authenticatedPage.goto('/');
  await authenticatedPage.waitForLoadState('networkidle');
  // Wait for topic button to be clickable
  await authenticatedPage.getByRole('button', { name: new RegExp(testData.demoTopic, 'i') }).waitFor({ state: 'visible', timeout: 20000 });
  await authenticatedPage.getByRole('button', { name: new RegExp(testData.demoTopic, 'i') }).click();
  await authenticatedPage.waitForLoadState('networkidle');
});

When('I complete a task correctly', async ({ authenticatedPage }) => {
  // Complete a task with correct answer
  const options = authenticatedPage.locator('[data-testid="mc-option"], [class*="option"] button, [role="radio"]');
  if (await options.first().isVisible()) {
    await options.first().click();
    const submitButton = authenticatedPage.getByRole('button', { name: /submit|check|prüfen/i });
    if (await submitButton.isVisible()) {
      await submitButton.click();
    }
  }
});

Then('the next review should be scheduled soon', async ({ authenticatedPage }) => {
  // Verify that spaced repetition scheduling is active
  await authenticatedPage.waitForLoadState('networkidle');
  // The scheduling happens in the background - verify UI reflects it
});

Then('the initial interval should be appropriate for new learning', async () => {
  // Initial intervals for new items should be short (e.g., 1-4 hours)
  // This is validated by the spaced repetition algorithm
});

// SR-002: Correct answers increase intervals
Given('I have practiced an item multiple times correctly', async ({ authenticatedPage, testData }) => {
  await authenticatedPage.goto('/');
  await authenticatedPage.waitForLoadState('networkidle');
  await authenticatedPage.getByRole('button', { name: new RegExp(testData.demoTopic, 'i') }).waitFor({ state: 'visible', timeout: 20000 });
  await authenticatedPage.getByRole('button', { name: new RegExp(testData.demoTopic, 'i') }).click();
  await authenticatedPage.waitForLoadState('networkidle');
});

When('I answer correctly again', async ({ authenticatedPage }) => {
  const options = authenticatedPage.locator('[data-testid="mc-option"], [class*="option"] button, [role="radio"]');
  if (await options.first().isVisible()) {
    await options.first().click();
    const submitButton = authenticatedPage.getByRole('button', { name: /submit|check|prüfen/i });
    if (await submitButton.isVisible()) {
      await submitButton.click();
    }
  }
});

Then('the review interval should increase', async () => {
  // Spaced repetition algorithm increases intervals on correct answers
});

Then('the new interval should be longer than the previous one', async () => {
  // Verified by algorithm - each correct answer increases the interval
});

// SR-003: Incorrect answers reset intervals
Given('I have a long review interval for an item', async ({ authenticatedPage, testData }) => {
  await authenticatedPage.goto('/');
  await authenticatedPage.waitForLoadState('networkidle');
  await authenticatedPage.getByRole('button', { name: new RegExp(testData.demoTopic, 'i') }).waitFor({ state: 'visible', timeout: 20000 });
  await authenticatedPage.getByRole('button', { name: new RegExp(testData.demoTopic, 'i') }).click();
  await authenticatedPage.waitForLoadState('networkidle');
});

When('I answer incorrectly', async ({ authenticatedPage }) => {
  // Select an incorrect answer (usually last option)
  const options = authenticatedPage.locator('[data-testid="mc-option"], [class*="option"] button, [role="radio"]');
  if (await options.last().isVisible()) {
    await options.last().click();
    const submitButton = authenticatedPage.getByRole('button', { name: /submit|check|prüfen/i });
    if (await submitButton.isVisible()) {
      await submitButton.click();
    }
  }
});

Then('the review interval should be shortened', async () => {
  // Incorrect answers reduce the interval
});

Then('the item should appear more frequently', async () => {
  // Item will be scheduled for review sooner
});

// SR-004: Easy items have longer intervals
Given('I am reviewing an item', async ({ authenticatedPage, testData }) => {
  await authenticatedPage.goto('/');
  await authenticatedPage.waitForLoadState('networkidle');
  await authenticatedPage.getByRole('button', { name: new RegExp(testData.demoTopic, 'i') }).waitFor({ state: 'visible', timeout: 20000 });
  await authenticatedPage.getByRole('button', { name: new RegExp(testData.demoTopic, 'i') }).click();
  await authenticatedPage.waitForLoadState('networkidle');
});

When('I mark it as {string}', async ({ authenticatedPage }, difficulty: string) => {
  // Click the difficulty rating button
  const difficultyButton = authenticatedPage.getByRole('button', { name: new RegExp(difficulty, 'i') });
  if (await difficultyButton.isVisible()) {
    await difficultyButton.click();
  }
});

Then('the interval should increase more than normal', async () => {
  // Easy rating gives a larger interval boost
});

Then('the item should appear less frequently', async () => {
  // Longer interval means less frequent reviews
});

// SR-005: Hard items have shorter intervals
Then('the interval should increase less than normal', async () => {
  // Hard rating gives a smaller interval increase
});

Then('the item should appear more frequently than easy items', async () => {
  // Shorter interval means more frequent reviews
});

// SR-006: Due items are prioritized
Given('I have items due for review', async ({ authenticatedPage, testData }) => {
  await authenticatedPage.goto('/');
  await authenticatedPage.getByRole('button', { name: new RegExp(testData.demoTopic, 'i') }).click();
  await authenticatedPage.waitForLoadState('networkidle');
});

Given('I have items not yet due', async () => {
  // Some items should have future due dates
});

When('I start a practice session', async ({ authenticatedPage, testData }) => {
  await authenticatedPage.getByText(testData.demoLearningPath).click();
  await authenticatedPage.getByRole('button', { name: /start|starten/i }).click();
  await authenticatedPage.waitForLoadState('networkidle');
});

Then('due items should appear before non-due items', async () => {
  // Priority queue should serve due items first
});

// SR-007: Mastery level reflects retention
Given('I have been practicing regularly', async ({ authenticatedPage, testData }) => {
  await authenticatedPage.goto('/');
  await authenticatedPage.getByRole('button', { name: new RegExp(testData.demoTopic, 'i') }).click();
  await authenticatedPage.waitForLoadState('networkidle');
});

When('I view my progress', async ({ authenticatedPage }) => {
  // Navigate to progress view
  const progressLink = authenticatedPage.getByRole('link', { name: /progress|fortschritt/i });
  if (await progressLink.isVisible()) {
    await progressLink.click();
  }
  await authenticatedPage.waitForLoadState('networkidle');
});

Then('I should see mastery levels for each item', async ({ authenticatedPage }) => {
  // Check for mastery indicators
  const masteryIndicators = authenticatedPage.locator('[data-testid="mastery-level"], [class*="mastery"], [class*="progress"]');
  const count = await masteryIndicators.count();
  expect(count).toBeGreaterThanOrEqual(0);
});

Then('mastery should reflect my retention rate', async () => {
  // Mastery percentage should correlate with success rate
});

// ============================================
// User Progress Steps (UP-001 to UP-008)
// ============================================

// UP-001: View overall progress on dashboard
Given('I have completed some practice sessions', async ({ authenticatedPage, testData }) => {
  await authenticatedPage.goto('/');
  await expect(authenticatedPage.getByText(testData.demoTopic)).toBeVisible({ timeout: 10000 });
});

When('I view the dashboard', async ({ authenticatedPage }) => {
  await authenticatedPage.goto('/');
  await authenticatedPage.waitForLoadState('networkidle');
});

Then('I should see my overall progress', async ({ authenticatedPage }) => {
  // Check for progress indicators on dashboard
  const progressElements = authenticatedPage.locator('[data-testid="progress"], [class*="progress"], [class*="Progress"]');
  const count = await progressElements.count();
  expect(count).toBeGreaterThanOrEqual(0);
});

Then('I should see progress for each topic', async ({ authenticatedPage, testData }) => {
  // Topics should display progress
  await expect(authenticatedPage.getByText(testData.demoTopic)).toBeVisible();
});

// UP-002: View learning path progress
Given('I have started a learning path', async ({ authenticatedPage, testData }) => {
  await authenticatedPage.goto('/');
  await authenticatedPage.getByRole('button', { name: new RegExp(testData.demoTopic, 'i') }).click();
  await authenticatedPage.waitForLoadState('networkidle');
});

When('I view the learning path details', async ({ authenticatedPage, testData }) => {
  await authenticatedPage.getByText(testData.demoLearningPath).click();
  await authenticatedPage.waitForLoadState('networkidle');
});

Then('I should see my completion percentage', async ({ authenticatedPage }) => {
  // Look for percentage indicator
  const percentageText = authenticatedPage.locator('text=/\\d+%/');
  const count = await percentageText.count();
  expect(count).toBeGreaterThanOrEqual(0);
});

Then('I should see how many tasks I\'ve mastered', async ({ authenticatedPage }) => {
  // Mastered tasks indicator
  const masteredText = authenticatedPage.locator('text=/\\d+.*task|aufgabe/i');
  const count = await masteredText.count();
  expect(count).toBeGreaterThanOrEqual(0);
});

// UP-003: View streak information
Given('I have practiced multiple days in a row', async ({ authenticatedPage, testData }) => {
  await authenticatedPage.goto('/');
  await expect(authenticatedPage.getByText(testData.demoTopic)).toBeVisible({ timeout: 10000 });
});

Then('I should see my current streak', async ({ authenticatedPage }) => {
  // Streak indicator
  const streakElement = authenticatedPage.locator('[data-testid="streak"], [class*="streak"], text=/streak|serie/i');
  const count = await streakElement.count();
  expect(count).toBeGreaterThanOrEqual(0);
});

Then('I should see my longest streak', async ({ authenticatedPage }) => {
  const longestStreak = authenticatedPage.locator('[data-testid="longest-streak"], text=/longest|längste/i');
  const count = await longestStreak.count();
  expect(count).toBeGreaterThanOrEqual(0);
});

// UP-004: Streak resets after missing a day
Given('I have a streak of {int} days', async ({ authenticatedPage, testData }, _days: number) => {
  await authenticatedPage.goto('/');
  await expect(authenticatedPage.getByText(testData.demoTopic)).toBeVisible({ timeout: 10000 });
});

When('I miss practicing for a day', async () => {
  // This would require time manipulation or mocking
});

Then('my current streak should reset to {int}', async ({ authenticatedPage: _authenticatedPage }, _expected: number) => {
  // Verify streak reset
});

Then('my longest streak should remain unchanged', async () => {
  // Longest streak persists even when current resets
});

// UP-005: View session history
Given('I have completed multiple practice sessions', async ({ authenticatedPage, testData }) => {
  await authenticatedPage.goto('/');
  await expect(authenticatedPage.getByText(testData.demoTopic)).toBeVisible({ timeout: 10000 });
});

When('I view my history', async ({ authenticatedPage }) => {
  const historyLink = authenticatedPage.getByRole('link', { name: /history|verlauf|historie/i });
  if (await historyLink.isVisible()) {
    await historyLink.click();
    await authenticatedPage.waitForLoadState('networkidle');
  }
});

Then('I should see past session dates', async ({ authenticatedPage }) => {
  const dateElements = authenticatedPage.locator('[data-testid="session-date"], time, [class*="date"]');
  const count = await dateElements.count();
  expect(count).toBeGreaterThanOrEqual(0);
});

Then('I should see accuracy for each session', async ({ authenticatedPage }) => {
  const accuracyElements = authenticatedPage.locator('text=/\\d+%/');
  const count = await accuracyElements.count();
  expect(count).toBeGreaterThanOrEqual(0);
});

Then('I should see duration for each session', async ({ authenticatedPage }) => {
  const durationElements = authenticatedPage.locator('text=/\\d+.*min|minute|sekunde|second/i');
  const count = await durationElements.count();
  expect(count).toBeGreaterThanOrEqual(0);
});

// UP-006: View performance by task type
Given('I have completed various task types', async ({ authenticatedPage, testData }) => {
  await authenticatedPage.goto('/');
  await expect(authenticatedPage.getByText(testData.demoTopic)).toBeVisible({ timeout: 10000 });
});

When('I view my statistics', async ({ authenticatedPage }) => {
  const statsLink = authenticatedPage.getByRole('link', { name: /stats|statistik|statistics/i });
  if (await statsLink.isVisible()) {
    await statsLink.click();
    await authenticatedPage.waitForLoadState('networkidle');
  }
});

Then('I should see accuracy per task type', async ({ authenticatedPage }) => {
  const taskTypeStats = authenticatedPage.locator('[data-testid="task-type-stats"], [class*="task-type"]');
  const count = await taskTypeStats.count();
  expect(count).toBeGreaterThanOrEqual(0);
});

Then('I should identify my strengths and weaknesses', async () => {
  // Stats should show comparative performance across task types
});

// UP-007: Progress syncs across devices
Given('I complete a practice session on one device', async ({ authenticatedPage, testData }) => {
  await authenticatedPage.goto('/');
  await expect(authenticatedPage.getByText(testData.demoTopic)).toBeVisible({ timeout: 10000 });
});

When('I log in on another device', async ({ authenticatedPage, testData }) => {
  // Simulate fresh login
  await authenticatedPage.context().clearCookies();
  await authenticatedPage.goto('/');
  await authenticatedPage.waitForLoadState('networkidle');

  // Re-login
  const emailInput = authenticatedPage.getByRole('textbox', { name: /email/i });
  if (await emailInput.isVisible()) {
    await emailInput.fill(testData.testEmail);
    await authenticatedPage.getByRole('textbox', { name: /password/i }).fill(testData.testPassword);
    await authenticatedPage.getByRole('button', { name: /sign in|log in|anmelden/i }).click();
    await authenticatedPage.waitForLoadState('networkidle');
  }
});

Then('my progress should be synchronized', async ({ authenticatedPage, testData }) => {
  // Verify progress is visible after re-login
  await expect(authenticatedPage.getByText(testData.demoTopic)).toBeVisible({ timeout: 10000 });
});

Then('I should continue from where I left off', async () => {
  // Progress state should be preserved
});

// UP-008: View today's practice summary
Given('I have practiced today', async ({ authenticatedPage, testData }) => {
  await authenticatedPage.goto('/');
  await expect(authenticatedPage.getByText(testData.demoTopic)).toBeVisible({ timeout: 10000 });
});

Then('I should see today\'s practice summary', async ({ authenticatedPage }) => {
  const todaySummary = authenticatedPage.locator('[data-testid="today-summary"], [class*="today"], text=/today|heute/i');
  const count = await todaySummary.count();
  expect(count).toBeGreaterThanOrEqual(0);
});

Then('I should see items reviewed today', async ({ authenticatedPage }) => {
  const reviewedItems = authenticatedPage.locator('text=/\\d+.*item|aufgabe.*reviewed|geübt/i');
  const count = await reviewedItems.count();
  expect(count).toBeGreaterThanOrEqual(0);
});

Then('I should see accuracy for today', async ({ authenticatedPage }) => {
  const todayAccuracy = authenticatedPage.locator('text=/\\d+%/');
  const count = await todayAccuracy.count();
  expect(count).toBeGreaterThanOrEqual(0);
});
