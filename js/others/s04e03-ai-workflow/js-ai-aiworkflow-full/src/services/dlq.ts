import Database from "better-sqlite3";
import fs from "fs";
import { log } from "./monitor.js";
import { config } from "../config.js";

fs.mkdirSync("workspace", { recursive: true });

const db = new Database("workspace/dlq.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS dead_letter (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp  TEXT    NOT NULL,
    article_id INTEGER NOT NULL,
    payload    TEXT    NOT NULL,
    error_type TEXT    NOT NULL,
    attempts   INTEGER NOT NULL,
    status     TEXT    NOT NULL DEFAULT 'pending'
  )
`);

export interface DLQItem {
  id: number;
  timestamp: string;
  article_id: number;
  payload: string;
  error_type: string;
  attempts: number;
  status: string;
}

export function pushToDLQ(
  articleId: number,
  payload: unknown,
  errorType: string,
  attempts: number
) {
  if (getDLQSize() >= config.dlq.maxSize) {
    log.warn({ layer: "pipeline", dlq: "full", articleId }, "DLQ is full — dropping item");
    return;
  }

  db.prepare(`
    INSERT INTO dead_letter (timestamp, article_id, payload, error_type, attempts)
    VALUES (?, ?, ?, ?, ?)
  `).run(new Date().toISOString(), articleId, JSON.stringify(payload), errorType, attempts);

  log.warn({ layer: "pipeline", dlq: "push", articleId, errorType, attempts }, "pushed to DLQ");
}

export function getDLQPending(limit: number): DLQItem[] {
  return db
    .prepare("SELECT * FROM dead_letter WHERE status = 'pending' ORDER BY timestamp ASC LIMIT ?")
    .all(limit) as DLQItem[];
}

export function getAllDLQPending(): DLQItem[] {
  return db
    .prepare("SELECT * FROM dead_letter WHERE status = 'pending' ORDER BY timestamp ASC")
    .all() as DLQItem[];
}

export function markDLQItem(id: number, status: "reprocessed" | "manual_review") {
  db.prepare("UPDATE dead_letter SET status = ? WHERE id = ?").run(status, id);
}

export function getDLQSize(): number {
  const row = db
    .prepare("SELECT COUNT(*) as count FROM dead_letter WHERE status = 'pending'")
    .get() as { count: number };
  return row.count;
}
