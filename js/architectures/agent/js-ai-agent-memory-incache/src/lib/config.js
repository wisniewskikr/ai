'use strict';

/*
 * config.js — load and validate all external configuration.
 *
 * Reads config.json from the project root and ANTHROPIC_API_KEY from .env.
 * Fails fast if anything required is missing.
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

    const { model, maxTokens, temperature } = parsed;

    if (!model) throw new Error('config.json is missing required field: "model"');

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not set in .env');

    return {
        model,
        maxTokens:   maxTokens   ?? 1024,
        temperature: temperature ?? 0,
        apiKey,
    };
}

module.exports = { loadConfig };
