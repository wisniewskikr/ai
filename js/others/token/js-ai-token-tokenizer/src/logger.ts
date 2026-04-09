import * as fs from 'fs';
import * as path from 'path';

const LOGS_DIR = path.join(process.cwd(), 'logs');

function ensureLogsDir(): void {
  if (!fs.existsSync(LOGS_DIR)) {
    fs.mkdirSync(LOGS_DIR);
  }
}

function getLogPath(): string {
  const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  return path.join(LOGS_DIR, `${date}.log`);
}

function timestamp(): string {
  return new Date().toLocaleTimeString('pl-PL', { hour12: false });
}

function append(line: string): void {
  ensureLogsDir();
  fs.appendFileSync(getLogPath(), line + '\n', 'utf-8');
}

export function logSessionStart(model: string): void {
  append('');
  append('╔══════════════════════════════════════════════════════╗');
  append(`║  SESSION STARTED  ${new Date().toLocaleString('pl-PL').padEnd(35)}║`);
  append(`║  Model: ${model.padEnd(45)}║`);
  append('╚══════════════════════════════════════════════════════╝');
}

export function logSessionEnd(reason: 'exit' | 'eof'): void {
  const label = reason === 'exit' ? 'user typed /exit' : 'stdin closed';
  append('');
  append(`[${timestamp()}] ─── SESSION ENDED (${label}) ───`);
  append('');
}

export function logClear(): void {
  append('');
  append(`[${timestamp()}] ─── /clear — history reset ───`);
}

export function logUserMessage(text: string, estimatedTokens: number): void {
  append('');
  append(`[${timestamp()}] YOU`);
  append(`  ${text}`);
  append(`  Estimated input tokens: ${estimatedTokens}`);
}

export function logSkipped(): void {
  append(`[${timestamp()}] (message cancelled by user)`);
}

export function logAssistantMessage(
  text: string,
  estimatedInput: number,
  actualInput: number,
  output: number
): void {
  append(`[${timestamp()}] ASSISTANT`);
  append(`  ${text.replace(/\n/g, '\n  ')}`);
  append(`  Tokens — estimated input: ${estimatedInput} | actual input: ${actualInput} | output: ${output}`);
}

export function logError(message: string): void {
  append(`[${timestamp()}] ERROR: ${message}`);
}
