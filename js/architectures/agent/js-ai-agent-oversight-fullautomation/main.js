'use strict';

/*
 * main.js — entry point.
 *
 * Orchestrator responsibilities (this file):
 *   - Load and validate configuration.
 *   - Define the task and hand it to the agent.
 *   - Log every oversight event (approvals, results).
 *   - Report the final outcome.
 *
 * The agent (src/agent.js) is the worker.  The orchestrator is the
 * supervisor.  In full-automation mode the orchestrator approves every
 * agent action automatically — no human in the loop.
 *
 * Usage:
 *   node main.js
 */

const path             = require('path');
const fs               = require('fs');
const { loadConfig }   = require('./src/libs/config');
const logger           = require('./src/libs/logger');
const { runAgent }     = require('./src/agents/agent');

/* ------------------------------------------------------------------ */

async function main() {
    logger.banner('AI Agent Oversight — Full Automation Mode');

    /* ---- Configuration ------------------------------------------- */

    let config;
    try {
        config = loadConfig();
    } catch (err) {
        logger.error(`Configuration: ${err.message}`);
        process.exit(1);
    }

    logger.info(`Model    : ${config.model}`);
    logger.info(`Max tokens: ${config.maxTokens}`);
    logger.info(`Name     : ${config.name}`);
    logger.separator();

    /* ---- Workspace ------------------------------------------------ */

    const workspaceDir  = path.join(process.cwd(), 'workspace');
    const outputFile    = path.join(workspaceDir, 'output.txt');

    fs.mkdirSync(workspaceDir, { recursive: true });

    /* ---- Task definition (Orchestrator → Agent) ------------------- */

    const task =
        `Write exactly this text to the file workspace/output.txt:\n` +
        `Hello World, ${config.name}!`;

    logger.step('[Orchestrator] Assigning task to agent');
    logger.info(`Task: ${task.replace('\n', ' ')}`);
    logger.info('[Orchestrator] Supervision mode: full-automation (all actions auto-approved)');
    logger.separator();

    /* ---- Run agent ------------------------------------------------ */

    let writtenContent;
    try {
        writtenContent = await runAgent(config, task);
    } catch (err) {
        logger.error(`Agent failed: ${err.message}`);
        process.exit(1);
    }

    /* ---- Report --------------------------------------------------- */

    logger.separator();
    logger.step('[Orchestrator] Agent completed task');
    logger.result(`Output file  : workspace/output.txt`);
    logger.result(`File content : "${writtenContent}"`);
    logger.info('[Orchestrator] Run finished successfully');
}

/* ------------------------------------------------------------------ */

main().catch((err) => {
    logger.error(`Unhandled error: ${err.message}`);
    process.exit(1);
});
