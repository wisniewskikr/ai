import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from './logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MCP_SERVER_PATH = path.join(__dirname, '..', 'mcp-server.js');
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1/chat/completions';

// ---------------------------------------------------------------------------
// OpenRouter API helper
// ---------------------------------------------------------------------------

async function callModel(apiKey, model, messages, tools = null) {
  const body = { model, messages };
  if (tools) {
    body.tools = tools;
    body.tool_choice = 'auto';
  }

  const response = await fetch(OPENROUTER_BASE_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://github.com/local/js-ai-workflow-tool-mcp',
      'X-Title': 'Hello World MCP Workflow',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API error ${response.status}: ${errorText}`);
  }

  return response.json();
}

// ---------------------------------------------------------------------------
// STEP 1 — Model converts text to uppercase on its own (no tools)
// ---------------------------------------------------------------------------

export async function step1ModelOnly(apiKey, model, input) {
  logger.separator('STEP 1 · Model Only (no tools)');
  logger.info(`Input: "${input}"`);
  logger.info('Asking the model to convert the text to uppercase without any tools...');

  const messages = [
    {
      role: 'system',
      content:
        'You are a helpful assistant. When asked to convert text to uppercase, respond with ONLY the uppercase version — no explanation, no punctuation, just the result.',
    },
    {
      role: 'user',
      content: `Convert the following text to uppercase: "${input}"`,
    },
  ];

  const response = await callModel(apiKey, model, messages);
  const result = response.choices[0].message.content.trim();

  logger.result(`Model answered (no tools): "${result}"`);
  return result;
}

// ---------------------------------------------------------------------------
// STEP 2 — Model converts text to uppercase using MCP server tool
//
// Flow:
//   1. Spawn mcp-server.js as a child process (stdio transport)
//   2. Connect MCP Client → MCP Server
//   3. Fetch tool list from the server → convert to OpenAI format
//   4. Send request to model with tool definitions
//   5. Agentic loop: when the model calls a tool, forward the call to the
//      MCP Server via client.callTool(), then send the result back to the model
//   6. Disconnect client / close server
// ---------------------------------------------------------------------------

/** Convert MCP tool schema to OpenAI function-calling format */
function mcpToolToOpenAI(mcpTool) {
  return {
    type: 'function',
    function: {
      name: mcpTool.name,
      description: mcpTool.description,
      parameters: mcpTool.inputSchema,
    },
  };
}

export async function step2ModelWithMCP(apiKey, model, input) {
  logger.separator('STEP 2 · Model + MCP Server');
  logger.info(`Input: "${input}"`);

  // --- Connect to MCP Server ---
  logger.info('Spawning MCP server (stdio transport)...');
  const transport = new StdioClientTransport({
    command: 'node',
    args: [MCP_SERVER_PATH],
  });

  const mcpClient = new Client(
    { name: 'workflow-mcp-client', version: '1.0.0' },
    { capabilities: {} },
  );
  await mcpClient.connect(transport);
  logger.info('MCP client connected to server');

  try {
    // --- Discover tools from MCP Server ---
    const { tools: mcpTools } = await mcpClient.listTools();
    logger.info(`MCP server exposed ${mcpTools.length} tool(s): ${mcpTools.map((t) => `"${t.name}"`).join(', ')}`);

    const openAITools = mcpTools.map(mcpToolToOpenAI);

    // --- Build initial messages ---
    const messages = [
      {
        role: 'system',
        content:
          'You are a helpful assistant with access to tools. When asked to convert text to uppercase, always use the to_uppercase tool.',
      },
      {
        role: 'user',
        content: `Convert the following text to uppercase using the to_uppercase tool: "${input}"`,
      },
    ];

    logger.info('Sending request to model with MCP tool definitions...');

    // --- Agentic loop ---
    let currentMessages = [...messages];
    let finalResult = null;

    while (true) {
      const response = await callModel(apiKey, model, currentMessages, openAITools);
      const assistantMessage = response.choices[0].message;
      currentMessages.push(assistantMessage);

      if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
        for (const toolCall of assistantMessage.tool_calls) {
          const toolName = toolCall.function.name;
          const toolArgs = JSON.parse(toolCall.function.arguments);

          logger.tool(`Model requested MCP tool: "${toolName}"`);
          logger.tool(`Tool arguments: ${JSON.stringify(toolArgs)}`);

          // Forward call to MCP Server
          const mcpResult = await mcpClient.callTool({ name: toolName, arguments: toolArgs });
          const toolResultText = mcpResult.content[0].text;

          logger.tool(`MCP server returned: "${toolResultText}"`);

          currentMessages.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            content: toolResultText,
          });
        }
        // Continue loop — let model produce its final response
      } else {
        finalResult = assistantMessage.content.trim();
        break;
      }
    }

    logger.result(`Model answered (with MCP tool): "${finalResult}"`);
    return finalResult;
  } finally {
    await mcpClient.close();
    logger.info('MCP client disconnected');
  }
}

// ---------------------------------------------------------------------------
// Main workflow orchestrator
// ---------------------------------------------------------------------------

export async function runWorkflow(config, apiKey) {
  const { model, input } = config;

  logger.separator('WORKFLOW START');
  logger.info(`Model   : ${model}`);
  logger.info(`Input   : "${input}"`);
  logger.info(`Log file: ${logger.logFile}`);

  const result1 = await step1ModelOnly(apiKey, model, input);
  const result2 = await step2ModelWithMCP(apiKey, model, input);

  logger.separator('FINAL RESULTS');
  logger.result(`Step 1 — Model only       : "${result1}"`);
  logger.result(`Step 2 — Model + MCP tool : "${result2}"`);
  logger.separator('WORKFLOW COMPLETE');

  return { step1: result1, step2: result2 };
}
