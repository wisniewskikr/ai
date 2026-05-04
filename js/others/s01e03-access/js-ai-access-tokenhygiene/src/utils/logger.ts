import { appendFileSync, mkdirSync } from "fs";
import { join } from "path";
import { config } from "./config.js";

const logsDir = join(process.cwd(), config.logging.dir);
const logFile = join(logsDir, config.logging.file);

mkdirSync(logsDir, { recursive: true });

type Level = "INFO" | "WARN" | "ERROR";

function formatNow(): string {
  return new Date().toISOString().replace("T", " ").slice(0, 19);
}

function write(level: Level, message: string): void {
  const line = `[${formatNow()}] [${level}] ${message}`;
  console.log(line);
  appendFileSync(logFile, line + "\n");
}

export const logger = {
  info:  (msg: string) => write("INFO",  msg),
  warn:  (msg: string) => write("WARN",  msg),
  error: (msg: string) => write("ERROR", msg),
};
