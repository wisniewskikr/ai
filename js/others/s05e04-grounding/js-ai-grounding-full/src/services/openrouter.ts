import * as dotenv from "dotenv";
import config from "../../config.json";

dotenv.config();

const API_KEY = process.env.OPENROUTER_API_KEY;
if (!API_KEY) throw new Error("OPENROUTER_API_KEY not set in .env");

const BASE_URL = "https://openrouter.ai/api/v1/chat/completions";

export interface ModelResponse {
  answer: string;
  confidence: number;
  keywords: string[];
  language: string;
}

async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
}

export async function callModel<T>(model: string, prompt: string): Promise<T> {
  const { timeoutMs, maxRetries } = config.verification;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetchWithTimeout(
        BASE_URL,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model,
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" },
          }),
        },
        timeoutMs
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
      const content: string | undefined = data.choices?.[0]?.message?.content;
      if (!content) throw new Error("Empty response from model");

      const cleaned = content.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
      return JSON.parse(cleaned) as T;
    } catch (err) {
      if (attempt === maxRetries) throw err;
      // Exponential backoff before retry
      await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, attempt)));
    }
  }

  throw new Error("Max retries exceeded");
}
