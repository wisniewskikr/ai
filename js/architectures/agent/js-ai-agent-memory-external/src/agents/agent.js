'use strict';

/*
 * agent.js — agent orchestration for the external-memory demo.
 *
 * Agentic loop:
 *   1. Agent receives the user prompt.
 *   2. Agent calls read_memory to check memory.txt.
 *   3a. Memory empty/missing → agent calls write_memory("My name is Chris"),
 *       then outputs "Hello World stranger".
 *   3b. Memory present → agent extracts the name and outputs "Hello World <name>".
 *
 * System prompt: src/prompts/agent.txt
 */

const fs                           = require('fs');
const path                         = require('path');
const { chatCompletionWithTools }   = require('../lib/api');
const { createMcpClient }          = require('../lib/mcp-client');
const logger                       = require('../lib/logger');

const SYSTEM_PROMPT = fs
    .readFileSync(path.join(__dirname, '../prompts/agent.txt'), 'utf8')
    .trim();

/**
 * Convert MCP tool definitions to the OpenAI function-calling format.
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
 * Run the memory-aware greeting agent.
 *
 * @param {object} config - Config from loadConfig()
 * @param {string} prompt - User input
 * @returns {Promise<string>} - The greeting produced by the agent
 */
async function run(config, prompt) {
    logger.step('Memory agent: starting agentic loop');
    logger.info(`[Agent] Input: "${prompt}"`);

    const mcpClient = await createMcpClient();
    const { tools: mcpTools } = await mcpClient.listTools();
    logger.info(`[Agent] MCP tools available: ${mcpTools.map((t) => t.name).join(', ')}`);

    const tools    = toOpenAiTools(mcpTools);
    const messages = [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user',   content: prompt },
    ];

    let greeting = '';

    while (true) {
        logger.info(`[Agent] Calling API — model: ${config.model}`);
        const response = await chatCompletionWithTools(config, messages, tools);

        if (response.finish_reason === 'tool_calls') {
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
            greeting = response.content.trim();
            break;
        }
    }

    await mcpClient.close();
    logger.info('[Agent] MCP server disconnected');
    logger.result(`[Agent] Greeting: "${greeting}"`);

    return greeting;
}

module.exports = { run };
