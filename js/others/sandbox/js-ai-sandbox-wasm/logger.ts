/*
 * logger.ts — dead-simple logger: timestamps, levels, console + file output.
 *
 * No external deps. No config objects. No "log transports".
 * If you need Splunk, write your own wrapper.
 */

import fs from "fs";
import path from "path";

const LOG_DIR = "logs";

// Create logs/ on first import — not lazy, not optional.
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

// ANSI escape codes. A lookup table beats switch statements.
const COLOR = {
  reset:  "\x1b[0m",
  green:  "\x1b[32m",
  yellow: "\x1b[33m",
  red:    "\x1b[31m",
  gray:   "\x1b[90m",
} as const;

type Level = "INFO" | "WARN" | "ERROR" | "DEBUG";

const LEVEL_COLOR: Record<Level, string> = {
  INFO:  COLOR.green,
  WARN:  COLOR.yellow,
  ERROR: COLOR.red,
  DEBUG: COLOR.gray,
};

/*
 * Log file name = current UTC date.  One file per day, never truncated.
 * Reading yesterday's logs is as hard as opening the right file.
 */
function logFilePath(): string {
  const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  return path.join(LOG_DIR, `${date}.log`);
}

function buildLine(level: Level, message: string): string {
  const ts = new Date().toISOString();
  return `[${ts}] [${level.padEnd(5)}] ${message}`;
}

function emit(level: Level, message: string): void {
  const line = buildLine(level, message);

  // File: plain text, no colors — grep-friendly.
  fs.appendFileSync(logFilePath(), line + "\n", "utf8");

  // Console: gray timestamp, colored level tag, plain message.
  const ts = new Date().toISOString();
  console.log(
    `${COLOR.gray}[${ts}]${COLOR.reset} ` +
    `${LEVEL_COLOR[level]}[${level.padEnd(5)}]${COLOR.reset} ` +
    message
  );
}

export const logger = {
  info:  (msg: string) => emit("INFO",  msg),
  warn:  (msg: string) => emit("WARN",  msg),
  error: (msg: string) => emit("ERROR", msg),
  debug: (msg: string) => emit("DEBUG", msg),
};
