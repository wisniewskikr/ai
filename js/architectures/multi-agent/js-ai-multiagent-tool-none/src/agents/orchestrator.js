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
 */

const { chatCompletion } = require('../lib/api');
const subagent           = require('./subagent');
const logger             = require('../lib/logger');

const SYSTEM_PROMPT = `\
You are an orchestrator agent. Your job is to analyze incoming tasks and \
describe which subagent should handle them. Available subagents:

  - text-transformer: converts text to uppercase

Respond with a brief one-line plan describing what you will delegate and why. \
Be concise and direct.`;

/**
 * Run the orchestration pipeline.
 *
 * @param {object} config         - Validated config object
 * @param {string} config.apiKey  - OpenRouter API key
 * @param {string} config.model   - Model identifier
 * @param {string} config.prompt  - Input text from config.json
 * @returns {Promise<string>}     - Final transformed result
 */
async function run(config) {
    const { apiKey, model, prompt } = config;

    logger.info('[Orchestrator] Starting');
    logger.info(`[Orchestrator] Task: "${prompt}"`);

    /* Step 1: ask the LLM orchestrator to plan the task */
    const planMessages = [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user',   content: `Task: convert this text to uppercase — "${prompt}"` },
    ];

    logger.debug('[Orchestrator] Requesting task plan from LLM');
    const plan = await chatCompletion(apiKey, model, planMessages);
    logger.info(`[Orchestrator] Plan: ${plan}`);

    /* Step 2: execute the plan — delegate to text-transformer subagent */
    logger.info('[Orchestrator] Delegating to text-transformer subagent');
    const result = await subagent.run(apiKey, model, prompt);

    logger.info(`[Orchestrator] Pipeline complete — final result: "${result}"`);
    return result;
}

module.exports = { run };
