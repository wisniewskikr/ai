import { ChatMessage } from './types';
import config from './config';

function getApiKey(): string {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error('OPENROUTER_API_KEY is not set in environment');
  return key;
}

export async function callModel(
  model: string,
  messages: ChatMessage[],
  maxTokens = 500
): Promise<string> {
  const response = await fetch(`${config.openrouterBaseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getApiKey()}`,
      'HTTP-Referer': 'https://bank-assistant-demo',
      'X-Title': 'Bank Assistant Output Validation Demo',
    },
    body: JSON.stringify({ model, messages, max_tokens: maxTokens }),
  });

  const json = (await response.json()) as {
    choices?: Array<{ message: { content: string } }>;
    error?: { message: string };
  };

  if (!response.ok || json.error) {
    throw new Error(json.error?.message ?? `OpenRouter API error: ${response.status}`);
  }

  if (!json.choices?.[0]?.message?.content) {
    throw new Error('Empty response from OpenRouter API');
  }

  return json.choices[0].message.content;
}
