import fs from 'fs';
import path from 'path';

const logsDir = path.join(process.cwd(), 'logs');

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logFile = path.join(logsDir, `${new Date().toISOString().split('T')[0]}.log`);

function formatLine(level: string, message: string): string {
  const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
  return `[${timestamp}] [${level.padEnd(5)}] ${message}`;
}

function writeToFile(line: string): void {
  fs.appendFileSync(logFile, line + '\n');
}

export const logger = {
  info(message: string): void {
    writeToFile(formatLine('INFO', message));
  },
  warn(message: string): void {
    writeToFile(formatLine('WARN', message));
  },
  error(message: string): void {
    const line = formatLine('ERROR', message);
    console.error(line);
    writeToFile(line);
  },
};
