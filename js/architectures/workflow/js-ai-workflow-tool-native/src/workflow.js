import { chatCompletion } from "./api.js";
import { toolDefinitions, executeTool } from "./tools.js";
import { logger } from "./logger.js";

// ─── Step 1: Model without tools ────────────────────────────────────────────
export async function stepModelWithoutTools({ apiKey, model, prompt }) {
  logger.step("STEP 1 — Model converts to uppercase WITHOUT tools");
  logger.info(`Sending prompt to model: "${prompt}"`);

  const messages = [
    {
      role: "system",
      content: "You are a helpful assistant. When asked to convert text to uppercase, return ONLY the uppercase text, nothing else.",
    },
    {
      role: "user",
      content: `Convert the following text to uppercase: "${prompt}"`,
    },
  ];

  const response = await chatCompletion({ apiKey, model, messages });
  const result = response.choices[0].message.content.trim();

  logger.success("Model responded without using any tools.");
  logger.result("Output", result);
  return result;
}

// ─── Step 2: Model with tools ────────────────────────────────────────────────
export async function stepModelWithTools({ apiKey, model, prompt }) {
  logger.step("STEP 2 — Model converts to uppercase WITH tools");
  logger.info(`Sending prompt to model with tool definitions: "${prompt}"`);

  const messages = [
    {
      role: "system",
      content: "You are a helpful assistant. Use the to_uppercase tool to convert text to uppercase. Return ONLY the uppercase text from the tool result, nothing else.",
    },
    {
      role: "user",
      content: `Convert the following text to uppercase using the to_uppercase tool: "${prompt}"`,
    },
  ];

  // First API call — model decides to call the tool
  const firstResponse = await chatCompletion({
    apiKey,
    model,
    messages,
    tools: toolDefinitions,
  });

  const assistantMessage = firstResponse.choices[0].message;

  if (!assistantMessage.tool_calls || assistantMessage.tool_calls.length === 0) {
    throw new Error("Expected the model to call a tool, but it did not.");
  }

  const toolCall = assistantMessage.tool_calls[0];
  const toolName = toolCall.function.name;
  const toolArgs = JSON.parse(toolCall.function.arguments);

  logger.info(`Model requested tool call: ${toolName}(${JSON.stringify(toolArgs)})`);

  // Execute the tool locally
  const toolResult = executeTool(toolName, toolArgs);
  logger.info(`Tool executed locally → result: "${toolResult}"`);

  // Second API call — send tool result back to the model
  const messagesWithResult = [
    ...messages,
    assistantMessage,
    {
      role: "tool",
      tool_call_id: toolCall.id,
      content: toolResult,
    },
  ];

  const secondResponse = await chatCompletion({ apiKey, model, messages: messagesWithResult });
  const finalResult = secondResponse.choices[0].message.content.trim();

  logger.success("Model processed tool result and returned final answer.");
  logger.result("Output", finalResult);
  return finalResult;
}
