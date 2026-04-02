import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from './logger.js';
import { runWorkflow } from './workflow.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  logger.separator('Hello World MCP Workflow');
  logger.info('Loading configuration...');

  // --- Validate environment ---
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    logger.error('OPENROUTER_API_KEY is not set. Add it to your .env file.');
    process.exit(1);
  }
  logger.info('API key loaded from .env');

  // --- Load config.json ---
  const configPath = path.join(__dirname, '..', 'config.json');
  if (!fs.existsSync(configPath)) {
    logger.error(`config.json not found at: ${configPath}`);
    process.exit(1);
  }

  let config;
  try {
    config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  } catch (err) {
    logger.error(`Failed to parse config.json: ${err.message}`);
    process.exit(1);
  }

  if (!config.model || !config.input) {
    logger.error('config.json must contain "model" and "input" fields.');
    process.exit(1);
  }

  logger.info(`Config loaded — model: "${config.model}", input: "${config.input}"`);

  // --- Run workflow ---
  await runWorkflow(config, apiKey);
}

main().catch((err) => {
  logger.error(`Unhandled error: ${err.message}`);
  process.exit(1);
});
