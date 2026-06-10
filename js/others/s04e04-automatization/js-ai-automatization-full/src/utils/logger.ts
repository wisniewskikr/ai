import * as fs from 'fs';
import * as path from 'path';
import { DateTime } from 'luxon';
import config from '../../config.json';

// Buffer mode: when active, console output is captured instead of printed.
// Used to prevent spinner/log interleaving during ora spinner display.
let buffer: string[] | null = null;

export function startBuffer(): void {
  buffer = [];
}

export function flushBuffer(): string[] {
  const lines = buffer ?? [];
  buffer = null;
  return lines;
}

function ensureLogsDir(): void {
  if (!fs.existsSync(config.logsDir)) {
    fs.mkdirSync(config.logsDir, { recursive: true });
  }
}

function write(level: 'INFO' | 'WARN' | 'ERROR', message: string): void {
  const timestamp = DateTime.now().setZone(config.timezone).toFormat('yyyy-MM-dd HH:mm:ss');
  const formatted = `[${timestamp}] [${level}] ${message}`;

  // Always write to file
  try {
    ensureLogsDir();
    const date = DateTime.now().toFormat('yyyy-MM-dd');
    fs.appendFileSync(path.join(config.logsDir, `agent-${date}.log`), formatted + '\n');
  } catch {
    // Log file write failure is non-fatal
  }

  // Console: buffer or print
  if (buffer !== null) {
    buffer.push(formatted);
  } else if (level === 'ERROR') {
    console.error(formatted);
  } else {
    console.log(formatted);
  }
}

export const logger = {
  info: (msg: string) => write('INFO', msg),
  warn: (msg: string) => write('WARN', msg),
  error: (msg: string) => write('ERROR', msg),
};
