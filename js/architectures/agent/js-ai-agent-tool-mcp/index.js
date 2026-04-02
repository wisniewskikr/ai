/*
 * index.js - Entry point.
 *
 * Accepts an optional prompt via CLI argument.
 * Falls back to config.json `input` field if none is given.
 *
 * Usage:
 *   node index.js
 *   node index.js "your prompt here"
 */

import { config } from './src/config.js';
import { logger } from './src/logger.js';
import { run }    from './src/agent.js';

const prompt = process.argv[2] || config.input;

if (!config.apiKey) {
  logger.error('OPENROUTER_API_KEY is not set. Add it to .env and try again.');
  process.exit(1);
}

run(prompt).catch((err) => {
  logger.error(`Agent crashed: ${err.message}`);
  process.exit(1);
});
