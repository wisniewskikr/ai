import fs from "fs";
import path from "path";

const LOGS_DIR = path.join(process.cwd(), "logs");
const LOG_FILE = path.join(LOGS_DIR, "app.log");
const USAGE_FILE = path.join(LOGS_DIR, "usage.json");

function ensureLogsDir(): void {
  if (!fs.existsSync(LOGS_DIR)) {
    fs.mkdirSync(LOGS_DIR, { recursive: true });
  }
}

function timestamp(): string {
  return new Date().toISOString().replace("T", " ").substring(0, 19);
}

function writeLog(level: "INFO" | "WARN" | "ERROR", message: string): void {
  ensureLogsDir();
  const line = `[${timestamp()}] [${level.padEnd(5)}] ${message}\n`;
  fs.appendFileSync(LOG_FILE, line, "utf8");
}

export const logger = {
  info: (message: string) => writeLog("INFO", message),
  warn: (message: string) => writeLog("WARN", message),
  error: (message: string) => writeLog("ERROR", message),
};

// Usage tracking — persisted to logs/usage.json by date

type UsageData = Record<string, Record<string, number>>;

function today(): string {
  return new Date().toISOString().substring(0, 10);
}

function loadUsage(): UsageData {
  ensureLogsDir();
  if (!fs.existsSync(USAGE_FILE)) return {};
  try {
    return JSON.parse(fs.readFileSync(USAGE_FILE, "utf8")) as UsageData;
  } catch {
    return {};
  }
}

function saveUsage(data: UsageData): void {
  ensureLogsDir();
  fs.writeFileSync(USAGE_FILE, JSON.stringify(data, null, 2), "utf8");
}

export function getUsageCount(toolName: string): number {
  const data = loadUsage();
  return data[today()]?.[toolName] ?? 0;
}

export function incrementUsage(toolName: string): void {
  const data = loadUsage();
  const day = today();
  if (!data[day]) data[day] = {};
  data[day][toolName] = (data[day][toolName] ?? 0) + 1;
  saveUsage(data);
}
