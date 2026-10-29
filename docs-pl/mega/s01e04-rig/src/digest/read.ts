// Plan morning-digest § 1. Reads runs/<night>.jsonl into one row per job.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { DigestRow, ReadNight, RunLine, RunStatus } from './types.js';

const NIGHT = /^\d{4}-\d{2}-\d{2}$/;
const STATUSES: readonly string[] = ['ok', 'retry', 'fail'] satisfies RunStatus[];

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function isStatus(v: unknown): v is RunStatus {
  return typeof v === 'string' && STATUSES.includes(v);
}

// Parse one line at the edge; null means "bad line".
function parseLine(text: string): RunLine | null {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return null;
  }
  if (!isObject(raw)) return null;
  const { at, job, status, owner, error } = raw;
  if (typeof at !== 'string' || at === '' || Number.isNaN(Date.parse(at))) return null;
  if (typeof job !== 'string' || job === '') return null;
  if (!isStatus(status)) return null;
  if (owner !== null && typeof owner !== 'string') return null;
  if (error !== undefined && typeof error !== 'string') return null;
  return error === undefined ? { at, job, status, owner } : { at, job, status, owner, error };
}

export const readNight: ReadNight = (runsDir, night) => {
  // Checked before touching the filesystem: the route passes `night` straight through.
  if (!NIGHT.test(night)) return null;

  let text: string;
  try {
    text = readFileSync(join(runsDir, `${night}.jsonl`), 'utf8');
  } catch (err) {
    if (isObject(err) && err.code === 'ENOENT') return null;
    throw err;
  }

  const byJob = new Map<string, DigestRow>();
  let badLines = 0;
  for (const rawLine of text.split('\n')) {
    const trimmed = rawLine.trim();
    if (trimmed === '') continue;
    const line = parseLine(trimmed);
    if (!line) {
      badLines++;
      continue;
    }
    const retry = line.status === 'retry' ? 1 : 0;
    const row = byJob.get(line.job);
    if (!row) {
      byJob.set(line.job, {
        job: line.job,
        owner: line.owner,
        runs: 1,
        retries: retry,
        lastStatus: line.status,
        lastError: line.error ?? null,
        firstAt: line.at,
        lastAt: line.at,
      });
      continue;
    }
    row.runs++;
    row.retries += retry;
    row.owner = line.owner;
    row.lastStatus = line.status;
    row.lastError = line.error ?? null;
    row.lastAt = line.at;
  }

  const rows = [...byJob.values()].sort((a, b) => (a.job < b.job ? -1 : a.job > b.job ? 1 : 0));
  return { night, rows, badLines };
};
