import fs from "fs";
import path from "path";

const LOGS_DIR = "logs";

function ensureLogsDir() {
  if (!fs.existsSync(LOGS_DIR)) {
    fs.mkdirSync(LOGS_DIR, { recursive: true });
  }
}

function logFilePath(): string {
  const date = new Date().toISOString().split("T")[0];
  return path.join(LOGS_DIR, `demo-${date}.log`);
}

function formatLine(level: string, message: string): string {
  const ts = new Date().toISOString().replace("T", " ").split(".")[0];
  return `[${ts}] [${level}] ${message}`;
}

function write(level: string, message: string) {
  ensureLogsDir();
  const line = formatLine(level, message);
  console.log(line);
  fs.appendFileSync(logFilePath(), line + "\n");
}

export const logger = {
  info: (msg: string) => write("INFO", msg),
  warn: (msg: string) => write("WARN", msg),
  error: (msg: string) => write("ERROR", msg),
};
