'use strict';

/*
 * orchestrator.js — HOTL run lifecycle manager.
 *
 * Responsibilities:
 *   - Present the human-on-the-loop monitoring interface.
 *   - Listen for an Enter key press and set the interrupt flag.
 *   - Start the agent and wait for it to finish (or be interrupted).
 *   - Report the final outcome.
 *
 * Human-on-the-loop means the human is NOT required to approve each
 * action — the agent runs autonomously.  The human only intervenes
 * if they want to stop the run early.
 */

const readline     = require('readline');
const logger       = require('../libs/logger');
const { runAgent } = require('./agent');

const OUTPUT_FILE = 'workspace/output.txt';

/* ------------------------------------------------------------------ */

async function run(config) {
    logger.step('[Orchestrator] Supervision mode: HUMAN-ON-THE-LOOP (HOTL)');
    logger.info('[Orchestrator] Agent will act fully autonomously');
    logger.info('[Orchestrator] You are monitoring — press Enter to interrupt at any time');
    logger.separator();

    /*
     * Shared oversight object.
     * The readline listener below sets `interrupted = true` when the
     * human presses Enter.  The agent reads this flag after every write.
     */
    const oversight = { interrupted: false };

    const rl = readline.createInterface({ input: process.stdin });

    rl.once('line', () => {
        oversight.interrupted = true;
        logger.info('[Oversight] Human requested interrupt — flagging agent');
        rl.close();
    });

    /* Run the agent; it will finish on its own or when interrupted */
    const written = await runAgent(config, oversight);

    /* Clean up readline in case the agent finished before any input */
    rl.close();

    logger.separator();

    if (oversight.interrupted) {
        logger.step('[Orchestrator] Run interrupted by human');
        logger.result(`Greetings written before interrupt : ${written}`);
        logger.result(`Output file                        : ${OUTPUT_FILE}`);
        logger.info('[Orchestrator] Partial output was saved to the file');
    } else {
        logger.step('[Orchestrator] Agent completed task autonomously');
        logger.result(`Output file      : ${OUTPUT_FILE}`);
        logger.result(`Greetings written: ${written}`);
        logger.info('[Orchestrator] All greetings written successfully');
    }

    logger.info('[Orchestrator] Application exiting');
}

/* ------------------------------------------------------------------ */

module.exports = { run };
