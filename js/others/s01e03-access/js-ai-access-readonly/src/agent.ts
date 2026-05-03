import OpenAI from 'openai';
import { toolDefinitions, executeToolCall } from './tools';
import { logAudit } from './audit';
import { SYSTEM_PROMPT } from './prompts/system';
import config from '../config.json';

const client = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function runAgent(userMessage: string): Promise<string> {
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: userMessage },
  ];

  logAudit('INFO', `User task: "${userMessage}"`);

  for (let step = 0; step < 10; step++) {
    const response = await client.chat.completions.create({
      model: config.model,
      messages,
      tools: toolDefinitions,
      tool_choice: 'auto',
      max_tokens: config.agent.maxTokens,
      temperature: config.agent.temperature,
    });

    const message = response.choices[0].message;
    messages.push(message);

    if (!message.tool_calls || message.tool_calls.length === 0) {
      const content = message.content ?? '';
      logAudit('INFO', `Agent response: "${content.substring(0, 120)}"`);
      return content;
    }

    for (const toolCall of message.tool_calls) {
      const args = JSON.parse(toolCall.function.arguments) as Record<string, unknown>;
      const result = executeToolCall(toolCall.function.name, args);

      logAudit('INFO', `Tool called: ${toolCall.function.name}(${toolCall.function.arguments})`);

      messages.push({
        role: 'tool',
        tool_call_id: toolCall.id,
        content: JSON.stringify(result),
      });
    }
  }

  return 'Agent reached maximum steps without a final response.';
}
