'use strict';

/*
 * agent.js — autonomous agent that executes tasks using tools.
 *
 * Architecture: oversight pattern, full-automation mode.
 *
 * The agent runs an agentic loop:
 *   1. Send task + message history to the model.
 *   2. If the model stops with "tool_calls", execute the requested tools
 *      and feed the results back (loop continues).
 *   3. If the model stops with "stop", the task is complete.
 *
 * In a supervised mode, step 2 would pause and ask a human to approve
 * each tool call before execution.  In full-automation mode (this file)
 * every tool call is approved automatically — the oversight is still
 * present as a logging checkpoint so the audit trail is intact.
 *
 * The agent is intentionally stateless: all state lives in the `messages`
 * array that grows with each turn of the loop.
 */

const fs                       = require('fs');
const path                     = require('path');
const { chatWithTools }        = require('../libs/api');
const logger                   = require('../libs/logger');
const { definitions, execute } = require('../tools/tools');

/* ------------------------------------------------------------------ */

const SYSTEM_PROMPT = fs
    .readFileSync(path.join(__dirname, '../prompts/agent.txt'), 'utf8')
    .trim();

/* ------------------------------------------------------------------ */

/*
 * runAgent(config, task) — run the agent until the task is complete.
 *
 * Returns the text content written to the output file, or an empty
 * string if the write_file tool was never called.
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
             * Oversight checkpoint.
             *
             * Full-automation: auto-approve and execute immediately.
             * Supervised mode: pause here, show the call to a human,
             * and wait for explicit approval before proceeding.
             */
            logger.info('[Oversight] Full-automation — tool call auto-approved');

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
