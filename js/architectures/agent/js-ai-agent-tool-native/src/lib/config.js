/**
 * config.js
 *
 * Loads and validates application configuration.
 * Reads config.json from the project root and injects environment variables via dotenv.
 */

import 'dotenv/config';
import { readFileSync } from 'fs';

/**
 * Reads config.json from the current working directory and returns the merged config.
 *
 * @returns {object} Validated configuration object.
 */
export function loadConfig() {
    const config = JSON.parse(readFileSync('./config.json', 'utf8'));

    if (!config.model)     throw new Error('config.json: "model" is required');
    if (!config.maxTokens) throw new Error('config.json: "maxTokens" is required');

    return config;
}
