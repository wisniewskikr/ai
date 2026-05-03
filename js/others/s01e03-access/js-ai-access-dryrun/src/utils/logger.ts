import fs from 'fs';
import path from 'path';
import config from '../../config.json';

function timestamp(): string {
  return new Date().toISOString().replace('T', ' ').slice(0, 19);
}

function write(level: 'INFO' | 'WARN' | 'ERROR', message: string): void {
  const line = `[${timestamp()}] [${level}] ${message}`;
  const logPath = path.resolve(config.auditLogFile);
  fs.mkdirSync(path.dirname(logPath), { recursive: true });
  fs.appendFileSync(logPath, line + '\n');
}

export const logger = {
  info: (msg: string) => write('INFO', msg),
  warn: (msg: string) => write('WARN', msg),
  error: (msg: string) => write('ERROR', msg),
};
