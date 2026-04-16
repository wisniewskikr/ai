import Database from 'better-sqlite3';
import * as path from 'path';

const DB_PATH = path.join(process.cwd(), 'data/knowledge.db');

const db = new Database(DB_PATH);

db.exec(`
  CREATE TABLE IF NOT EXISTS entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    topic TEXT NOT NULL,
    content TEXT NOT NULL
  )
`);

const entries = [
  { topic: 'name', content: "User's name is Joe Doe." },
  { topic: 'work', content: 'He works as a software engineer at a mid-sized tech company in Austin, Texas.' },
  { topic: 'hobbies', content: 'In his free time, Joe enjoys hiking in the mountains and exploring nature trails.' },
  { topic: 'reading', content: 'He is an avid reader and particularly loves science fiction and historical novels.' },
  { topic: 'music', content: 'Joe plays acoustic guitar and occasionally performs at local open mic nights.' },
  { topic: 'wife', content: 'He is married to his wife Clara, and they have been together for eight years.' },
  { topic: 'children', content: 'They have two children: a seven-year-old daughter named Lily and a four-year-old son named Max.' },
  { topic: 'pet', content: 'Joe does have a dog — a golden retriever named Biscuit who goes everywhere with him.' },
  { topic: 'cooking', content: 'On weekends, Joe loves cooking elaborate meals for his family and experimenting with new recipes.' },
  { topic: 'cycling', content: 'He is a passionate cyclist and participates in charity bike races every summer.' },
  { topic: 'volunteering', content: 'Joe volunteers at a local community center, teaching basic coding skills to teenagers.' },
  { topic: 'sports', content: 'He follows football closely and is a dedicated fan of the Dallas Cowboys.' },
  { topic: 'games', content: 'Joe enjoys board games and hosts a monthly game night with friends and neighbors.' },
  { topic: 'garden', content: 'He has a small vegetable garden in the backyard where he grows tomatoes, peppers, and herbs.' },
  { topic: 'dreams', content: 'Joe dreams of one day taking his family on a road trip across all 50 states of the USA.' },
];

const insert = db.prepare('INSERT INTO entries (topic, content) VALUES (?, ?)');
for (const entry of entries) {
  insert.run(entry.topic, entry.content);
}

console.log(`Seeded ${entries.length} entries to ${DB_PATH}`);
db.close();
