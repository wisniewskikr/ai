import 'dotenv/config';
import OpenAI from 'openai';
import fs from 'fs';
import { logger } from './utils/logger.js';
import { runStandardApi, type Review } from './services/standard.js';
import { runBatchApi } from './services/batch.js';
import { compareResults } from './services/compare.js';

interface Config {
  model: string;
  reviewsFile: string;
  openrouterBaseUrl: string;
  batchPollIntervalMs: number;
  batchMaxWaitMs: number;
  inputCostPer1MTokens: number;
  outputCostPer1MTokens: number;
  batchCostMultiplier: number;
}

const config: Config = JSON.parse(fs.readFileSync('config.json', 'utf-8'));

const apiKey = process.env.OPENROUTER_API_KEY;
if (!apiKey) {
  console.error('ERROR: OPENROUTER_API_KEY is not set in .env');
  process.exit(1);
}

const client = new OpenAI({
  apiKey,
  baseURL: config.openrouterBaseUrl,
});

async function main() {
  const reviews: Review[] = JSON.parse(fs.readFileSync(config.reviewsFile, 'utf-8'));
  logger.info(`Loaded ${reviews.length} reviews from ${config.reviewsFile}`);

  console.log('\nHeadphone Review Analysis');
  console.log('=========================\n');

  // --- Standard API ---
  console.log('--- Standard API ---');
  const standardResult = await runStandardApi(
    reviews,
    client,
    config.model,
    config.inputCostPer1MTokens,
    config.outputCostPer1MTokens,
  );

  // --- Batch API ---
  console.log('\n--- Batch API ---');
  const batchResult = await runBatchApi(
    reviews,
    client,
    config.model,
    config.batchPollIntervalMs,
    config.batchMaxWaitMs,
    config.inputCostPer1MTokens,
    config.outputCostPer1MTokens,
    config.batchCostMultiplier,
  );

  // --- Comparison ---
  compareResults(standardResult, batchResult);
}

main().catch((err: Error) => {
  logger.error(err.message);
  process.exit(1);
});
