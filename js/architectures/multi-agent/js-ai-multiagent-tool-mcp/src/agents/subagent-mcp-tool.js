'use strict';

/*
 * subagent-mcp-tool.js — text transformation via LLM + MCP tool.
 *
 * Gives the model the to_uppercase tool (sourced from a local MCP server)
 * and lets it decide to call it. The agentic loop runs until finish_reason
 * is "stop" — in this case that takes exactly one tool call and one final
 * reply, but the loop handles the general case correctly.
 *
 * System prompt: src/prompts/subagent-mcp-tool.txt
 */

const fs                               = require('fs');
const path                             = require('path');
const { chatCompletionWithTools }      = require('../lib/api');
const { createMcpClient }              = require('../lib/mcp-client');
const logger                           = require('../lib/logger');

const SYSTEM_PROMPT = fs
    .readFileSync(path.join(__dirname, '../prompts/subagent-mcp-tool.txt'), 'utf8')
    .trim();

/**
 * Convert MCP tool definitions to the OpenAI function-calling format.
 * The shapes are nearly identical; this is purely a structural mapping.
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

/**
 * Transform text to uppercase — LLM calls an MCP tool to do the work.
 *
 * @param {object} config - Config from loadConfig()
 * @param {string} text   - Text to transform
 * @returns {Promise<string>} - Uppercased result
 */
async function run(config, text) {
    logger.info('[SubagentMcp] Task received: uppercase via MCP tool');
    logger.info(`[SubagentMcp] Input: "${text}"`);

    /* ── Connect to MCP server ─────────────────────────────────────────── */
    logger.debug('[SubagentMcp] Connecting to MCP server');
    const mcpClient = await createMcpClient();

    const { tools: mcpTools } = await mcpClient.listTools();
    logger.debug(
        `[SubagentMcp] MCP tools available: ${mcpTools.map((t) => t.name).join(', ')}`
    );

    const tools = toOpenAiTools(mcpTools);

    /* ── Agentic tool-use loop ─────────────────────────────────────────── */
    const messages = [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user',   content: text },
    ];

    let result = '';

    while (true) {
        logger.debug(`[SubagentMcp] Calling API — model: ${config.model}`);
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

                logger.info(
                    `[SubagentMcp] Calling MCP tool: ${toolName}(${JSON.stringify(toolArgs)})`
                );

                const toolResult     = await mcpClient.callTool({ name: toolName, arguments: toolArgs });
                const toolResultText = toolResult.content[0].text;

                logger.info(`[SubagentMcp] MCP tool returned: "${toolResultText}"`);

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

    logger.info(`[SubagentMcp] Output: "${result}"`);
    logger.info('[SubagentMcp] Task complete');

    return result;
}

module.exports = { run };
