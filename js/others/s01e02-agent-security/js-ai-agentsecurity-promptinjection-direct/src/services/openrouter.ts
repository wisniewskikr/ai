import * as dotenv from "dotenv";
import config from "../../config.json";
import { logger } from "../utils/logger";

dotenv.config();

export interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  error?: {
    message: string;
    code?: number;
  };
}

export async function sendChat(messages: Message[]): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not set. Check your .env file.");
  }

  logger.info(`Sending request to ${config.model} (${messages.length} messages)`);

  const response = await fetch(config.apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages,
      max_tokens: config.maxTokens,
      temperature: config.temperature,
    }),
  });

  const data = (await response.json()) as OpenRouterResponse;

  if (!response.ok || data.error) {
    const errorMsg = data.error?.message ?? `HTTP ${response.status}`;
    logger.error(`API request failed: ${errorMsg}`);
    throw new Error(`OpenRouter API error: ${errorMsg}`);
  }

  const reply = data.choices[0]?.message?.content?.trim() ?? "(empty response)";
  logger.info(`Response received (${reply.length} chars)`);
  return reply;
}
