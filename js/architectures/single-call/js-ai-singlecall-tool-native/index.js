import OpenAI from "openai";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import "dotenv/config";
import config from "./config.json" with { type: "json" };

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOGS_DIR = path.join(__dirname, "logs");

// ── Logger ────────────────────────────────────────────────────────────────────

function ensureLogsDir() {
  if (!fs.existsSync(LOGS_DIR)) fs.mkdirSync(LOGS_DIR, { recursive: true });
}

function getLogFilePath() {
  const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  return path.join(LOGS_DIR, `${date}.log`);
}

function log(level, message, data = null) {
  const timestamp = new Date().toISOString();
  const dataStr = data ? `\n  ${JSON.stringify(data, null, 2).replace(/\n/g, "\n  ")}` : "";

  const consoleLine = `[${timestamp}] [${level.padEnd(5)}] ${message}${dataStr}`;
  const fileLine = consoleLine + "\n";

  const colors = { INFO: "\x1b[36m", OK: "\x1b[32m", ERROR: "\x1b[31m", CALL: "\x1b[35m" };
  const reset = "\x1b[0m";
  const color = colors[level] ?? "";

  console.log(`${color}${consoleLine}${reset}`);

  ensureLogsDir();
  fs.appendFileSync(getLogFilePath(), fileLine, "utf8");
}

// ── Native tool definition ────────────────────────────────────────────────────

const tools = [
  {
    type: "function",
    function: {
      name: "to_uppercase",
      description: "Converts the given text to uppercase letters.",
      parameters: {
        type: "object",
        properties: {
          text: { type: "string", description: "The text to convert to uppercase." },
        },
        required: ["text"],
      },
    },
  },
];

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  log("INFO", "Starting single-call tool-native example");
  log("INFO", "Loaded config", { model: config.model, text: config.text });

  const inputText = config.text;
  log("INFO", `Input text: "${inputText}"`);

  // Build the OpenRouter client (OpenAI-compatible)
  const client = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
  });

  const messages = [
    {
      role: "user",
      content: inputText,
    },
  ];

  log("INFO", "Sending request to model", { model: config.model, messages });

  // Single API call with tools
  const response = await client.chat.completions.create({
    model: config.model,
    messages,
    tools,
    tool_choice: "required",
  });

  log("INFO", "Received response from model", {
    finish_reason: response.choices[0].finish_reason,
    usage: response.usage,
  });

  const assistantMessage = response.choices[0].message;

  if (!assistantMessage.tool_calls?.length) {
    log("ERROR", "Model did not call any tool — unexpected response");
    process.exit(1);
  }

  // Display what tool(s) the model wants to call — no execution
  console.log("\n" + "▶".repeat(50));
  for (const toolCall of assistantMessage.tool_calls) {
    const { name, arguments: argsJson } = toolCall.function;
    log("CALL", `Model wants to call tool: ${name}`, {
      tool_call_id: toolCall.id,
      arguments: JSON.parse(argsJson),
    });
  }
  console.log("▶".repeat(50) + "\n");

  log("INFO", "Single call complete — tool was NOT executed (by design)");
  log("INFO", "Done. Log written to: " + getLogFilePath());
}

main().catch((err) => {
  log("ERROR", "Unhandled error", { message: err.message, stack: err.stack });
  process.exit(1);
});
