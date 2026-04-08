import * as fs from 'fs';
import * as path from 'path';

type Level = 'INFO' | 'ERROR' | 'USER' | 'ASSISTANT';

const COLORS: Record<Level, string> = {
  INFO: '\x1b[36m',      // cyan
  ERROR: '\x1b[31m',     // red
  USER: '\x1b[32m',      // green
  ASSISTANT: '\x1b[33m', // yellow
};
const RESET = '\x1b[0m';

function getLogPath(): string {
  const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const logsDir = path.join(process.cwd(), 'logs');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
  }
  return path.join(logsDir, `${date}.log`);
}

function formatEntry(level: Level, message: string): string {
  const ts = new Date().toISOString();
  return `[${ts}] [${level}] ${message}`;
}

export function log(level: Level, message: string): void {
  const entry = formatEntry(level, message);

  // console output with color
  const color = COLORS[level];
  console.log(`${color}${entry}${RESET}`);

  // append to file without color codes
  fs.appendFileSync(getLogPath(), entry + '\n', 'utf-8');
}
