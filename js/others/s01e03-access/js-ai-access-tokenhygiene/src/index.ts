import { TokenVault, ScopeViolationError, TokenExpiredError, AuditEntry } from "./services/token-vault.js";
import { ChatAgent } from "./services/chat-agent.js";
import { Analyzer } from "./services/analyzer.js";
import { Writer } from "./services/writer.js";
import { logger } from "./utils/logger.js";
import { config } from "./utils/config.js";

const API_KEY = process.env.OPENROUTER_API_KEY;
if (!API_KEY) throw new Error("Brak OPENROUTER_API_KEY w .env");

// ─── BAD PATTERN ─────────────────────────────────────────────────────────────

function demoBadPattern(): void {
  const masked = API_KEY!.slice(0, 14) + "...";
  logger.warn("=== BAD PATTERN ===");
  logger.warn(`[chat]     Używa: ${masked} (pełny klucz, bez ograniczeń)`);
  logger.warn(`[analyzer] Używa: ${masked} (ten sam klucz, ten sam scope)`);
  logger.warn(`[writer]   Używa: ${masked} (brak audytu, brak expiry)`);
}

// ─── GOOD PATTERN ────────────────────────────────────────────────────────────

function buildVault(): TokenVault {
  const vault = new TokenVault();
  const { chat, analyzer, writer } = config.services;
  vault.register(chat.tokenName,     API_KEY!, [chat.model],     chat.ttlMinutes);
  vault.register(analyzer.tokenName, API_KEY!, [analyzer.model], analyzer.ttlMinutes);
  vault.register(writer.tokenName,   API_KEY!, [writer.model],   writer.ttlMinutes);
  return vault;
}

async function demoGoodPattern(vault: TokenVault): Promise<void> {
  logger.info("=== GOOD PATTERN ===");

  const { chat, analyzer, writer } = config.services;
  logger.info(`[chat]     Token: ${chat.tokenName}     | scope: ${chat.model.split("/")[1]}  | TTL: ${vault.getTtlMinutes(chat.tokenName)}min`);
  logger.info(`[analyzer] Token: ${analyzer.tokenName} | scope: ${analyzer.model.split("/")[1]}  | TTL: ${vault.getTtlMinutes(analyzer.tokenName)}min`);
  logger.info(`[writer]   Token: ${writer.tokenName}   | scope: ${writer.model.split("/")[1]} | TTL: ${vault.getTtlMinutes(writer.tokenName)}min`);

  const chatAgent  = new ChatAgent(vault);
  const analyzerSvc = new Analyzer(vault);
  const writerSvc  = new Writer(vault);

  await chatAgent.chat("Powiedz 'cześć' po polsku");
  await analyzerSvc.analyze("Token hygiene matters");
  await writerSvc.write("bezpieczeństwo API");
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
  logger.info("[analyzer] próba użycia claude-opus-4-6...");
  try {
    vault.getApiKey(config.services.analyzer.tokenName, "anthropic/claude-opus-4-6");
  } catch (e) {
    if (e instanceof ScopeViolationError) {
      logger.error(`ScopeViolationError — ${e.message}`);
    }
  }
}

// ─── TOKEN EXPIRY TEST ────────────────────────────────────────────────────────

function demoTokenExpiry(): void {
  const vault = new TokenVault();
  vault.register("ANALYZER_TOKEN", API_KEY!, ["anthropic/claude-haiku-4-5"], -3);

  logger.info("=== TOKEN EXPIRY TEST ===");
  logger.info("[analyzer] próba użycia po wygaśnięciu TTL...");
  try {
    vault.getApiKey("ANALYZER_TOKEN", "anthropic/claude-haiku-4-5");
  } catch (e) {
    if (e instanceof TokenExpiredError) {
      logger.error(`TokenExpiredError — ${e.message}`);
    }
  }
}

// ─── MAIN ────────────────────────────────────────────────────────────────────

demoBadPattern();

const vault = buildVault();
await demoGoodPattern(vault);
printAuditLog(vault);
demoScopeViolation(vault);
demoTokenExpiry();
