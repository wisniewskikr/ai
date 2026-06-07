import 'dotenv/config';
import { isAllowedByRobots } from './services/robots.js';
import { fetchPage } from './services/scraper.js';
import { detectPii } from './services/pii-detector.js';
import { getAiFeedback } from './services/ai-feedback.js';
import { logger } from './utils/logger.js';
import { showMenu, promptChoice, promptUrl } from './utils/menu.js';
import { config } from './config.js';

async function countdown(ms: number): Promise<void> {
  const seconds = ms / 1000;
  process.stdout.write(`Waiting ${seconds}s`);
  for (let i = seconds - 1; i >= 1; i--) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    process.stdout.write(`... ${i}`);
  }
  await new Promise(resolve => setTimeout(resolve, 1000));
  process.stdout.write('\n');
}

async function scrapeUrl(url: string): Promise<void> {
  logger.info(`Starting scrape: ${url}`);

  // Step 1: Check robots.txt
  logger.info(`Checking robots.txt for ${url}`);
  const allowed = await isAllowedByRobots(url);
  if (!allowed) {
    logger.warn(`robots.txt BLOCKED: ${url} — scraping not permitted`);
    return;
  }
  logger.info('robots.txt OK — scraping permitted');

  // Step 2: Rate limit delay
  await countdown(config.rateLimitMs);

  // Step 3: Fetch page
  logger.info(`Fetching: ${url}`);
  const result = await fetchPage(url);
  if (!result.ok) {
    if (result.reason === 'rate-limited') {
      logger.warn(result.message);
    } else {
      logger.error(result.message);
    }
    return;
  }
  logger.info(`Fetched ${result.content.length} characters`);

  // Step 4: PII detection
  const piiMatches = detectPii(result.content);
  if (piiMatches.length > 0) {
    logger.warn(`PII detected — stopping. Found: ${piiMatches.map(m => `${m.type}: ${m.value}`).join(', ')}`);
    return;
  }
  logger.info('No PII detected');

  // Step 5: AI ethical feedback
  logger.info('Requesting AI ethical feedback...');
  try {
    const feedback = await getAiFeedback(url, result.content);
    logger.info(`AI Feedback:\n${feedback}`);
  } catch (error) {
    logger.error(`AI feedback failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function main(): Promise<void> {
  while (true) {
    showMenu();
    const choice = await promptChoice();

    switch (choice) {
      case '1':
        await scrapeUrl(config.exampleUrls.robotsBlocked);
        break;
      case '2':
        await scrapeUrl(config.exampleUrls.robotsAllowed);
        break;
      case '3':
        await scrapeUrl(config.exampleUrls.piiDetection);
        break;
      case '4':
        for (const url of config.exampleUrls.rateLimiting) {
          await scrapeUrl(url);
        }
        break;
      case '5': {
        const url = await promptUrl();
        if (url) await scrapeUrl(url);
        break;
      }
      case '0':
        logger.info('Goodbye!');
        process.exit(0);
      default:
        console.log('Invalid choice. Try again.');
    }
  }
}

main().catch(err => {
  logger.error(`Fatal error: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});
