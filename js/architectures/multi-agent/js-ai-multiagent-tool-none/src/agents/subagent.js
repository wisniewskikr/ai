'use strict';

/*
 * subagent.js — text transformation agent.
 *
 * This agent has a single, well-defined responsibility: receive a text
 * string and return it in uppercase. It knows nothing about the caller
 * and does not care why the transformation is needed.
 *
 * Single responsibility is not just good practice — it makes agents
 * composable and independently testable.
 *
 * System prompt lives in: src/prompts/subagent.txt
 */

const fs             = require('fs');
const path           = require('path');
const { chatCompletion } = require('../lib/api');
const logger             = require('../lib/logger');

const SYSTEM_PROMPT = fs
    .readFileSync(path.join(__dirname, '../prompts/subagent.txt'), 'utf8')
    .trim();

/**
 * Transform text to uppercase via LLM.
 *
 * @param {object} config - Config object from loadConfig()
 * @param {string} text   - Input text to transform
 * @returns {Promise<string>} - Uppercased result
 */
async function run(config, text) {
    logger.info('[Subagent] Task received: text transformation');
    logger.info(`[Subagent] Input: "${text}"`);

    const messages = [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user',   content: text },
    ];

    logger.debug(`[Subagent] Calling API — model: ${config.model}`);
    const result = await chatCompletion(config, messages);

    logger.info(`[Subagent] Output: "${result}"`);
    logger.info('[Subagent] Task complete');

    return result;
}

module.exports = { run };
