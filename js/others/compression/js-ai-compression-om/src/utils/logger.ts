import * as fs from 'fs';
import * as path from 'path';

type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';

let logFilePath: string | null = null;

function timestamp(): string {
  return new Date().toTimeString().slice(0, 8); // HH:MM:SS
}

function write(entry: string): void {
  if (!logFilePath) return;
  fs.appendFileSync(logFilePath, entry + '\n', 'utf-8');
}

function log(level: LogLevel, message: string): void {
  write(`[${timestamp()}] [${level}] ${message}`);
}

export function initLogger(logDir: string): void {
  const now = new Date();
  // Format: YYYY-MM-DD_HH-MM-SS
  const dateStr = now.toISOString().replace('T', '_').replace(/:/g, '-').slice(0, 19);

  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  logFilePath = path.join(logDir, `${dateStr}.log`);
}

export const logger = {
  info:  (msg: string) => log('INFO',  msg),
  warn:  (msg: string) => log('WARN',  msg),
  error: (msg: string) => log('ERROR', msg),
  debug: (msg: string) => log('DEBUG', msg),
};
