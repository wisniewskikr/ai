'use strict';

/*
 * agent.js — autonomous agent that executes tasks using tools.
 *
 * Architecture: oversight pattern, human-in-the-loop (HITL) mode.
 *
 * The agent runs an agentic loop:
 *   1. Send task + message history to the model.
 *   2. If the model stops with "tool_calls", the oversight checkpoint
 *      pauses and asks the human to approve each tool call before
 *      execution.  If approved, the result is fed back (loop continues).
 *      If rejected, the task is cancelled immediately.
 *   3. If the model stops with "stop", the task is complete.
 *
 * The agent is intentionally stateless: all state lives in the `messages`
 * array that grows with each turn of the loop.
 */

const fs                       = require('fs');
const path                     = require('path');
const readline                 = require('readline');
const { chatWithTools }        = require('../libs/api');
const logger                   = require('../libs/logger');
const { definitions, execute } = require('../tools/tools');

/* ------------------------------------------------------------------ */

const SYSTEM_PROMPT = fs
    .readFileSync(path.join(__dirname, '../prompts/agent.txt'), 'utf8')
    .trim();

/* ------------------------------------------------------------------ */

/*
 * askHuman(question) — prompt the human and return the trimmed answer.
 */
function askHuman(question) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            rl.close();
            resolve(answer.trim().toLowerCase());
        });
    });
}

/* ------------------------------------------------------------------ */

/*
 * runAgent(config, task) — run the agent until the task is complete.
 *
 * Returns the text content written to the output file, or null if the
 * human rejected the action.
 */
async function runAgent(config, task) {
    const messages = [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user',   content: task },
    ];

    let writtenContent = '';

    logger.step('[Agent] Entering agentic loop');

    for (;;) {
        logger.info('[Agent] Sending request to model...');

        const { message, finish_reason, tool_calls } =
            await chatWithTools(config, messages, definitions);

        logger.info(`[Agent] Stop reason: ${finish_reason}`);

        /* ---------------------------------------------------------- */
        /* Task complete                                               */
        /* ---------------------------------------------------------- */

        if (finish_reason === 'stop') {
            if (message.content) logger.info(`[Agent] Final message: ${message.content}`);
            break;
        }

        /* ---------------------------------------------------------- */
        /* Model wants to call tools                                   */
        /* ---------------------------------------------------------- */

        if (finish_reason !== 'tool_calls') {
            throw new Error(`Unexpected stop reason: "${finish_reason}"`);
        }

        /* Append the full assistant turn to message history */
        messages.push(message);

        /* Process each tool call */
        for (const call of tool_calls) {
            const name = call.function.name;
            const args = JSON.parse(call.function.arguments);

            logger.tool(`[Agent] Tool call : ${name}`);
            logger.tool(`[Agent] Arguments : ${JSON.stringify(args)}`);

            /*
             * Oversight checkpoint — HUMAN-IN-THE-LOOP.
             *
             * Pause and ask the human to approve every tool call before
             * it is executed.  A rejection cancels the task immediately.
             */
            logger.info('[Oversight] HUMAN-IN-THE-LOOP — awaiting human approval');

            if (name === 'write_file') {
                logger.info(`[Oversight] Agent wants to write to file:`);
                logger.info(`  Path   : ${args.path}`);
                logger.info(`  Content: "${args.content}"`);
            }

            const answer = await askHuman('\n[Oversight] Approve this action? (y/n): ');
            const approved = answer === 'y' || answer === 'yes';

            if (!approved) {
                logger.info('[Oversight] Human REJECTED the action — task cancelled');
                return null;
            }

            logger.info('[Oversight] Human APPROVED the action — executing');

            let result;
            try {
                result = execute(name, args);
            } catch (err) {
                result = `ERROR: ${err.message}`;
                logger.warn(`[Agent] Tool error: ${err.message}`);
            }

            logger.tool(`[Agent] Result    : ${result}`);

            if (name === 'write_file') {
                writtenContent = args.content;
            }

            /* Feed tool result back as a separate tool message */
            messages.push({
                role:         'tool',
                tool_call_id: call.id,
                content:      result,
            });
        }
    }

    return writtenContent;
}

/* ------------------------------------------------------------------ */

module.exports = { runAgent };
