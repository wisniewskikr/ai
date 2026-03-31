import "dotenv/config";
import OpenAI from "openai";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
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

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Converts MCP tool definitions to OpenAI function-calling format. */
function mcpToolsToOpenAI(mcpTools) {
  return mcpTools.map((tool) => ({
    type: "function",
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.inputSchema,
    },
  }));
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  logger.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  logger.info("  Single-Call Architecture – MCP Tool Use Demo");
  logger.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  // 1. Load config
  logger.info("Step 1/5 · Loading config.json …");
  const config = JSON.parse(await readFile("config.json", "utf8"));
  logger.info(`          model  : ${config.model}`);
  logger.info(`          prompt : ${config.prompt}`);

  // 2. Connect to MCP server
  logger.info("Step 2/5 · Starting MCP server (stdio transport) …");
  const transport = new StdioClientTransport({
    command: "node",
    args: ["mcp-server.js"],
  });

  const mcpClient = new Client({ name: "hello-world-client", version: "1.0.0" });
  await mcpClient.connect(transport);
  logger.info("          MCP server connected ✓");

  // 3. Discover tools from MCP server
  logger.info("Step 3/5 · Discovering tools from MCP server …");
  const { tools: mcpTools } = await mcpClient.listTools();
  const toolNames = mcpTools.map((t) => t.name).join(", ");
  logger.info(`          Tools discovered : ${toolNames}`);

  mcpTools.forEach((tool) => {
    logger.info(`          ┌─ tool: ${tool.name}`);
    logger.info(`          │  description : ${tool.description}`);
    const props = Object.keys(tool.inputSchema?.properties ?? {}).join(", ");
    logger.info(`          └─ parameters  : ${props}`);
  });

  // 4. Send single call to the model
  logger.info("Step 4/5 · Sending single request to the model …");
  const openAITools = mcpToolsToOpenAI(mcpTools);

  const client = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
  });

  const response = await client.chat.completions.create({
    model: config.model,
    messages: [{ role: "user", content: config.prompt }],
    tools: openAITools,
    tool_choice: "auto",
  });

  await mcpClient.close();

  // 5. Inspect the model's response
  logger.info("Step 5/5 · Inspecting model response …");
  const message = response.choices[0].message;

  if (message.tool_calls && message.tool_calls.length > 0) {
    const call = message.tool_calls[0];
    const args = JSON.parse(call.function.arguments);

    logger.info("──────────────────────────────────────────────────────");
    logger.info("  Model requested a tool call  ✓");
    logger.info(`  Function  : ${call.function.name}`);
    logger.info(`  Arguments : ${JSON.stringify(args)}`);
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
