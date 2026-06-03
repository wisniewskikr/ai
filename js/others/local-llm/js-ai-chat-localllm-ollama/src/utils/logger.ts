import * as fs from "fs";
import * as path from "path";
import configJson from "../../config.json" assert { type: "json" };

type LogLevel = "INFO" | "WARN" | "ERROR";

const logsDir = path.resolve(configJson.logging.dir);

function ensureLogsDir(): void {
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
}

function timestamp(): string {
  return new Date().toISOString().replace("T", " ").slice(0, 19);
}

function logFile(): string {
  const date = new Date().toISOString().slice(0, 10);
  return path.join(logsDir, `chat-${date}.log`);
}

function write(level: LogLevel, message: string): void {
  ensureLogsDir();
  const line = `[${timestamp()}] [${level}] ${message}\n`;
  fs.appendFileSync(logFile(), line, "utf8");
}

export const logger = {
  info: (message: string) => write("INFO", message),
  warn: (message: string) => write("WARN", message),
  error: (message: string) => write("ERROR", message),
};
