'use strict';

/*
 * evaluator.js — automated tests that verify the agent's output.
 *
 * Tests:
 *   1. Output file exists and is readable.
 *   2. Content contains "Hello World".
 *   3. Content contains a name after "Hello World" (non-empty word).
 *
 * Results are logged at PASS / FAIL level and saved to the daily log file.
 */

const fs     = require('fs');
const path   = require('path');
const logger = require('../libs/logger');

const OUTPUT_FILE = path.join(process.cwd(), 'workspace', 'output.txt');

/* ------------------------------------------------------------------ */

const TESTS = [
    {
        name: 'Content contains "Hello World"',
        run(content) {
            const ok = content.includes('Hello World');
            return { pass: ok, detail: ok ? null : `Got: "${content}"` };
        },
    },
    {
        name: 'Content contains a name after "Hello World"',
        run(content) {
            // Matches: "Hello World, <name>" or "Hello World <name>"
            const match = content.match(/Hello World[,\s]+([A-Za-z]+)/i);
            const name  = match ? match[1] : null;
            return {
                pass:   !!name,
                detail: name ? `Name found: "${name}"` : `Pattern not matched in: "${content}"`,
            };
        },
    },
];

/* ------------------------------------------------------------------ */

async function runEval() {
    logger.separator();
    logger.step('[Evaluator] Running automated tests on agent output');

    /* ── Test 0: file must exist ─────────────────────────────────── */
    let content;
    try {
        content = fs.readFileSync(OUTPUT_FILE, 'utf8').trim();
        logger.pass(`Output file exists (${OUTPUT_FILE})`);
    } catch (err) {
        logger.fail(`Output file exists → file not found: ${err.message}`);
        logger.evalSummary(0, TESTS.length + 1);
        return false;
    }

    /* ── Tests 1-N: content assertions ─────────────────────────── */
    let passed = 1;   // file-exists test already passed

    for (const test of TESTS) {
        const { pass, detail } = test.run(content);
        const suffix = detail ? ` — ${detail}` : '';
        if (pass) {
            logger.pass(`${test.name}${suffix}`);
            passed++;
        } else {
            logger.fail(`${test.name}${suffix}`);
        }
    }

    logger.evalSummary(passed, TESTS.length + 1);
    return passed === TESTS.length + 1;
}

/* ------------------------------------------------------------------ */

module.exports = { runEval };
