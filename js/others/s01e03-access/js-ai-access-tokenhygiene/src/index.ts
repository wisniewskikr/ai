import { TokenVault, ScopeViolationError, TokenExpiredError } from "./services/token-vault.js";
import { ChatAgent } from "./services/chat-agent.js";
import { Analyzer } from "./services/analyzer.js";
import { Writer } from "./services/writer.js";
import { logger } from "./utils/logger.js";
import { config } from "./utils/config.js";

const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;
if (!OPENROUTER_KEY) throw new Error("Missing OPENROUTER_API_KEY in .env");

const MASTER_KEY = process.env.PROXY_ADMIN_KEY;
const PROXY_URL  = config.proxy.baseUrl;

async function fetchNewKey(alias: string, models: string[], ttlMinutes: number): Promise<string> {
  if (!MASTER_KEY) throw new Error("Missing PROXY_ADMIN_KEY — cannot rotate token");
  const res = await fetch(`${PROXY_URL}/key/generate`, {
    method: "POST",
    headers: { Authorization: `Bearer ${MASTER_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ key_alias: alias, models, ttl_minutes: ttlMinutes }),
  });
  if (!res.ok) throw new Error(`Key rotation failed for '${alias}': ${await res.text()}`);
  const data = (await res.json()) as { key: string };
  logger.info(`[vault] rotated token '${alias}'`);
  return data.key;
}

// ─── BAD PATTERN ─────────────────────────────────────────────────────────────

function demoBadPattern(): void {
  const masked = OPENROUTER_KEY!.slice(0, 14) + "...";
  logger.warn("=== BAD PATTERN ===");
  logger.warn(`[chat]     Uses: ${masked} (full OpenRouter key, no restrictions)`);
  logger.warn(`[analyzer] Uses: ${masked} (same key, same scope)`);
  logger.warn(`[writer]   Uses: ${masked} (no audit, no expiry)`);
}

// ─── GOOD PATTERN ────────────────────────────────────────────────────────────

async function buildVault(): Promise<TokenVault> {
  const vault = new TokenVault();
  const { chat, analyzer, writer } = config.services;

  // Each service gets its own virtual key from the local proxy —
  // scope is enforced server-side by the proxy, not just in code.
  // If the env var is absent, a new key is fetched automatically.
  const chatKey     = process.env.CHAT_API_KEY     ?? await fetchNewKey("chat-key",     [chat.model],     chat.ttlMinutes);
  const analyzerKey = process.env.ANALYZER_API_KEY ?? await fetchNewKey("analyzer-key", [analyzer.model], analyzer.ttlMinutes);
  const writerKey   = process.env.WRITER_API_KEY   ?? await fetchNewKey("writer-key",   [writer.model],   writer.ttlMinutes);

  vault.register(chat.tokenName,     chatKey,     [chat.model],     chat.ttlMinutes,     () => fetchNewKey("chat-key",     [chat.model],     chat.ttlMinutes));
  vault.register(analyzer.tokenName, analyzerKey, [analyzer.model], analyzer.ttlMinutes, () => fetchNewKey("analyzer-key", [analyzer.model], analyzer.ttlMinutes));
  vault.register(writer.tokenName,   writerKey,   [writer.model],   writer.ttlMinutes,   () => fetchNewKey("writer-key",   [writer.model],   writer.ttlMinutes));

  return vault;
}

async function demoGoodPattern(vault: TokenVault): Promise<void> {
  logger.info("=== GOOD PATTERN (via local proxy) ===");

  const { chat, analyzer, writer } = config.services;
  logger.info(`[chat]     Token: ${chat.tokenName}     | scope: ${chat.model.split("/")[1]}  | TTL: ${vault.getTtlMinutes(chat.tokenName)}min`);
  logger.info(`[analyzer] Token: ${analyzer.tokenName} | scope: ${analyzer.model.split("/")[1]}  | TTL: ${vault.getTtlMinutes(analyzer.tokenName)}min`);
  logger.info(`[writer]   Token: ${writer.tokenName}   | scope: ${writer.model.split("/")[1]} | TTL: ${vault.getTtlMinutes(writer.tokenName)}min`);

  const chatAgent   = new ChatAgent(vault);
  const analyzerSvc = new Analyzer(vault);
  const writerSvc   = new Writer(vault);

  await chatAgent.chat("Say hello in English");
  await analyzerSvc.analyze("Token hygiene matters");
  await writerSvc.write("API security");
}

function printAuditLog(vault: TokenVault): void {
  logger.info("AUDIT LOG:");
  for (const entry of vault.getAuditLog()) {
    const ts    = entry.timestamp.toISOString().replace("T", " ").slice(0, 19);
    const name  = entry.tokenName.padEnd(16);
    const model = entry.model.split("/")[1]?.padEnd(22) ?? entry.model.padEnd(22);
    const tok   = String(entry.tokens).padStart(4);
    logger.info(`${ts} | ${name} | ${model} | ${tok} tokens`);
  }
}

// ─── SCOPE VIOLATION TEST ─────────────────────────────────────────────────────

function demoScopeViolation(vault: TokenVault): void {
  logger.info("=== SCOPE VIOLATION TEST ===");
  logger.info("[analyzer] attempting to use claude-opus-4-6...");
  try {
    vault.getApiKey(config.services.analyzer.tokenName, "anthropic/claude-opus-4-6");
  } catch (e) {
    if (e instanceof ScopeViolationError) {
      logger.error(`ScopeViolationError — ${e.message}`);
    }
  }
}

// ─── TOKEN EXPIRY TEST ────────────────────────────────────────────────────────

async function demoTokenExpiry(): Promise<void> {
  const vault = new TokenVault();
  vault.register("ANALYZER_TOKEN", "expired-key-placeholder", ["anthropic/claude-haiku-4-5"], -3);

  logger.info("=== TOKEN EXPIRY TEST ===");
  logger.info("[analyzer] attempting to use after TTL expired...");
  try {
    await vault.getApiKey("ANALYZER_TOKEN", "anthropic/claude-haiku-4-5");
  } catch (e) {
    if (e instanceof TokenExpiredError) {
      logger.error(`TokenExpiredError — ${e.message}`);
    }
  }
}

// ─── MAIN ────────────────────────────────────────────────────────────────────

demoBadPattern();

const vault = await buildVault();
await demoGoodPattern(vault);
printAuditLog(vault);
demoScopeViolation(vault);
await demoTokenExpiry();
