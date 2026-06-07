import * as fs from 'fs';
import * as path from 'path';

const LOG_DIR = path.join(process.cwd(), 'logs');

function ensureLogDir(): void {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}

function timestamp(): string {
  return new Date().toISOString().replace('T', ' ').substring(0, 19);
}

function writeLog(level: string, message: string): void {
  ensureLogDir();
  const line = `[${timestamp()}] [${level}] ${message}\n`;
  const filename = new Date().toISOString().substring(0, 10) + '.log';
  fs.appendFileSync(path.join(LOG_DIR, filename), line, 'utf-8');
}

export const logger = {
  info:  (msg: string) => writeLog('INFO',  msg),
  warn:  (msg: string) => writeLog('WARN',  msg),
  error: (msg: string) => writeLog('ERROR', msg),
};
