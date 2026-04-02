/*
 * agent.js - Agent orchestration.
 *
 * Two phases, same goal (uppercase the input), different execution paths:
 *
 *   Phase 1 - Without tools:
 *     Ask the model directly to uppercase the text. The model does it
 *     from its own knowledge, no tool involved.
 *
 *   Phase 2 - With MCP tools:
 *     Give the model access to the `to_uppercase` MCP tool. The model
 *     decides to call the tool, we execute it via the MCP client, and
 *     feed the result back. The model then returns the final answer.
 *
 * This demonstrates the full agent loop: plan -> act -> observe -> respond.
 */

import OpenAI from 'openai';
import { Client }               from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { resolve, dirname }     from 'path';
import { fileURLToPath }        from 'url';

import { config } from './config.js';
import { logger } from './logger.js';

const MCP_SERVER_PATH = resolve(
  dirname(fileURLToPath(import.meta.url)),
  'mcp-server.js',
);

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function makeOpenAIClient() {
  return new OpenAI({
    apiKey:  config.apiKey,
    baseURL: config.baseUrl,
  });
}

function baseMessages(prompt) {
  return [
    {
      role: 'system',
      content:
        'You are a text processing assistant. ' +
        'Convert the given text to uppercase. ' +
        'Return ONLY the uppercase text, nothing else.',
    },
    { role: 'user', content: prompt },
  ];
}

/* Convert MCP tool definitions to the OpenAI function-calling schema. */
function toOpenAITools(mcpTools) {
  return mcpTools.map((t) => ({
    type: 'function',
    function: {
      name:        t.name,
      description: t.description,
      parameters:  t.inputSchema,
    },
  }));
}

/* ------------------------------------------------------------------ */
/* Phase 1 - Model without tools                                       */
/* ------------------------------------------------------------------ */

async function runWithoutTools(openai, prompt) {
  logger.step('Phase 1: uppercase WITHOUT MCP tools (model only)');
  logger.info(`Sending prompt to ${config.model}: "${prompt}"`);

  const response = await openai.chat.completions.create({
    model:       config.model,
    max_tokens:  config.maxTokens,
    temperature: config.temperature,
    messages:    baseMessages(prompt),
  });

  const result = response.choices[0].message.content.trim();
  logger.info(`Model responded: "${result}"`);
  return result;
}

/* ------------------------------------------------------------------ */
/* Phase 2 - Model with MCP tools (agent loop)                        */
/* ------------------------------------------------------------------ */

async function runWithMcpTools(openai, prompt) {
  logger.step('Phase 2: uppercase WITH MCP tools (agent loop)');

  /* Spawn the MCP server and connect to it. */
  logger.info('Starting MCP server process...');
  const transport = new StdioClientTransport({
    command: 'node',
    args:    [MCP_SERVER_PATH],
  });

  const mcpClient = new Client(
    { name: 'agent-client', version: '1.0.0' },
    { capabilities: {} },
  );

  await mcpClient.connect(transport);
  logger.info('MCP server connected');

  try {
    /* Discover tools exposed by the server. */
    const { tools: mcpTools } = await mcpClient.listTools();
    const toolNames = mcpTools.map((t) => t.name).join(', ');
    logger.info(`Available MCP tools: [${toolNames}]`);

    const openaiTools = toOpenAITools(mcpTools);

    /* First LLM call: model sees the tools and picks which one to call. */
    logger.info(`Sending prompt to ${config.model} with tools: "${prompt}"`);
    const messages = baseMessages(prompt);

    const firstResponse = await openai.chat.completions.create({
      model:       config.model,
      max_tokens:  config.maxTokens,
      temperature: config.temperature,
      tools:       openaiTools,
      tool_choice: 'required',
      messages,
    });

    const assistantMsg = firstResponse.choices[0].message;
    messages.push(assistantMsg);

    /* Execute each tool call the model requested. */
    for (const toolCall of assistantMsg.tool_calls ?? []) {
      const fnName = toolCall.function.name;
      const fnArgs = JSON.parse(toolCall.function.arguments);

      logger.tool(`Calling "${fnName}" with args: ${JSON.stringify(fnArgs)}`);

      const toolResult = await mcpClient.callTool({
        name:      fnName,
        arguments: fnArgs,
      });

      const toolOutput = toolResult.content[0].text;
      logger.tool(`"${fnName}" returned: "${toolOutput}"`);

      messages.push({
        role:         'tool',
        tool_call_id: toolCall.id,
        content:      toolOutput,
      });
    }

    /* Second LLM call: model sees the tool results and gives final answer. */
    const finalResponse = await openai.chat.completions.create({
      model:       config.model,
      max_tokens:  config.maxTokens,
      temperature: config.temperature,
      messages,
    });

    const result = finalResponse.choices[0].message.content.trim();
    logger.info(`Model responded: "${result}"`);
    return result;

  } finally {
    await mcpClient.close();
    logger.info('MCP server disconnected');
  }
}

/* ------------------------------------------------------------------ */
/* Public API                                                          */
/* ------------------------------------------------------------------ */

export async function run(prompt) {
  const sep = '='.repeat(60);

  logger.info(sep);
  logger.info(`Agent started`);
  logger.info(`  prompt : "${prompt}"`);
  logger.info(`  model  : ${config.model}`);
  logger.info(`  baseUrl: ${config.baseUrl}`);
  logger.info(sep);

  const openai = makeOpenAIClient();

  const withoutTools = await runWithoutTools(openai, prompt);
  logger.result(`Phase 1 result: "${withoutTools}"`);

  const withMcpTools = await runWithMcpTools(openai, prompt);
  logger.result(`Phase 2 result: "${withMcpTools}"`);

  logger.info(sep);
  logger.info('Final output:');
  logger.result(withoutTools);
  logger.result(withMcpTools);
  logger.info(sep);

  return { withoutTools, withMcpTools };
}
