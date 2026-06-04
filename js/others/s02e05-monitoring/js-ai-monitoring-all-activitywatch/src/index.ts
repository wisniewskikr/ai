import { discoverBuckets, getLatestEvent } from "./services/activitywatch.js";
import { classifyByKeyword, type Category } from "./services/classifier.js";
import { createEmptyStats, displayStats, saveStats } from "./services/stats.js";
import { ask, sleep, isYes, isQuit, closeReadline, log } from "./utils/cli.js";
import config from "../config.json";

const { monitoringIntervalMs, batchSize, activityWatchUrl, logsDir, categories } = config;
const intervalSeconds = monitoringIntervalMs / 1000;

async function collectSample(
  windowBucket: string,
  afkBucket: string
): Promise<Category> {
  const afkEvent = await getLatestEvent<{ status: string }>(
    activityWatchUrl,
    afkBucket
  );
  if (afkEvent?.data.status === "afk") return "idle";

  const windowEvent = await getLatestEvent<{ app: string; title: string }>(
    activityWatchUrl,
    windowBucket
  );
  if (!windowEvent) return "other";

  return classifyByKeyword(windowEvent.data.app, windowEvent.data.title);
}

function getTopCategory(stats: Record<string, number>): string {
  return Object.entries(stats).sort(([, a], [, b]) => b - a)[0][0];
}

async function runSession(
  windowBucket: string,
  afkBucket: string
): Promise<void> {
  const stats = createEmptyStats(categories);
  const sessionStart = new Date();
  let totalSamples = 0;
  let lastCategory: Category = "other";

  log("INFO", `Monitoring started. Interval: ${intervalSeconds}s | Batch: ${batchSize} samples`);
  log("INFO", `ActivityWatch buckets: ${windowBucket}, ${afkBucket}`);

  while (true) {
    for (let i = 0; i < batchSize; i++) {
      await sleep(monitoringIntervalMs);
      lastCategory = await collectSample(windowBucket, afkBucket);
      stats[lastCategory] += intervalSeconds;
      totalSamples++;
    }

    const elapsedTotal = totalSamples * intervalSeconds;
    const elapsedMin = Math.floor(elapsedTotal / 60);
    const elapsedSec = elapsedTotal % 60;
    const top = getTopCategory(stats);

    log(
      "INFO",
      `Sample ${totalSamples} | Category: ${lastCategory} | Top: ${top} | Elapsed: ${elapsedMin}m ${elapsedSec}s`
    );
    console.log(`[Progress] ${totalSamples} samples | ${Math.floor(elapsedTotal / 60)}m ${elapsedTotal % 60}s | Top: ${top}`);

    const answer = await ask(
      "Stop and show statistics? (y = yes | c = continue | q = quit): "
    );

    if (isQuit(answer)) {
      log("INFO", "Monitoring stopped by user.");
      return;
    }

    if (isYes(answer)) {
      displayStats(stats);
      const filepath = saveStats(stats, logsDir, sessionStart);
      log("INFO", `Session saved to ${filepath}`);

      const next = await ask(
        "What next? (m = new monitoring session | q = quit): "
      );

      if (next === "m") return runSession(windowBucket, afkBucket);
      return;
    }

    // c = continue — loop again
  }
}

async function main(): Promise<void> {
  console.log("\nWindow Title Tracker — Privacy First");
  console.log("All data stays local. Only categories are recorded.\n");

  let windowBucket: string;
  let afkBucket: string;

  try {
    ({ windowBucket, afkBucket } = await discoverBuckets(activityWatchUrl));
  } catch (err) {
    log("ERROR", (err as Error).message);
    closeReadline();
    process.exit(1);
  }

  const start = await ask("Start monitoring? (y = yes | q = quit): ");

  if (isQuit(start) || !isYes(start)) {
    closeReadline();
    return;
  }

  try {
    await runSession(windowBucket, afkBucket);
  } catch (err) {
    log("ERROR", (err as Error).message);
  }

  closeReadline();
}

main();
