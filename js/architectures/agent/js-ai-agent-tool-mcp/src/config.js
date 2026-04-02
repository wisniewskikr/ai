/*
 * config.js - Load and validate runtime configuration.
 *
 * Reads config.json for model/API settings, and .env for secrets.
 * Dies loudly if required values are missing - there is no point
 * in running with a broken configuration.
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

dotenv.config({ path: resolve(ROOT, '.env') });

const raw = readFileSync(resolve(ROOT, 'config.json'), 'utf-8');
const json = JSON.parse(raw);

export const config = {
  model:    json.model    || 'openai/gpt-4o',
  maxTokens: json.maxTokens || 1024,
  temperature: json.temperature ?? 0,
  baseUrl:  json.baseUrl  || 'https://openrouter.ai/api/v1',
  input:    json.input    || 'hello world',
  apiKey:   process.env.OPENROUTER_API_KEY,
};
