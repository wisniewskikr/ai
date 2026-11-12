const { chromium } = require(process.cwd() + '/node_modules/playwright');
(async () => {
  const exe = require('path').join(process.env.LOCALAPPDATA, 'ms-playwright', 'chromium-1243', 'chrome-win64', 'chrome.exe');
  const browser = await chromium.launch({ executablePath: exe });
  for (const [locale, tz] of [['de-DE','Europe/Berlin'],['en-NZ','Pacific/Auckland'],['en-GB','Europe/London'],['en-US','America/New_York']]) {
    const ctx = await browser.newContext({ locale, timezoneId: tz });
    const page = await ctx.newPage();
    await page.goto('http://localhost:3000/');
    await page.waitForSelector('[data-testid=incident-row]');
    const t = page.locator('[data-id=INC-9805] time');
    console.log(locale, tz, '->', await t.textContent(), '| datetime', await t.getAttribute('datetime'));
    await ctx.close();
  }
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
