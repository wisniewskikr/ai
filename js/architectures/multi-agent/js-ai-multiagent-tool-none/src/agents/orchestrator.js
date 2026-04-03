'use strict';

/*
 * orchestrator.js — main agent responsible for task planning and delegation.
 *
 * The orchestrator is itself LLM-powered: it receives a task, decides how
 * to handle it, and routes work to the appropriate subagent. In this project
 * there is one subagent (text-transformer), but the pattern is intentionally
 * general — adding new capabilities means adding new agents and updating the
 * orchestrator's system prompt to know about them.
 *
 * No tools are used. Agent-to-agent communication is explicit function calls
 * in code — clear, debuggable, and easy to trace in logs.
 *
 * System prompt lives in: src/prompts/orchestrator.txt
 */

const fs                 = require('fs');
const path               = require('path');
const { chatCompletion } = require('../lib/api');
const subagent           = require('./subagent');
const logger             = require('../lib/logger');

const SYSTEM_PROMPT = fs
    .readFileSync(path.join(__dirname, '../prompts/orchestrator.txt'), 'utf8')
    .trim();

/**
 * Run the orchestration pipeline.
 *
 * @param {object} config        - Config object from loadConfig()
 * @param {string} config.input  - Input text from config.json
 * @returns {Promise<string>}    - Final transformed result
 */
async function run(config) {
    const { input } = config;

    logger.info('[Orchestrator] Starting');
    logger.info(`[Orchestrator] Task: "${input}"`);

    /* Step 1: ask the LLM orchestrator to plan the task */
    const planMessages = [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user',   content: `Task: convert this text to uppercase — "${input}"` },
    ];

    logger.debug('[Orchestrator] Requesting task plan from LLM');
    const plan = await chatCompletion(config, planMessages);
    logger.info(`[Orchestrator] Plan: ${plan}`);

    /* Step 2: execute the plan — delegate to text-transformer subagent */
    logger.info('[Orchestrator] Delegating to text-transformer subagent');
    const result = await subagent.run(config, input);

    logger.info(`[Orchestrator] Pipeline complete — final result: "${result}"`);
    return result;
}

module.exports = { run };
