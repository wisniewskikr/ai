import * as fs from 'fs';
import * as path from 'path';
import config from '../../config.json';

const logsDir = path.resolve(config.logsDir);

function timestamp(): string {
  return new Date().toISOString().replace('T', ' ').substring(0, 19);
}

export function log(level: 'INFO' | 'WARN' | 'ERROR', message: string): void {
  const line = `[${timestamp()}] [${level}] ${message}`;
  console.log(line);

  fs.mkdirSync(logsDir, { recursive: true });
  const logFile = path.join(logsDir, `app-${new Date().toISOString().substring(0, 10)}.log`);
  fs.appendFileSync(logFile, line + '\n', 'utf-8');
}
