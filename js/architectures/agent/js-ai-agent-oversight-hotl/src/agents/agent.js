'use strict';

/*
 * agent.js — HOTL (Human-on-the-Loop) agent.
 *
 * Architecture: oversight pattern, human-ON-the-loop mode.
 *
 * The agent acts fully autonomously:
 *   1. Asks the model to generate N creative names (one API call).
 *   2. Writes "Hello World, <name>!" greetings to the output file,
 *      one per line, with a configurable delay between each write.
 *   3. After every write the orchestrator is notified so the human
 *      can see what happened in real-time.
 *   4. The human can press Enter at any moment — this sets
 *      oversight.interrupted = true and the agent stops after the
 *      current write finishes.
 *
 * Key difference from HITL: no per-action approval.  The human is
 * "on the loop" (observing) rather than "in the loop" (approving).
 */

const fs                  = require('fs');
const path                = require('path');
const { chatWithTools }   = require('../libs/api');
const logger              = require('../libs/logger');

const OUTPUT_FILE = path.join(process.cwd(), 'workspace', 'output.txt');

/* ------------------------------------------------------------------ */

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/*
 * interruptibleSleep(ms, oversight)
 *
 * Sleeps for `ms` milliseconds but wakes every 100 ms to check if the
 * human has requested an interrupt — so the response feels instant.
 */
async function interruptibleSleep(ms, oversight) {
    const deadline = Date.now() + ms;
    while (Date.now() < deadline) {
        if (oversight.interrupted) return;
        await sleep(100);
    }
}

/* ------------------------------------------------------------------ */

/*
 * generateNames(config, count)
 *
 * Ask the model for `count` creative first names.
 * Returns a string array.
 */
async function generateNames(config, count) {
    logger.info(`[Agent] Asking model to generate ${count} random names...`);

    const messages = [
        {
            role: 'user',
            content:
                `Generate exactly ${count} creative and diverse first names. ` +
                `Return ONLY the names, one per line, with no numbering, ` +
                `no punctuation, and no extra text.`,
        },
    ];

    const { message } = await chatWithTools(config, messages, []);

    const names = message.content
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean)
        .slice(0, count);

    logger.info(`[Agent] Names received: ${names.join(', ')}`);
    return names;
}

/* ------------------------------------------------------------------ */

/*
 * runAgent(config, oversight)
 *
 * Main agent loop.  Writes greetings autonomously until done or interrupted.
 *
 * `oversight.interrupted` is a flag set by the orchestrator when the
 * human decides to stop the run.
 *
 * Returns the number of greetings actually written.
 */
async function runAgent(config, oversight) {
    const { greetingCount, intervalSeconds } = config;

    /* Ensure workspace directory exists and start with a clean file */
    fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
    fs.writeFileSync(OUTPUT_FILE, '', 'utf8');

    /* Step 1 — use the model to generate names (single API call) */
    const names = await generateNames(config, greetingCount);

    logger.separator();
    logger.step('[Agent] Entering autonomous greeting loop');
    logger.info(`[Agent] Greetings to write : ${greetingCount}`);
    logger.info(`[Agent] Interval           : ${intervalSeconds}s`);
    logger.info(`[Oversight] Press Enter at any time to interrupt`);
    logger.separator();

    let written = 0;

    for (let i = 0; i < names.length; i++) {
        /* Check interrupt before each write */
        if (oversight.interrupted) {
            logger.info('[Oversight] Interrupt detected — agent stopping');
            break;
        }

        const line = `Hello World, ${names[i]}!`;

        /* Autonomous action — no human approval required in HOTL */
        fs.appendFileSync(OUTPUT_FILE, line + '\n', 'utf8');
        written++;

        logger.tool(`[Agent] Written (${written}/${greetingCount}): "${line}"`);
        logger.info(
            `[Oversight] File updated — ${greetingCount - written} greeting(s) remaining`,
        );

        /* Wait between writes (skip delay after the last one) */
        if (written < greetingCount && !oversight.interrupted) {
            logger.info(`[Agent] Next greeting in ${intervalSeconds}s  (Press Enter to interrupt)`);
            await interruptibleSleep(intervalSeconds * 1000, oversight);
        }
    }

    return written;
}

/* ------------------------------------------------------------------ */

module.exports = { runAgent };
