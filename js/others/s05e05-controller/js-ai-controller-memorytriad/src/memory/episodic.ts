import { DatabaseSync } from 'node:sqlite';

export interface EpisodicEntry {
  id: number;
  action: string;
  result: string;
  timestamp: string;
}

export class EpisodicMemory {
  private readonly db: DatabaseSync;
  private readonly maxEntries: number;

  constructor(db: DatabaseSync, maxEntries: number) {
    this.db = db;
    this.maxEntries = maxEntries;
  }

  log(action: string, result: string): void {
    this.db.prepare(`
      INSERT INTO action_log (action, result, timestamp)
      VALUES (?, ?, ?)
    `).run(action, result, new Date().toISOString());
  }

  getRecent(n?: number): EpisodicEntry[] {
    const limit = n ?? this.maxEntries;
    const rows = this.db.prepare(`
      SELECT * FROM action_log
      ORDER BY id DESC
      LIMIT ?
    `).all(limit) as unknown as EpisodicEntry[];
    return rows.reverse();
  }

  getAll(): EpisodicEntry[] {
    return this.db.prepare('SELECT * FROM action_log ORDER BY id ASC').all() as unknown as EpisodicEntry[];
  }

  clear(): void {
    this.db.prepare('DELETE FROM action_log').run();
  }
}
