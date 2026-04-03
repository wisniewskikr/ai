'use strict';

/*
 * orchestrator.js — plans the task and delegates to both subagents.
 *
 * The orchestrator is LLM-powered: it receives the task, asks the model
 * for a delegation plan, then explicitly calls each subagent in code.
 * Using direct function calls (not runtime tool dispatch) keeps the
 * execution path visible and trivial to trace in logs.
 *
 * Subagents:
 *   subagent-no-tool  — transforms text via LLM only
 *   subagent-mcp-tool — transforms text via LLM + MCP tool
 *
 * System prompt: src/prompts/orchestrator.txt
 */

const fs                 = require('fs');
const path               = require('path');
const { chatCompletion } = require('../lib/api');
const subagentNoTool     = require('./subagent-no-tool');
const subagentMcpTool    = require('./subagent-mcp-tool');
const logger             = require('../lib/logger');

const SYSTEM_PROMPT = fs
    .readFileSync(path.join(__dirname, '../prompts/orchestrator.txt'), 'utf8')
    .trim();

/**
 * Run the full multi-agent pipeline.
 *
 * @param {object} config       - Config from loadConfig()
 * @param {string} config.input - Input text from config.json
 * @returns {Promise<{noTool: string, mcpTool: string}>}
 */
async function run(config) {
    const { input } = config;

    logger.info('[Orchestrator] Starting');
    logger.info(`[Orchestrator] Task: convert "${input}" to uppercase`);

    /* ── Step 1: ask the LLM for a delegation plan ─────────────────────── */
    const planMessages = [
        { role: 'system', content: SYSTEM_PROMPT },
        {
            role:    'user',
            content: `Task: convert this text to uppercase — "${input}"`,
        },
    ];

    logger.debug('[Orchestrator] Requesting delegation plan from LLM');
    const plan = await chatCompletion(config, planMessages);
    logger.info(`[Orchestrator] Plan:\n${plan}`);

    /* ── Step 2: delegate to subagent-no-tool ───────────────────────────── */
    logger.info('[Orchestrator] Delegating to subagent-no-tool');
    const resultNoTool = await subagentNoTool.run(config, input);
    logger.info(`[Orchestrator] subagent-no-tool result: "${resultNoTool}"`);

    /* ── Step 3: delegate to subagent-mcp-tool ──────────────────────────── */
    logger.info('[Orchestrator] Delegating to subagent-mcp-tool');
    const resultMcpTool = await subagentMcpTool.run(config, input);
    logger.info(`[Orchestrator] subagent-mcp-tool result: "${resultMcpTool}"`);

    logger.info('[Orchestrator] Pipeline complete');

    return { noTool: resultNoTool, mcpTool: resultMcpTool };
}

module.exports = { run };
