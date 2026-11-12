// Step-2 recording: open-board -> watch-board -> ack-incident via the incident panel, including a click on a row that moved.
const path = require('path'); const fs = require('fs');
const { chromium } = require(path.join(__dirname, 'repo', 'node_modules', 'playwright'));
const [, , url, outDir] = process.argv;
(async () => {
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ locale: 'pl-PL', timezoneId: 'Europe/Warsaw', viewport: { width: 1280, height: 900 }, recordVideo: { dir: outDir, size: { width: 1280, height: 900 } } });
  const page = await ctx.newPage();
  const t0 = Date.now();
  const mmss = () => { const s = Math.floor((Date.now() - t0) / 1000); return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; };
  const events = [];
  const mark = (e) => { const x = { at: mmss(), wall: new Date().toISOString(), ...e }; events.push(x); console.log(JSON.stringify(x).replace(/("receipt":")[^"]{8}[^"]*/, '$1***')); return x; };
  // Draw the pointer, since headless video does not.
  await page.addInitScript(() => { addEventListener('DOMContentLoaded', () => { const d = document.createElement('div'); d.id = '__ptr'; d.style.cssText = 'position:fixed;width:18px;height:18px;margin:-9px 0 0 -9px;border-radius:50%;background:rgba(220,0,60,.55);border:2px solid #c00;pointer-events:none;z-index:10000;left:-50px;top:-50px'; document.body.appendChild(d); addEventListener('mousemove', (e) => { d.style.left = e.clientX + 'px'; d.style.top = e.clientY + 'px'; }, true); }); });
  const caption = (t) => page.evaluate((t) => { let el = document.getElementById('__rec'); if (!el) { el = document.createElement('div'); el.id = '__rec'; el.style.cssText = 'position:fixed;left:0;right:0;bottom:0;padding:10px 16px;background:#1d1d1f;color:#fff;font:15px system-ui;z-index:9999;pointer-events:none'; document.body.appendChild(el); } el.textContent = `recorder · ${new Date().toLocaleTimeString('pl-PL')} · ${t}`; }, t).catch(() => {});
  page.on('console', (m) => { const t = m.text(); if (t.startsWith('ack ')) { const [, id, ackedAt, receipt] = t.split(' '); mark({ type: 'ack-api', id, ackedAt, receipt }); } });
  const row = (id) => page.locator(`[data-testid=incident-row][data-id="${id}"]`);
  const panelText = () => page.locator('[data-testid=incident-panel]').innerText().catch(() => '');
  const waitArrival = () => page.evaluate(() => new Promise((res) => { const list = document.querySelector('[data-testid=incident-list]'); const top = list.firstElementChild?.dataset.id; new MutationObserver((m, o) => { if (list.firstElementChild?.dataset.id !== top) { o.disconnect(); res(list.firstElementChild.dataset.id); } }).observe(list, { childList: true }); }));
  const center = async (loc) => { const b = await loc.boundingBox(); return [b.x + b.width / 2, b.y + b.height / 2]; };

  mark({ type: 'open-board', url });
  await page.goto(url, { waitUntil: 'commit' });
  try { await page.locator('[data-testid=loader]').waitFor({ state: 'visible', timeout: 3000 }); mark({ type: 'loader-visible' }); } catch {}
  await page.locator('[data-testid=incident-row]').first().waitFor();
  const sha = await page.locator('meta[name=build]').getAttribute('content');
  mark({ type: 'loaded', rows: await page.locator('[data-testid=incident-row]').count(), rowAckButtons: await page.locator('[data-testid=incident-row] [data-testid=ack]').count(), sha, footer: await page.locator('[data-testid=build-sha]').textContent() });
  await caption(`open-board · build ${sha.slice(0, 7)} · rows have no Ack button`);
  await page.waitForTimeout(3000);

  await caption('watch-board · waiting for a new incident, no reload');
  const first = await waitArrival();
  mark({ type: 'arrival', id: first });
  await caption(`watch-board · ${first} arrived live on top`);
  await page.waitForTimeout(2000);

  // ack-incident: aim at row 3, a new incident lands mid-aim, the click opens the row that moved under the pointer.
  const ids = await page.locator('[data-testid=incident-row]').evaluateAll((els) => els.map((e) => e.dataset.id));
  const want = ids[2];
  await caption(`ack-incident · I want ${want} (row 3) · moving to it`);
  const [x, y] = await center(row(want));
  await page.mouse.move(x, y, { steps: 20 });
  mark({ type: 'aim', want });
  const landed = await waitArrival();
  mark({ type: 'arrival-mid-aim', id: landed });
  await page.waitForTimeout(150);
  await page.mouse.click(x, y);
  await page.waitForTimeout(300);
  const opened = (await panelText()).match(/INC-\d+/)?.[0];
  mark({ type: 'panel-opened', want, panelNames: opened, acksSoFar: events.filter((e) => e.type === 'ack-api').length });
  await caption(`ack-incident · list moved: panel names ${opened}, not ${want} · nothing acked`);
  await page.waitForTimeout(3500);

  // Pick the wanted row again, read the panel, Ack there.
  await caption(`ack-incident · picking ${want} again`);
  await page.mouse.move(...(await center(row(want))), { steps: 15 });
  await page.mouse.click(...(await center(row(want))));
  await page.waitForTimeout(400);
  const now = (await panelText()).match(/INC-\d+/)?.[0];
  mark({ type: 'panel-opened', want, panelNames: now });
  await caption(`ack-incident · panel names ${now} · pressing "Ack ${now}"`);
  await page.waitForTimeout(1500);
  const ackBtn = page.locator('[data-testid=panel-ack]');
  await page.mouse.move(...(await center(ackBtn)), { steps: 15 });
  await page.waitForTimeout(400);
  mark({ type: 'click-panel-ack', want, label: await ackBtn.innerText() });
  await page.mouse.click(...(await center(ackBtn)));
  await row(want).locator('[data-testid=acked]').waitFor({ timeout: 5000 });
  const ackedIds = await page.locator('[data-testid=acked]').evaluateAll((els) => els.map((e) => e.closest('[data-testid=incident-row]').dataset.id));
  mark({ type: 'acked-now', want, ackedIds });
  await caption(`ack-incident · ${want} acked, the incident I wanted · acked rows: ${ackedIds.join(', ')}`);
  await page.waitForTimeout(6000);
  mark({ type: 'end', ackedIds: await page.locator('[data-testid=acked]').evaluateAll((els) => els.map((e) => e.closest('[data-testid=incident-row]').dataset.id)) });

  const video = page.video(); await page.close(); await ctx.close(); const file = await video.path(); await browser.close();
  fs.writeFileSync(path.join(outDir, 'events.json'), JSON.stringify({ url, video: file, events }, null, 2));
  console.log('VIDEO', file);
})().catch((e) => { console.error('ERR', e); process.exit(1); });
