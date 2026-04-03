'use strict';

/*
 * config.js — configuration loader
 *
 * Merges two sources:
 *   1. config.json  — model settings and task input (committed to repo)
 *   2. .env         — secrets such as the API key  (never committed)
 *
 * Fails fast with a clear message if anything required is missing.
 */

require('dotenv').config();

const fs   = require('fs');
const path = require('path');

function loadConfig() {
    const configPath = path.join(process.cwd(), 'config.json');

    if (!fs.existsSync(configPath)) {
        throw new Error(`config.json not found at: ${configPath}`);
    }

    let parsed;
    try {
        parsed = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    } catch (err) {
        throw new Error(`Failed to parse config.json: ${err.message}`);
    }

    const { input, model, baseUrl, maxTokens, temperature } = parsed;

    if (!input)   throw new Error('config.json is missing required field: "input"');
    if (!model)   throw new Error('config.json is missing required field: "model"');
    if (!baseUrl) throw new Error('config.json is missing required field: "baseUrl"');

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey)  throw new Error('OPENROUTER_API_KEY is not set in .env');

    return {
        input,
        model,
        baseUrl,
        maxTokens:   maxTokens   ?? 1024,
        temperature: temperature ?? 0,
        apiKey,
    };
}

module.exports = { loadConfig };
