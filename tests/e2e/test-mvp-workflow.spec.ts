import { test, expect } from '@playwright/test';

test.describe('MVP Core Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear IndexedDB before each test
    await page.goto('http://localhost:5173/');
    await page.evaluate(() => {
      return indexedDB.databases().then((dbs: any[]) => {
        return Promise.all(
          dbs.map((db: any) => {
            return new Promise<void>((resolve) => {
              const req = indexedDB.deleteDatabase(db.name);
              req.onsuccess = () => resolve();
              req.onerror = () => resolve();
            });
          })
        );
      });
    });
    await page.reload();
    await page.waitForLoadState('networkidle');
  });

  test('complete learning workflow: select topic → select path → complete session → view results', async ({
    page,
  }) => {
    // Step 1: Verify landing page loads
    await expect(page.locator('h1')).toContainText('Deutsche Lernplattform');
    await expect(page.locator('p')).toContainText('Lernen mit Spaced Repetition Algorithmus');

    // Step 2: Verify topics are displayed
    const topics = page.locator('button:has-text("Thema erkunden")');
    await expect(topics).toHaveCount(2); // Mathematik and Biologie

    // Step 3: Click on Mathematik topic
    const mathButton = topics.first();
    await mathButton.click();

    // Step 4: Verify learning paths are displayed
    await expect(page.locator('h1')).toContainText('Mathematik');
    const learningPaths = page.locator('button:has-text("Lernpfad starten")');
    await expect(learningPaths).toHaveCount(2); // Algebra and Geometrie

    // Step 5: Start first learning path (Algebra)
    await learningPaths.first().click();

    // Step 6: Verify practice session started
    await page.waitForTimeout(1000); // Wait for session to initialize
    await expect(page.locator('h2')).toContainText('Aufgabe');

    // Step 7: Answer all 5 questions in the session
    for (let i = 0; i < 5; i++) {
      // Wait for question to load
      await page.waitForSelector('h3', { timeout: 5000 });

      // Select first answer option
      const answerOptions = page.locator('button:has-text("x ="), button:has-text("°")');
      await answerOptions.first().click();

      // Submit answer
      const submitButton = page.locator('button:has-text("Antwort einreichen")');
      await submitButton.click();

      // Wait for feedback
      await page.waitForTimeout(500);

      // Click "Weiter" to go to next question (or finish)
      const nextButton = page.locator('button:has-text("Weiter")');
      if (i < 4) {
        await expect(nextButton).toBeVisible();
        await nextButton.click();
      }
    }

    // Step 8: Verify session completed and results shown
    await page.waitForTimeout(1000);
    await expect(page.locator('h1')).toContainText('Sitzung abgeschlossen');

    // Step 9: Verify results statistics are displayed
    await expect(page.locator('text=Abgeschlossen')).toBeVisible();
    await expect(page.locator('text=Richtig')).toBeVisible();
    await expect(page.locator('text=Genauigkeit')).toBeVisible();
    await expect(page.locator('text=Zeit')).toBeVisible();

    // Step 10: Close results
    const closeButton = page.locator('button:has-text("Schließen")');
    await closeButton.click();

    // Step 11: Verify back on topic selection page
    await expect(page.locator('h1')).toContainText('Mathematik');
  });

  test('can navigate back from topic to home', async ({ page }) => {
    // Select a topic
    const topics = page.locator('button:has-text("Thema erkunden")');
    await topics.first().click();

    // Verify on topic page
    await expect(page.locator('h1')).toContainText('Mathematik');

    // Click back button
    const backButton = page.locator('button:has-text("← Zurück zu Themen")');
    await backButton.click();

    // Verify back on home page
    await expect(page.locator('h1')).toContainText('Deutsche Lernplattform');
  });

  test('database seeding works correctly', async ({ page }) => {
    // Wait for app to load
    await page.waitForLoadState('networkidle');

    // Check console for successful seeding
    const logs: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'log') {
        logs.push(msg.text());
      }
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    // Verify seeding message appeared
    expect(logs.some((log) => log.includes('Seeding database'))).toBe(true);

    // Verify topics are displayed
    const topics = page.locator('button:has-text("Thema erkunden")');
    await expect(topics).toHaveCount(2);
  });

  test('app loads without console errors', async ({ page }) => {
    const errors: string[] = [];

    page.on('pageerror', (error) => {
      errors.push(error.message);
    });

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('http://localhost:5173/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Verify no errors occurred
    expect(errors).toHaveLength(0);
  });
});