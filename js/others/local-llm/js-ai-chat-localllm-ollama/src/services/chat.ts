import { Ollama } from "ollama";
import configJson from "../../config.json" assert { type: "json" };
import { systemPrompt } from "../prompts/system.js";
import { logger } from "../utils/logger.js";

type Message = { role: "user" | "assistant" | "system"; content: string };

const ollama = new Ollama({ host: configJson.ollama.host });

const history: Message[] = [
  { role: "system", content: systemPrompt },
];

export async function chat(userMessage: string): Promise<void> {
  history.push({ role: "user", content: userMessage });
  logger.info(`User: ${userMessage}`);

  const stream = await ollama.chat({
    model: configJson.ollama.model,
    messages: history,
    stream: true,
  });

  let response = "";
  process.stdout.write("\nAsystent: ");

  for await (const chunk of stream) {
    process.stdout.write(chunk.message.content);
    response += chunk.message.content;
  }

  console.log("\n");
  history.push({ role: "assistant", content: response });
  logger.info(`Assistant: ${response}`);
}

export function clearHistory(): void {
  history.splice(1); // keep system prompt
  logger.info("Chat history cleared");
}
