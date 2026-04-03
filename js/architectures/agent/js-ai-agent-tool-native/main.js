/**
 * main.js — entry point
 *
 * Loads configuration and hands off to the agent.
 * Input text comes from argv[2] first; config.json's "input" field as fallback.
 *
 * Usage:
 *   node main.js                  # uses config.json "input"
 *   node main.js "hello world"    # uses argv
 */

import { loadConfig } from './src/lib/config.js';
import { runAgent }   from './src/agents/agent.js';

const config = loadConfig();
const input  = process.argv[2] ?? config.input ?? 'hello world';

await runAgent(input, config);
