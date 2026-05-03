import Database from 'better-sqlite3';
import * as fs from 'fs';
import config from '../config.json';

let _db: Database.Database | null = null;

type ProductSeed = { name: string; price: number; category: string };

function createAndSeed(dbPath: string): void {
  const db = new Database(dbPath);

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
  const insertMany = db.transaction((rows: ProductSeed[]) => {
    for (const r of rows) insert.run(r.name, r.price, r.category);
  });

  insertMany([
    { name: 'Laptop',              price: 2999, category: 'Electronics' },
    { name: 'Wireless Mouse',      price:   49, category: 'Electronics' },
    { name: 'Mechanical Keyboard', price:  129, category: 'Electronics' },
    { name: 'Monitor 24"',         price:  899, category: 'Electronics' },
    { name: 'Standing Desk',       price:  599, category: 'Furniture'   },
    { name: 'Ergonomic Chair',     price:  799, category: 'Furniture'   },
    { name: 'Notebook A4',         price:   12, category: 'Stationery'  },
    { name: 'Premium Pen Set',     price:   25, category: 'Stationery'  },
  ]);

  db.close();
}

export function getDatabase(): Database.Database {
  if (_db) return _db;

  const dbPath = config.database.path;

  if (!fs.existsSync(dbPath)) {
    createAndSeed(dbPath);
  }

  _db = new Database(dbPath, { readonly: true });
  return _db;
}
