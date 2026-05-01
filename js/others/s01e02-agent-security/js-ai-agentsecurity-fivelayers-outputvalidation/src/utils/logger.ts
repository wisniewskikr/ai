import * as fs from 'fs';
import * as path from 'path';

const LOGS_DIR = path.join(__dirname, '../../logs');
const LOG_FILE = path.join(LOGS_DIR, 'app.log');

function ensureLogsDir(): void {
  if (!fs.existsSync(LOGS_DIR)) {
    fs.mkdirSync(LOGS_DIR, { recursive: true });
  }
}

function timestamp(): string {
  return new Date().toISOString().replace('T', ' ').slice(0, 19);
}

function writeLog(level: string, message: string): void {
  ensureLogsDir();
  const line = `[${timestamp()}] [${level}] ${message}\n`;
  fs.appendFileSync(LOG_FILE, line, 'utf-8');
}

export const logger = {
  info: (msg: string) => writeLog('INFO', msg),
  warn: (msg: string) => writeLog('WARN', msg),
  error: (msg: string) => writeLog('ERROR', msg),
};
