import "dotenv/config";
import OpenAI from "openai";
import winston from "winston";
import fs from "fs";
import { readFile } from "fs/promises";

// ── Logger setup ─────────────────────────────────────────────────────────────

if (!fs.existsSync("logs")) fs.mkdirSync("logs");

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.printf(({ timestamp, level, message }) =>
      `[${timestamp}] ${level.toUpperCase().padEnd(5)} ${message}`
    )
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize({ all: true }),
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        winston.format.printf(({ timestamp, level, message }) =>
          `[${timestamp}] ${level.padEnd(15)} ${message}`
        )
      ),
    }),
    new winston.transports.File({ filename: "logs/app.log" }),
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
  ],
});

// ── MCP tool definition ───────────────────────────────────────────────────────

const tools = [
  {
    type: "function",
    function: {
      name: "to_uppercase",
      description: "Converts the given text to uppercase letters.",
      parameters: {
        type: "object",
        properties: {
          text: {
            type: "string",
            description: "The text to convert to uppercase.",
          },
        },
        required: ["text"],
      },
    },
  },
];

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  logger.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  logger.info("  Single-Call Architecture – MCP Tool Use Demo");
  logger.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  // 1. Load config
  logger.info("Step 1/4 · Loading config.json …");
  const config = JSON.parse(await readFile("config.json", "utf8"));
  logger.info(`          model  : ${config.model}`);
  logger.info(`          prompt : ${config.prompt}`);

  // 2. Build OpenAI client (OpenRouter-compatible)
  logger.info("Step 2/4 · Initialising OpenAI client (OpenRouter) …");
  const client = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
  });

  // 3. Send single call to the model
  logger.info("Step 3/4 · Sending request to the model …");
  logger.info(`          Available tools : ${tools.map((t) => t.function.name).join(", ")}`);

  const response = await client.chat.completions.create({
    model: config.model,
    messages: [{ role: "user", content: config.prompt }],
    tools,
    tool_choice: "auto",
  });

  const message = response.choices[0].message;

  // 4. Inspect the model's response
  logger.info("Step 4/4 · Inspecting model response …");

  if (message.tool_calls && message.tool_calls.length > 0) {
    const call = message.tool_calls[0];
    const args = JSON.parse(call.function.arguments);

    logger.info("──────────────────────────────────────────────────────");
    logger.info("  Model requested a tool call  ✓");
    logger.info(`  Function : ${call.function.name}`);
    logger.info(`  Arguments: ${JSON.stringify(args, null, 0)}`);
    logger.info("──────────────────────────────────────────────────────");
    logger.info("  (Single-call demo – tool is NOT executed)");
    logger.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  } else {
    logger.warn("Model did not request any tool call.");
    logger.info(`Model text response: ${message.content}`);
  }
}

main().catch((err) => {
  logger.error(`Unexpected error: ${err.message}`);
  process.exit(1);
});
