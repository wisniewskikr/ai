/**
 * index.js — entry point
 *
 * Reads config.json and .env, then hands off to the agent.
 * Input text comes from argv[2] first; config.json's "input" field as fallback.
 *
 * Usage:
 *   node index.js                  # uses config.json "input"
 *   node index.js "hello world"    # uses argv
 */

import 'dotenv/config';
import { readFileSync } from 'fs';
import { runAgent } from './src/agent.js';

const config = JSON.parse(readFileSync('./config.json', 'utf8'));
const input  = process.argv[2] ?? config.input ?? 'hello world';

await runAgent(input, config);
