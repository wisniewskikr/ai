'use strict';

/*
 * orchestrator.js — supervise the agent and manage the run lifecycle.
 *
 * Responsibilities:
 *   - Load the task prompt.
 *   - Ensure the workspace directory exists.
 *   - Hand the task to the agent.
 *   - Log every run event (approvals, results).
 *   - Report the final outcome.
 *
 * Evaluation is performed by a human (human-as-judge): after the file is written,
 * the human decides whether the output meets their expectations.
 */

const fs             = require('fs');
const path           = require('path');
const logger         = require('../libs/logger');
const { runAgent }   = require('./agent');
const { runEval }    = require('../eval/evaluator');

const TASK        = fs.readFileSync(path.join(__dirname, '../prompts/orchestrator.txt'), 'utf8').trim();
const WORKSPACE   = path.join(process.cwd(), 'workspace');
const OUTPUT_FILE = 'workspace/output.txt';

/* ------------------------------------------------------------------ */

async function run(config) {
    fs.mkdirSync(WORKSPACE, { recursive: true });

    logger.step('[Orchestrator] Assigning task to agent');
    logger.info(`Task: ${TASK.replaceAll('\n', ' ')}`);
    logger.info('[Orchestrator] Eval mode: human-as-judge');
    logger.separator();

    const writtenContent = await runAgent(config, TASK);

    logger.separator();
    logger.step('[Orchestrator] Agent completed task');
    logger.result(`Output file  : ${OUTPUT_FILE}`);
    logger.result(`File content : "${writtenContent}"`);

    const allPassed = await runEval();

    logger.separator();
    logger.info(`[Orchestrator] Run finished — eval ${allPassed ? 'PASSED' : 'FAILED'}`);
}

/* ------------------------------------------------------------------ */

module.exports = { run };
