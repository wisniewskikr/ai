import * as fs from "fs";
import * as path from "path";
import OpenAI from "openai";
import { config } from "../utils/config";
import { logger } from "../utils/logger";

export const VALID_INTENTS = ["similarity", "relation", "global"] as const;
export type Intent = (typeof VALID_INTENTS)[number];

const client = new OpenAI({
  apiKey: config.openRouterApiKey,
  baseURL: "https://openrouter.ai/api/v1",
});

function loadPromptTemplate(): string {
  const promptPath = path.join(
    process.cwd(),
    "src",
    "prompts",
    "classifyIntent.md"
  );
  return fs.readFileSync(promptPath, "utf-8");
}

function parseIntent(raw: string): Intent {
  const normalized = raw.trim().toLowerCase();
  if (VALID_INTENTS.includes(normalized as Intent)) {
    return normalized as Intent;
  }
  logger.warn(`Invalid intent received: "${raw}" — falling back to similarity`);
  return "similarity";
}

async function callLLM(prompt: string, attempt: number): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(
    () => controller.abort(),
    config.requestTimeoutMs
  );

  try {
    const response = await client.chat.completions.create(
      {
        model: config.model,
        messages: [{ role: "user", content: prompt }],
        max_tokens: 10,
        temperature: 0,
      },
      { signal: controller.signal }
    );
    return response.choices[0]?.message?.content ?? "";
  } catch (err: unknown) {
    const isTimeout =
      err instanceof Error && err.name === "AbortError";
    if (isTimeout && attempt < config.maxRetries) {
      logger.error(
        `OpenRouter request failed: timeout after ${config.requestTimeoutMs}ms, retrying (${attempt}/${config.maxRetries})`
      );
      return callLLM(prompt, attempt + 1);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

export async function classifyIntent(question: string): Promise<Intent> {
  const template = loadPromptTemplate();
  const prompt = template.replace("{{question}}", question);

  const raw = await callLLM(prompt, 1);
  return parseIntent(raw);
}
