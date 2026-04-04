'use strict';

/*
 * orchestrator.js — supervise the agent and manage the run lifecycle.
 *
 * Responsibilities:
 *   - Load the task prompt.
 *   - Ensure the workspace directory exists.
 *   - Hand the task to the agent.
 *   - Log every oversight event (approvals, results).
 *   - Report the final outcome.
 *
 * In full-automation mode every agent action is approved automatically.
 * In a supervised mode this is where a human would be asked to approve
 * each tool call before it is executed.
 */

const fs             = require('fs');
const path           = require('path');
const logger         = require('../libs/logger');
const { runAgent }   = require('./agent');

const TASK        = fs.readFileSync(path.join(__dirname, '../prompts/orchestrator.txt'), 'utf8').trim();
const WORKSPACE   = path.join(process.cwd(), 'workspace');
const OUTPUT_FILE = 'workspace/output.txt';

/* ------------------------------------------------------------------ */

async function run(config) {
    fs.mkdirSync(WORKSPACE, { recursive: true });

    logger.step('[Orchestrator] Assigning task to agent');
    logger.info(`Task: ${TASK.replaceAll('\n', ' ')}`);
    logger.info('[Orchestrator] Supervision mode: human-in-the-loop (actions require human approval)');
    logger.separator();

    const writtenContent = await runAgent(config, TASK);

    logger.separator();

    if (writtenContent === null) {
        logger.step('[Orchestrator] Task cancelled by human');
        logger.info('[Orchestrator] No file was written');
        return;
    }

    logger.step('[Orchestrator] Agent completed task');
    logger.result(`Output file  : ${OUTPUT_FILE}`);
    logger.result(`File content : "${writtenContent}"`);
    logger.info('[Orchestrator] Run finished successfully');
}

/* ------------------------------------------------------------------ */

module.exports = { run };
