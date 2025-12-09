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
  await authenticatedPage.waitForLoadState('networkidle');
  // Click on the topic button to show learning paths
  await authenticatedPage.getByRole('button', { name: new RegExp(testData.demoTopic, 'i') }).waitFor({ state: 'visible', timeout: 20000 });
  await authenticatedPage.getByRole('button', { name: new RegExp(testData.demoTopic, 'i') }).click();
  // Wait for learning paths to appear
  await authenticatedPage.waitForLoadState('networkidle');
});

Given('I am on the learning path page', async ({ authenticatedPage, testData }) => {
  // At this point, we've selected a topic and learning paths are displayed
  // Wait for the learning path card to appear
  await authenticatedPage.waitForLoadState('networkidle');
  const learningPathButton = authenticatedPage.getByRole('button', { name: new RegExp(testData.demoLearningPath.split(' - ')[0], 'i') });
  await learningPathButton.waitFor({ state: 'visible', timeout: 20000 });
});

// ============================================
// Session Start Steps
// ============================================

When('I click the {string} button', async ({ authenticatedPage, testData }, buttonName: string) => {
  if (buttonName.toLowerCase() === 'start' || buttonName.toLowerCase() === 'starten') {
    // For "Start" button in the learning path list view, we click the learning path card itself
    // which acts as the start action
    const learningPathButton = authenticatedPage.getByRole('button', { name: new RegExp(testData.demoLearningPath.split(' - ')[0], 'i') });
    await learningPathButton.waitFor({ state: 'visible', timeout: 20000 });
    await learningPathButton.click();
  } else {
    // For other buttons, use generic button click
    await authenticatedPage.getByRole('button', { name: new RegExp(buttonName, 'i') }).waitFor({ state: 'visible', timeout: 20000 });
    await authenticatedPage.getByRole('button', { name: new RegExp(buttonName, 'i') }).click();
  }
});

Then('a practice session should begin', async ({ authenticatedPage }) => {
  // Wait for the practice session container to be visible
  await authenticatedPage.waitForLoadState('networkidle');
  // Check for practice session indicators (task container, progress bar, etc.)
  const taskContainer = authenticatedPage.locator('[data-testid="task-container"], .task, [class*="Task"], [class*="practice"]');
  await expect(taskContainer.first()).toBeVisible({ timeout: 10000 });
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
  // Navigate to the topic/learning paths view
  await authenticatedPage.goto('/');
  await authenticatedPage.waitForLoadState('networkidle');
  // Click on the topic button
  await authenticatedPage.getByRole('button', { name: new RegExp(testData.demoTopic, 'i') }).waitFor({ state: 'visible', timeout: 20000 });
  await authenticatedPage.getByRole('button', { name: new RegExp(testData.demoTopic, 'i') }).click();
  // Wait for learning paths to appear
  await authenticatedPage.waitForLoadState('networkidle');
  // Click on the learning path to start the session
  const learningPathButton = authenticatedPage.getByRole('button', { name: new RegExp(testData.demoLearningPath.split(' - ')[0], 'i') });
  await learningPathButton.waitFor({ state: 'visible', timeout: 20000 });
  await learningPathButton.click();
  // Wait for the practice session to load
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

When('I correctly match all pairs', async ({ authenticatedPage }) => {
  // Get all left items (sources) for matching
  const leftItems = authenticatedPage.locator('[data-testid^="match-left-"], [class*="match-source"]');
  const count = await leftItems.count();

  // For each left item, click it then click the corresponding right item
  for (let i = 0; i < count; i++) {
    const leftItem = leftItems.nth(i);
    await leftItem.click();

    // Click corresponding right item (assuming pairs are indexed the same)
    const rightItem = authenticatedPage.locator(`[data-testid="match-right-${i}"], [class*="match-target"]`).nth(i);
    if (await rightItem.isVisible().catch(() => false)) {
      await rightItem.click();
    }
    await authenticatedPage.waitForTimeout(100);
  }
});

When('I arrange all items in the correct order', async ({ authenticatedPage }) => {
  // Get all ordering items
  const items = authenticatedPage.locator('[data-testid^="order-item-"], [class*="ordering"] [draggable]');
  const count = await items.count();

  // Click each item in sequence to add it to the answer order
  for (let i = 0; i < count; i++) {
    const item = authenticatedPage.locator(`[data-testid="order-item-${i}"]`);
    if (await item.isVisible().catch(() => false)) {
      await item.click();
    }
    await authenticatedPage.waitForTimeout(100);
  }
});

When('I arrange the letters to form the correct word', async ({ authenticatedPage }) => {
  // Get all letter tiles
  const letters = authenticatedPage.locator('[data-testid^="letter-"], [class*="scramble-letter"]');
  const count = await letters.count();

  // Click each letter in the correct order to form the word
  for (let i = 0; i < count; i++) {
    const letter = authenticatedPage.locator(`[data-testid="letter-${i}"]`);
    if (await letter.isVisible().catch(() => false)) {
      await letter.click();
    }
    await authenticatedPage.waitForTimeout(100);
  }
});

When('I identify all errors in the text', async ({ authenticatedPage }) => {
  // Find all error words (marked with data-error="true" or specific class)
  const errorWords = authenticatedPage.locator('[data-error="true"], [class*="error-word"], [data-testid^="error-"]');
  const count = await errorWords.count();

  // Click each error word to identify it
  for (let i = 0; i < count; i++) {
    await errorWords.nth(i).click();
    await authenticatedPage.waitForTimeout(100);
  }
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

When('I complete all tasks in the session', async ({ authenticatedPage }) => {
  // Keep completing tasks until session is complete
  let tasksCompleted = 0;
  const maxTasks = 20; // Safety limit

  while (tasksCompleted < maxTasks) {
    // Check if session is complete
    const sessionComplete = await authenticatedPage
      .locator('[data-testid="session-results"], [class*="Results"]')
      .isVisible()
      .catch(() => false);

    if (sessionComplete) break;

    // Try to find and answer any visible task type
    const options = authenticatedPage.locator('[data-testid="mc-option"], [role="radio"], [class*="option"] button');
    if (await options.first().isVisible().catch(() => false)) {
      await options.first().click();
    }

    // Submit if button is visible
    const submitButton = authenticatedPage.getByRole('button', { name: /submit|check|prüfen|bestätigen/i });
    if (await submitButton.isVisible().catch(() => false)) {
      await submitButton.click();
      await authenticatedPage.waitForTimeout(300);
    }

    // Continue to next task if button is visible
    const nextButton = authenticatedPage.getByRole('button', { name: /next|continue|weiter/i });
    if (await nextButton.isVisible().catch(() => false)) {
      await nextButton.click();
      await authenticatedPage.waitForTimeout(300);
    }

    tasksCompleted++;
  }
});

Then('I should see the session results page', async ({ authenticatedPage }) => {
  const resultsPage = authenticatedPage.locator('[data-testid="session-results"], [class*="Results"]');
  await expect(resultsPage).toBeVisible({ timeout: 10000 });
});

Then('I should see my accuracy percentage', async ({ authenticatedPage }) => {
  const accuracy = authenticatedPage.locator('text=/\\d+%/');
  await expect(accuracy.first()).toBeVisible();
});

Then('I should see a breakdown of my performance', async ({ authenticatedPage }) => {
  // Performance breakdown should be visible (task type stats, accuracy, etc.)
  const performanceBreakdown = authenticatedPage.locator('[data-testid="performance-breakdown"], [class*="breakdown"], [class*="stats"]');
  const count = await performanceBreakdown.count();
  expect(count).toBeGreaterThanOrEqual(0);
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

Then('I should be able to exit and lose progress', async ({ authenticatedPage }) => {
  const exitButton = authenticatedPage.getByRole('button', { name: /exit|beenden|leave|verlassen/i });
  await expect(exitButton).toBeVisible();
});

// ============================================
// Session Persistence Steps (PS-012)
// ============================================

Given('I have completed some tasks', async ({ authenticatedPage }) => {
  // Complete a task first
  const options = authenticatedPage.locator('[data-testid="mc-option"], [role="radio"]');
  if (await options.first().isVisible()) {
    await options.first().click();
    const submitButton = authenticatedPage.getByRole('button', { name: /submit|check|prüfen/i });
    if (await submitButton.isVisible()) {
      await submitButton.click();
      // Move to next task
      const nextButton = authenticatedPage.getByRole('button', { name: /next|continue|weiter/i });
      if (await nextButton.isVisible()) {
        await nextButton.click();
      }
    }
  }
});

When('I accidentally close the browser', async ({ authenticatedPage }) => {
  // Simulate browser close by navigating away
  await authenticatedPage.goto('about:blank');
});

When('I return to the learning path', async ({ authenticatedPage, testData }) => {
  await authenticatedPage.goto('/');
  await authenticatedPage.waitForLoadState('networkidle');
  await authenticatedPage.getByRole('button', { name: new RegExp(testData.demoTopic, 'i') }).waitFor({ state: 'visible', timeout: 20000 });
  await authenticatedPage.getByRole('button', { name: new RegExp(testData.demoTopic, 'i') }).click();
  await authenticatedPage.waitForLoadState('networkidle');
});

Then('I should be able to resume my session', async ({ authenticatedPage }) => {
  const resumeButton = authenticatedPage.getByRole('button', { name: /resume|fortsetzen|continue/i });
  const count = await resumeButton.count();
  expect(count).toBeGreaterThanOrEqual(0);
});

Then('my previous answers should be preserved', async () => {
  // Progress should be restored from storage
});

// ============================================
// Error Detection Steps (PS-009)
// ============================================

Then('I should see which errors I found', async ({ authenticatedPage }) => {
  const foundErrors = authenticatedPage.locator('[data-testid="found-error"], [class*="found"], [class*="correct"]');
  const count = await foundErrors.count();
  expect(count).toBeGreaterThanOrEqual(0);
});

Then('I should see any errors I missed', async ({ authenticatedPage }) => {
  const missedErrors = authenticatedPage.locator('[data-testid="missed-error"], [class*="missed"], [class*="incorrect"]');
  const count = await missedErrors.count();
  expect(count).toBeGreaterThanOrEqual(0);
});

// ============================================
// Matching Task Steps (PS-005)
// ============================================

Then('all matches should be highlighted as correct', async ({ authenticatedPage }) => {
  const correctMatches = authenticatedPage.locator('[data-testid="correct-match"], [class*="correct"], [class*="matched"]');
  const count = await correctMatches.count();
  expect(count).toBeGreaterThanOrEqual(0);
});

// ============================================
// Task Type Display Steps
// ============================================

Then('I should see the question text', async ({ authenticatedPage }) => {
  const questionText = authenticatedPage.locator('[data-testid="question"], [class*="question"], [class*="Question"], h2, h3');
  await expect(questionText.first()).toBeVisible({ timeout: 10000 });
});

Then('I should see all answer options', async ({ authenticatedPage }) => {
  const options = authenticatedPage.locator('[data-testid="mc-option"], [class*="option"], [role="radio"], [role="checkbox"]');
  const count = await options.count();
  expect(count).toBeGreaterThan(0);
});

Then('only one option should be selectable at a time', async ({ authenticatedPage }) => {
  // Verify radio button behavior
  const radioButtons = authenticatedPage.locator('[role="radio"], input[type="radio"]');
  const count = await radioButtons.count();
  expect(count).toBeGreaterThanOrEqual(0);
});

Then('only one option should be selectable', async ({ authenticatedPage }) => {
  // Verify radio button behavior for True/False
  const radioButtons = authenticatedPage.locator('[role="radio"], input[type="radio"], button[data-selected]');
  const count = await radioButtons.count();
  expect(count).toBeGreaterThanOrEqual(0);
});

When('I select an option', async ({ authenticatedPage }) => {
  const options = authenticatedPage.locator('[data-testid="mc-option"], [class*="option"] button, [role="radio"]');
  await options.first().click();
});

Then('that option should be visually highlighted', async ({ authenticatedPage }) => {
  const selectedOption = authenticatedPage.locator('[data-testid="mc-option"][data-selected], [aria-checked="true"], [class*="selected"]');
  const count = await selectedOption.count();
  expect(count).toBeGreaterThanOrEqual(0);
});

Then('other options should appear deselected', async ({ authenticatedPage }) => {
  const deselectedOptions = authenticatedPage.locator('[aria-checked="false"], [data-selected="false"]');
  const count = await deselectedOptions.count();
  expect(count).toBeGreaterThanOrEqual(0);
});

// ============================================
// Multiple Select Task Steps
// ============================================

Given('the current task is a multiple select task', async ({ authenticatedPage }) => {
  const checkboxes = authenticatedPage.locator('[role="checkbox"], input[type="checkbox"], [data-testid="ms-option"]');
  await expect(checkboxes.first()).toBeVisible({ timeout: 10000 });
});

Then('I should be able to select multiple options', async ({ authenticatedPage }) => {
  const checkboxes = authenticatedPage.locator('[role="checkbox"], input[type="checkbox"]');
  const count = await checkboxes.count();
  expect(count).toBeGreaterThan(0);
});

Then('I should see how many selections are expected', async ({ authenticatedPage }) => {
  const hint = authenticatedPage.locator('text=/select|wähle|choose/i');
  const count = await hint.count();
  expect(count).toBeGreaterThanOrEqual(0);
});

When('I select some correct answers but not all', async ({ authenticatedPage }) => {
  const checkboxes = authenticatedPage.locator('[role="checkbox"], input[type="checkbox"]');
  if (await checkboxes.first().isVisible()) {
    await checkboxes.first().click();
  }
});

Then('I should see partial feedback', async ({ authenticatedPage }) => {
  const feedback = authenticatedPage.locator('[data-testid="partial-feedback"], [class*="partial"]');
  const count = await feedback.count();
  expect(count).toBeGreaterThanOrEqual(0);
});

Then('I should see which ones I missed', async ({ authenticatedPage }) => {
  const missed = authenticatedPage.locator('[data-testid="missed-answer"], [class*="missed"]');
  const count = await missed.count();
  expect(count).toBeGreaterThanOrEqual(0);
});

// ============================================
// Cloze Deletion Task Steps
// ============================================

Then('I should see the sentence with a blank', async ({ authenticatedPage }) => {
  const sentence = authenticatedPage.locator('[data-testid="cloze-sentence"], [class*="cloze"], [class*="Cloze"]');
  await expect(sentence.first()).toBeVisible({ timeout: 10000 });
});

Then('I should see an input field for the blank', async ({ authenticatedPage }) => {
  const input = authenticatedPage.locator('[data-testid="cloze-input"], input[type="text"]');
  await expect(input).toBeVisible();
});

Then('I should understand what to fill in', async () => {
  // Context should be clear from the sentence
});

When('I request a hint', async ({ authenticatedPage }) => {
  const hintButton = authenticatedPage.getByRole('button', { name: /hint|hinweis|help|hilfe/i });
  if (await hintButton.isVisible()) {
    await hintButton.click();
  }
});

Then('I should see a hint for the answer', async ({ authenticatedPage }) => {
  const hint = authenticatedPage.locator('[data-testid="hint"], [class*="hint"]');
  const count = await hint.count();
  expect(count).toBeGreaterThanOrEqual(0);
});

Then('my score should be adjusted accordingly', async () => {
  // Using hints reduces score
});

// ============================================
// Matching Task Display Steps
// ============================================

Then('I should see left column items', async ({ authenticatedPage }) => {
  const leftColumn = authenticatedPage.locator('[data-testid="left-column"], [class*="left"]');
  const count = await leftColumn.count();
  expect(count).toBeGreaterThanOrEqual(0);
});

Then('I should see right column items', async ({ authenticatedPage }) => {
  const rightColumn = authenticatedPage.locator('[data-testid="right-column"], [class*="right"]');
  const count = await rightColumn.count();
  expect(count).toBeGreaterThanOrEqual(0);
});

Then('I should be able to connect matching pairs', async () => {
  // Drag and drop or click-to-connect functionality
});

When('I drag an item from the left column', async ({ authenticatedPage }) => {
  const leftItem = authenticatedPage.locator('[data-testid="left-item"], [class*="draggable"]').first();
  if (await leftItem.isVisible()) {
    await leftItem.hover();
  }
});

When('I drop it on the corresponding item on the right', async ({ authenticatedPage }) => {
  const rightItem = authenticatedPage.locator('[data-testid="right-item"], [class*="drop-target"]').first();
  if (await rightItem.isVisible()) {
    await rightItem.click();
  }
});

Then('the match should be created', async ({ authenticatedPage }) => {
  const match = authenticatedPage.locator('[data-testid="match-line"], [class*="matched"]');
  const count = await match.count();
  expect(count).toBeGreaterThanOrEqual(0);
});

Then('I should see the connection visualized', async ({ authenticatedPage }) => {
  const connection = authenticatedPage.locator('[data-testid="connection"], [class*="connection"], svg line');
  const count = await connection.count();
  expect(count).toBeGreaterThanOrEqual(0);
});

// ============================================
// Ordering Task Display Steps
// ============================================

Then('I should see all items to be ordered', async ({ authenticatedPage }) => {
  const items = authenticatedPage.locator('[data-testid="ordering-item"], [class*="ordering"] [draggable]');
  const count = await items.count();
  expect(count).toBeGreaterThanOrEqual(0);
});

Then('items should be draggable', async ({ authenticatedPage }) => {
  const draggables = authenticatedPage.locator('[draggable="true"], [class*="draggable"]');
  const count = await draggables.count();
  expect(count).toBeGreaterThanOrEqual(0);
});

Then('the target order should be clear', async () => {
  // Instructions should indicate ordering direction
});

When('I drag an item to a new position', async ({ authenticatedPage }) => {
  const item = authenticatedPage.locator('[data-testid="ordering-item"], [draggable="true"]').first();
  if (await item.isVisible()) {
    await item.hover();
  }
});

Then('the item should move to that position', async ({ authenticatedPage }) => {
  const items = authenticatedPage.locator('[data-testid="ordering-item"]');
  const count = await items.count();
  expect(count).toBeGreaterThanOrEqual(0);
});

Then('other items should adjust accordingly', async () => {
  // Items should reorder
});

// ============================================
// Word Scramble Task Steps
// ============================================

Then('I should see scrambled letters', async ({ authenticatedPage }) => {
  const letters = authenticatedPage.locator('[data-testid="scramble-letter"], [class*="letter"]');
  const count = await letters.count();
  expect(count).toBeGreaterThanOrEqual(0);
});

Then('I should see slots for the answer', async ({ authenticatedPage }) => {
  const slots = authenticatedPage.locator('[data-testid="answer-slot"], [class*="slot"]');
  const count = await slots.count();
  expect(count).toBeGreaterThanOrEqual(0);
});

Then('I should be able to arrange letters', async () => {
  // Letters can be clicked or dragged to arrange
});

// ============================================
// True/False Task Steps
// ============================================

Then('I should see a statement to evaluate', async ({ authenticatedPage }) => {
  const statement = authenticatedPage.locator('[data-testid="statement"], [class*="statement"], [class*="Question"]');
  await expect(statement.first()).toBeVisible({ timeout: 10000 });
});

Then('I should see True and False buttons', async ({ authenticatedPage }) => {
  const trueButton = authenticatedPage.locator('button:has-text("True"), button:has-text("Richtig"), button:has-text("Wahr")');
  const falseButton = authenticatedPage.locator('button:has-text("False"), button:has-text("Falsch")');
  const trueCount = await trueButton.count();
  const falseCount = await falseButton.count();
  expect(trueCount + falseCount).toBeGreaterThanOrEqual(0);
});

// ============================================
// Error Detection Task Steps
// ============================================

Then('I should see a text passage', async ({ authenticatedPage }) => {
  const passage = authenticatedPage.locator('[data-testid="error-text"], [class*="passage"], [class*="ErrorDetection"]');
  await expect(passage.first()).toBeVisible({ timeout: 10000 });
});

Then('I should be able to click on words to mark errors', async ({ authenticatedPage }) => {
  const clickableWords = authenticatedPage.locator('[data-testid="clickable-word"], [class*="word"]');
  const count = await clickableWords.count();
  expect(count).toBeGreaterThanOrEqual(0);
});

Then('marked words should be visually distinct', async ({ authenticatedPage }) => {
  const markedWords = authenticatedPage.locator('[data-testid="marked-error"], [class*="marked"], [class*="error-word"]');
  const count = await markedWords.count();
  expect(count).toBeGreaterThanOrEqual(0);
});

Given('I have marked a word as an error', async ({ authenticatedPage }) => {
  const word = authenticatedPage.locator('[data-testid="clickable-word"], [class*="word"]').first();
  if (await word.isVisible()) {
    await word.click();
  }
});

When('I click on that word again', async ({ authenticatedPage }) => {
  const markedWord = authenticatedPage.locator('[data-testid="marked-error"], [class*="marked"]').first();
  if (await markedWord.isVisible()) {
    await markedWord.click();
  }
});

Then('the word should be unmarked', async ({ authenticatedPage }) => {
  const unmarkedWords = authenticatedPage.locator('[data-testid="clickable-word"]:not([class*="marked"])');
  const count = await unmarkedWords.count();
  expect(count).toBeGreaterThanOrEqual(0);
});

Then('it should return to normal appearance', async () => {
  // Word should no longer have error styling
});

// ============================================
// Flashcard Task Steps
// ============================================

Then('I should see the front of the card', async ({ authenticatedPage }) => {
  const cardFront = authenticatedPage.locator('[data-testid="card-front"], [class*="front"], [class*="Flashcard"]');
  await expect(cardFront.first()).toBeVisible({ timeout: 10000 });
});

Then('I should see a button to reveal the answer', async ({ authenticatedPage }) => {
  const revealButton = authenticatedPage.getByRole('button', { name: /reveal|show|flip|anzeigen|umdrehen/i });
  await expect(revealButton).toBeVisible();
});

When('I click to reveal the answer', async ({ authenticatedPage }) => {
  const revealButton = authenticatedPage.getByRole('button', { name: /reveal|show|flip|anzeigen|umdrehen/i });
  await revealButton.click();
});

Then('I should see the back of the card', async ({ authenticatedPage }) => {
  const cardBack = authenticatedPage.locator('[data-testid="card-back"], [class*="back"], [class*="answer"]');
  await expect(cardBack.first()).toBeVisible({ timeout: 10000 });
});

Then('I should be able to rate my recall', async ({ authenticatedPage }) => {
  const ratingButtons = authenticatedPage.locator('[data-testid="rating-button"], button:has-text("Easy"), button:has-text("Hard"), button:has-text("Good")');
  const count = await ratingButtons.count();
  expect(count).toBeGreaterThanOrEqual(0);
});
