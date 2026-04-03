'use strict';

/*
 * orchestrator.js — main coordination agent
 *
 * Responsibilities:
 *   1. Ask the LLM to produce an execution plan (which subagents, in what order)
 *   2. Invoke subagent-no-tool  — uppercase via pure LLM reasoning
 *   3. Invoke subagent-with-tool — uppercase via native tool call
 *   4. Return both results to main.js
 *
 * Agent-to-agent communication is explicit function calls in code — clear,
 * debuggable, and easy to trace in logs. No magic dispatch or dynamic routing.
 */

const fs                 = require('fs');
const path               = require('path');
const { chatCompletion } = require('../lib/api');
const subagentNoTool     = require('./subagent-no-tool');
const subagentWithTool   = require('./subagent-with-tool');
const logger             = require('../lib/logger');

const SYSTEM_PROMPT = fs
    .readFileSync(path.join(__dirname, '../prompts/orchestrator.txt'), 'utf8')
    .trim();

async function run(config) {
    const { input } = config;

    logger.info('[Orchestrator] Starting');
    logger.info(`[Orchestrator] Task: convert "${input}" to uppercase`);

    /* Step 1: ask the LLM for an execution plan */
    const planMessages = [
        { role: 'system', content: SYSTEM_PROMPT },
        {
            role:    'user',
            content: `Task: convert to uppercase using all available subagents — "${input}"`,
        },
    ];

    logger.debug('[Orchestrator] Requesting execution plan from LLM');
    const plan = await chatCompletion(config, planMessages);
    logger.info(`[Orchestrator] Plan: ${plan}`);

    /* Step 2: delegate to the no-tool subagent */
    logger.info('[Orchestrator] Delegating to subagent-no-tool');
    const resultNoTool = await subagentNoTool.run(config, input);
    logger.info(`[Orchestrator] subagent-no-tool returned: "${resultNoTool}"`);

    /* Step 3: delegate to the native-tool subagent */
    logger.info('[Orchestrator] Delegating to subagent-with-tool');
    const resultWithTool = await subagentWithTool.run(config, input);
    logger.info(`[Orchestrator] subagent-with-tool returned: "${resultWithTool}"`);

    logger.info('[Orchestrator] All subagents finished — pipeline complete');

    return { noTool: resultNoTool, withTool: resultWithTool };
}

module.exports = { run };
