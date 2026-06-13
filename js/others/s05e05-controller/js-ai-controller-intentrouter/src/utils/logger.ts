import * as fs from "fs";
import * as path from "path";
import { config } from "./config";

const LOG_DIR = path.join(process.cwd(), "logs");
const LOG_FILE = path.join(LOG_DIR, "app.log");

const LEVELS = { info: 0, warn: 1, error: 2 };

function ensureLogDir(): void {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}

function timestamp(): string {
  const now = new Date();
  const pad = (n: number, w = 2) => String(n).padStart(w, "0");
  return (
    `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ` +
    `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
  );
}

function write(level: "info" | "warn" | "error", message: string): void {
  if (LEVELS[level] < LEVELS[config.logLevel]) return;

  const line = `[${timestamp()}] [${level.toUpperCase().padEnd(5)}] ${message}`;
  ensureLogDir();
  fs.appendFileSync(LOG_FILE, line + "\n", "utf-8");
}

export const logger = {
  info: (msg: string) => write("info", msg),
  warn: (msg: string) => write("warn", msg),
  error: (msg: string) => write("error", msg),
};
