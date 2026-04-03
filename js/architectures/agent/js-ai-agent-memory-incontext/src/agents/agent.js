'use strict';

/*
 * agent.js — agent orchestration.
 *
 * Single phase — in-weights memory demo:
 *   Ask the model for the user's name. Because the model only has in-weights
 *   memory (knowledge from training), it has no personal data about the user
 *   and responds with "Hello World, stranger".
 *
 * System prompt: src/prompts/agent.txt
 */

const fs                = require('fs');
const path              = require('path');
const { chatCompletion } = require('../lib/api');
const logger            = require('../lib/logger');

const SYSTEM_PROMPT = fs
    .readFileSync(path.join(__dirname, '../prompts/agent.txt'), 'utf8')
    .trim();

/**
 * Ask the model for the user's name using only in-weights memory.
 *
 * @param {object} config - Config from loadConfig()
 * @param {string} prompt - User message
 * @returns {Promise<string>}
 */
async function run(config, prompt) {
    logger.step('In-weights memory demo');
    logger.info(`[Agent] Question: "${prompt}"`);

    const messages = [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user',   content: prompt },
    ];

    logger.info(`[Agent] Calling API — model: ${config.model}`);
    const result = await chatCompletion(config, messages);

    logger.result(`[Agent] Answer: "${result}"`);
    return result;
}

module.exports = { run };
