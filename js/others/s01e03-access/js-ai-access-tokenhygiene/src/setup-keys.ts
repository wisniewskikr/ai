import { config } from "./utils/config.js";
import { logger } from "./utils/logger.js";

const MASTER_KEY = process.env.LITELLM_MASTER_KEY;
if (!MASTER_KEY) throw new Error("Brak LITELLM_MASTER_KEY w .env");

const PROXY_URL = config.proxy.baseUrl;

async function createVirtualKey(alias: string, models: string[]): Promise<string> {
  const res = await fetch(`${PROXY_URL}/key/generate`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${MASTER_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ key_alias: alias, models }),
  });

  if (!res.ok) {
    throw new Error(`Nie udało się utworzyć klucza '${alias}': ${await res.text()}`);
  }

  const data = (await res.json()) as { key: string };
  return data.key;
}

async function setup(): Promise<void> {
  logger.info("Tworzenie wirtualnych kluczy przez LiteLLM proxy...");

  const { chat, analyzer, writer } = config.services;

  const chatKey     = await createVirtualKey("chat-key",     [chat.model]);
  const analyzerKey = await createVirtualKey("analyzer-key", [analyzer.model]);
  const writerKey   = await createVirtualKey("writer-key",   [writer.model]);

  logger.info("Klucze utworzone. Dodaj do .env:");
  console.log(`\nCHAT_API_KEY=${chatKey}`);
  console.log(`ANALYZER_API_KEY=${analyzerKey}`);
  console.log(`WRITER_API_KEY=${writerKey}`);
}

setup().catch((e: Error) => {
  logger.error(e.message);
  process.exit(1);
});
