// Recording for step 1. Flows: open-board -> watch-board -> ack-incident (clean) -> ack-incident (row shifts under the pointer).
// Usage: node record2.cjs <boardUrl> <outDir>
const path = require('path');
const fs = require('fs');
const { chromium } = require(path.join(__dirname, 'repo', 'node_modules', 'playwright'));
const [, , url, outDir] = process.argv;

(async () => {
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    locale: 'pl-PL', timezoneId: 'Europe/Warsaw',
    viewport: { width: 1280, height: 900 },
    recordVideo: { dir: outDir, size: { width: 1280, height: 900 } },
  });
  const page = await ctx.newPage();
  const t0 = Date.now();
  const mmss = () => { const s = Math.floor((Date.now() - t0) / 1000); return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; };
  const events = [];
  const mark = (e) => { const x = { at: mmss(), wall: new Date().toISOString(), ...e }; events.push(x); console.log(JSON.stringify(x).replace(/("receipt":")[^"]{8}[^"]*/, '$1***')); return x; };
  const caption = (t) => page.evaluate((t) => {
    let el = document.getElementById('__rec');
    if (!el) { el = document.createElement('div'); el.id = '__rec'; el.style.cssText = 'position:fixed;left:0;right:0;bottom:0;padding:10px 16px;background:#1d1d1f;color:#fff;font:15px system-ui;z-index:9999'; document.body.appendChild(el); }
    el.textContent = `recorder · ${new Date().toLocaleTimeString('pl-PL')} · ${t}`;
  }, t).catch(() => {});
  page.on('console', (m) => { const t = m.text(); if (t.startsWith('ack ')) { const [, id, ackedAt, receipt] = t.split(' '); mark({ type: 'ack-api', id, ackedAt, receipt }); } });
  const row = (id) => page.locator(`[data-testid=incident-row][data-id="${id}"]`);
  const topId = () => page.locator('[data-testid=incident-row]').first().getAttribute('data-id');
  const waitArrival = () => page.evaluate(() => new Promise((res) => {
    const list = document.querySelector('[data-testid=incident-list]');
    const top = list.firstElementChild?.dataset.id;
    new MutationObserver((m, o) => { if (list.firstElementChild?.dataset.id !== top) { o.disconnect(); res(list.firstElementChild.dataset.id); } }).observe(list, { childList: true });
  }));

  // 1. open-board
  mark({ type: 'open-board', url });
  await page.goto(url, { waitUntil: 'commit' });
  try { await page.locator('[data-testid=loader]').waitFor({ state: 'visible', timeout: 3000 }); mark({ type: 'loader-visible' }); } catch {}
  await page.locator('[data-testid=incident-row]').first().waitFor();
  const sha = await page.locator('meta[name=build]').getAttribute('content');
  mark({ type: 'loaded', rows: await page.locator('[data-testid=incident-row]').count(), loader: await page.locator('[data-testid=loader]').count(), sha, footer: await page.locator('[data-testid=build-sha]').textContent() });
  await caption(`open-board · loader gone · build ${sha.slice(0, 7)} in footer`);
  await page.waitForTimeout(3000);

  // 2. watch-board: two arrivals, no reload
  for (let n = 1; n <= 2; n++) {
    await caption(`watch-board · waiting for new incident ${n}/2, no reload`);
    const id = await waitArrival();
    mark({ type: 'arrival', id, rows: await page.locator('[data-testid=incident-row]').count() });
    await caption(`watch-board · ${id} arrived on top, no reload`);
    await page.waitForTimeout(1500);
  }
  mark({ type: 'navigations', count: await page.evaluate(() => performance.getEntriesByType('navigation').length) });

  // 3. ack-incident, clean: right after an arrival, take the top row
  await waitArrival();
  await page.waitForTimeout(400);
  const a = await topId();
  await caption(`ack-incident · pointing at Ack on ${a}`);
  let box = await row(a).locator('[data-testid=ack]').boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 15 });
  await page.waitForTimeout(500);
  mark({ type: 'click', aimedAt: a });
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  await row(a).locator('[data-testid=acked]').waitFor({ timeout: 5000 }).catch(() => {});
  await caption(`ack-incident · ${a} acked (the row I pointed at)`);
  await page.waitForTimeout(3000);

  // 4. ack-incident while a new incident lands: point at the 3rd row's Ack, click as the list moves
  const rowsNow = await page.locator('[data-testid=incident-row]').evaluateAll((els) => els.map((e) => e.dataset.id));
  const b = rowsNow[2];
  await caption(`ack-incident · pointing at Ack on ${b} (row 3); a new incident is due`);
  box = await row(b).locator('[data-testid=ack]').boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 15 });
  mark({ type: 'aim', aimedAt: b, rowIndex: 3 });
  const landed = await waitArrival();
  mark({ type: 'arrival-under-pointer', id: landed });
  await page.waitForTimeout(150); // a human's click already on its way
  const under = await page.evaluate(([x, y]) => document.elementFromPoint(x, y)?.closest('[data-testid=incident-row]')?.dataset.id, [box.x + box.width / 2, box.y + box.height / 2]);
  mark({ type: 'click', aimedAt: b, rowUnderPointer: under });
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  await page.waitForTimeout(1200);
  const ackedIds = await page.locator('[data-testid=acked]').evaluateAll((els) => els.map((e) => e.closest('[data-testid=incident-row]').dataset.id));
  mark({ type: 'acked-now', ackedIds, aimedAtAcked: ackedIds.includes(b) });
  await caption(`ack-incident · aimed at ${b}, board acked ${ackedIds.filter((x) => x !== a).join(', ') || 'nothing'}`);
  await page.waitForTimeout(6000);
  mark({ type: 'end', ackedIds: await page.locator('[data-testid=acked]').evaluateAll((els) => els.map((e) => e.closest('[data-testid=incident-row]').dataset.id)) });

  const video = page.video();
  await page.close(); await ctx.close();
  const file = await video.path();
  await browser.close();
  fs.writeFileSync(path.join(outDir, 'events.json'), JSON.stringify({ url, video: file, events }, null, 2));
  console.log('VIDEO', file);
})().catch((e) => { console.error('ERR', e); process.exit(1); });
