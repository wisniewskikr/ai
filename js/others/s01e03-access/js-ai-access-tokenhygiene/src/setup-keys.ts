import { config } from "./utils/config.js";
import { logger } from "./utils/logger.js";

const MASTER_KEY = process.env.PROXY_ADMIN_KEY;
if (!MASTER_KEY) throw new Error("Missing PROXY_ADMIN_KEY in .env");

const PROXY_URL = config.proxy.baseUrl;

async function createVirtualKey(alias: string, models: string[], ttlMinutes?: number): Promise<string> {
  const res = await fetch(`${PROXY_URL}/key/generate`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${MASTER_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ key_alias: alias, models, ttl_minutes: ttlMinutes }),
  });

  if (!res.ok) {
    throw new Error(`Failed to create key '${alias}': ${await res.text()}`);
  }

  const data = (await res.json()) as { key: string };
  return data.key;
}

async function setup(): Promise<void> {
  logger.info("Creating virtual keys via local proxy...");

  const { chat, analyzer, writer } = config.services;

  const chatKey     = await createVirtualKey("chat-key",     [chat.model],     chat.ttlMinutes);
  const analyzerKey = await createVirtualKey("analyzer-key", [analyzer.model], analyzer.ttlMinutes);
  const writerKey   = await createVirtualKey("writer-key",   [writer.model],   writer.ttlMinutes);

  logger.info("Keys created. Add to .env:");
  console.log(`\nCHAT_API_KEY=${chatKey}`);
  console.log(`ANALYZER_API_KEY=${analyzerKey}`);
  console.log(`WRITER_API_KEY=${writerKey}`);
}

setup().catch((e: Error) => {
  logger.error(e.message);
  process.exit(1);
});
