import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { readNight } from '../src/digest/read.js';

describe('readNight on runs/2026-10-28.jsonl', () => {
  const night = readNight('runs', '2026-10-28');
  const row = (job: string) => night?.rows.find((r) => r.job === job);

  it('has 5 jobs sorted by name and 1 bad line', () => {
    expect(night).not.toBeNull();
    expect(night?.night).toBe('2026-10-28');
    expect(night?.badLines).toBe(1);
    expect(night?.rows.map((r) => r.job)).toEqual([
      'digest/render',
      'fixtures/refresh',
      'lane/sync',
      'notes/backup',
      'rig/rotate-logs',
    ]);
  });

  it('counts retries and takes the last status', () => {
    expect(row('fixtures/refresh')).toMatchObject({
      runs: 4,
      retries: 3,
      lastStatus: 'ok',
      lastError: null,
      firstAt: '2026-10-29T01:30:00+01:00',
      lastAt: '2026-10-29T01:37:00+01:00',
    });
  });

  it('keeps the last error of a failed job', () => {
    expect(row('notes/backup')).toMatchObject({ lastStatus: 'fail', lastError: 'quota exceeded', owner: 'lane-07' });
  });

  it('keeps a row whose owner is null', () => {
    expect(row('digest/render')).toMatchObject({ owner: null, runs: 1, lastStatus: 'ok' });
  });

  it('keeps the offset from the log', () => {
    expect(row('rig/rotate-logs')?.firstAt).toBe('2026-10-28T23:00:02+01:00');
  });
});

describe('readNight on a temp runs dir', () => {
  let dir: string;
  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'rig-runs-'));
  });
  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it('returns null when the file is missing', () => {
    expect(readNight(dir, '2026-01-01')).toBeNull();
  });

  it('returns no rows for an empty file', () => {
    writeFileSync(join(dir, '2026-01-01.jsonl'), '');
    expect(readNight(dir, '2026-01-01')).toEqual({ night: '2026-01-01', rows: [], badLines: 0 });
  });

  it('counts bad lines, ignores blank ones, never throws', () => {
    const lines = [
      '{"at":"2026-01-01T01:00:00+01:00","job":"a","status":"ok","owner":"x"}',
      '',
      '{not json',
      '{"at":"2026-01-01T02:00:00+01:00","job":"a","status":"weird","owner":"x"}',
      '{"at":"2026-01-01T02:00:00+01:00","status":"ok","owner":"x"}',
      '{"at":"2026-01-01T02:00:00+01:00","job":"a","status":"ok","owner":7}',
      '{"job":"a","status":"ok","owner":"x"}',
      '   ',
    ];
    writeFileSync(join(dir, '2026-01-01.jsonl'), lines.join('\r\n'));
    const night = readNight(dir, '2026-01-01');
    expect(night?.badLines).toBe(5);
    expect(night?.rows).toHaveLength(1);
    expect(night?.rows[0]).toMatchObject({ job: 'a', runs: 1 });
  });

  it('rejects a night that is not YYYY-MM-DD', () => {
    writeFileSync(join(dir, 'x.jsonl'), '');
    expect(readNight(dir, 'x')).toBeNull();
    expect(readNight(dir, '../2026-01-01')).toBeNull();
    expect(readNight(dir, '2026-01-01.jsonl')).toBeNull();
  });
});
