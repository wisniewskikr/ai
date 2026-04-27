import fs from 'fs';
import path from 'path';

const LOG_DIR = 'logs';
const LOG_FILE = path.join(LOG_DIR, `run-${new Date().toISOString().replace(/[:.]/g, '-')}.log`);

let logDirReady = false;

function ensureLogDir() {
  if (!logDirReady) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
    logDirReady = true;
  }
}

function timestamp() {
  return new Date().toISOString().replace('T', ' ').slice(0, 19);
}

function write(level: string, message: string) {
  ensureLogDir();
  const line = `[${timestamp()}] [${level}] ${message}`;
  console.log(line);
  fs.appendFileSync(LOG_FILE, line + '\n');
}

export const logger = {
  info: (msg: string) => write('INFO', msg),
  warn: (msg: string) => write('WARN', msg),
  error: (msg: string) => write('ERROR', msg),
};
