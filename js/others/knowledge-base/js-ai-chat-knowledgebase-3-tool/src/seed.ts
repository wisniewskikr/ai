import Database from 'better-sqlite3';
import * as fs from 'fs';
import * as path from 'path';
import { loadConfig } from './config';

const config = loadConfig();

const DB_PATH = path.join(process.cwd(), 'data/knowledge.db');
const DATA_PATH = path.join(process.cwd(), config.seedDataPath);

const db = new Database(DB_PATH);

db.exec(`
  CREATE TABLE IF NOT EXISTS entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    topic TEXT NOT NULL,
    content TEXT NOT NULL
  )
`);

db.exec('DELETE FROM entries');

const lines = fs.readFileSync(DATA_PATH, 'utf-8')
  .split('\n')
  .map(line => line.trim())
  .filter(line => line.length > 0);

const insert = db.prepare('INSERT INTO entries (topic, content) VALUES (?, ?)');
for (const line of lines) {
  insert.run('fact', line);
}

console.log(`Seeded ${lines.length} entries from ${DATA_PATH} to ${DB_PATH}`);
db.close();
