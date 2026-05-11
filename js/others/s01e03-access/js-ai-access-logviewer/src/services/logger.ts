import fs from 'fs';
import path from 'path';
import { getDb } from './db.js';

export interface AuditEntry {
  id: number;
  timestamp: string;
  action: string;
  input: string;
  result: string;
  status: string;
}

function now(): string {
  return new Date().toISOString().replace('T', ' ').substring(0, 19);
}

function writeFileLog(level: string, message: string): void {
  const logsDir = './logs';
  fs.mkdirSync(logsDir, { recursive: true });
  const date = new Date().toISOString().substring(0, 10);
  const logFile = path.join(logsDir, `${date}.log`);
  fs.appendFileSync(logFile, `[${now()}] [${level}] ${message}\n`);
}

export function logAction(
  action: string,
  input: string,
  result: string,
  status: 'OK' | 'DENIED' | 'ERROR'
): void {
  const timestamp = now();
  getDb()
    .prepare('INSERT INTO audit_log (timestamp, action, input, result, status) VALUES (?, ?, ?, ?, ?)')
    .run(timestamp, action, input, result, status);

  writeFileLog('INFO', `${action}(${input}) → ${status}: ${result}`);
}

export function getRecentLogs(limit: number): AuditEntry[] {
  const rows = getDb()
    .prepare('SELECT * FROM audit_log ORDER BY id DESC LIMIT ?')
    .all(limit) as Record<string, unknown>[];

  return rows.map(row => ({
    id:        row['id'] as number,
    timestamp: row['timestamp'] as string,
    action:    row['action'] as string,
    input:     row['input'] as string,
    result:    row['result'] as string,
    status:    row['status'] as string,
  }));
}
