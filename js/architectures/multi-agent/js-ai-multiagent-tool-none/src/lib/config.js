'use strict';

/*
 * config.js — load and validate all external configuration.
 *
 * Reads .env first (via dotenv), then config.json.
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

    const { prompt, model } = parsed;

    if (!prompt) throw new Error('config.json is missing required field: "prompt"');
    if (!model)  throw new Error('config.json is missing required field: "model"');

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey)  throw new Error('OPENROUTER_API_KEY is not set in .env');

    return { prompt, model, apiKey };
}

module.exports = { loadConfig };
