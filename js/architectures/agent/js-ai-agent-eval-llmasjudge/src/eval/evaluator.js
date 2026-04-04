'use strict';

/*
 * evaluator.js — LLM-as-judge evaluation of the agent's output.
 *
 * Flow:
 *   1. Verify that the output file exists and is readable.
 *   2. Send the file content to an LLM judge with an evaluation rubric.
 *   3. Parse the structured verdict (PASS / FAIL + reasoning).
 *   4. Log the result clearly to console and to the daily log file.
 *
 * The LLM judge is asked to verify:
 *   - The content contains the phrase "Hello World".
 *   - A name (at least one word) follows "Hello World".
 */

const fs              = require('fs');
const path            = require('path');
const logger          = require('../libs/logger');
const { chatWithTools } = require('../libs/api');

const OUTPUT_FILE = path.join(process.cwd(), 'workspace', 'output.txt');

/* ------------------------------------------------------------------ */
/* LLM judge prompt                                                     */
/* ------------------------------------------------------------------ */

const JUDGE_SYSTEM = `You are an automated test evaluator.
Your task is to check whether a text file meets the required criteria.
Always respond with valid JSON — no markdown fences, no extra text.`;

function buildJudgePrompt(content) {
    return `You are evaluating the following file content:

===FILE CONTENT START===
${content}
===FILE CONTENT END===

Evaluate the content against these two criteria:

CRITERION 1 — "Hello World" present:
  Check whether the text contains the substring "Hello World" (case-insensitive).

CRITERION 2 — Name present after "Hello World":
  After the "Hello World" substring, is there at least one word made entirely of
  letters (A-Z, a-z)?  The word may be separated from "Hello World" by a comma,
  space, exclamation mark, or any punctuation.
  EXAMPLES that PASS criterion 2:
    - "Hello World, Alice!"  → name = "Alice"
    - "Hello World Zephyra"  → name = "Zephyra"
    - "Hello World, Bob."    → name = "Bob"
  EXAMPLES that FAIL criterion 2:
    - "Hello World"          → no name follows
    - "Hello World, 123"     → no letter-only word follows

Now evaluate the FILE CONTENT shown above and respond with ONLY a valid JSON object
(no markdown, no extra text):
{
  "criteria_1_hello_world": true or false,
  "criteria_2_name_present": true or false,
  "name_found": "<the first letter-only word after Hello World, or null>",
  "verdict": "PASS" or "FAIL",
  "reasoning": "<one sentence explaining your decision>"
}`;
}

/* ------------------------------------------------------------------ */
/* JSON extraction (handles occasional markdown fences from models)    */
/* ------------------------------------------------------------------ */

function extractJson(raw) {
    // Strip ```json ... ``` or ``` ... ``` wrappers if present
    const stripped = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
    return JSON.parse(stripped);
}

/* ------------------------------------------------------------------ */

async function runEval(config) {
    logger.separator();
    logger.step('[Evaluator] Running LLM-as-judge evaluation on agent output');

    /* ── Step 1: file must exist ─────────────────────────────────── */
    let content;
    try {
        content = fs.readFileSync(OUTPUT_FILE, 'utf8').trim();
        logger.pass(`Output file exists — ${OUTPUT_FILE}`);
        logger.info(`File content: "${content}"`);
    } catch (err) {
        logger.fail(`Output file not found: ${err.message}`);
        logger.evalSummary(0, 1);
        return false;
    }

    /* ── Step 2: call the LLM judge ─────────────────────────────── */
    logger.separator();
    logger.step('[LLM Judge] Sending file content to judge model for evaluation');
    logger.info(`Judge model: ${config.model}`);

    const messages = [
        { role: 'system', content: JUDGE_SYSTEM },
        { role: 'user',   content: buildJudgePrompt(content) },
    ];

    let judgment;
    try {
        const response = await chatWithTools(config, messages, []);
        const raw = response.message.content ?? '';

        logger.info(`[LLM Judge] Raw response: ${raw.replace(/\n/g, ' ')}`);

        judgment = extractJson(raw);
    } catch (err) {
        logger.fail(`[LLM Judge] Failed to get or parse judge response: ${err.message}`);
        logger.evalSummary(0, 1);
        return false;
    }

    /* ── Step 3: log the structured verdict ─────────────────────── */
    logger.separator();
    logger.step('[LLM Judge] Evaluation result');

    const c1 = judgment.criteria_1_hello_world === true;
    const c2 = judgment.criteria_2_name_present === true;

    if (c1) {
        logger.pass('Criteria 1 — contains "Hello World"');
    } else {
        logger.fail('Criteria 1 — contains "Hello World"');
    }

    if (c2) {
        logger.pass(`Criteria 2 — name present after "Hello World": "${judgment.name_found}"`);
    } else {
        logger.fail(`Criteria 2 — name not found after "Hello World"`);
    }

    logger.result(`Judge reasoning : ${judgment.reasoning}`);
    logger.result(`Name detected   : ${judgment.name_found ?? '(none)'}`);
    logger.result(`Verdict         : ${judgment.verdict}`);

    const allPassed = judgment.verdict === 'PASS';
    logger.evalSummary(allPassed ? 1 : 0, 1);
    return allPassed;
}

/* ------------------------------------------------------------------ */

module.exports = { runEval };
