'use strict';

/*
 * evaluator.js — human-as-judge evaluation of the agent's output.
 *
 * Flow:
 *   1. Read workspace/output.txt.
 *   2. Display the content to the human evaluator.
 *   3. Ask: does this meet your expectations? (yes / no)
 *   4. If yes  → file stays, evaluation passes.
 *   5. If no   → file is deleted, evaluation fails.
 */

const fs       = require('fs');
const path     = require('path');
const readline = require('readline');
const logger   = require('../libs/logger');

const OUTPUT_FILE = path.join(process.cwd(), 'workspace', 'output.txt');

/* ------------------------------------------------------------------ */

function askHuman(question) {
    const rl = readline.createInterface({
        input:  process.stdin,
        output: process.stdout,
    });

    return new Promise(resolve => {
        rl.question(question, answer => {
            rl.close();
            resolve(answer.trim().toLowerCase());
        });
    });
}

/* ------------------------------------------------------------------ */

async function runEval() {
    logger.separator();
    logger.step('[Evaluator] Human-as-judge evaluation');

    /* ── Step 1: read the output file ─────────────────────────────── */
    let content;
    try {
        content = fs.readFileSync(OUTPUT_FILE, 'utf8').trim();
        logger.pass(`Output file exists (${OUTPUT_FILE})`);
    } catch (err) {
        logger.fail(`Output file not found: ${err.message}`);
        logger.evalSummary(0, 1);
        return false;
    }

    /* ── Step 2: show content to the human ────────────────────────── */
    logger.separator();
    logger.result(`File content : "${content}"`);
    logger.separator();

    /* ── Step 3: ask for human verdict ────────────────────────────── */
    const answer = await askHuman('Does this meet your expectations? [yes/no]: ');
    const approved = answer === 'yes' || answer === 'y';

    /* ── Step 4: act on the verdict ───────────────────────────────── */
    if (approved) {
        logger.pass('Human approved — file kept');
        logger.evalSummary(1, 1);
        return true;
    } else {
        logger.fail('Human rejected — file deleted');
        try {
            fs.unlinkSync(OUTPUT_FILE);
            logger.info(`Deleted: ${OUTPUT_FILE}`);
        } catch (err) {
            logger.warn(`Could not delete file: ${err.message}`);
        }
        logger.evalSummary(0, 1);
        return false;
    }
}

/* ------------------------------------------------------------------ */

module.exports = { runEval };
