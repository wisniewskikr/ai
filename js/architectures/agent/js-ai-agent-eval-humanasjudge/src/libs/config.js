'use strict';

/*
 * config.js — load and validate runtime configuration.
 *
 * Reads config.json from the project root and OPENROUTER_API_KEY from the
 * environment (via .env).  Fails fast with a clear message if anything is
 * missing — better to die at startup than to crash mid-run.
 */

require('dotenv').config();

const fs   = require('fs');
const path = require('path');

function loadConfig() {
    const configPath = path.join(process.cwd(), 'config.json');
    let raw;

    try {
        raw = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    } catch (err) {
        throw new Error(`Cannot read config.json: ${err.message}`);
    }

    const { model, maxTokens, baseUrl } = raw;

    if (!model)   throw new Error('config.json: missing required field "model"');
    if (!baseUrl) throw new Error('config.json: missing required field "baseUrl"');

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) throw new Error('.env: OPENROUTER_API_KEY is not set');

    return {
        model,
        maxTokens: maxTokens ?? 1024,
        baseUrl,
        apiKey,
    };
}

module.exports = { loadConfig };
