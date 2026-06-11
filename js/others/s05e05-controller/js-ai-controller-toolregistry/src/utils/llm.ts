import { AppConfig } from "../types";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

// Simple LLM call without tool use — used by translator, summarizer, and router.
// model and maxTokens can be overridden to use a cheaper model for routing.
export async function callLLM(
  userPrompt: string,
  systemPrompt: string,
  config: AppConfig,
  model?: string,
  maxTokens?: number
): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.requestTimeoutMs);

  try {
    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model ?? config.model,
        max_tokens: maxTokens ?? config.maxTokens,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter API error ${response.status}: ${errorText}`);
    }

    const data = await response.json() as {
      choices: Array<{ message: { content: string } }>;
    };

    return data.choices[0].message.content;
  } finally {
    clearTimeout(timeout);
  }
}
