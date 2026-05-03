import { DatabaseSync } from 'node:sqlite';
import * as fs from 'fs';
import config from '../config.json';

let _db: DatabaseSync | null = null;

type ProductSeed = { name: string; price: number; category: string };

function createAndSeed(dbPath: string): void {
  const db = new DatabaseSync(dbPath);

  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      name       TEXT    NOT NULL,
      price      REAL    NOT NULL,
      category   TEXT    NOT NULL,
      created_at TEXT    DEFAULT (datetime('now'))
    )
  `);

  const insert = db.prepare('INSERT INTO products (name, price, category) VALUES (?, ?, ?)');

  const rows: ProductSeed[] = [
    { name: 'Laptop',              price: 2999, category: 'Electronics' },
    { name: 'Wireless Mouse',      price:   49, category: 'Electronics' },
    { name: 'Mechanical Keyboard', price:  129, category: 'Electronics' },
    { name: 'Monitor 24"',         price:  899, category: 'Electronics' },
    { name: 'Standing Desk',       price:  599, category: 'Furniture'   },
    { name: 'Ergonomic Chair',     price:  799, category: 'Furniture'   },
    { name: 'Notebook A4',         price:   12, category: 'Stationery'  },
    { name: 'Premium Pen Set',     price:   25, category: 'Stationery'  },
  ];

  db.exec('BEGIN');
  for (const r of rows) insert.run(r.name, r.price, r.category);
  db.exec('COMMIT');

  db.close();
}

export function getDatabase(): DatabaseSync {
  if (_db) return _db;

  const dbPath = config.database.path;

  if (!fs.existsSync(dbPath)) {
    createAndSeed(dbPath);
  }

  _db = new DatabaseSync(dbPath, { readOnly: true });
  return _db;
}
