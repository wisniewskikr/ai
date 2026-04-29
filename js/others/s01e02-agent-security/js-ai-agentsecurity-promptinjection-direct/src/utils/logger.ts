import * as fs from "fs";
import * as path from "path";

const LOG_DIR = path.join(process.cwd(), "logs");

function getLogFile(): string {
  const date = new Date().toISOString().split("T")[0];
  return path.join(LOG_DIR, `chat-${date}.log`);
}

function ensureLogDir(): void {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}

function timestamp(): string {
  return new Date().toISOString().replace("T", " ").substring(0, 19);
}

function write(level: "INFO" | "WARN" | "ERROR", message: string): void {
  ensureLogDir();
  const line = `[${timestamp()}] [${level}] ${message}\n`;
  fs.appendFileSync(getLogFile(), line);
}

export const logger = {
  info: (message: string) => write("INFO", message),
  warn: (message: string) => write("WARN", message),
  error: (message: string) => write("ERROR", message),
};
