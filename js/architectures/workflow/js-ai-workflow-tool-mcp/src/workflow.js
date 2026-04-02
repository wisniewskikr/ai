const { toolDefinitions, executeTool } = require('./tools');
const logger = require('./logger');

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1/chat/completions';

/**
 * Send a chat completion request to OpenRouter.
 */
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

/**
 * STEP 1 — Model converts text to uppercase using its own knowledge (no tools).
 */
async function step1ModelOnly(apiKey, model, input) {
  logger.separator('STEP 1 · Model Only (no tools)');
  logger.info(`Input: "${input}"`);
  logger.info('Asking the model to convert the text to uppercase without any tools...');

  const messages = [
    {
      role: 'system',
      content:
        'You are a helpful assistant. When asked to convert text to uppercase, respond with ONLY the uppercase version of the text — no explanation, no punctuation, just the result.',
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

/**
 * STEP 2 — Model converts text to uppercase using the MCP "to_uppercase" tool.
 *
 * The agentic loop:
 *  1. Send the request with tool definitions.
 *  2. If the model returns tool_calls, execute them locally and feed results back.
 *  3. Collect the final text response.
 */
async function step2ModelWithMCP(apiKey, model, input) {
  logger.separator('STEP 2 · Model + MCP Tool');
  logger.info(`Input: "${input}"`);
  logger.info(`Available MCP tool: "${toolDefinitions[0].function.name}"`);
  logger.info('Asking the model to convert the text using the MCP tool...');

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

  // --- Agentic loop ---
  let currentMessages = [...messages];
  let finalResult = null;

  while (true) {
    const response = await callModel(apiKey, model, currentMessages, toolDefinitions);
    const choice = response.choices[0];
    const assistantMessage = choice.message;

    // Append assistant turn to conversation
    currentMessages.push(assistantMessage);

    if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
      // Process every requested tool call
      for (const toolCall of assistantMessage.tool_calls) {
        const toolName = toolCall.function.name;
        const toolArgs = JSON.parse(toolCall.function.arguments);

        logger.tool(`Model requested tool: "${toolName}"`);
        logger.tool(`Tool arguments: ${JSON.stringify(toolArgs)}`);

        const toolResult = executeTool(toolName, toolArgs);
        logger.tool(`Tool execution result: "${toolResult}"`);

        // Feed tool result back into the conversation
        currentMessages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: toolResult,
        });
      }
      // Continue the loop so the model can formulate its final answer
    } else {
      // Model produced a regular text response — we're done
      finalResult = assistantMessage.content.trim();
      break;
    }
  }

  logger.result(`Model answered (with MCP tool): "${finalResult}"`);
  return finalResult;
}

/**
 * Main workflow orchestrator.
 */
async function runWorkflow(config, apiKey) {
  const { model, input } = config;

  logger.separator('WORKFLOW START');
  logger.info(`Model  : ${model}`);
  logger.info(`Input  : "${input}"`);
  logger.info(`Log file: ${logger.logFile}`);

  const result1 = await step1ModelOnly(apiKey, model, input);
  const result2 = await step2ModelWithMCP(apiKey, model, input);

  logger.separator('FINAL RESULTS');
  logger.result(`Step 1 — Model only      : "${result1}"`);
  logger.result(`Step 2 — Model + MCP tool: "${result2}"`);
  logger.separator('WORKFLOW COMPLETE');

  return { step1: result1, step2: result2 };
}

module.exports = { runWorkflow };
