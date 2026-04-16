import Database from 'better-sqlite3';
import * as path from 'path';

let db: Database.Database;

function getDb(): Database.Database {
  if (!db) {
    const dbPath = path.join(process.cwd(), 'data/knowledge.db');
    db = new Database(dbPath, { readonly: true });
  }
  return db;
}

export function searchKnowledge(query: string): { id: number; topic: string; content: string }[] {
  const database = getDb();
  const words = query.trim().split(/\s+/).filter(w => w.length > 0);

  // OR match with relevance score — entries matching more keywords rank higher
  const whereClause = words.map(() => 'content LIKE ?').join(' OR ');
  const scoreClause = words.map(() => 'CASE WHEN content LIKE ? THEN 1 ELSE 0 END').join(' + ');
  const whereParams = words.map(w => `%${w}%`);
  const scoreParams = words.map(w => `%${w}%`);

  const stmt = database.prepare(`
    SELECT id, topic, content
    FROM entries
    WHERE ${whereClause}
    ORDER BY (${scoreClause}) DESC
    LIMIT 5
  `);
  return stmt.all(...whereParams, ...scoreParams) as { id: number; topic: string; content: string }[];
}

export function getEntryById(id: number): { id: number; topic: string; content: string } | undefined {
  const database = getDb();
  const stmt = database.prepare('SELECT id, topic, content FROM entries WHERE id = ?');
  return stmt.get(id) as { id: number; topic: string; content: string } | undefined;
}

export function listTopics(): { id: number; topic: string }[] {
  const database = getDb();
  const stmt = database.prepare('SELECT id, topic FROM entries ORDER BY topic');
  return stmt.all() as { id: number; topic: string }[];
}
