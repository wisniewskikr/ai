import "dotenv/config";
import OpenAI from "openai";
import fs from "fs";
import path from "path";
import { readFileSync } from "fs";

// ── Load config ──────────────────────────────────────────────────────────────
const config = JSON.parse(readFileSync("./config.json", "utf-8"));

// ── Logger setup ─────────────────────────────────────────────────────────────
const logsDir = "./logs";
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logFile = path.join(
  logsDir,
  `run-${new Date().toISOString().replace(/[:.]/g, "-")}.log`
);
const logStream = fs.createWriteStream(logFile, { flags: "a" });

function log(level, message) {
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] [${level.toUpperCase()}] ${message}`;

  // Console output with color
  const colors = { INFO: "\x1b[36m", SUCCESS: "\x1b[32m", ERROR: "\x1b[31m" };
  const reset = "\x1b[0m";
  const color = colors[level.toUpperCase()] ?? "\x1b[37m";
  console.log(`${color}${line}${reset}`);

  // File output (no color codes)
  logStream.write(line + "\n");
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function run(inputText) {
  log("INFO", `Starting single-call example`);
  log("INFO", `Input text    : "${inputText}"`);
  log("INFO", `Model         : ${config.model}`);

  const client = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
  });

  const prompt = `Convert the following text to UPPERCASE and return ONLY the result with no extra explanation:\n\n${inputText}`;

  log("INFO", `Sending request to model...`);

  const response = await client.chat.completions.create({
    model: config.model,
    messages: [{ role: "user", content: prompt }],
  });

  const result = response.choices[0].message.content.trim();

  log("SUCCESS", `Response received`);
  log("SUCCESS", `Result        : "${result}"`);
  log("INFO", `Log saved to  : ${logFile}`);

  logStream.end();
  return result;
}

// ── Entry point ───────────────────────────────────────────────────────────────
const inputText = config.text;
run(inputText);
