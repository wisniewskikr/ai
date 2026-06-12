import * as fs from 'fs';
import * as path from 'path';
import config from '../../config.json';

function ensureLogsDir(): void {
  const logsDir = path.resolve(config.logsDir);
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
}

function timestamp(): string {
  return new Date().toISOString().replace('T', ' ').substring(0, 19);
}

function write(level: string, message: string): void {
  ensureLogsDir();
  const line = `[${timestamp()}] [${level}] ${message}\n`;
  const date = new Date().toISOString().substring(0, 10);
  const logFile = path.join(path.resolve(config.logsDir), `${date}.log`);
  fs.appendFileSync(logFile, line, 'utf-8');
}

export const logger = {
  info:  (message: string) => write('INFO', message),
  warn:  (message: string) => write('WARN', message),
  error: (message: string) => write('ERROR', message),
};
