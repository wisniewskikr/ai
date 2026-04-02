import "dotenv/config";
import { readFileSync } from "fs";
import { logger } from "./src/logger.js";
import { stepModelWithoutTools, stepModelWithTools } from "./src/workflow.js";

// ─── Load configuration ──────────────────────────────────────────────────────
const config = JSON.parse(readFileSync("config.json", "utf8"));
const apiKey = process.env.OPENROUTER_API_KEY;

if (!apiKey) {
  logger.error("OPENROUTER_API_KEY is not set in .env");
  process.exit(1);
}

const { prompt, model } = config;

// ─── Main workflow ───────────────────────────────────────────────────────────
async function main() {
  logger.divider();
  logger.info("Workflow: Hello World — Uppercase Converter");
  logger.info(`Model   : ${model}`);
  logger.info(`Input   : "${prompt}"`);
  logger.divider();

  // Step 1: model answers without any tools
  const result1 = await stepModelWithoutTools({ apiKey, model, prompt });

  logger.divider();

  // Step 2: model uses the to_uppercase tool
  const result2 = await stepModelWithTools({ apiKey, model, prompt });

  logger.divider();
  logger.step("FINAL RESULTS");
  logger.result("Without tools", result1);
  logger.result("With tools   ", result2);
  logger.divider();
  logger.success("Workflow completed successfully.");
}

main().catch((err) => {
  logger.error(err.message);
  process.exit(1);
});
