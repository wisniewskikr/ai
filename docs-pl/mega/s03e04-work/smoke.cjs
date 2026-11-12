const { chromium } = require(process.cwd() + '/node_modules/playwright');
(async () => {
  const exe = require('path').join(process.env.LOCALAPPDATA, 'ms-playwright', 'chromium-1243', 'chrome-win64', 'chrome.exe');
  const browser = await chromium.launch({ executablePath: exe });
  const ctx = await browser.newContext({ locale: 'pl-PL', timezoneId: 'Europe/Berlin' });
  const page = await ctx.newPage();
  page.on('console', m => console.log('console:', m.text().slice(0, 80)));
  await page.goto('http://localhost:3000/');
  console.log('loader visible at start:', await page.locator('[data-testid=loader]').count());
  await page.waitForSelector('[data-testid=incident-row]');
  console.log('loader after load:', await page.locator('[data-testid=loader]').count());
  console.log('rows:', await page.locator('[data-testid=incident-row]').count());
  console.log('first times:', await page.locator('time').first().textContent(), '| attr', await page.locator('time').first().getAttribute('datetime'));
  console.log('meta:', await page.locator('meta[name=build]').getAttribute('content'), 'footer:', await page.locator('[data-testid=build-sha]').textContent());
  await page.close(); await ctx.close(); await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
