import { test, expect } from '@playwright/test';

test('capture runtime errors on app load', async ({ page }) => {
  const errors: string[] = [];
  const consoleMessages: any[] = [];

  // Capture console errors
  page.on('pageerror', (error) => {
    errors.push(`PAGE ERROR: ${error.message}\n${error.stack}`);
  });

  // Capture ALL console messages with args
  page.on('console', async (msg) => {
    const type = msg.type();
    const text = msg.text();
    const args = await Promise.all(msg.args().map(arg => arg.jsonValue().catch(() => arg.toString())));
    consoleMessages.push({ type, text, args });
  });

  try {
    // Clear IndexedDB before loading
    await page.goto('http://localhost:5173/');
    await page.evaluate(() => {
      return indexedDB.databases().then((dbs: any[]) => {
        return Promise.all(dbs.map((db: any) => {
          return new Promise<void>((resolve) => {
            const req = indexedDB.deleteDatabase(db.name);
            req.onsuccess = () => resolve();
            req.onerror = () => resolve();
          });
        }));
      });
    });

    // Reload page
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
  } catch (e) {
    errors.push(`NAVIGATION ERROR: ${e}`);
  }

  console.log('\n=== PAGE ERRORS ===');
  errors.forEach(err => console.log(err));

  console.log('\n=== ALL CONSOLE MESSAGES ===');
  consoleMessages.forEach(({ type, text, args }) => {
    console.log(`[${type.toUpperCase()}]`, text);
    if (args.length > 0 && type === 'error') {
      console.log('  Args:', JSON.stringify(args, null, 2));
    }
  });

  // Take screenshot for debugging
  await page.screenshot({ path: 'debug-screenshot.png', fullPage: true });

  console.log('\n=== Screenshot saved to debug-screenshot.png ===');
});