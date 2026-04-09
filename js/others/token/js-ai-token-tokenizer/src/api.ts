import { Config } from './config';

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ApiResult {
  content: string;
  promptTokens: number;
  completionTokens: number;
}

export async function sendMessage(history: Message[], config: Config): Promise<ApiResult> {
  const apiKey = process.env.OPENROUTER_API_KEY!;

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
    throw new Error(`API error ${response.status}: ${errorText}`);
  }

  const data = await response.json() as {
    choices: { message: { content: string } }[];
    usage: { prompt_tokens: number; completion_tokens: number };
  };

  return {
    content: data.choices[0].message.content,
    promptTokens: data.usage?.prompt_tokens ?? 0,
    completionTokens: data.usage?.completion_tokens ?? 0,
  };
}
