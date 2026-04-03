'use strict';

/*
 * subagent-with-tool.js — text transformation via native tool calling
 *
 * Demonstrates the standard tool-calling loop:
 *   Round 1 — send message + tool schema; LLM responds with tool_calls
 *   Round 2 — execute tool locally, append result as role:"tool" message
 *   Round 3 — LLM produces final text answer with the tool result in context
 *
 * The tool registry maps tool names to local executor functions.
 * Adding a new tool means: (1) write the tool file, (2) add it to TOOL_REGISTRY.
 */

const fs                           = require('fs');
const path                         = require('path');
const { chatCompletionWithTools }   = require('../lib/api');
const uppercaseTool                 = require('../tools/uppercase');
const logger                        = require('../lib/logger');

const SYSTEM_PROMPT = fs
    .readFileSync(path.join(__dirname, '../prompts/subagent-with-tool.txt'), 'utf8')
    .trim();

/* Maps each tool name to its local executor function */
const TOOL_REGISTRY = {
    to_uppercase: uppercaseTool.execute,
};

/* All tool schemas sent to the LLM */
const TOOL_SCHEMAS = [uppercaseTool.SCHEMA];

async function run(config, text) {
    logger.info('[Subagent-Tool] Task received: uppercase via native tool calling');
    logger.info(`[Subagent-Tool] Input: "${text}"`);

    const messages = [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user',   content: `Convert to uppercase: "${text}"` },
    ];

    /* Round 1: LLM decides whether and which tools to call */
    logger.debug('[Subagent-Tool] Round 1 — sending request to LLM with tool schemas');
    const assistantMessage = await chatCompletionWithTools(config, messages, TOOL_SCHEMAS);
    messages.push(assistantMessage);

    if (!assistantMessage.tool_calls || assistantMessage.tool_calls.length === 0) {
        /* LLM answered directly — unusual but handle gracefully */
        logger.warn('[Subagent-Tool] LLM skipped tool call and answered directly');
        const result = (assistantMessage.content ?? '').trim();
        logger.info(`[Subagent-Tool] Output: "${result}"`);
        logger.info('[Subagent-Tool] Task complete');
        return result;
    }

    /* Round 2: execute each tool call the LLM requested */
    for (const toolCall of assistantMessage.tool_calls) {
        const { id, function: fn } = toolCall;

        let args;
        try {
            args = JSON.parse(fn.arguments);
        } catch (err) {
            throw new Error(`Failed to parse tool arguments for "${fn.name}": ${err.message}`);
        }

        logger.info(`[Subagent-Tool] LLM called tool: ${fn.name}(${JSON.stringify(args)})`);

        const executor = TOOL_REGISTRY[fn.name];
        if (!executor) {
            throw new Error(`Unknown tool requested by LLM: "${fn.name}"`);
        }

        const toolResult = executor(args);
        logger.info(`[Subagent-Tool] Tool result: "${toolResult}"`);

        messages.push({
            role:         'tool',
            tool_call_id: id,
            content:      String(toolResult),
        });
    }

    /* Round 3: LLM produces its final answer with tool results in context */
    logger.debug('[Subagent-Tool] Round 3 — sending tool results back for final answer');
    const finalMessage = await chatCompletionWithTools(config, messages, TOOL_SCHEMAS);

    const result = (finalMessage.content ?? '').trim();
    logger.info(`[Subagent-Tool] Output: "${result}"`);
    logger.info('[Subagent-Tool] Task complete');

    return result;
}

module.exports = { run };
