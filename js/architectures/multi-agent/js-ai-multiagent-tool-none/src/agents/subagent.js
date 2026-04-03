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
 */

const { chatCompletion } = require('../lib/api');
const logger             = require('../lib/logger');

const SYSTEM_PROMPT = `\
You are a text transformation agent. Your sole responsibility is to convert \
the user's input to uppercase. Return ONLY the uppercase text — no explanation, \
no surrounding quotes, no extra words.`;

/**
 * Transform text to uppercase via LLM.
 *
 * @param {string} apiKey - OpenRouter API key
 * @param {string} model  - Model identifier
 * @param {string} text   - Input text to transform
 * @returns {Promise<string>} - Uppercased result
 */
async function run(apiKey, model, text) {
    logger.info('[Subagent] Task received: text transformation');
    logger.info(`[Subagent] Input: "${text}"`);

    const messages = [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user',   content: text },
    ];

    logger.debug(`[Subagent] Calling API — model: ${model}`);
    const result = await chatCompletion(apiKey, model, messages);

    logger.info(`[Subagent] Output: "${result}"`);
    logger.info('[Subagent] Task complete');

    return result;
}

module.exports = { run };
