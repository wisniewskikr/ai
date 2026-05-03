import * as fs from 'fs';
import * as path from 'path';
import config from '../config.json';

const logPath = config.audit.logPath;

function ensureLogDir(): void {
  const dir = path.dirname(logPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function timestamp(): string {
  return new Date().toISOString().replace('T', ' ').substring(0, 19);
}

export function logAudit(level: 'INFO' | 'WARN' | 'ERROR', message: string): void {
  ensureLogDir();
  const line = `[${timestamp()}] [${level}] ${message}\n`;
  fs.appendFileSync(logPath, line, 'utf8');
}
