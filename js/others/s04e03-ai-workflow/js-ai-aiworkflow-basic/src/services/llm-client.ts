import OpenAI from "openai";
import pRetry, { AbortError } from "p-retry";
import fs from "fs";
import { config } from "../config.js";
import { log, logInfraCall } from "./monitor.js";

const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

const summarizePrompt = fs.readFileSync("src/prompts/summarize.md", "utf-8");

export interface LLMResult {
  content: string;
  latencyMs: number;
}

export async function callLLM(
  text: string,
  onRetry?: (attempt: number, error: string) => void
): Promise<LLMResult> {
  const start = Date.now();

  const response = await pRetry(
    async () => {
      const res = await client.chat.completions.create({
        model: config.model,
        response_format: { type: "json_object" },
        messages: [{ role: "user", content: `${summarizePrompt}\n\nArticle:\n${text}` }],
      });

      logInfraCall(Date.now() - start, {
        prompt: res.usage?.prompt_tokens,
        completion: res.usage?.completion_tokens,
        total: res.usage?.total_tokens,
      });

      return res;
    },
    {
      retries: config.retry.attempts,
      minTimeout: config.retry.minTimeoutMs,
      factor: config.retry.factor,
      randomize: true,
      onFailedAttempt: (err) => {
        const status = (err as any).status ?? (err as any).response?.status;
        if (status === 400) throw new AbortError(err.message);
        const reason = status === 429 ? "rate limit (429)" : err.message;
        onRetry?.(err.attemptNumber, reason);
        log.warn({ layer: "infra", attempt: err.attemptNumber, error: err.message }, "retry");
      },
    }
  );

  const content = response.choices[0]?.message?.content ?? "{}";
  return { content, latencyMs: Date.now() - start };
}

export async function runCanaryCheck(): Promise<boolean> {
  try {
    const res = await pRetry(
      async () =>
        client.chat.completions.create({
          model: config.model,
          response_format: { type: "json_object" },
          messages: [{ role: "user", content: 'Reply with only valid JSON: {"ok": true}' }],
        }),
      { retries: 2, minTimeout: 500, factor: 2 }
    );

    const content = res.choices[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(content);
    const passed = parsed?.ok === true;
    log.info({ layer: "quality", check: "canary", passed }, "health check");
    return passed;
  } catch (err) {
    log.error({ layer: "quality", check: "canary", error: String(err) }, "canary error");
    return false;
  }
}
