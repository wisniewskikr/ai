import express from "express";
import { DatabaseSync } from "node:sqlite";
import { randomBytes } from "node:crypto";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
if (!OPENROUTER_API_KEY) throw new Error("Missing OPENROUTER_API_KEY in .env");

const MASTER_KEY = process.env.PROXY_ADMIN_KEY;
if (!MASTER_KEY) throw new Error("Missing PROXY_ADMIN_KEY in .env");

const PORT = 4000;
const OPENROUTER_BASE = "https://openrouter.ai/api/v1";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const db = new DatabaseSync(join(root, "proxy.db"));

db.exec(`
  CREATE TABLE IF NOT EXISTS virtual_keys (
    key        TEXT PRIMARY KEY,
    service    TEXT NOT NULL,
    models     TEXT NOT NULL,
    expires_at INTEGER,
    created_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS audit_log (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    key        TEXT NOT NULL,
    service    TEXT NOT NULL,
    model      TEXT NOT NULL,
    tokens     INTEGER,
    ts         INTEGER NOT NULL
  );
`);

const app = express();
app.use(express.json());

function bearerToken(req: express.Request): string | null {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) return null;
  return auth.slice(7);
}

// POST /key/generate — create virtual key (admin only)
app.post("/key/generate", (req, res) => {
  if (bearerToken(req) !== MASTER_KEY) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const { key_alias, models, ttl_minutes } = req.body as {
    key_alias: string;
    models: string[];
    ttl_minutes?: number;
  };

  if (!key_alias || !Array.isArray(models)) {
    res.status(400).json({ error: "Missing key_alias or models" });
    return;
  }

  const key = "sk-local-" + randomBytes(16).toString("hex");
  const now = Math.floor(Date.now() / 1000);
  const expiresAt = ttl_minutes ? now + ttl_minutes * 60 : null;

  db.prepare(
    "INSERT OR REPLACE INTO virtual_keys (key, service, models, expires_at, created_at) VALUES (?, ?, ?, ?, ?)"
  ).run(key, key_alias, JSON.stringify(models), expiresAt, now);

  res.json({ key, key_alias, models, expires_at: expiresAt });
});

// POST /chat/completions — validate key, enforce scope, forward to OpenRouter
app.post("/chat/completions", async (req, res) => {
  const token = bearerToken(req);
  if (!token) {
    res.status(401).json({ error: "Missing authorization" });
    return;
  }

  const row = db.prepare("SELECT * FROM virtual_keys WHERE key = ?").get(token) as {
    key: string; service: string; models: string; expires_at: number | null; created_at: number;
  } | undefined;

  if (!row) {
    res.status(401).json({ error: "Invalid key" });
    return;
  }

  const now = Math.floor(Date.now() / 1000);
  if (row.expires_at !== null && now > row.expires_at) {
    res.status(401).json({ error: "Key expired" });
    return;
  }

  const requestedModel = req.body.model as string;
  const allowedModels = JSON.parse(row.models) as string[];
  if (!allowedModels.includes(requestedModel)) {
    res.status(403).json({
      error: `Model '${requestedModel}' not allowed for service '${row.service}'`,
    });
    return;
  }

  const upstream = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(req.body),
  });

  const data = await upstream.json() as {
    usage?: { total_tokens?: number };
    [key: string]: unknown;
  };

  db.prepare(
    "INSERT INTO audit_log (key, service, model, tokens, ts) VALUES (?, ?, ?, ?, ?)"
  ).run(token, row.service, requestedModel, data.usage?.total_tokens ?? 0, now);

  res.status(upstream.status).json(data);
});

app.listen(PORT, () => {
  console.log(`[proxy] Running on http://localhost:${PORT}`);
  console.log(`[proxy] Database: ${join(root, "proxy.db")}`);
});
