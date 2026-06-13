import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

dotenv.config();

interface AppConfig {
  model: string;
  requestTimeoutMs: number;
  maxRetries: number;
  vectorTopK: number;
  logLevel: "info" | "warn" | "error";
  openRouterApiKey: string;
}

function loadConfig(): AppConfig {
  const configPath = path.join(process.cwd(), "config.json");
  const raw = fs.readFileSync(configPath, "utf-8");
  const json = JSON.parse(raw);

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is missing from .env");
  }

  return {
    model: json.model,
    requestTimeoutMs: json.requestTimeoutMs,
    maxRetries: json.maxRetries,
    vectorTopK: json.vectorTopK,
    logLevel: json.logLevel,
    openRouterApiKey: apiKey,
  };
}

export const config = loadConfig();
