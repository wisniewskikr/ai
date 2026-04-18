import { Config } from './config';

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function sendMessage(messages: Message[], config: Config): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY!;

  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: config.model,
      messages,
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
  };

  return data.choices[0].message.content;
}
