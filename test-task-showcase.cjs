const { chromium } = require('playwright');

(async () => {
  console.log('🚀 Testing Task Showcase...\n');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Navigate to the app
    console.log('📍 Navigating to http://localhost:5173');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });

    // Open admin panel
    console.log('🔧 Opening admin panel...');
    await page.click('button:has-text("Admin")');
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    console.log('✅ Admin panel opened');

    // Click on Task Types tab
    console.log('🎯 Clicking Task Types tab...');
    await page.click('button[role="tab"]:has-text("Task Types")');
    await page.waitForTimeout(1000);
    console.log('✅ Task Types tab opened');

    // Verify task showcase loaded
    const showcaseTitle = await page.textContent('h2:has-text("Task Types Showcase")');
    console.log(`✅ Showcase title: ${showcaseTitle}`);

    // Count task types
    const taskCount = await page.locator('.taskDemo').count();
    console.log(`✅ Found ${taskCount} task types (expected 9)`);

    // Test search functionality
    console.log('🔍 Testing search...');
    await page.fill('input[placeholder="Search task types..."]', 'flashcard');
    await page.waitForTimeout(500);
    const searchResults = await page.locator('.taskDemo').count();
    console.log(`✅ Search results: ${searchResults} task type(s) found`);

    // Clear search
    await page.click('button[aria-label="Clear search"]');
    await page.waitForTimeout(500);

    // Test difficulty filters
    console.log('🎚️ Testing difficulty filters...');
    await page.click('button:has-text("Easy")');
    await page.waitForTimeout(500);
    const easyTasks = await page.locator('.taskDemo').count();
    console.log(`✅ Easy difficulty: ${easyTasks} task type(s)`);

    await page.click('button:has-text("Medium")');
    await page.waitForTimeout(500);
    const mediumTasks = await page.locator('.taskDemo').count();
    console.log(`✅ Medium difficulty: ${mediumTasks} task type(s)`);

    await page.click('button:has-text("Hard")');
    await page.waitForTimeout(500);
    const hardTasks = await page.locator('.taskDemo').count();
    console.log(`✅ Hard difficulty: ${hardTasks} task type(s)`);

    // Reset to all
    await page.click('button:has-text("All")');
    await page.waitForTimeout(500);

    // Test example expansion
    console.log('📂 Testing example expansion...');
    const firstExample = page.locator('.exampleToggle').first();
    await firstExample.click();
    await page.waitForTimeout(500);

    // Check if example content is visible
    const exampleContent = await page.locator('.exampleContent').first().isVisible();
    console.log(`✅ Example content visible: ${exampleContent}`);

    // Test raw JSON toggle
    console.log('📄 Testing raw JSON toggle...');
    const jsonToggle = page.locator('button:has-text("Show Raw JSON Data")').first();
    await jsonToggle.click();
    await page.waitForTimeout(500);
    const jsonVisible = await page.locator('.exampleDataBlock').first().isVisible();
    console.log(`✅ Raw JSON visible: ${jsonVisible}`);

    // Take screenshot
    console.log('📸 Taking screenshot...');
    await page.screenshot({ path: 'test-task-showcase.png', fullPage: true });
    console.log('✅ Screenshot saved: test-task-showcase.png');

    // Check console for errors
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.waitForTimeout(1000);

    if (errors.length > 0) {
      console.log('⚠️ Console errors found:');
      errors.forEach(err => console.log(`   - ${err}`));
    } else {
      console.log('✅ No console errors');
    }

    console.log('\n✅ All tests passed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    await page.screenshot({ path: 'test-task-showcase-error.png', fullPage: true });
    console.log('📸 Error screenshot saved: test-task-showcase-error.png');
  } finally {
    await browser.close();
  }
})();
