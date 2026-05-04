import { config } from "./config.js";

interface CompletionResult {
  text: string;
  tokens: number;
}

export async function complete(apiKey: string, model: string, prompt: string): Promise<CompletionResult> {
  const res = await fetch(`${config.proxy.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      max_tokens: config.proxy.maxTokens,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`LiteLLM proxy ${res.status}: ${err}`);
  }

  const data = (await res.json()) as {
    choices: { message: { content: string } }[];
    usage: { total_tokens: number };
  };

  return {
    text: data.choices[0].message.content,
    tokens: data.usage.total_tokens,
  };
}
