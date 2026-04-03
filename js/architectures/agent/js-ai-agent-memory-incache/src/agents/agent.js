'use strict';

/*
 * agent.js — agent orchestration.
 *
 * In-context memory demo:
 *   The agent maintains a growing conversation history across multiple turns.
 *   Information shared by the user in earlier messages (e.g. their name) is
 *   retained in the context window and can be recalled in later turns.
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
 * Send one turn of the conversation, carrying forward the history.
 *
 * @param {object}   config  - Config from loadConfig()
 * @param {string}   prompt  - New user message for this turn
 * @param {Array}    history - Previous [{role, content}] pairs (user + assistant)
 * @returns {Promise<{answer: string, history: Array}>}
 */
async function run(config, prompt, history = []) {
    logger.info(`[Agent] User: "${prompt}"`);

    const messages = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...history,
        { role: 'user', content: prompt },
    ];

    logger.info(`[Agent] Calling API — model: ${config.model} | context turns: ${history.length / 2}`);
    const answer = await chatCompletion(config, messages);

    logger.result(`[Agent] Assistant: "${answer}"`);

    const updatedHistory = [
        ...history,
        { role: 'user',      content: prompt },
        { role: 'assistant', content: answer  },
    ];

    return { answer, history: updatedHistory };
}

module.exports = { run };
