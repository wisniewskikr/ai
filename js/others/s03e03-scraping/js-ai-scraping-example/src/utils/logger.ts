import { appendFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const logDir = 'logs';
const logFile = join(logDir, `scraper-${new Date().toISOString().slice(0, 10)}.log`);

mkdirSync(logDir, { recursive: true });

function timestamp(): string {
  return new Date().toISOString().replace('T', ' ').slice(0, 19);
}

function write(level: string, message: string): void {
  const line = `[${timestamp()}] [${level}] ${message}`;
  console.log(line);
  appendFileSync(logFile, line + '\n');
}

export const logger = {
  info: (msg: string) => write('INFO', msg),
  warn: (msg: string) => write('WARN', msg),
  error: (msg: string) => write('ERROR', msg),
};
