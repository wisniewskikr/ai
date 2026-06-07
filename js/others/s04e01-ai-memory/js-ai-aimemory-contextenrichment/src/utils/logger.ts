import { appendFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

const LOG_DIR = "logs";
const LOG_FILE = join(LOG_DIR, `app-${new Date().toISOString().slice(0, 10)}.log`);

if (!existsSync(LOG_DIR)) mkdirSync(LOG_DIR);

export function log(level: "INFO" | "WARN" | "ERROR", message: string): void {
  const timestamp = new Date().toISOString().replace("T", " ").slice(0, 19);
  const line = `[${timestamp}] [${level}] ${message}\n`;
  appendFileSync(LOG_FILE, line, "utf-8");
}
