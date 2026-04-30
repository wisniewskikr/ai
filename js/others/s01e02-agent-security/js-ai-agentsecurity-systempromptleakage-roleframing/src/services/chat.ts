import { Logger } from "../utils/logger";

interface ChatConfig {
  apiKey: string;
  apiBaseUrl: string;
  model: string;
  temperature: number;
  maxTokens: number;
}

interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function sendMessage(
  messages: Message[],
  config: ChatConfig,
  logger: Logger
): Promise<string> {
  logger.info(`Sending request to model: ${config.model}`);

  const response = await fetch(config.apiBaseUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: config.model,
      messages,
      temperature: config.temperature,
      max_tokens: config.maxTokens,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    logger.error(`API error ${response.status}: ${error}`);
    throw new Error(`API request failed (${response.status}): ${error}`);
  }

  const data = (await response.json()) as {
    choices: Array<{ message: { content: string } }>;
  };

  const reply = data.choices[0]?.message?.content ?? "";
  logger.info(`Model replied (${reply.length} chars)`);
  return reply;
}
