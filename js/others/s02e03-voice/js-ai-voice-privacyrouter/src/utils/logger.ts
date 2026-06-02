import fs from 'fs';
import path from 'path';

type LogLevel = 'INFO' | 'WARN' | 'ERROR';

let logFilePath: string | null = null;

function formatTimestamp(): string {
  return new Date().toISOString().replace('T', ' ').substring(0, 19);
}

function formatLine(level: LogLevel, message: string): string {
  return `[${formatTimestamp()}] [${level}] ${message}`;
}

export function initLogger(logsDir: string): void {
  fs.mkdirSync(logsDir, { recursive: true });
  const date = new Date().toISOString().substring(0, 10);
  logFilePath = path.join(logsDir, `privacy-router-${date}.log`);
}

function write(level: LogLevel, message: string): void {
  const line = formatLine(level, message);
  console.log(line);
  if (logFilePath) {
    fs.appendFileSync(logFilePath, line + '\n');
  }
}

export const log = {
  info: (message: string) => write('INFO', message),
  warn: (message: string) => write('WARN', message),
  error: (message: string) => write('ERROR', message),
};
