'use strict';

/*
 * subagent-no-tool.js — text transformation without tools
 *
 * Asks the LLM to uppercase the input using pure reasoning.
 * No function calling, no external tools — the model does it alone.
 */

const fs                 = require('fs');
const path               = require('path');
const { chatCompletion } = require('../lib/api');
const logger             = require('../lib/logger');

const SYSTEM_PROMPT = fs
    .readFileSync(path.join(__dirname, '../prompts/subagent-no-tool.txt'), 'utf8')
    .trim();

async function run(config, text) {
    logger.info('[Subagent-NoTool] Task received: uppercase via pure LLM reasoning');
    logger.info(`[Subagent-NoTool] Input: "${text}"`);

    const messages = [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user',   content: text },
    ];

    logger.debug(`[Subagent-NoTool] Calling LLM — model: ${config.model}`);
    const result = await chatCompletion(config, messages);

    logger.info(`[Subagent-NoTool] Output: "${result}"`);
    logger.info('[Subagent-NoTool] Task complete');

    return result;
}

module.exports = { run };
