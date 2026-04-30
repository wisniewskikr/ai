import config from '../../config.json';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface OpenRouterCall {
  model: 'main' | 'judge';
  systemPrompt: string;
  userMessage: string;
  history?: ChatMessage[];
}

interface OpenRouterResponse {
  choices: Array<{ message: { content: string } }>;
}

export async function callOpenRouter(options: OpenRouterCall): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not set in environment');
  }

  const modelId = options.model === 'main' ? config.models.main : config.models.judge;

  const messages = [
    ...(options.history ?? []),
    { role: 'user' as const, content: options.userMessage },
  ];

  const response = await fetch(`${config.openrouter.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: modelId,
      messages: [{ role: 'system', content: options.systemPrompt }, ...messages],
    }),
    signal: AbortSignal.timeout(config.openrouter.timeoutMs),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`OpenRouter ${response.status}: ${body}`);
  }

  const data = (await response.json()) as OpenRouterResponse;
  return data.choices[0]?.message?.content ?? '';
}
