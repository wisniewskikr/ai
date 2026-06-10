import 'dotenv/config';
import * as readline from 'readline';
import ora from 'ora';
import config from '../config.json';
import { runAgent } from './services/agent';
import { acquireLock } from './services/lock';
import { logger, startBuffer, flushBuffer } from './utils/logger';

// ── Graceful shutdown ─────────────────────────────────────────────────────────

process.on('SIGINT', () => {
  process.stdout.write('\n');
  logger.info('Agent stopped by user');
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('Agent stopped by SIGTERM');
  process.exit(0);
});

// ── Helpers ───────────────────────────────────────────────────────────────────

function ask(question: string): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close();
      resolve(answer);
    });
  });
}

// Shows a spinner while fn() runs. Buffers all logger output during execution,
// then flushes it after the spinner stops so there is no interleaving.
async function runWithSpinner(fn: () => Promise<void>): Promise<void> {
  const spinner = ora('Processing articles...').start();
  startBuffer();
  try {
    await fn();
    spinner.stop();
  } catch (err) {
    spinner.stop();
    throw err;
  } finally {
    const lines = flushBuffer();
    for (const line of lines) {
      console.log(line);
    }
  }
}

function waitWithCountdown(seconds: number): Promise<void> {
  return new Promise(resolve => {
    let remaining = seconds;

    const tick = () => {
      const mm = Math.floor(remaining / 60).toString().padStart(2, '0');
      const ss = (remaining % 60).toString().padStart(2, '0');
      process.stdout.write(`\rNext run in: ${mm}:${ss}  (Ctrl+C to stop)  `);
    };

    tick();

    const interval = setInterval(() => {
      remaining--;
      if (remaining <= 0) {
        clearInterval(interval);
        process.stdout.write('\r' + ' '.repeat(50) + '\r');
        resolve();
      } else {
        tick();
      }
    }, 1000);
  });
}

// ── Modes ─────────────────────────────────────────────────────────────────────

async function runCron(): Promise<void> {
  console.log(
    `\nStarting cron — runs every ${config.cronIntervalMinutes} minute(s). Press Ctrl+C to stop.\n`
  );

  let runCount = 0;

  while (true) {
    runCount++;

    try {
      await runWithSpinner(() => runAgent({ skipTimeCheck: true, cronMode: true }));
      console.log(`[INFO] Run #${runCount} completed successfully`);
    } catch (err) {
      // Error already logged and alerted inside runAgent
      console.log(`[INFO] Run #${runCount} failed — cron continues`);
    }

    await waitWithCountdown(config.cronIntervalMinutes * 60);
  }
}

async function runSimulation(opts: {
  label: string;
  simulateStaleInput?: boolean;
  simulateInvalidOutput?: boolean;
  simulateHeartbeatFailure?: boolean;
  simulateLockConflict?: boolean;
}): Promise<void> {
  console.log(`\nSimulating: ${opts.label}\n`);

  let lockRelease: (() => Promise<void>) | null = null;

  try {
    if (opts.simulateLockConflict) {
      // Hold the lock so runAgent sees it as taken
      lockRelease = await acquireLock();
      console.log('[INFO] Lock held by simulated second instance\n');
    }

    await runWithSpinner(() =>
      runAgent({
        skipTimeCheck: true,
        simulateStaleInput: opts.simulateStaleInput,
        simulateInvalidOutput: opts.simulateInvalidOutput,
        simulateHeartbeatFailure: opts.simulateHeartbeatFailure,
      })
    );
  } catch (_err) {
    // Error already logged and alerted inside runAgent
  } finally {
    if (lockRelease) {
      await lockRelease();
      console.log('[INFO] Simulated lock released');
    }
  }

  await ask('\nPress Enter to return to menu...');
}

// ── Menu ──────────────────────────────────────────────────────────────────────

function printHeader(): void {
  console.log('\n\u2554' + '\u2550'.repeat(42) + '\u2557');
  console.log('\u2551       Daily News Digest Agent            \u2551');
  console.log('\u2551  Press Ctrl+C at any time to exit safely \u2551');
  console.log('\u255a' + '\u2550'.repeat(42) + '\u255d\n');
}

function printMenu(): void {
  console.log('Select mode:');
  console.log('  1. Run normally     (cron every 1 min, clean data)');
  console.log('  2. Simulate error   \u2014 stale input data');
  console.log('  3. Simulate error   \u2014 invalid AI output');
  console.log('  4. Simulate error   \u2014 heartbeat failure');
  console.log('  5. Simulate error   \u2014 lock file conflict');
  console.log('  6. Exit\n');
}

// ── Entry point ───────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  printHeader();

  while (true) {
    printMenu();
    const choice = (await ask('> ')).trim();

    switch (choice) {
      case '1':
        await runCron();
        break;

      case '2':
        await runSimulation({ label: 'stale input data', simulateStaleInput: true });
        break;

      case '3':
        await runSimulation({ label: 'invalid AI output', simulateInvalidOutput: true });
        break;

      case '4':
        await runSimulation({ label: 'heartbeat failure', simulateHeartbeatFailure: true });
        break;

      case '5':
        await runSimulation({ label: 'lock file conflict', simulateLockConflict: true });
        break;

      case '6':
        console.log('Goodbye!');
        process.exit(0);
        break;

      default:
        console.log('Invalid choice. Please enter 1-6.\n');
    }
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
