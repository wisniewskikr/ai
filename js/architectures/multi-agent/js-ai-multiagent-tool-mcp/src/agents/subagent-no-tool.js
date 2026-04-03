'use strict';

/*
 * subagent-no-tool.js — text transformation via pure LLM, zero tools.
 *
 * Asks the model to uppercase the input directly. No function calls, no
 * external services — just a system prompt and a user message. This is the
 * baseline: if LLM-only and MCP-tool paths give the same answer, the
 * plumbing is working correctly.
 *
 * System prompt: src/prompts/subagent-no-tool.txt
 */

const fs                 = require('fs');
const path               = require('path');
const { chatCompletion } = require('../lib/api');
const logger             = require('../lib/logger');

const SYSTEM_PROMPT = fs
    .readFileSync(path.join(__dirname, '../prompts/subagent-no-tool.txt'), 'utf8')
    .trim();

/**
 * Transform text to uppercase via LLM, no tools.
 *
 * @param {object} config - Config from loadConfig()
 * @param {string} text   - Text to transform
 * @returns {Promise<string>} - Uppercased result
 */
async function run(config, text) {
    logger.info('[SubagentNoTool] Task received: uppercase via LLM only');
    logger.info(`[SubagentNoTool] Input: "${text}"`);

    const messages = [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user',   content: text },
    ];

    logger.debug(`[SubagentNoTool] Calling API — model: ${config.model}`);
    const result = await chatCompletion(config, messages);

    logger.info(`[SubagentNoTool] Output: "${result}"`);
    logger.info('[SubagentNoTool] Task complete');

    return result;
}

module.exports = { run };
