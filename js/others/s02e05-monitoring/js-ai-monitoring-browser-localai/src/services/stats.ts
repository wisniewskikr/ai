import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

export type Stats = Record<string, number>;

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}m ${String(s).padStart(2, '0')}s`;
}

export function getTopCategory(stats: Stats): string {
  let top = 'other';
  let max = 0;
  for (const [cat, secs] of Object.entries(stats)) {
    if (secs > max) {
      max = secs;
      top = cat;
    }
  }
  return top;
}

export function initStats(categories: string[]): Stats {
  return Object.fromEntries(categories.map((c) => [c, 0]));
}

export function getTotalSeconds(stats: Stats): number {
  return Object.values(stats).reduce((sum, s) => sum + s, 0);
}

export function displayStats(stats: Stats): void {
  const total = getTotalSeconds(stats);
  const LINE = '─'.repeat(58);
  const DOUBLE = '═'.repeat(58);

  console.log('\n' + DOUBLE);
  console.log('  Session Summary');
  console.log(DOUBLE);
  console.log(
    'Category'.padEnd(18) +
    'Time'.padStart(10) +
    '%'.padStart(6) +
    '   Bar'
  );
  console.log(LINE);

  const sorted = Object.entries(stats)
    .filter(([, s]) => s > 0)
    .sort(([, a], [, b]) => b - a);

  for (const [cat, secs] of sorted) {
    const pct = total > 0 ? Math.round((secs / total) * 100) : 0;
    const barLen = Math.round(pct / 5);
    const bar = '\u2588'.repeat(barLen);
    console.log(
      cat.padEnd(18) +
      formatDuration(secs).padStart(10) +
      `${pct}%`.padStart(6) +
      `   ${bar}`
    );
  }

  console.log(LINE);
  console.log(
    'Total'.padEnd(18) +
    formatDuration(total).padStart(10) +
    '100%'.padStart(6)
  );
  console.log(DOUBLE + '\n');
}

export function saveStats(stats: Stats, logsDir: string, samples: number): string {
  mkdirSync(logsDir, { recursive: true });

  const now = new Date();
  const sessionId = now
    .toISOString()
    .replace('T', 'T')
    .replace(/:/g, '-')
    .substring(0, 19);

  const filename = `session-${sessionId}.json`;
  const filepath = join(logsDir, filename);

  const total = getTotalSeconds(stats);

  const data = {
    session: sessionId,
    totalSeconds: total,
    samples,
    categories: Object.fromEntries(
      Object.entries(stats).filter(([, s]) => s > 0)
    ),
  };

  writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf-8');
  return filepath;
}
