import { Config } from './config';
import { ToolDefinition } from './tools';
import { log } from './logger';

interface ToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

export interface Message {
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string | null;
  tool_calls?: ToolCall[];
  tool_call_id?: string;
}

export type OnToolCall = (name: string, args: Record<string, unknown>, result: string) => void;
export type ToolExecutor = (name: string, args: Record<string, unknown>) => Promise<string>;

const MAX_ITERATIONS = 10;

export async function sendMessage(
  history: Message[],
  config: Config,
  tools: ToolDefinition[],
  executeTool: ToolExecutor,
  onToolCall?: OnToolCall,
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY!;

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: config.model,
        messages: history,
        tools,
        tool_choice: 'auto',
        max_tokens: config.maxTokens,
        temperature: config.temperature,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error ${response.status}: ${errorText}`);
    }

    const data = await response.json() as {
      choices: {
        message: {
          role: string;
          content: string | null;
          tool_calls?: ToolCall[];
        };
        finish_reason: string;
      }[];
    };

    const assistantMsg = data.choices[0].message;

    if (!assistantMsg.tool_calls || assistantMsg.tool_calls.length === 0) {
      return assistantMsg.content ?? '';
    }

    // Add assistant message with tool_calls to history
    history.push({
      role: 'assistant',
      content: assistantMsg.content,
      tool_calls: assistantMsg.tool_calls,
    });

    // Execute each tool and append result to history
    for (const toolCall of assistantMsg.tool_calls) {
      const args = JSON.parse(toolCall.function.arguments) as Record<string, unknown>;
      log('INFO', `Tool call: ${toolCall.function.name}(${toolCall.function.arguments})`);

      const result = await executeTool(toolCall.function.name, args);
      log('INFO', `Tool result: ${result}`);

      onToolCall?.(toolCall.function.name, args, result);

      history.push({
        role: 'tool',
        tool_call_id: toolCall.id,
        content: result,
      });
    }
  }

  throw new Error('Agent loop exceeded maximum iterations');
}
