import * as fs from 'fs';
import * as path from 'path';
import { DateTime } from 'luxon';
import config from '../../config.json';
import { InputSchema, OutputSchema } from '../schemas/index';
import { chatWithRetry } from './openrouter';
import { acquireLock } from './lock';
import { ping } from './heartbeat';
import { sendAlert } from '../utils/alert';
import { logger } from '../utils/logger';

export interface RunOptions {
  // Skip the 9:00-9:05 Warsaw time window check (use for interactive menu runs)
  skipTimeCheck?: boolean;
  // In cron mode, lock conflicts are a normal skip — no alert, no throw
  cronMode?: boolean;
  // Simulation flags
  simulateStaleInput?: boolean;
  simulateInvalidOutput?: boolean;
  simulateHeartbeatFailure?: boolean;
}

function buildPrompt(articles: Array<{ title: string; source: string }>): string {
  const template = fs.readFileSync(
    path.join(__dirname, '../prompts/digest.md'),
    'utf-8'
  );
  const list = articles.map(a => `- ${a.title} (${a.source})`).join('\n');
  return template.replace('{{ARTICLES}}', list);
}

function ageInHours(isoString: string): number {
  const generatedAt = DateTime.fromISO(isoString);
  return DateTime.now().diff(generatedAt, 'hours').hours;
}

export async function runAgent(options: RunOptions = {}): Promise<void> {
  const now = DateTime.now().setZone(config.timezone);

  // 1. Schedule window check
  if (!options.skipTimeCheck) {
    const inWindow =
      now.hour === config.scheduleHour &&
      now.minute < config.scheduleWindowMinutes;

    if (!inWindow) {
      throw new Error(
        `Run outside schedule window — expected ${config.scheduleHour}:00–` +
          `${config.scheduleHour}:0${config.scheduleWindowMinutes} Warsaw, ` +
          `got ${now.toFormat('HH:mm')}`
      );
    }
  }

  // 2. Acquire lock
  let release: (() => Promise<void>);
  try {
    release = await acquireLock();
  } catch (err: any) {
    const isLockConflict = err.message?.includes('another instance');
    if (isLockConflict && options.cronMode) {
      logger.warn('Lock conflict — another instance is running, skipping this run');
      return;
    }
    await sendAlert(err.message);
    throw err;
  }
  logger.info('Lock acquired');

  try {
    // 3. Validate input data
    const rawData = JSON.parse(fs.readFileSync('data/news.json', 'utf-8'));
    const inputData = InputSchema.parse(rawData);

    const effectiveGeneratedAt = options.simulateStaleInput
      ? DateTime.now().minus({ hours: 26 }).toISO()!
      : inputData.generatedAt;

    const age = ageInHours(effectiveGeneratedAt);
    if (age > config.maxInputAgeHours) {
      throw new Error(
        `Input data is ${Math.round(age)}h old — refusing to generate report`
      );
    }

    logger.info(
      `Input data is fresh (generatedAt: ` +
        `${DateTime.fromISO(effectiveGeneratedAt).setZone(config.timezone).toFormat('yyyy-MM-dd HH:mm')} Warsaw)`
    );

    // 4. Call OpenRouter
    const prompt = buildPrompt(inputData.articles);
    const rawResponse = await chatWithRetry(prompt);
    logger.info('OpenRouter response received');

    // 5. Validate output
    const parsed: unknown = options.simulateInvalidOutput
      ? { summary: 'bad', topics: [] }
      : JSON.parse(rawResponse);

    const output = OutputSchema.parse(parsed);
    logger.info(
      `Output valid — summary: ${output.summary.length} chars, topics: ${output.topics.length}`
    );

    // Save result
    const timestamp = now.toFormat("yyyy-MM-dd'T'HH-mm-ss");
    const resultPath = path.join(config.resultsDir, `report_${timestamp}.json`);
    fs.mkdirSync(config.resultsDir, { recursive: true });
    fs.writeFileSync(
      resultPath,
      JSON.stringify({ generatedAt: now.toISO(), ...output }, null, 2)
    );
    logger.info(`Report saved → ${resultPath}`);

    // 6. Heartbeat
    const pingUrl = options.simulateHeartbeatFailure
      ? 'https://httpbin.org/status/500'
      : process.env.HEALTHCHECK_PING_URL;

    if (!pingUrl) throw new Error('HEALTHCHECK_PING_URL not set in .env');
    await ping(pingUrl);
    logger.info('Heartbeat sent \u2713');
  } catch (err) {
    await sendAlert((err as Error).message);
    throw err;
  } finally {
    await release!();
    logger.info('Lock released');
  }
}
