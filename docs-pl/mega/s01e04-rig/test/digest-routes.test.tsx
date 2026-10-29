import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import type { Night, RunLine } from '../src/digest/types.js';

const NORMAL = '2026-01-02';
const EMPTY = '2026-01-03';
const BAD = '2026-01-04';
const MISSING = '2026-01-09';

let runsDir = '';
let app: ReturnType<typeof createApp>;

function line(l: RunLine): string {
  return JSON.stringify(l);
}

const normalLines: RunLine[] = [
  { at: '2026-01-02T03:10:00+01:00', job: 'sync', status: 'fail', owner: 'ola', error: 'timeout' },
  { at: '2026-01-02T03:00:00+01:00', job: 'backup', status: 'retry', owner: 'kuba' },
  { at: '2026-01-02T03:01:00+01:00', job: 'backup', status: 'retry', owner: 'kuba' },
  { at: '2026-01-02T03:02:00+01:00', job: 'backup', status: 'retry', owner: 'kuba' },
  { at: '2026-01-02T03:03:00+01:00', job: 'backup', status: 'ok', owner: 'kuba' },
];

beforeAll(() => {
  runsDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rig-digest-'));
  fs.writeFileSync(path.join(runsDir, `${NORMAL}.jsonl`), normalLines.map(line).join('\n') + '\n');
  fs.writeFileSync(path.join(runsDir, `${EMPTY}.jsonl`), '');
  const good: RunLine = { at: '2026-01-04T02:00:00+01:00', job: 'cleanup', status: 'ok', owner: null };
  const truncated = '{"at":"2026-01-04T02:05:00+01:00","job":"rep';
  fs.writeFileSync(path.join(runsDir, `${BAD}.jsonl`), [line(good), truncated].join('\n') + '\n');
  process.env.LANE_MARKER = 'TEST-MARKER';
  app = createApp({ adapter: 'shim', installed: '2026-10-29T14:06:00+01:00', beatEverySeconds: 60, runsDir });
});

afterAll(() => {
  fs.rmSync(runsDir, { recursive: true, force: true });
});

// The <tr ...> chunk that mentions the job, opening tag included.
function rowChunk(html: string, job: string): string {
  const chunk = html.split('<tr').slice(1).find((c) => c.includes(job));
  if (!chunk) throw new Error(`no table row for ${job}`);
  return '<tr' + chunk;
}

function openingTag(chunk: string): string {
  return chunk.slice(0, chunk.indexOf('>') + 1);
}

function jobsInPage(html: string, jobs: string[]): string[] {
  return jobs
    .map((j) => ({ j, i: html.indexOf(j) }))
    .filter((x) => x.i >= 0)
    .sort((a, b) => a.i - b.i)
    .map((x) => x.j);
}

describe('GET /digest/:night', () => {
  it('renders the jobs and the lane banner, marking fail and retries >= 3', async () => {
    const res = await app.request(`/digest/${NORMAL}`);
    const html = await res.text();
    expect(res.status).toBe(200);
    expect(html).toContain('TEST-MARKER');
    expect(html).toContain('backup');
    expect(html).toContain('sync');
    expect(openingTag(rowChunk(html, 'sync'))).toContain('warn');
    expect(openingTag(rowChunk(html, 'backup'))).toContain('warn');
  });

  it('returns 404 for a night with no file', async () => {
    const res = await app.request(`/digest/${MISSING}`);
    expect(res.status).toBe(404);
  });

  it('says "nothing ran" for an empty night', async () => {
    const res = await app.request(`/digest/${EMPTY}`);
    expect(res.status).toBe(200);
    expect(await res.text()).toContain('nothing ran');
  });

  it('still renders a night with a bad line', async () => {
    const res = await app.request(`/digest/${BAD}`);
    expect(res.status).toBe(200);
    expect(await res.text()).toContain('cleanup');
  });
});

describe('GET /api/digest/:night', () => {
  it('returns the Night with rows sorted by job', async () => {
    const res = await app.request(`/api/digest/${NORMAL}`);
    expect(res.status).toBe(200);
    const body = (await res.json()) as Night;
    expect(body.night).toBe(NORMAL);
    expect(body.badLines).toBe(0);
    expect(body.rows.map((r) => r.job)).toEqual(['backup', 'sync']);
    expect(body.rows.find((r) => r.job === 'backup')?.retries).toBeGreaterThanOrEqual(3);
    expect(body.rows.find((r) => r.job === 'sync')?.lastStatus).toBe('fail');
  });

  it('returns 404 for a night with no file', async () => {
    const res = await app.request(`/api/digest/${MISSING}`);
    expect(res.status).toBe(404);
  });

  it('returns no rows and no bad lines for an empty night', async () => {
    const res = await app.request(`/api/digest/${EMPTY}`);
    expect(res.status).toBe(200);
    const body = (await res.json()) as Night;
    expect(body.rows).toEqual([]);
    expect(body.badLines).toBe(0);
  });

  it('counts a bad line and keeps the other rows', async () => {
    const res = await app.request(`/api/digest/${BAD}`);
    expect(res.status).toBe(200);
    const body = (await res.json()) as Night;
    expect(body.badLines).toBe(1);
    expect(body.rows.map((r) => r.job)).toEqual(['cleanup']);
  });
});

describe('page and JSON agree', () => {
  it('lists the same jobs in the same order', async () => {
    const html = await (await app.request(`/digest/${NORMAL}`)).text();
    const body = (await (await app.request(`/api/digest/${NORMAL}`)).json()) as Night;
    const jsonJobs = body.rows.map((r) => r.job);
    expect(jobsInPage(html, jsonJobs)).toEqual(jsonJobs);
    expect(jsonJobs).toEqual(['backup', 'sync']);
  });
});
