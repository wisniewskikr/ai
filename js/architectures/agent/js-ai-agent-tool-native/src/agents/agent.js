/**
 * agent.js
 *
 * The agent core. Runs two independent phases for the same input:
 *
 *   Phase 1 — no tools:   model converts text to uppercase on its own.
 *   Phase 2 — with tools: model calls to_uppercase(), we execute it locally,
 *                          send the result back, model formulates final answer.
 *
 * System prompts are loaded from src/prompts/ to keep logic and copy separate.
 */

import { readFileSync } from 'fs';
import { createClient, chatCompletion, chatCompletionWithTools } from '../lib/api.js';
import { logger } from '../lib/logger.js';
import { TOOLS, executeTool } from '../tools/uppercase.js';

const PROMPT_NO_TOOL   = readFileSync(new URL('../prompts/agent-no-tool.txt',   import.meta.url), 'utf8').trim();
const PROMPT_WITH_TOOL = readFileSync(new URL('../prompts/agent-with-tool.txt', import.meta.url), 'utf8').trim();

/**
 * Phase 1: model-only uppercase.
 *
 * No tools are provided. The model must produce the uppercase result
 * purely from instruction-following. Returns only the bare result string.
 */
async function uppercaseWithoutTools(client, input, config) {
    logger.step('Phase 1 — Uppercase WITHOUT native tools');
    logger.info(`Input: "${input}"`);
    logger.info(`Model: ${config.model} | Tools: none`);

    const messages = [
        { role: 'system', content: PROMPT_NO_TOOL },
        { role: 'user',   content: `Convert to uppercase: "${input}"` },
    ];

    logger.info('Sending request to model...');

    const result = await chatCompletion(client, config, messages);
    logger.result(`Phase 1 result: "${result}"`);
    return result;
}

/**
 * Phase 2: tool-assisted uppercase.
 *
 * The model is given the to_uppercase tool. It decides to call it,
 * we execute the call locally, send the result back, and collect
 * the model's final response.
 *
 * Standard agentic tool-use loop:
 *   request → tool_calls → execute → tool_result → final response
 */
async function uppercaseWithTools(client, input, config) {
    logger.step('Phase 2 — Uppercase WITH native tools');
    logger.info(`Input: "${input}"`);
    logger.info(`Model: ${config.model} | Tools: [to_uppercase]`);

    const messages = [
        { role: 'system', content: PROMPT_WITH_TOOL },
        { role: 'user',   content: `Use the to_uppercase tool to convert to uppercase: "${input}"` },
    ];

    logger.info('Sending request to model (with tools)...');

    // Turn 1: model sees the tools and decides to call one
    const assistantMessage = await chatCompletionWithTools(
        client, config, messages, TOOLS,
        { type: 'function', function: { name: 'to_uppercase' } },
    );

    if (!assistantMessage.tool_calls?.length) {
        throw new Error('Model did not call any tools. Check tool_choice configuration.');
    }

    // Execute every tool call the model requested (usually just one here)
    const toolResultMessages = [];

    for (const call of assistantMessage.tool_calls) {
        const { name, arguments: argsJson } = call.function;
        const args = JSON.parse(argsJson);

        logger.tool(`Tool call:   ${name}(${JSON.stringify(args)})`);

        const output = executeTool(name, args);

        logger.tool(`Tool output: "${output}"`);

        toolResultMessages.push({
            role:         'tool',
            tool_call_id: call.id,
            content:      output,
        });
    }

    // Turn 2: send tool results back so the model can formulate its final answer
    logger.info('Sending tool results back to model...');

    const result = await chatCompletion(client, config, [
        ...messages,
        assistantMessage,
        ...toolResultMessages,
    ]);

    logger.result(`Phase 2 result: "${result}"`);
    return result;
}

/**
 * Main agent entry point.
 *
 * Runs both phases and prints a clean summary at the end.
 *
 * @param {string} input  - Text to process.
 * @param {object} config - App configuration (model, maxTokens, temperature).
 */
export async function runAgent(input, config) {
    logger.step(`Agent starting | Input: "${input}" | Model: ${config.model}`);

    const client = createClient(config);

    const withoutTools = await uppercaseWithoutTools(client, input, config);
    const withTools    = await uppercaseWithTools(client, input, config);

    const divider = '─'.repeat(48);
    const summary = [
        '',
        divider,
        '  FINAL OUTPUT',
        divider,
        `  Without tools : ${withoutTools}`,
        `  With tools    : ${withTools}`,
        divider,
        '',
    ].join('\n');

    console.log(summary);
    logger.step('Agent finished');
    logger.info(`Summary — without tools: "${withoutTools}" | with tools: "${withTools}"`);
}
