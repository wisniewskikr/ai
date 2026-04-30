import fs from 'fs';
import path from 'path';

const LOG_DIR = path.join(process.cwd(), 'logs');
const LOG_FILE = path.join(
  LOG_DIR,
  `session-${new Date().toISOString().replace(/[:.]/g, '-')}.log`
);

if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

function timestamp(): string {
  return new Date().toISOString().replace('T', ' ').substring(0, 19);
}

function write(level: 'INFO' | 'WARN' | 'ERROR', message: string): void {
  const line = `[${timestamp()}] [${level}] ${message}`;
  fs.appendFileSync(LOG_FILE, line + '\n');
}

export const logger = {
  info: (message: string) => write('INFO', message),
  warn: (message: string) => write('WARN', message),
  error: (message: string) => write('ERROR', message),
};
