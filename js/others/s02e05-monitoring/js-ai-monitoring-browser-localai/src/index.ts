import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { ask, sleep, isYes, isQuit, closeReadline } from './utils/cli.js';
import { logInfo, logWarn, logError } from './utils/log.js';
import { getActiveWindowTitle } from './services/monitor.js';
import { classifyByKeyword, classifyByAI } from './services/classifier.js';
import { initStats, displayStats, saveStats, getTopCategory, getTotalSeconds } from './services/stats.js';

interface AppConfig {
  monitoringIntervalMs: number;
  batchSize: number;
  ollamaBaseUrl: string;
  model: string;
  logsDir: string;
  categories: string[];
}

function loadConfig(): AppConfig {
  const raw = readFileSync(resolve('config.json'), 'utf-8');
  return JSON.parse(raw) as AppConfig;
}

function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}m ${String(s).padStart(2, '0')}s`;
}

async function runSession(config: AppConfig): Promise<'new' | 'quit'> {
  const stats = initStats(config.categories);
  let sampleCount = 0;
  let lastCategory = 'other';
  const sessionStart = Date.now();

  logInfo(`Monitoring started. Interval: ${config.monitoringIntervalMs / 1000}s | Batch: ${config.batchSize} samples`);

  while (true) {
    // Collect one batch of samples
    for (let i = 0; i < config.batchSize; i++) {
      await sleep(config.monitoringIntervalMs);

      const title = await getActiveWindowTitle();

      let category: string;
      if (!title) {
        category = 'other';
        logWarn('Could not read active window title — counting as other');
      } else {
        category = classifyByKeyword(title);
        if (category === 'other') {
          try {
            category = await classifyByAI(title, config.ollamaBaseUrl, config.model);
          } catch {
            logError('AI classification failed — using keyword fallback');
            category = 'other';
          }
        }
      }

      stats[category] = (stats[category] ?? 0) + config.monitoringIntervalMs / 1000;
      sampleCount++;
      lastCategory = category;
    }

    // Progress report after each batch
    const elapsedSecs = Math.floor((Date.now() - sessionStart) / 1000);
    const topCategory = getTopCategory(stats);
    logInfo(
      `Sample ${sampleCount} | Category: ${lastCategory} | Top: ${topCategory} | Elapsed: ${formatElapsed(elapsedSecs)}`
    );

    const total = getTotalSeconds(stats);
    console.log(`  Time tracked: ${formatElapsed(total)} across ${sampleCount} samples\n`);

    const answer = await ask('Stop and show statistics? (y = yes | c = continue | q = quit) ');

    if (isQuit(answer)) {
      closeReadline();
      process.exit(0);
    }

    if (isYes(answer)) {
      displayStats(stats);
      const filePath = saveStats(stats, config.logsDir, sampleCount);
      logInfo(`Session saved to ${filePath}`);

      const next = await ask('What next? (m = new monitoring session | q = quit) ');
      if (isQuit(next) || next.trim().toLowerCase() !== 'm') {
        closeReadline();
        process.exit(0);
      }
      return 'new';
    }
    // 'c' or anything else → continue
  }
}

async function main(): Promise<void> {
  const config = loadConfig();

  process.on('SIGINT', () => {
    console.log('\nInterrupted.');
    closeReadline();
    process.exit(0);
  });

  console.log('\nWindow Title Tracker — Privacy First');
  console.log('Data stays on your machine. Only categories are recorded.\n');

  while (true) {
    const answer = await ask('Start monitoring? (y = yes | q = quit) ');

    if (isQuit(answer)) {
      closeReadline();
      process.exit(0);
    }

    if (!isYes(answer)) {
      continue;
    }

    const result = await runSession(config);
    if (result === 'quit') {
      closeReadline();
      process.exit(0);
    }
    // result === 'new' → loop back and start a new session
    console.log('\n--- Starting new monitoring session ---\n');
  }
}

main();
