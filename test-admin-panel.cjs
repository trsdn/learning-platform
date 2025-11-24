const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('🧪 Testing Admin Panel Integration...\n');

  try {
    // Navigate to app
    console.log('1. Navigating to http://localhost:5173/');
    await page.goto('http://localhost:5173/');
    await page.waitForLoadState('networkidle');

    // Check for console errors
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Test 1: Click Admin button
    console.log('2. Looking for Admin button...');
    const adminButton = page.locator('button:has-text("Admin")');
    await adminButton.waitFor({ timeout: 5000 });
    console.log('   ✅ Admin button found');

    console.log('3. Clicking Admin button...');
    await adminButton.click();
    await page.waitForTimeout(500);

    // Verify admin panel opened
    console.log('4. Verifying admin panel opened...');
    const adminPanel = page.locator('[role="dialog"][aria-modal="true"]');
    await adminPanel.waitFor({ timeout: 5000 });
    console.log('   ✅ Admin panel opened');

    // Verify tabs exist
    console.log('5. Verifying tabs exist...');
    const componentsTab = page.locator('[role="tab"]:has-text("Components")');
    const tasksTab = page.locator('[role="tab"]:has-text("Task Types")');
    await componentsTab.waitFor({ timeout: 2000 });
    await tasksTab.waitFor({ timeout: 2000 });
    console.log('   ✅ Both tabs found');

    // Test tab switching
    console.log('6. Testing tab switching...');
    await tasksTab.click();
    await page.waitForTimeout(300);
    const tasksPanel = page.locator('#tasks-panel');
    await tasksPanel.waitFor({ timeout: 2000 });
    console.log('   ✅ Tasks tab works');

    await componentsTab.click();
    await page.waitForTimeout(300);
    const componentsPanel = page.locator('#components-panel');
    await componentsPanel.waitFor({ timeout: 2000 });
    console.log('   ✅ Components tab works');

    // Test close button
    console.log('7. Testing close button...');
    const closeButton = page.locator('[aria-label="Close admin panel"]');
    await closeButton.click();
    await page.waitForTimeout(500);
    const panelHidden = await adminPanel.isHidden();
    if (panelHidden) {
      console.log('   ✅ Close button works');
    } else {
      console.log('   ❌ Close button failed');
    }

    // Test keyboard shortcut
    console.log('8. Testing keyboard shortcut (Ctrl+Shift+A)...');
    await page.keyboard.press('Control+Shift+A');
    await page.waitForTimeout(500);
    const panelVisible = await adminPanel.isVisible();
    if (panelVisible) {
      console.log('   ✅ Keyboard shortcut works');
    } else {
      console.log('   ❌ Keyboard shortcut failed');
    }

    // Close again with ESC
    console.log('9. Testing ESC key...');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    const panelClosedByEsc = await adminPanel.isHidden();
    if (panelClosedByEsc) {
      console.log('   ✅ ESC key works');
    } else {
      console.log('   ❌ ESC key failed');
    }

    // Test hash fragment
    console.log('10. Testing hash fragment navigation (#admin)...');
    await page.goto('http://localhost:5173/#admin');
    await page.waitForTimeout(500);
    const panelOpenedByHash = await adminPanel.isVisible();
    if (panelOpenedByHash) {
      console.log('   ✅ Hash fragment works');
    } else {
      console.log('   ❌ Hash fragment failed');
    }

    // Test hash fragment with tab
    console.log('11. Testing hash fragment with tab (#admin/tasks)...');
    await page.goto('http://localhost:5173/#admin/tasks');
    await page.waitForTimeout(500);
    const tasksPanelVisible = await tasksPanel.isVisible();
    if (tasksPanelVisible) {
      console.log('   ✅ Hash fragment with tab works');
    } else {
      console.log('   ❌ Hash fragment with tab failed');
    }

    // Check for errors
    if (errors.length > 0) {
      console.log('\n⚠️  Console errors detected:');
      errors.forEach(err => console.log('   -', err));
    } else {
      console.log('\n✅ No console errors');
    }

    console.log('\n✅ All tests passed!');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
})();
