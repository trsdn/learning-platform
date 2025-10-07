import { test, expect } from '@playwright/test';

/**
 * E2E tests for Admin Test Pages functionality
 * Tests the admin panel, component library, and task types showcase
 */

test.describe('Admin Panel', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app and wait for it to load
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should open admin panel when Admin button is clicked', async ({ page }) => {
    // Find and click the Admin button
    await page.getByRole('button', { name: /admin/i }).click();

    // Verify admin panel dialog is visible
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    // Verify admin panel title
    await expect(page.getByText('🔧 Admin Test Pages')).toBeVisible();
    await expect(page.getByText(/Development tool for testing and documentation/)).toBeVisible();
  });

  test('should close admin panel with close button', async ({ page }) => {
    // Open admin panel
    await page.getByRole('button', { name: /admin/i }).click();

    // Wait for dialog to be visible
    await expect(page.getByRole('dialog')).toBeVisible();

    // Click close button
    await page.getByRole('button', { name: /close admin panel/i }).click();

    // Verify dialog is closed
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('should close admin panel with Escape key', async ({ page }) => {
    // Open admin panel
    await page.getByRole('button', { name: /admin/i }).click();

    // Wait for dialog to be visible
    await expect(page.getByRole('dialog')).toBeVisible();

    // Press Escape key
    await page.keyboard.press('Escape');

    // Verify dialog is closed
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('should display warning banner', async ({ page }) => {
    // Open admin panel
    await page.getByRole('button', { name: /admin/i }).click();

    // Verify warning banner is visible
    await expect(page.getByText(/⚠️/)).toBeVisible();
    await expect(page.getByText(/Development Tool - For testing and documentation purposes/)).toBeVisible();
  });

  test('should have two tabs: Components and Task Types', async ({ page }) => {
    // Open admin panel
    await page.getByRole('button', { name: /admin/i }).click();

    // Verify both tabs exist
    await expect(page.getByRole('tab', { name: /components/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /task types/i })).toBeVisible();
  });
});

test.describe('Component Library Tab', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Open admin panel
    await page.getByRole('button', { name: /admin/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    // Ensure Components tab is active (should be by default)
    const componentsTab = page.getByRole('tab', { name: /components/i });
    await componentsTab.click();
  });

  test('should display component library header', async ({ page }) => {
    await expect(page.getByText('Component Library')).toBeVisible();
    await expect(page.getByText(/Interactive showcase of all 12 UI components/)).toBeVisible();
  });

  test('should display search input', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search components/i);
    await expect(searchInput).toBeVisible();
  });

  test('should display category filter buttons', async ({ page }) => {
    await expect(page.getByRole('button', { name: /All \(12\)/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Cards/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Common/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Feedback/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Forms/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Interactive/ })).toBeVisible();
  });

  test('should display results count', async ({ page }) => {
    await expect(page.getByText(/Showing 12 of 12 components/)).toBeVisible();
  });

  test('should filter components using search', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search components/i);

    // Search for "button"
    await searchInput.fill('button');

    // Should show filtered results (Button, IconButton, AudioButton = 3 components)
    await expect(page.getByText(/Showing 3 of 12 components/)).toBeVisible();

    // Clear search
    await page.getByRole('button', { name: /clear search/i }).click();

    // Should show all components again
    await expect(page.getByText(/Showing 12 of 12 components/)).toBeVisible();
  });

  test('should show no results message when search has no matches', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search components/i);

    // Search for non-existent component
    await searchInput.fill('nonexistent-component-xyz');

    // Should show no results message
    await expect(page.getByText(/No components found matching/)).toBeVisible();
  });

  test('should filter components by category', async ({ page }) => {
    // Click Cards category
    await page.getByRole('button', { name: /Cards/ }).click();

    // Should show filtered results (TopicCard, StatCard, FeedbackCard = 3 components)
    await expect(page.getByText(/Showing 3 of 12 components/)).toBeVisible();

    // Click All to reset
    await page.getByRole('button', { name: /All \(12\)/ }).click();

    // Should show all components
    await expect(page.getByText(/Showing 12 of 12 components/)).toBeVisible();
  });

  test('should apply both search and category filters', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search components/i);

    // Search for "card"
    await searchInput.fill('card');

    // Click Cards category
    await page.getByRole('button', { name: /Cards/ }).click();

    // Should show components matching both filters
    await expect(page.getByText(/Showing 3 of 12 components/)).toBeVisible();
  });

  test('should display component demos with variants', async ({ page }) => {
    // Find a component demo (e.g., Button)
    const buttonDemo = page.locator('[data-testid*="component-demo"]').first();
    await expect(buttonDemo).toBeVisible();

    // Component should have a name/title
    await expect(buttonDemo.locator('h3')).toBeVisible();
  });
});

test.describe('Task Types Showcase Tab', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Open admin panel
    await page.getByRole('button', { name: /admin/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    // Click Task Types tab
    await page.getByRole('tab', { name: /task types/i }).click();
  });

  test('should display task types showcase header', async ({ page }) => {
    await expect(page.getByText('Task Types Showcase')).toBeVisible();
    await expect(page.getByText(/Interactive examples of all 9 task types with 19 sample tasks/)).toBeVisible();
  });

  test('should display search input', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search task types/i);
    await expect(searchInput).toBeVisible();
  });

  test('should display difficulty filter buttons', async ({ page }) => {
    await expect(page.getByRole('button', { name: /All \(9\)/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Easy/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Medium/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Hard/ })).toBeVisible();
  });

  test('should display results count', async ({ page }) => {
    await expect(page.getByText(/Showing 9 of 9 task types/)).toBeVisible();
  });

  test('should filter task types using search', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search task types/i);

    // Search for "flashcard"
    await searchInput.fill('flashcard');

    // Should show filtered result (1 task type)
    await expect(page.getByText(/Showing 1 of 9 task types/)).toBeVisible();

    // Clear search
    await page.getByRole('button', { name: /clear search/i }).click();

    // Should show all task types again
    await expect(page.getByText(/Showing 9 of 9 task types/)).toBeVisible();
  });

  test('should show no results message when search has no matches', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search task types/i);

    // Search for non-existent task type
    await searchInput.fill('nonexistent-task-xyz');

    // Should show no results message
    await expect(page.getByText(/No task types found matching/)).toBeVisible();
  });

  test('should filter task types by difficulty', async ({ page }) => {
    // Click Easy difficulty
    await page.getByRole('button', { name: /Easy/ }).click();

    // Should show filtered results (6 easy task types)
    await expect(page.getByText(/Showing 6 of 9 task types/)).toBeVisible();

    // Click All to reset
    await page.getByRole('button', { name: /All \(9\)/ }).click();

    // Should show all task types
    await expect(page.getByText(/Showing 9 of 9 task types/)).toBeVisible();
  });

  test('should apply both search and difficulty filters', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search task types/i);

    // Search for "multiple"
    await searchInput.fill('multiple');

    // Click Medium difficulty
    await page.getByRole('button', { name: /Medium/ }).click();

    // Should show task types matching both filters (multiple-choice and multiple-select)
    await expect(page.getByText(/Showing 2 of 9 task types/)).toBeVisible();
  });

  test('should display task demos with examples', async ({ page }) => {
    // Find a task demo (should have data-testid attribute)
    const taskDemo = page.locator('[data-testid*="task-demo"]').first();
    await expect(taskDemo).toBeVisible();

    // Task demo should have a name/title
    await expect(taskDemo.locator('h3')).toBeVisible();
  });

  test('should toggle JSON viewer', async ({ page }) => {
    // Find a task demo
    const taskDemo = page.locator('[data-testid*="task-demo"]').first();

    // Find and click JSON toggle button within this task demo
    const jsonToggleButton = taskDemo.getByRole('button', { name: /show raw json data/i });
    await jsonToggleButton.click();

    // JSON viewer should be visible
    await expect(taskDemo.getByText(/"type":/i)).toBeVisible();

    // Click again to hide
    await taskDemo.getByRole('button', { name: /hide raw json data/i }).click();

    // JSON should be hidden
    await expect(taskDemo.getByText(/"type":/i)).not.toBeVisible();
  });
});

test.describe('Tab Switching', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Open admin panel
    await page.getByRole('button', { name: /admin/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('should switch between Components and Task Types tabs', async ({ page }) => {
    // Components tab should be active by default
    await expect(page.getByText('Component Library')).toBeVisible();

    // Click Task Types tab
    await page.getByRole('tab', { name: /task types/i }).click();

    // Task Types content should be visible
    await expect(page.getByText('Task Types Showcase')).toBeVisible();

    // Components content should not be visible
    await expect(page.getByText('Component Library')).not.toBeVisible();

    // Click Components tab
    await page.getByRole('tab', { name: /components/i }).click();

    // Components content should be visible
    await expect(page.getByText('Component Library')).toBeVisible();

    // Task Types content should not be visible
    await expect(page.getByText('Task Types Showcase')).not.toBeVisible();
  });

  test('should maintain active tab styling', async ({ page }) => {
    // Components tab should have aria-selected="true"
    const componentsTab = page.getByRole('tab', { name: /components/i });
    await expect(componentsTab).toHaveAttribute('aria-selected', 'true');

    // Task Types tab should have aria-selected="false"
    const taskTypesTab = page.getByRole('tab', { name: /task types/i });
    await expect(taskTypesTab).toHaveAttribute('aria-selected', 'false');

    // Click Task Types tab
    await taskTypesTab.click();

    // Task Types tab should now be selected
    await expect(taskTypesTab).toHaveAttribute('aria-selected', 'true');

    // Components tab should no longer be selected
    await expect(componentsTab).toHaveAttribute('aria-selected', 'false');
  });
});

test.describe('Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Open admin panel
    await page.getByRole('button', { name: /admin/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('should have proper ARIA attributes on dialog', async ({ page }) => {
    const dialog = page.getByRole('dialog');

    // Dialog should have aria-modal="true"
    await expect(dialog).toHaveAttribute('aria-modal', 'true');

    // Dialog should have aria-labelledby
    await expect(dialog).toHaveAttribute('aria-labelledby', 'admin-title');
  });

  test('should have proper ARIA attributes on tabs', async ({ page }) => {
    // Tablist should exist
    const tablist = page.getByRole('tablist');
    await expect(tablist).toBeVisible();

    // Both tabs should be visible
    await expect(page.getByRole('tab', { name: /components/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /task types/i })).toBeVisible();

    // Tabpanel should exist
    const tabpanel = page.getByRole('tabpanel');
    await expect(tabpanel).toBeVisible();
  });

  test('should have accessible search inputs', async ({ page }) => {
    // Component search should have type="text"
    const componentSearch = page.getByPlaceholder(/search components/i);
    await expect(componentSearch).toHaveAttribute('type', 'text');

    // Switch to Task Types tab
    await page.getByRole('tab', { name: /task types/i }).click();

    // Task search should have type="text"
    const taskSearch = page.getByPlaceholder(/search task types/i);
    await expect(taskSearch).toHaveAttribute('type', 'text');
  });

  test('should have accessible clear buttons', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search components/i);

    // Type something to show clear button
    await searchInput.fill('test');

    // Clear button should have aria-label
    const clearButton = page.getByRole('button', { name: /clear search/i });
    await expect(clearButton).toHaveAttribute('aria-label');
  });
});
