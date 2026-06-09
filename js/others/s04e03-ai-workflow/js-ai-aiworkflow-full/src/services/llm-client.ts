import OpenAI from "openai";
import pRetry, { AbortError } from "p-retry";
import fs from "fs";
import { config } from "../config.js";
import { log, logInfraCall } from "./monitor.js";
import { createLLMBreaker } from "./circuit-breaker.js";
import { shouldSimulateFail, shouldReturnInvalidCanary, getSimMode } from "../utils/simulate.js";

const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

const summarizePrompt = fs.readFileSync("src/prompts/summarize.md", "utf-8");

export interface LLMResult {
  content: string;
  latencyMs: number;
}

// The raw HTTP call — this is what the circuit breaker wraps
async function makeApiCall(prompt: string): Promise<OpenAI.Chat.ChatCompletion> {
  if (shouldSimulateFail()) {
    const err = new Error("Simulated server error (500)");
    (err as any).status = 500;
    throw err;
  }
  return client.chat.completions.create({
    model: config.model,
    response_format: { type: "json_object" },
    messages: [{ role: "user", content: prompt }],
  });
}

// Circuit breaker wraps the single HTTP call — NOT the entire retry logic
// Retry is on the outside: retry → breaker.fire() → makeApiCall
export const breaker = createLLMBreaker(makeApiCall);

export function resetBreaker(): void {
  breaker.close();
}

export async function callLLM(
  text: string,
  onRetry?: (attempt: number, error: string) => void
): Promise<LLMResult> {
  const start = Date.now();
  const prompt = `${summarizePrompt}\n\nArticle:\n${text}`;

  // In simulation mode, use short timeouts so demos complete quickly
  const isSimulation = getSimMode() !== "none";
  const retries = isSimulation ? 2 : config.retry.attempts;
  const minTimeout = isSimulation ? 300 : config.retry.minTimeoutMs;

  const response = await pRetry(
    async () => {
      const res = (await breaker.fire(prompt)) as OpenAI.Chat.ChatCompletion;
      logInfraCall(Date.now() - start, {
        prompt: res.usage?.prompt_tokens,
        completion: res.usage?.completion_tokens,
        total: res.usage?.total_tokens,
      });
      return res;
    },
    {
      retries,
      minTimeout,
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

  const raw = response.choices[0]?.message?.content ?? "{}";
  return { content: stripMarkdownFences(raw), latencyMs: Date.now() - start };
}

// Some models wrap JSON in ```json ... ``` despite response_format: json_object
function stripMarkdownFences(text: string): string {
  const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  return match ? match[1]!.trim() : text.trim();
}

export async function runCanaryCheck(): Promise<boolean> {
  try {
    if (shouldReturnInvalidCanary()) {
      log.warn({ layer: "quality", check: "canary", passed: false }, "canary failed (simulated)");
      return false;
    }

    const res = await pRetry(
      async () =>
        client.chat.completions.create({
          model: config.model,
          response_format: { type: "json_object" },
          messages: [{ role: "user", content: 'Reply with only valid JSON: {"ok": true}' }],
        }),
      { retries: 2, minTimeout: 500, factor: 2 }
    );

    const content = stripMarkdownFences(res.choices[0]?.message?.content ?? "{}");
    const parsed = JSON.parse(content);
    const passed = parsed?.ok === true;
    log.info({ layer: "quality", check: "canary", passed }, "health check");
    return passed;
  } catch (err) {
    log.error({ layer: "quality", check: "canary", error: String(err) }, "canary error");
    return false;
  }
}
