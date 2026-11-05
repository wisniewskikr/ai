// Storage: Postgres when DATABASE_URL is set (Heroku), in-memory otherwise (local tests).
import pg from "pg";

const SCHEMA = `
CREATE TABLE IF NOT EXISTS notes (
  id TEXT PRIMARY KEY, text TEXT NOT NULL, author TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS files (
  id TEXT PRIMARY KEY, filename TEXT NOT NULL, content_type TEXT NOT NULL, size INTEGER NOT NULL,
  data BYTEA NOT NULL, author TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS oauth_clients (
  client_id TEXT PRIMARY KEY, metadata JSONB NOT NULL, secret_hash TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS oauth_grants (
  hash TEXT PRIMARY KEY, kind TEXT NOT NULL, data JSONB NOT NULL, expires_at TIMESTAMPTZ NOT NULL);
`;

function terms(query) {
  return String(query || "").toLowerCase().split(/\s+/).filter(Boolean);
}

class PgStore {
  constructor(url) {
    this.pool = new pg.Pool({ connectionString: url, ssl: { rejectUnauthorized: false }, max: 5 });
  }
  async init() { await this.pool.query(SCHEMA); }
  q(sql, args) { return this.pool.query(sql, args); }

  async addNote(note) {
    const r = await this.q("INSERT INTO notes (id, text, author) VALUES ($1,$2,$3) RETURNING created_at", [note.id, note.text, note.author]);
    return { ...note, created_at: r.rows[0].created_at.toISOString() };
  }
  async searchNotes(query, limit) {
    const t = terms(query);
    const where = t.map((_, i) => `text ILIKE $${i + 1}`).join(" AND ") || "TRUE";
    const args = t.map(x => `%${x.replace(/[\\%_]/g, m => "\\" + m)}%`);
    const r = await this.q(`SELECT id, text, created_at FROM notes WHERE ${where} ORDER BY created_at DESC, id DESC LIMIT ${limit | 0}`, args);
    return r.rows.map(n => ({ id: n.id, text: n.text, created_at: n.created_at.toISOString() }));
  }
  async addFile(f) {
    await this.q("INSERT INTO files (id, filename, content_type, size, data, author) VALUES ($1,$2,$3,$4,$5,$6)",
      [f.id, f.filename, f.content_type, f.size, f.data, f.author]);
  }
  async getFile(id) {
    const r = await this.q("SELECT id, filename, content_type, size, data FROM files WHERE id=$1", [id]);
    return r.rows[0] || null;
  }
  async saveClient(c) {
    await this.q("INSERT INTO oauth_clients (client_id, metadata, secret_hash) VALUES ($1,$2,$3)", [c.client_id, c.metadata, c.secret_hash]);
  }
  async getClient(id) {
    const r = await this.q("SELECT client_id, metadata, secret_hash FROM oauth_clients WHERE client_id=$1", [id]);
    return r.rows[0] || null;
  }
  async putGrant(hash, kind, data, expiresAt) {
    await this.q("INSERT INTO oauth_grants (hash, kind, data, expires_at) VALUES ($1,$2,$3,$4)", [hash, kind, data, expiresAt]);
  }
  async getGrant(hash, kind) {
    const r = await this.q("SELECT data, expires_at FROM oauth_grants WHERE hash=$1 AND kind=$2 AND expires_at > now()", [hash, kind]);
    return r.rows[0] ? { ...r.rows[0].data, expires_at: r.rows[0].expires_at } : null;
  }
  async takeGrant(hash, kind) { // single use
    const r = await this.q("DELETE FROM oauth_grants WHERE hash=$1 AND kind=$2 RETURNING data, expires_at", [hash, kind]);
    const row = r.rows[0];
    return row && row.expires_at > new Date() ? { ...row.data, expires_at: row.expires_at } : null;
  }
  async purge() { await this.q("DELETE FROM oauth_grants WHERE expires_at < now()"); }
}

class MemStore {
  constructor() { this.notes = []; this.files = new Map(); this.clients = new Map(); this.grants = new Map(); }
  async init() {}
  async addNote(note) {
    const n = { ...note, created_at: new Date().toISOString() };
    this.notes.push(n);
    return n;
  }
  async searchNotes(query, limit) {
    const t = terms(query);
    return this.notes.filter(n => t.every(x => n.text.toLowerCase().includes(x)))
      .slice().reverse().slice(0, limit).map(({ id, text, created_at }) => ({ id, text, created_at }));
  }
  async addFile(f) { this.files.set(f.id, f); }
  async getFile(id) { return this.files.get(id) || null; }
  async saveClient(c) { this.clients.set(c.client_id, c); }
  async getClient(id) { return this.clients.get(id) || null; }
  async putGrant(hash, kind, data, expiresAt) { this.grants.set(kind + ":" + hash, { data, expires_at: expiresAt }); }
  async getGrant(hash, kind) {
    const g = this.grants.get(kind + ":" + hash);
    return g && g.expires_at > new Date() ? { ...g.data, expires_at: g.expires_at } : null;
  }
  async takeGrant(hash, kind) {
    const g = await this.getGrant(hash, kind);
    this.grants.delete(kind + ":" + hash);
    return g;
  }
  async purge() {}
}

export function createStore() {
  return process.env.DATABASE_URL ? new PgStore(process.env.DATABASE_URL) : new MemStore();
}
