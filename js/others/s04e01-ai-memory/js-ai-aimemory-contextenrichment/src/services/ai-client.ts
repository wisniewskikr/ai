import { createRequire } from "module";
const require = createRequire(import.meta.url);
const config = require("../../config.json") as {
  model: string;
  timeout_ms: number;
  retry_limit: number;
  retry_delay_ms: number;
};

interface Message {
  role: "system" | "user";
  content: string;
}

interface OpenRouterResponse {
  choices: Array<{ message: { content: string } }>;
}

export async function askAI(system: string, userMessage: string): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY is not set in .env");

  const messages: Message[] = [
    { role: "system", content: system },
    { role: "user", content: userMessage },
  ];

  for (let attempt = 1; attempt <= config.retry_limit; attempt++) {
    const response = await fetchWithTimeout(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ model: config.model, messages }),
      },
      config.timeout_ms
    );

    if (response.status === 429) {
      if (attempt < config.retry_limit) {
        console.log(`  Rate limited, retrying in ${config.retry_delay_ms * attempt}ms...`);
        await sleep(config.retry_delay_ms * attempt);
        continue;
      }
      throw new Error("Rate limit exceeded. Try again later.");
    }

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`API error ${response.status}: ${body}`);
    }

    const data = (await response.json()) as OpenRouterResponse;
    return data.choices[0].message.content.trim();
  }

  throw new Error("All retry attempts failed");
}

function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(timer));
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
