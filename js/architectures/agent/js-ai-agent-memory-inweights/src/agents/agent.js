'use strict';

/*
 * agent.js — agent orchestration.
 *
 * Two phases, same goal (uppercase the input), different execution paths:
 *
 *   Phase 1 — Without tools:
 *     Ask the model directly to uppercase the text. The model does it
 *     from its own knowledge, no tool involved.
 *
 *   Phase 2 — With MCP tools (agentic loop):
 *     Give the model access to the to_uppercase MCP tool. The model
 *     decides to call the tool, we execute it via the MCP client, and
 *     feed the result back. Loop continues until finish_reason is "stop".
 *
 * This demonstrates the full agent loop: plan -> act -> observe -> respond.
 *
 * System prompt: src/prompts/agent.txt
 */

const fs                           = require('fs');
const path                         = require('path');
const { chatCompletion,
        chatCompletionWithTools }   = require('../lib/api');
const { createMcpClient }          = require('../lib/mcp-client');
const logger                       = require('../lib/logger');

const SYSTEM_PROMPT = fs
    .readFileSync(path.join(__dirname, '../prompts/agent.txt'), 'utf8')
    .trim();

/* ── Helpers ────────────────────────────────────────────────────────────── */

/**
 * Convert MCP tool definitions to the OpenAI function-calling format.
 *
 * @param {Array} mcpTools - Tools returned by client.listTools()
 * @returns {Array} - OpenAI-style tool definition array
 */
function toOpenAiTools(mcpTools) {
    return mcpTools.map((t) => ({
        type: 'function',
        function: {
            name:        t.name,
            description: t.description,
            parameters:  t.inputSchema,
        },
    }));
}

/* ── Phase 1 — Without tools ────────────────────────────────────────────── */

/**
 * Transform text to uppercase via LLM, no tools.
 *
 * @param {object} config - Config from loadConfig()
 * @param {string} text   - Text to transform
 * @returns {Promise<string>}
 */
async function runWithoutTools(config, text) {
    logger.step('Phase 1: uppercase WITHOUT MCP tools (model only)');
    logger.info(`[Agent] Input: "${text}"`);

    const messages = [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user',   content: text },
    ];

    logger.info(`[Agent] Calling API — model: ${config.model}`);
    const result = await chatCompletion(config, messages);

    logger.result(`[Agent] Phase 1 result: "${result}"`);
    return result;
}

/* ── Phase 2 — With MCP tools (agentic loop) ────────────────────────────── */

/**
 * Transform text to uppercase — LLM calls an MCP tool to do the work.
 * Runs an agentic loop until finish_reason is "stop".
 *
 * @param {object} config - Config from loadConfig()
 * @param {string} text   - Text to transform
 * @returns {Promise<string>}
 */
async function runWithMcpTools(config, text) {
    logger.step('Phase 2: uppercase WITH MCP tools (agentic loop)');
    logger.info(`[Agent] Input: "${text}"`);

    /* Connect to MCP server */
    logger.info('[Agent] Connecting to MCP server');
    const mcpClient = await createMcpClient();

    const { tools: mcpTools } = await mcpClient.listTools();
    logger.info(`[Agent] MCP tools available: ${mcpTools.map((t) => t.name).join(', ')}`);

    const tools = toOpenAiTools(mcpTools);

    /* Agentic loop */
    const messages = [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user',   content: text },
    ];

    let result = '';

    while (true) {
        logger.info(`[Agent] Calling API — model: ${config.model}`);
        const response = await chatCompletionWithTools(config, messages, tools);

        if (response.finish_reason === 'tool_calls') {
            /* Model wants to call one or more tools — execute each via MCP */
            messages.push({
                role:       'assistant',
                content:    response.content || null,
                tool_calls: response.tool_calls,
            });

            for (const call of response.tool_calls) {
                const toolName = call.function.name;
                const toolArgs = JSON.parse(call.function.arguments);

                logger.tool(`Calling MCP tool: ${toolName}(${JSON.stringify(toolArgs)})`);

                const toolResult     = await mcpClient.callTool({ name: toolName, arguments: toolArgs });
                const toolResultText = toolResult.content[0].text;

                logger.tool(`MCP tool returned: "${toolResultText}"`);

                messages.push({
                    role:         'tool',
                    tool_call_id: call.id,
                    content:      toolResultText,
                });
            }
        } else {
            /* Model is done */
            result = response.content.trim();
            break;
        }
    }

    await mcpClient.close();
    logger.info('[Agent] MCP server disconnected');

    logger.result(`[Agent] Phase 2 result: "${result}"`);
    return result;
}

/* ── Public API ─────────────────────────────────────────────────────────── */

/**
 * Run both phases and return their results.
 *
 * @param {object} config - Config from loadConfig()
 * @param {string} prompt - Input text
 * @returns {Promise<{withoutTools: string, withMcpTools: string}>}
 */
async function run(config, prompt) {
    const withoutTools = await runWithoutTools(config, prompt);
    const withMcpTools = await runWithMcpTools(config, prompt);
    return { withoutTools, withMcpTools };
}

module.exports = { run };
