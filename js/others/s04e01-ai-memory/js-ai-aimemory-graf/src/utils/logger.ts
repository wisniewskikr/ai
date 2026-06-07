import * as fs from 'fs';
import * as path from 'path';

const logPath = path.join(__dirname, '../../logs/app.log');

function timestamp(): string {
  return new Date().toISOString().replace('T', ' ').slice(0, 19);
}

function write(level: string, message: string): void {
  const line = `[${timestamp()}] [${level}] ${message}\n`;
  fs.appendFileSync(logPath, line, 'utf-8');
}

export const logger = {
  info: (msg: string) => write('INFO', msg),
  warn: (msg: string) => write('WARN', msg),
  error: (msg: string) => write('ERROR', msg),
};
