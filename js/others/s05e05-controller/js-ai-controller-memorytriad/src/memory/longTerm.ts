import { DatabaseSync } from 'node:sqlite';

interface UserDataRow {
  key: string;
  value: string;
}

export class LongTermMemory {
  private readonly db: DatabaseSync;

  constructor(db: DatabaseSync) {
    this.db = db;
  }

  set(key: string, value: string): void {
    this.db.prepare(`
      INSERT OR REPLACE INTO user_data (key, value, updated_at)
      VALUES (?, ?, ?)
    `).run(key, value, new Date().toISOString());
  }

  get(key: string): string | null {
    const row = this.db.prepare('SELECT value FROM user_data WHERE key = ?').get(key) as UserDataRow | undefined;
    return row ? row.value : null;
  }

  getAll(): Record<string, string> {
    const rows = this.db.prepare('SELECT key, value FROM user_data').all() as unknown as UserDataRow[];
    const result: Record<string, string> = {};
    for (const row of rows) {
      result[row.key] = row.value;
    }
    return result;
  }

  clear(): void {
    this.db.prepare('DELETE FROM user_data').run();
  }
}
