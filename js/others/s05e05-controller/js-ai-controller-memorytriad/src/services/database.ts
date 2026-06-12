import { DatabaseSync } from 'node:sqlite';
import * as fs from 'fs';
import * as path from 'path';
import config from '../../config.json';

let db: DatabaseSync | null = null;

export function getDatabase(): DatabaseSync {
  if (!db) {
    const dbDir = path.dirname(path.resolve(config.dbPath));
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    db = new DatabaseSync(path.resolve(config.dbPath));
    createTables(db);
  }
  return db;
}

function createTables(db: DatabaseSync): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_data (
      key        TEXT PRIMARY KEY,
      value      TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS action_log (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      action    TEXT NOT NULL,
      result    TEXT NOT NULL,
      timestamp TEXT NOT NULL
    );
  `);
}
