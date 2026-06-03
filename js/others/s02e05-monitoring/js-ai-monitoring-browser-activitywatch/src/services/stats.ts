import * as fs from "fs";
import * as path from "path";
import type { Category } from "./classifier.js";

export type Stats = Record<Category, number>;

export function createEmptyStats(categories: string[]): Stats {
  return Object.fromEntries(categories.map((c) => [c, 0])) as Stats;
}

export function displayStats(stats: Stats): void {
  const total = Object.values(stats).reduce((a, b) => a + b, 0);

  console.log("\n=== Session Statistics ===");

  for (const [category, seconds] of Object.entries(stats)) {
    const pct = total > 0 ? Math.round((seconds / total) * 100) : 0;
    const bar = "█".repeat(Math.round(pct / 5));
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    console.log(
      `  ${category.padEnd(15)} ${String(pct).padStart(3)}%  ${bar.padEnd(20)} ${minutes}m ${secs}s`
    );
  }

  const totalMin = Math.floor(total / 60);
  const totalSec = total % 60;
  console.log(`\n  Total time: ${totalMin}m ${totalSec}s`);
  console.log("=========================\n");
}

export function saveStats(
  stats: Stats,
  logsDir: string,
  sessionStart: Date
): string {
  fs.mkdirSync(logsDir, { recursive: true });

  const timestamp = sessionStart
    .toISOString()
    .replace(/:/g, "-")
    .slice(0, 19);
  const filename = `session-${timestamp}.json`;
  const filepath = path.join(logsDir, filename);

  const total = Object.values(stats).reduce((a, b) => a + b, 0);
  const data = {
    sessionStart: sessionStart.toISOString(),
    sessionEnd: new Date().toISOString(),
    totalSeconds: total,
    categories: stats,
  };

  fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
  return filepath;
}
