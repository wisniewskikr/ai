import * as fs from "fs";
import * as path from "path";

type LogLevel = "INFO" | "WARN" | "ERROR";

function formatMessage(level: LogLevel, message: string): string {
  const timestamp = new Date().toISOString().replace("T", " ").substring(0, 19);
  return `[${timestamp}] [${level}] ${message}`;
}

function writeToFile(line: string, logFile: string): void {
  const dir = path.dirname(logFile);
  fs.mkdirSync(dir, { recursive: true });
  fs.appendFileSync(logFile, line + "\n", "utf-8");
}

export function createLogger(logFile: string) {
  return {
    info(message: string): void {
      const line = formatMessage("INFO", message);
      console.log(line);
      writeToFile(line, logFile);
    },
    warn(message: string): void {
      const line = formatMessage("WARN", message);
      console.warn(line);
      writeToFile(line, logFile);
    },
    error(message: string): void {
      const line = formatMessage("ERROR", message);
      console.error(line);
      writeToFile(line, logFile);
    },
  };
}
