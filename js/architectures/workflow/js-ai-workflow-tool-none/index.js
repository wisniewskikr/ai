/**
 * Hello World — AI Workflow (no tools)
 * Architecture: Workflow (sequential nodes, no branching tools)
 *
 * Workflow nodes:
 *   1. loadConfig      — read config.json + .env
 *   2. validateInput   — verify prompt and API key are present
 *   3. programmatic    — convert prompt to uppercase via JS
 *   4. aiTransform     — convert prompt to uppercase via AI model
 *   5. output          — display and log final results
 */

import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';
import { createLogger } from './logger.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logger = createLogger();

// ── Node 1: Load configuration ────────────────────────────────────────────────
async function loadConfig() {
  logger.step('Node 1 › Loading configuration');

  const configPath = path.join(__dirname, 'config.json');
  const raw = fs.readFileSync(configPath, 'utf-8');
  const config = JSON.parse(raw);

  const apiKey = process.env.OPENROUTER_API_KEY;

  logger.info(`  config.json  →  prompt : "${config.prompt}"`);
  logger.info(`  config.json  →  model  : ${config.model}`);
  logger.info(`  .env         →  OPENROUTER_API_KEY : ${apiKey ? '***' + apiKey.slice(-4) : 'NOT SET'}`);

  return { prompt: config.prompt, model: config.model, apiKey };
}

// ── Node 2: Validate input ────────────────────────────────────────────────────
async function validateInput({ prompt, model, apiKey }) {
  logger.step('Node 2 › Validating input');

  if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
    throw new Error('config.json › "prompt" is missing or empty.');
  }
  if (!model || typeof model !== 'string') {
    throw new Error('config.json › "model" is missing or invalid.');
  }
  if (!apiKey) {
    throw new Error('.env › OPENROUTER_API_KEY is not set.');
  }

  logger.success('  All inputs are valid.');
  return { prompt: prompt.trim(), model, apiKey };
}

// ── Node 3: Programmatic uppercase ───────────────────────────────────────────
async function programmaticUppercase({ prompt, ...rest }) {
  logger.step('Node 3 › Converting to uppercase programmatically');

  const result = prompt.toUpperCase();

  logger.info(`  Input  : "${prompt}"`);
  logger.success(`  Output : "${result}"`);

  return { prompt, programmaticResult: result, ...rest };
}

// ── Node 4: AI-based uppercase ────────────────────────────────────────────────
async function aiUppercase({ prompt, model, apiKey, ...rest }) {
  logger.step('Node 4 › Converting to uppercase using AI model');
  logger.info(`  Sending request to model: ${model}`);

  const client = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey,
  });

  const systemPrompt =
    'You are a text transformation assistant. ' +
    'Convert the user\'s input to uppercase. ' +
    'Return ONLY the uppercased text — no explanations, no punctuation changes.';

  const response = await client.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user',   content: prompt },
    ],
    temperature: 0,
  });

  const aiResult = response.choices[0].message.content.trim();
  const usage = response.usage;

  logger.info(`  Tokens used  →  prompt: ${usage?.prompt_tokens ?? '?'}, completion: ${usage?.completion_tokens ?? '?'}`);
  logger.success(`  Output : "${aiResult}"`);

  return { prompt, model, apiKey, aiResult, ...rest };
}

// ── Node 5: Output results ────────────────────────────────────────────────────
async function outputResults({ prompt, programmaticResult, aiResult }) {
  logger.step('Node 5 › Final results');

  logger.divider();
  logger.info(`  Original input       : "${prompt}"`);
  logger.success(`  Programmatic result  : "${programmaticResult}"`);
  logger.success(`  AI model result      : "${aiResult}"`);
  logger.divider();
  logger.info(`  Log file saved to    : ${logger.logFile}`);

  return { programmaticResult, aiResult };
}

// ── Workflow runner ───────────────────────────────────────────────────────────
async function runWorkflow() {
  logger.divider();
  logger.step('Workflow START — Hello World (uppercase transformation)');
  logger.divider();

  const config       = await loadConfig();
  const validated    = await validateInput(config);
  const withProgram  = await programmaticUppercase(validated);
  const withAI       = await aiUppercase(withProgram);
  const results      = await outputResults(withAI);

  logger.divider();
  logger.step('Workflow END — completed successfully');
  logger.divider();

  return results;
}

runWorkflow().catch((err) => {
  logger.error(`Workflow failed: ${err.message}`);
  process.exit(1);
});
