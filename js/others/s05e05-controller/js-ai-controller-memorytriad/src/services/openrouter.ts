import config from '../../config.json';
import { Message } from '../memory/shortTerm';

interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string | null;
    };
  }>;
}

export async function callModel(system: string, messages: Message[]): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not set in .env');
  }

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: config.model,
      max_tokens: config.maxTokens,
      messages: [
        { role: 'system', content: system },
        ...messages,
      ],
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} ${response.statusText} — ${body}`);
  }

  const data = await response.json() as OpenRouterResponse;
  const content = data.choices[0]?.message?.content;
  if (content === null || content === undefined) {
    throw new Error('Model returned empty content');
  }
  return content;
}
