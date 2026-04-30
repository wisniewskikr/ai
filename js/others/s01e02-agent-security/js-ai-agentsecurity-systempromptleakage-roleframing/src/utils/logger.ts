import fs from "fs";
import path from "path";

type LogLevel = "INFO" | "WARN" | "ERROR";

function timestamp(): string {
  return new Date().toISOString().replace("T", " ").slice(0, 19);
}

function formatLine(level: LogLevel, message: string): string {
  return `[${timestamp()}] [${level}] ${message}`;
}

function ensureLogDir(logFile: string): void {
  const dir = path.dirname(logFile);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function createLogger(logFile: string) {
  ensureLogDir(logFile);

  function write(level: LogLevel, message: string): void {
    const line = formatLine(level, message);
    fs.appendFileSync(logFile, line + "\n");
  }

  return {
    info: (msg: string) => write("INFO", msg),
    warn: (msg: string) => write("WARN", msg),
    error: (msg: string) => write("ERROR", msg),
  };
}

export type Logger = ReturnType<typeof createLogger>;
