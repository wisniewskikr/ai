import * as fs from 'fs';
import * as path from 'path';
import { loadConfig } from './utils/config';
import { initLogger, logger } from './utils/logger';
import { loadLines } from './io/dataLoader';
import {
  printStartBanner,
  printObserverBanner,
  printReflectorBanner,
  printSummaryBanner,
  printUserLine,
  printMemoryStatus,
  UsageStats,
} from './io/display';
import { createMemory, hasActiveObservations } from './core/memory';
import { ChatSession } from './core/chat';
import { runObserver } from './core/observer';
import { runReflector } from './core/reflector';

// Read .env without an external dependency — saves ~50 lines of dotenv config
function loadEnv(): void {
  const envPath = path.resolve(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx < 0) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

function loadPrompt(name: string): string {
  const promptPath = path.resolve(process.cwd(), 'src', 'prompts', name);
  return fs.readFileSync(promptPath, 'utf-8').trim();
}

async function main(): Promise<void> {
  loadEnv();

  const config = loadConfig();
  initLogger(config.logDir);
  logger.info('Application started');
  logger.info(`Config loaded:\n${JSON.stringify(config, null, 2)}`);

  const apiKey = process.env['OPENROUTER_API_KEY'];
  if (!apiKey) throw new Error('OPENROUTER_API_KEY is not set in environment or .env');

  const lines = loadLines(config.dataFile);
  logger.info(`Loaded ${lines.length} biography lines from ${config.dataFile}`);

  const systemPrompt = loadPrompt('system.txt');
  const summaryPrompt = loadPrompt('summary.txt');

  const memory = createMemory();
  const chat = new ChatSession(config, apiKey, systemPrompt);

  printStartBanner(lines.length);

  // Counters that drive the Observer and Reflector triggers.
  // messagesSinceObserver: resets when Observer fires or Reflector fires (fresh context).
  // messagesSinceReflector: counts only while active observations exist, resets when Reflector fires.
  let messagesSinceObserver = 0;
  let messagesSinceReflector = 0;
  let messageCount = 0;
  let recentLines: string[] = []; // biography lines since last Observer/Reflector reset
  let calibration = 1.0;

  for (const line of lines) {
    messageCount++;

    // Capture estimate before the call so we can compute calibration afterward
    const estimatedTokens = chat.estimateTokens();

    const { reply, actualTokens } = await chat.sendMessage(line);

    // Rolling calibration: ratio of estimated to actual for this call
    calibration = estimatedTokens / (actualTokens || 1);

    const usage: UsageStats = { estimated: estimatedTokens, actual: actualTokens, calibration };

    printUserLine(messageCount, line);
    logger.info(`[msg ${messageCount}] User: ${line}`);
    logger.info(`[msg ${messageCount}] AI: ${reply}`);
    logger.info(`Usage: estimated=${estimatedTokens} actual=${actualTokens} calibration=${calibration.toFixed(2)}`);

    recentLines.push(line);
    messagesSinceObserver++;

    // Reflector counter only runs while there are uncompressed observations
    if (hasActiveObservations(memory)) {
      messagesSinceReflector++;
    }

    // Observer fires first — it is always checked before the Reflector
    if (messagesSinceObserver >= config.observerTriggerAfterMessages) {
      printObserverBanner();
      runObserver(memory, recentLines);
      recentLines = [];
      messagesSinceObserver = 0;
      messagesSinceReflector = 0; // Reflector countdown starts fresh after Observer
    }

    // Reflector fires after its own counter reaches the threshold
    if (hasActiveObservations(memory) && messagesSinceReflector >= config.reflectorTriggerAfterMessages) {
      const stats = await runReflector(memory, chat);
      printReflectorBanner(stats);
      recentLines = [];
      messagesSinceObserver = 0;
      messagesSinceReflector = 0;
    }

    printMemoryStatus(memory, usage);
  }

  // Final summary — asks specific fact-by-fact questions to prove compression worked
  printSummaryBanner();
  logger.info('Sending final summary prompt');

  const estimatedTokens = chat.estimateTokens();
  const { reply: summaryReply, actualTokens: summaryActual } = await chat.sendMessage(summaryPrompt);
  calibration = estimatedTokens / (summaryActual || 1);

  console.log(summaryReply);

  const finalUsage: UsageStats = { estimated: estimatedTokens, actual: summaryActual, calibration };
  printMemoryStatus(memory, finalUsage);

  logger.info(`Final summary reply:\n${summaryReply}`);
  logger.info('Application completed');
}

main().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  const stack = err instanceof Error ? (err.stack ?? '') : '';
  console.error('Fatal error:', message);
  logger.error(`Fatal error: ${message}\n${stack}`);
  process.exit(1);
});
