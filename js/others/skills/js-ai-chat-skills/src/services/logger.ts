import * as fs from 'fs';
import * as path from 'path';

type Level = 'INFO' | 'WARN' | 'ERROR';

function getLogPath(): string {
  const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const logsDir = path.join(process.cwd(), 'logs');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
  }
  return path.join(logsDir, `${date}.log`);
}

function formatEntry(level: Level, message: string): string {
  const ts = new Date().toISOString().replace('T', ' ').slice(0, 19);
  return `[${ts}] [${level}] ${message}`;
}

export function log(level: Level, message: string): void {
  const entry = formatEntry(level, message);
  fs.appendFileSync(getLogPath(), entry + '\n', 'utf-8');
}
