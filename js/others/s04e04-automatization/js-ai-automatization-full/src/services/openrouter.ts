import OpenAI from 'openai';
import config from '../../config.json';

const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
});

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Retries only for transient errors (429, 5xx). Logic errors propagate immediately.
export async function chatWithRetry(
  prompt: string,
  model: string = config.model
): Promise<string> {
  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await client.chat.completions.create({
        model,
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error('Empty response from OpenRouter');
      return content;
    } catch (err: any) {
      const status: number = err?.status ?? err?.response?.status ?? 0;
      const isTransient = status === 429 || (status >= 500 && status < 600);

      if (attempt < maxAttempts && isTransient) {
        await sleep(attempt * 2000);
        continue;
      }

      throw err;
    }
  }

  // Unreachable, but TypeScript needs it
  throw new Error('Unexpected exit from retry loop');
}
