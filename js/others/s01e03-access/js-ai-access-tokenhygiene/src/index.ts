import { TokenVault, ScopeViolationError, TokenExpiredError } from "./token-vault.js";
import { ChatAgent, Analyzer, Writer } from "./services.js";

const API_KEY = process.env.OPENROUTER_API_KEY;
if (!API_KEY) throw new Error("Brak OPENROUTER_API_KEY w .env");

// ─── BAD PATTERN ────────────────────────────────────────────────────────────

function demoBadPattern() {
  const masked = API_KEY!.slice(0, 14) + "...";
  console.log("\n=== BAD PATTERN ===");
  console.log(`[chat]     Używa: ${masked} (pełny klucz, bez ograniczeń)`);
  console.log(`[analyzer] Używa: ${masked} (ten sam klucz, ten sam scope)`);
  console.log(`[writer]   Używa: ${masked} (brak audytu, brak expiry)`);
}

// ─── GOOD PATTERN ───────────────────────────────────────────────────────────

function buildVault(): TokenVault {
  const vault = new TokenVault();
  vault.register("CHAT_TOKEN",     API_KEY!, ["anthropic/claude-haiku-4-5"],  5);
  vault.register("ANALYZER_TOKEN", API_KEY!, ["anthropic/claude-haiku-4-5"],  2);
  vault.register("WRITER_TOKEN",   API_KEY!, ["anthropic/claude-sonnet-4-6"], 10);
  return vault;
}

async function demoGoodPattern(vault: TokenVault) {
  console.log("\n=== GOOD PATTERN ===");

  console.log(
    `[chat]     Token: CHAT_TOKEN     | scope: claude-haiku-4-5  | TTL: ${vault.getTtlMinutes("CHAT_TOKEN")}min`
  );
  console.log(
    `[analyzer] Token: ANALYZER_TOKEN | scope: claude-haiku-4-5  | TTL: ${vault.getTtlMinutes("ANALYZER_TOKEN")}min`
  );
  console.log(
    `[writer]   Token: WRITER_TOKEN   | scope: claude-sonnet-4-6 | TTL: ${vault.getTtlMinutes("WRITER_TOKEN")}min`
  );

  const chat     = new ChatAgent(vault);
  const analyzer = new Analyzer(vault);
  const writer   = new Writer(vault);

  await chat.chat("Powiedz 'cześć' po polsku");
  await analyzer.analyze("Token hygiene matters");
  await writer.write("bezpieczeństwo API");
}

function printAuditLog(vault: TokenVault) {
  console.log("\nAUDIT LOG:");
  for (const entry of vault.getAuditLog()) {
    const ts = entry.timestamp.toISOString().replace("T", " ").slice(0, 19);
    const name  = entry.tokenName.padEnd(16);
    const model = entry.model.split("/")[1]?.padEnd(22) ?? entry.model.padEnd(22);
    const tok   = String(entry.tokens).padStart(4);
    console.log(`${ts} | ${name} | ${model} | ${tok} tokens`);
  }
}

// ─── SCOPE VIOLATION TEST ────────────────────────────────────────────────────

async function demoScopeViolation(vault: TokenVault) {
  console.log("\n=== SCOPE VIOLATION TEST ===");
  console.log("[analyzer] próba użycia claude-opus-4-6...");
  try {
    vault.getApiKey("ANALYZER_TOKEN", "anthropic/claude-opus-4-6");
  } catch (e) {
    if (e instanceof ScopeViolationError) {
      console.log(`ERROR: ScopeViolationError — ${e.message}`);
    }
  }
}

// ─── TOKEN EXPIRY TEST ───────────────────────────────────────────────────────

async function demoTokenExpiry() {
  const vault = new TokenVault();
  // token wygasa natychmiast (0 minut = już wygasł)
  vault.register("ANALYZER_TOKEN", API_KEY!, ["anthropic/claude-haiku-4-5"], -3);

  console.log("\n=== TOKEN EXPIRY TEST ===");
  console.log("[analyzer] próba użycia po wygaśnięciu TTL...");
  try {
    vault.getApiKey("ANALYZER_TOKEN", "anthropic/claude-haiku-4-5");
  } catch (e) {
    if (e instanceof TokenExpiredError) {
      console.log(`ERROR: TokenExpiredError — ${e.message}`);
    }
  }
}

// ─── MAIN ────────────────────────────────────────────────────────────────────

demoBadPattern();

const vault = buildVault();
await demoGoodPattern(vault);
printAuditLog(vault);
await demoScopeViolation(vault);
await demoTokenExpiry();
