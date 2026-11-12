// Records the deployed board in use: open-board -> watch-board (wait for a new incident) -> ack-incident.
// Usage: node record.cjs <boardUrl> <outDir> [maxWaitMs]
const path = require('path');
const fs = require('fs');
const { chromium } = require(path.join(__dirname, 'repo', 'node_modules', 'playwright'));

const [, , url, outDir, maxWaitArg] = process.argv;
const maxWait = Number(maxWaitArg) || 12 * 60_000;

(async () => {
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    locale: 'pl-PL',
    timezoneId: 'Europe/Warsaw',
    viewport: { width: 1280, height: 720 },
    recordVideo: { dir: outDir, size: { width: 1280, height: 720 } },
  });
  const page = await ctx.newPage();
  const t0 = Date.now(); // video starts with the page
  const mmss = () => {
    const s = Math.floor((Date.now() - t0) / 1000);
    return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  };
  const events = [];
  const mark = (e) => { const x = { at: mmss(), wall: new Date().toISOString(), ...e }; events.push(x); console.log(JSON.stringify(x)); };
  const caption = async (text) => {
    await page.evaluate((t) => {
      let el = document.getElementById('__rec');
      if (!el) {
        el = document.createElement('div');
        el.id = '__rec';
        el.style.cssText = 'position:fixed;left:0;right:0;bottom:0;padding:8px 16px;background:#1d1d1f;color:#fff;font:14px system-ui;z-index:9999';
        document.body.appendChild(el);
      }
      el.textContent = 'recording · ' + new Date().toLocaleTimeString('pl-PL') + ' · ' + t;
    }, text).catch(() => {});
  };
  page.on('console', (m) => {
    const t = m.text();
    if (t.startsWith('ack ')) { const [, id, ackedAt, receipt] = t.split(' '); mark({ type: 'ack-console', id, ackedAt, receipt }); }
  });

  // open-board
  mark({ type: 'goto', url });
  await page.goto(url, { waitUntil: 'commit' });
  try { await page.locator('[data-testid=loader]').waitFor({ state: 'visible', timeout: 3000 }); mark({ type: 'loader-visible' }); } catch {}
  await page.locator('[data-testid=incident-row]').first().waitFor();
  mark({ type: 'rows-loaded', rows: await page.locator('[data-testid=incident-row]').count(), loaderLeft: await page.locator('[data-testid=loader]').count() });
  const sha = await page.locator('meta[name=build]').getAttribute('content');
  mark({ type: 'build', sha, footer: await page.locator('[data-testid=build-sha]').textContent() });
  await caption(`open-board · build ${sha.slice(0, 7)} · ${await page.locator('[data-testid=incident-row]').count()} incidents`);
  await page.locator('[data-testid=build-sha]').hover();
  await page.waitForTimeout(3000);

  // watch-board: wait, without reload, for a new incident to come in at the top
  const firstId = await page.locator('[data-testid=incident-row]').first().getAttribute('data-id');
  mark({ type: 'watch-start', top: firstId });
  await caption(`watch-board · top is ${firstId} · waiting for a new incident, no reload`);
  const deadline = Date.now() + maxWait;
  let newTop = firstId;
  while (Date.now() < deadline) {
    newTop = await page.locator('[data-testid=incident-row]').first().getAttribute('data-id');
    if (newTop !== firstId) break;
    await page.waitForTimeout(1000);
    if ((Date.now() - t0) % 30000 < 1000) await caption(`watch-board · top is ${firstId} · waiting for a new incident, no reload`);
  }
  const navs = await page.evaluate(() => performance.getEntriesByType('navigation').length);
  mark({ type: newTop !== firstId ? 'new-incident-on-top' : 'no-new-incident', top: newTop, navigations: navs });
  await caption(newTop !== firstId ? `watch-board · new incident ${newTop} arrived on top, no reload` : 'watch-board · no new incident in the wait window');
  await page.waitForTimeout(3000);

  // ack-incident: ack the newest incident, with a visible pointer move and click
  const row = page.locator('[data-testid=incident-row]').first();
  const id = await row.getAttribute('data-id');
  await caption(`ack-incident · acking ${id}`);
  const btn = row.locator('[data-testid=ack]');
  const box = await btn.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 20 });
  await page.waitForTimeout(800);
  mark({ type: 'click-ack', id });
  await btn.click();
  await row.locator('[data-testid=acked]').waitFor();
  mark({ type: 'acked-mark', id });
  const receipt = events.find((e) => e.type === 'ack-console')?.receipt || '';
  await caption(`ack-incident · ${id} acked · receipt ${receipt.slice(0, 12)}…`);
  await page.waitForTimeout(6000); // still acked after a few refreshes
  mark({ type: 'still-acked', acked: await row.locator('[data-testid=acked]').count() });

  const video = page.video();
  await page.close();
  await ctx.close();
  const file = await video.path();
  await browser.close();
  fs.writeFileSync(path.join(outDir, 'events.json'), JSON.stringify({ url, video: file, events }, null, 2));
  console.log('VIDEO', file);
})().catch((e) => { console.error('ERR', e); process.exit(1); });
