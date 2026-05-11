import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';
import path from 'path';
import config from '../../config.json' with { type: 'json' };

let db: DatabaseSync | null = null;

export function getDb(): DatabaseSync {
  if (db) return db;

  const dbPath = config.db.path;
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });

  db = new DatabaseSync(dbPath);
  db.exec(`
    CREATE TABLE IF NOT EXISTS audit_log (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp TEXT NOT NULL,
      action    TEXT NOT NULL,
      input     TEXT NOT NULL,
      result    TEXT NOT NULL,
      status    TEXT NOT NULL
    )
  `);

  return db;
}
