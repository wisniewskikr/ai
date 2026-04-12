import { Config } from './config';
import { langfuse } from './langfuse';
import type { LangfuseTraceClient } from 'langfuse';

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function sendMessage(history: Message[], config: Config, trace: LangfuseTraceClient): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY!;

  const generation = trace.generation({
    name: 'chat-completion',
    model: config.model,
    input: history,
    modelParameters: {
      maxTokens: config.maxTokens,
      temperature: config.temperature,
    },
  });

  try {
    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: config.model,
        messages: history,
        max_tokens: config.maxTokens,
        temperature: config.temperature,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      generation.end({ level: 'ERROR', statusMessage: errorText });
      throw new Error(`API error ${response.status}: ${errorText}`);
    }

    const data = await response.json() as {
      choices: { message: { content: string } }[];
      usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
    };

    const content = data.choices[0].message.content;

    generation.end({
      output: content,
      usage: data.usage
        ? { input: data.usage.prompt_tokens, output: data.usage.completion_tokens, total: data.usage.total_tokens }
        : undefined,
    });

    return content;
  } catch (err) {
    if (!(err instanceof Error && err.message.startsWith('API error'))) {
      generation.end({ level: 'ERROR', statusMessage: String(err) });
    }
    throw err;
  }
}

export { langfuse };
