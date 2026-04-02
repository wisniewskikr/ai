/**
 * agent.js
 *
 * The agent core. Runs two independent phases for the same input:
 *
 *   Phase 1 — no tools:  model converts text to uppercase on its own.
 *   Phase 2 — with tools: model calls to_uppercase(), we execute it locally,
 *                          send the result back, model formulates final answer.
 *
 * Both phases are intentionally separate functions. They share nothing except
 * the client and config, which keeps the logic easy to follow and extend.
 */

import OpenAI from 'openai';
import { logger } from './logger.js';
import { TOOLS, executeTool } from './tools.js';

function createClient() {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
        throw new Error('OPENROUTER_API_KEY is not set. Check your .env file.');
    }
    return new OpenAI({
        apiKey,
        baseURL: 'https://openrouter.ai/api/v1',
    });
}

/**
 * Phase 1: model-only uppercase.
 *
 * No tools are provided. The model must produce the uppercase result
 * purely from instruction-following. Return only the bare result string.
 */
async function uppercaseWithoutTools(client, input, config) {
    logger.step('Phase 1 — Uppercase WITHOUT native tools');
    logger.info(`Input: "${input}"`);
    logger.info(`Model: ${config.model} | Tools: none`);

    const messages = [
        {
            role: 'system',
            content: 'You are a text-processing assistant. Convert text to uppercase when asked. Return ONLY the uppercase text — no explanations, no punctuation, no extra words.',
        },
        {
            role: 'user',
            content: `Convert to uppercase: "${input}"`,
        },
    ];

    logger.info('Sending request to model...');

    const response = await client.chat.completions.create({
        model: config.model,
        max_tokens: config.maxTokens,
        temperature: config.temperature,
        messages,
    });

    const result = response.choices[0].message.content.trim();
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
 * This is the standard agentic tool-use loop:
 *   request -> tool_calls -> execute -> tool_result -> final response
 */
async function uppercaseWithTools(client, input, config) {
    logger.step('Phase 2 — Uppercase WITH native tools');
    logger.info(`Input: "${input}"`);
    logger.info(`Model: ${config.model} | Tools: [to_uppercase]`);

    const messages = [
        {
            role: 'system',
            content: 'You are a text-processing assistant. Use the to_uppercase tool to convert text. After the tool returns, reply with ONLY the uppercase text it produced — nothing else.',
        },
        {
            role: 'user',
            content: `Use the to_uppercase tool to convert to uppercase: "${input}"`,
        },
    ];

    logger.info('Sending request to model (with tools)...');

    // Turn 1: model sees the tools and decides to call one
    const firstResponse = await client.chat.completions.create({
        model: config.model,
        max_tokens: config.maxTokens,
        temperature: config.temperature,
        messages,
        tools: TOOLS,
        tool_choice: { type: 'function', function: { name: 'to_uppercase' } },
    });

    const assistantMessage = firstResponse.choices[0].message;

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
            role: 'tool',
            tool_call_id: call.id,
            content: output,
        });
    }

    // Turn 2: send tool results back so the model can formulate its final answer
    logger.info('Sending tool results back to model...');

    const finalResponse = await client.chat.completions.create({
        model: config.model,
        max_tokens: config.maxTokens,
        temperature: config.temperature,
        messages: [
            ...messages,
            assistantMessage,
            ...toolResultMessages,
        ],
    });

    const result = finalResponse.choices[0].message.content.trim();
    logger.result(`Phase 2 result: "${result}"`);
    return result;
}

/**
 * Main agent entry point.
 *
 * Runs both phases and prints a clean summary at the end.
 */
export async function runAgent(input, config) {
    logger.step(`Agent starting | Input: "${input}" | Model: ${config.model}`);

    const client = createClient();

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

    // Also write the summary to the log file
    logger.info(`Summary — without tools: "${withoutTools}" | with tools: "${withTools}"`);
}
