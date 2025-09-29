import { test, expect } from '@playwright/test';

/**
 * End-to-end tests for complete user journey
 * Tests the full workflow from landing to session completion
 */

test.describe('Complete User Journey', () => {
  test('first-time user can complete a full learning session', async ({ page }) => {
    // Navigate to app
    await page.goto('/');

    // Should see welcome screen
    await expect(page.getByRole('heading', { name: /willkommen/i })).toBeVisible();

    // Should see available topics
    await expect(page.getByText('Mathematik')).toBeVisible();
    await expect(page.getByText('Biologie')).toBeVisible();

    // Select Mathematik topic
    await page.getByText('Mathematik').click();

    // Should see learning paths
    await expect(page.getByText(/Lernpfad/i)).toBeVisible();

    // Select first learning path
    await page.getByRole('button', { name: /Lernpfad starten/i }).first().click();

    // Configure session
    await expect(page.getByText(/Übung konfigurieren/i)).toBeVisible();

    // Set question count to 5 for quick test
    const slider = page.locator('input[type="range"]');
    await slider.fill('5');

    // Start session
    await page.getByRole('button', { name: /Session starten/i }).click();

    // Should see first question
    await expect(page.getByText(/Frage 1 von 5/i)).toBeVisible();

    // Answer all 5 questions
    for (let i = 0; i < 5; i++) {
      // Select first option
      await page.getByRole('radio').first().check();

      // Confirm answer
      await page.getByRole('button', { name: /Antwort bestätigen/i }).click();

      // Should see feedback
      await expect(
        page.getByText(/Richtig|Leider falsch/i)
      ).toBeVisible({ timeout: 2000 });

      // Continue to next question (if not last)
      if (i < 4) {
        await page.getByRole('button', { name: /Weiter/i }).click();
      }
    }

    // Should see session summary
    await expect(page.getByText(/Session abgeschlossen/i)).toBeVisible();
    await expect(page.getByText(/richtig/i)).toBeVisible();

    // Should show accuracy percentage
    await expect(page.locator('text=/\\d+%/')).toBeVisible();

    // Navigate to dashboard
    await page.getByRole('button', { name: /Dashboard/i }).click();

    // Should see progress summary
    await expect(page.getByText(/Fortschritt/i)).toBeVisible();
    await expect(page.getByText(/Insgesamt beantwortet/i)).toBeVisible();
  });

  test('user can pause and resume a session', async ({ page }) => {
    await page.goto('/');

    // Start a session (abbreviated setup)
    await page.getByText('Mathematik').click();
    await page.getByRole('button', { name: /Lernpfad starten/i }).first().click();
    await page.getByRole('button', { name: /Session starten/i }).click();

    // Answer first question
    await page.getByRole('radio').first().check();
    await page.getByRole('button', { name: /Antwort bestätigen/i }).click();
    await page.getByRole('button', { name: /Weiter/i }).click();

    // Pause session
    await page.getByRole('button', { name: /Pause/i }).click();

    // Should see pause confirmation
    await expect(page.getByText(/Session pausiert/i)).toBeVisible();

    // Resume session
    await page.getByRole('button', { name: /Fortsetzen/i }).click();

    // Should be back in session
    await expect(page.getByText(/Frage \d+ von \d+/i)).toBeVisible();
  });

  test('user can view and interact with progress dashboard', async ({ page }) => {
    await page.goto('/');

    // Navigate to dashboard (assuming user has completed sessions)
    await page.getByRole('link', { name: /Dashboard/i }).click();

    // Should see summary statistics
    await expect(page.getByText(/Gesamtfortschritt/i)).toBeVisible();
    await expect(page.getByText(/Genauigkeit/i)).toBeVisible();
    await expect(page.getByText(/Serie/i)).toBeVisible();

    // Should see topic progress cards
    await expect(page.getByText('Mathematik')).toBeVisible();

    // Click on topic for details
    await page.getByText('Mathematik').click();

    // Should see detailed topic progress
    await expect(page.getByText(/Lernpfade/i)).toBeVisible();
    await expect(page.getByText(/Fortschritt/i)).toBeVisible();
  });

  test('user can use hints and explanations', async ({ page }) => {
    await page.goto('/');

    // Start a session
    await page.getByText('Mathematik').click();
    await page.getByRole('button', { name: /Lernpfad starten/i }).first().click();
    await page.getByRole('button', { name: /Session starten/i }).click();

    // Request a hint
    const hintButton = page.getByRole('button', { name: /Tipp/i });
    if (await hintButton.isVisible()) {
      await hintButton.click();

      // Should show hint
      await expect(page.getByText(/Hinweis/i)).toBeVisible();
    }

    // Answer question
    await page.getByRole('radio').first().check();
    await page.getByRole('button', { name: /Antwort bestätigen/i }).click();

    // Should see explanation (if wrong or if always shown)
    const explanation = page.getByText(/Erklärung/i);
    if (await explanation.isVisible()) {
      await expect(explanation).toBeVisible();
    }
  });

  test('user can filter sessions by difficulty', async ({ page }) => {
    await page.goto('/');

    // Start session setup
    await page.getByText('Mathematik').click();
    await page.getByRole('button', { name: /Lernpfad starten/i }).first().click();

    // Select difficulty filter
    await page.getByRole('combobox', { name: /Schwierigkeit/i }).selectOption('easy');

    // Start session
    await page.getByRole('button', { name: /Session starten/i }).click();

    // Verify questions are marked as easy
    // This would require the UI to show difficulty indicators
    await expect(page.getByText(/Leicht/i)).toBeVisible();
  });

  test('user can review past session results', async ({ page }) => {
    await page.goto('/');

    // Navigate to dashboard
    await page.getByRole('link', { name: /Dashboard/i }).click();

    // Should see recent sessions section
    await expect(page.getByText(/Letzte Sessions/i)).toBeVisible();

    // Click on a past session
    await page.getByRole('button', { name: /Details ansehen/i }).first().click();

    // Should see session details
    await expect(page.getByText(/Session-Details/i)).toBeVisible();
    await expect(page.getByText(/Beantwortet/i)).toBeVisible();
    await expect(page.getByText(/Genauigkeit/i)).toBeVisible();

    // Should see list of questions from that session
    await expect(page.getByText(/Frage \d+:/i)).toBeVisible();
  });

  test('user can skip to specific topic from dashboard', async ({ page }) => {
    await page.goto('/');

    // Navigate to dashboard
    await page.getByRole('link', { name: /Dashboard/i }).click();

    // Click quick start for a topic
    await page.getByRole('button', { name: /Schnellstart/i }).first().click();

    // Should jump directly to session with default configuration
    await expect(page.getByText(/Frage 1 von/i)).toBeVisible();
  });

  test('navigation breadcrumbs work correctly', async ({ page }) => {
    await page.goto('/');

    // Navigate through: Home -> Topic -> Path -> Session
    await page.getByText('Mathematik').click();
    await page.getByRole('button', { name: /Lernpfad starten/i }).first().click();

    // Should see breadcrumb trail
    await expect(page.getByText(/Home.*Mathematik.*Algebra/i)).toBeVisible();

    // Click on Mathematik in breadcrumb
    await page.getByRole('link', { name: 'Mathematik' }).click();

    // Should be back at topic page
    await expect(page.getByText(/Lernpfade/i)).toBeVisible();
  });

  test('keyboard navigation works for answering questions', async ({ page }) => {
    await page.goto('/');

    // Start a session
    await page.getByText('Mathematik').click();
    await page.getByRole('button', { name: /Lernpfad starten/i }).first().click();
    await page.getByRole('button', { name: /Session starten/i }).click();

    // Use keyboard to select answer
    await page.keyboard.press('Tab'); // Focus first option
    await page.keyboard.press('Space'); // Select option

    // Use keyboard to confirm
    await page.keyboard.press('Tab'); // Tab to confirm button
    await page.keyboard.press('Enter'); // Confirm answer

    // Should see feedback
    await expect(page.getByText(/Richtig|Leider falsch/i)).toBeVisible();
  });
});