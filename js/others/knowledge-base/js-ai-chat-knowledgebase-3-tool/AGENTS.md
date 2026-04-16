# AGENTS.md — Migracja projektu 1 → 3 (Tools + SQLite)

## Cel

Projekt aktualnie implementuje **Projekt 1: Pełny kontekst** — cała baza wiedzy wczytywana jest do system promptu. Zadaniem jest przepisanie go na **Projekt 3: Asystent z narzędziami (Tools + SQLite)** — model sam decyduje kiedy i co zapytać, wywołując narzędzia (function calling).

---

## Stan obecny (Projekt 1 — Pełny kontekst)

### Architektura
```
Użytkownik pyta
      ↓
chat.ts ładuje CAŁY plik data/data.txt do system promptu
      ↓
api.ts wysyła historię wiadomości do OpenRouter
      ↓
Model odpowiada na podstawie kontekstu
```

### Pliki źródłowe
- `src/index.ts` — entry point; ładuje config, uruchamia `runChat()`
- `src/config.ts` — czyta `config.json` z dysku, sprawdza `OPENROUTER_API_KEY`
- `src/chat.ts` — ładuje plik KB do system promptu; pętla REPL (`/history`, `/clear`, `/exit`)
- `src/api.ts` — wysyła `POST /chat/completions` do OpenRouter (brak tool_calls)
- `src/logger.ts` — loguje do pliku `logs/YYYY-MM-DD.log`

### Kluczowy fragment `chat.ts` (do usunięcia/zastąpienia)
```ts
// Obecne podejście — pełny kontekst w system prompt
const knowledgeBase = loadKnowledgeBase(config.knowledgeBasePath);
const history: Message[] = [
  {
    role: 'system',
    content: `You are a helpful assistant. Answer questions based on the following knowledge base:\n\n${knowledgeBase}\n\nIf the answer cannot be found in the knowledge base, say so clearly.`,
  },
];
```

### Zależności (package.json)
```json
{
  "dependencies": { "dotenv": "^16.4.5" },
  "devDependencies": {
    "@types/node": "^20.14.0",
    "ts-node": "^10.9.2",
    "typescript": "^5.4.5"
  }
}
```

### Config (config.json)
```json
{
  "model": "openai/gpt-4o",
  "maxTokens": 1024,
  "temperature": 0.7,
  "baseUrl": "https://openrouter.ai/api/v1",
  "knowledgeBasePath": "data/data.txt"
}
```

---

## Stan docelowy (Projekt 3 — Tools + SQLite)

### Architektura
```
Użytkownik pyta
      ↓
api.ts wysyła wiadomość + definicje narzędzi do OpenRouter
      ↓
Model odpowiada z tool_call (np. search_kb lub get_entry)
      ↓
chat.ts wywołuje odpowiednią funkcję na bazie SQLite
      ↓
Wynik narzędzia odsyłany do modelu jako wiadomość role:"tool"
      ↓
Model generuje finalną odpowiedź
```

### Koncepcja kluczowa
Model **nie dostaje całej bazy wiedzy z góry**. Zamiast tego dostaje definicje narzędzi i sam decyduje, kiedy i z czym zapytać bazę. Różnica vs RAG: model świadomie wywołuje konkretne zapytanie, a nie system automatycznie wyszukuje fragmenty.

---

## Plan implementacji

### Krok 1 — Dodaj zależność `better-sqlite3`

```bash
npm install better-sqlite3
npm install --save-dev @types/better-sqlite3
```

W `package.json` pojawi się:
```json
"dependencies": {
  "better-sqlite3": "^9.x.x",
  "dotenv": "^16.4.5"
},
"devDependencies": {
  "@types/better-sqlite3": "^9.x.x",
  ...
}
```

### Krok 2 — Utwórz skrypt seedujący bazę SQLite

Nowy plik: `src/seed.ts`

Cel: przekonwertować istniejące dane z `data/data.txt` (lub innego źródła) na bazę SQLite.

```ts
// src/seed.ts
import Database from 'better-sqlite3';
import * as fs from 'fs';
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

// Przykładowe dane — zastąp własną logiką parsowania
const entries = [
  { topic: 'example', content: 'Example content...' },
];

const insert = db.prepare('INSERT INTO entries (topic, content) VALUES (?, ?)');
for (const entry of entries) {
  insert.run(entry.topic, entry.content);
}

console.log(`Seeded ${entries.length} entries to ${DB_PATH}`);
db.close();
```

Dodaj skrypt do `package.json`:
```json
"scripts": {
  "seed": "ts-node -r dotenv/config src/seed.ts",
  ...
}
```

### Krok 3 — Utwórz moduł bazy wiedzy

Nowy plik: `src/knowledge.ts`

```ts
// src/knowledge.ts
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
  // Wyszukiwanie pełnotekstowe — LIKE po topic i content
  const stmt = database.prepare(`
    SELECT id, topic, content
    FROM entries
    WHERE topic LIKE ? OR content LIKE ?
    LIMIT 5
  `);
  return stmt.all(`%${query}%`, `%${query}%`) as { id: number; topic: string; content: string }[];
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
```

### Krok 4 — Zaktualizuj `src/api.ts` — dodaj obsługę tool calling

Zastąp obecny `src/api.ts`:

```ts
// src/api.ts
import { Config } from './config';

export interface Message {
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string | null;
  tool_call_id?: string;
  tool_calls?: ToolCall[];
}

export interface ToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

export interface Tool {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: object;
  };
}

// Definicje narzędzi — przekazywane do modelu
export const KNOWLEDGE_TOOLS: Tool[] = [
  {
    type: 'function',
    function: {
      name: 'search_knowledge',
      description: 'Search the knowledge base for information matching a query string.',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'The search query to look for in the knowledge base.',
          },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'list_topics',
      description: 'List all available topics in the knowledge base.',
      parameters: {
        type: 'object',
        properties: {},
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_entry_by_id',
      description: 'Get the full content of a knowledge base entry by its ID.',
      parameters: {
        type: 'object',
        properties: {
          id: {
            type: 'number',
            description: 'The numeric ID of the entry.',
          },
        },
        required: ['id'],
      },
    },
  },
];

export async function sendMessage(
  history: Message[],
  config: Config,
  tools: Tool[] = KNOWLEDGE_TOOLS,
): Promise<{ content: string | null; tool_calls?: ToolCall[] }> {
  const apiKey = process.env.OPENROUTER_API_KEY!;

  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: config.model,
      messages: history,
      tools,
      tool_choice: 'auto',
      max_tokens: config.maxTokens,
      temperature: config.temperature,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API error ${response.status}: ${errorText}`);
  }

  const data = await response.json() as {
    choices: {
      message: {
        content: string | null;
        tool_calls?: ToolCall[];
      };
    }[];
  };

  return data.choices[0].message;
}
```

### Krok 5 — Przepisz `src/chat.ts` — pętla agentic z obsługą narzędzi

Zastąp obecny `src/chat.ts`:

```ts
// src/chat.ts
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { Config } from './config';
import { Message, ToolCall, sendMessage, KNOWLEDGE_TOOLS } from './api';
import { searchKnowledge, getEntryById, listTopics } from './knowledge';
import { log } from './logger';

// Dispatcher — wywołuje właściwą funkcję na podstawie nazwy narzędzia
function executeTool(name: string, args: Record<string, unknown>): string {
  switch (name) {
    case 'search_knowledge': {
      const results = searchKnowledge(args.query as string);
      if (results.length === 0) return 'No results found.';
      return JSON.stringify(results, null, 2);
    }
    case 'list_topics': {
      const topics = listTopics();
      if (topics.length === 0) return 'No topics in knowledge base.';
      return JSON.stringify(topics, null, 2);
    }
    case 'get_entry_by_id': {
      const entry = getEntryById(args.id as number);
      if (!entry) return `Entry with id ${args.id} not found.`;
      return JSON.stringify(entry, null, 2);
    }
    default:
      return `Unknown tool: ${name}`;
  }
}

function printHistory(history: Message[]): void {
  const visible = history.filter(m => m.role !== 'system');
  if (visible.length === 0) {
    console.log('(no messages yet)');
    return;
  }
  console.log('\n--- conversation history ---');
  for (const msg of visible) {
    const label = msg.role.toUpperCase().padEnd(9);
    const content = msg.content ?? `[tool_calls: ${msg.tool_calls?.map(t => t.function.name).join(', ')}]`;
    console.log(`${label} ${content}`);
  }
  console.log('--- end of history ---\n');
}

export async function runChat(config: Config): Promise<void> {
  const rl = readline.createInterface({ input, output });

  const history: Message[] = [
    {
      role: 'system',
      content: 'You are a helpful assistant with access to a knowledge base. Use the provided tools to search for information when needed. If you cannot find the answer, say so clearly.',
    },
  ];

  function printHelp(): void {
    console.log('Available commands:');
    console.log('  /history  — show conversation history');
    console.log('  /clear    — clear the console');
    console.log('  /exit     — quit the chatbot');
    console.log();
  }

  log('INFO', 'Session started');
  printHelp();

  while (true) {
    let userInput: string;
    try {
      userInput = await rl.question('You: ');
    } catch {
      log('INFO', 'Session ended (stdin closed)');
      console.log('\nGoodbye!');
      rl.close();
      return;
    }
    const trimmed = userInput.trim();

    if (!trimmed) continue;
    if (trimmed === '/exit') {
      log('INFO', 'Session ended by user');
      console.log('Goodbye!');
      rl.close();
      return;
    }
    if (trimmed === '/history') { printHistory(history); continue; }
    if (trimmed === '/clear') { console.clear(); printHelp(); continue; }

    log('USER', trimmed);
    history.push({ role: 'user', content: trimmed });

    // Pętla agentic — model może wywołać kilka narzędzi zanim odpowie
    try {
      while (true) {
        const response = await sendMessage(history, config, KNOWLEDGE_TOOLS);

        if (response.tool_calls && response.tool_calls.length > 0) {
          // Model chce wywołać narzędzia
          history.push({
            role: 'assistant',
            content: response.content,
            tool_calls: response.tool_calls,
          });

          for (const toolCall of response.tool_calls) {
            const args = JSON.parse(toolCall.function.arguments) as Record<string, unknown>;
            log('INFO', `Tool call: ${toolCall.function.name}(${JSON.stringify(args)})`);
            console.log(`[calling tool: ${toolCall.function.name}]`);

            const result = executeTool(toolCall.function.name, args);

            history.push({
              role: 'tool',
              content: result,
              tool_call_id: toolCall.id,
            });
          }
          // Kontynuuj pętlę — model przetworzy wyniki narzędzi
        } else {
          // Model dał finalną odpowiedź
          const reply = response.content ?? '';
          history.push({ role: 'assistant', content: reply });
          log('ASSISTANT', reply);
          console.log(`\nAssistant: ${reply}\n`);
          break;
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      log('ERROR', message);
      console.error(`Error: ${message}`);
      history.pop();
    }
  }
}
```

### Krok 6 — Zaktualizuj `config.json`

Usuń pole `knowledgeBasePath` (już niepotrzebne):

```json
{
  "model": "openai/gpt-4o",
  "maxTokens": 1024,
  "temperature": 0.7,
  "baseUrl": "https://openrouter.ai/api/v1"
}
```

### Krok 7 — Zaktualizuj `src/config.ts`

Usuń pole `knowledgeBasePath` z interfejsu `Config`:

```ts
export interface Config {
  model: string;
  maxTokens: number;
  temperature: number;
  baseUrl: string;
  // knowledgeBasePath usunięte — baza danych to SQLite
}
```

---

## Struktura plików po migracji

```
js-ai-chat-knowledgebase-3-tool/
├── src/
│   ├── index.ts       — bez zmian
│   ├── config.ts      — usunąć knowledgeBasePath
│   ├── api.ts         — przepisać: dodać Tool, ToolCall, tool_calls
│   ├── chat.ts        — przepisać: pętla agentic, dispatcher
│   ├── knowledge.ts   — NOWY: wrapper na better-sqlite3
│   ├── logger.ts      — bez zmian
│   └── seed.ts        — NOWY: skrypt do zasilenia bazy danych
├── data/
│   ├── data.txt       — stare dane (opcjonalnie zachować jako źródło do seed)
│   └── knowledge.db   — NOWY: baza SQLite (generowana przez seed.ts)
├── config.json        — usunąć knowledgeBasePath
├── package.json       — dodać better-sqlite3, @types/better-sqlite3
└── .gitignore         — dodać data/knowledge.db (opcjonalnie)
```

---

## Schematy bazy danych

### Tabela `entries` (minimalna)
```sql
CREATE TABLE IF NOT EXISTS entries (
  id      INTEGER PRIMARY KEY AUTOINCREMENT,
  topic   TEXT NOT NULL,
  content TEXT NOT NULL
);
```

### Opcjonalne rozszerzenie (jeśli dane mają tagi/kategorie)
```sql
CREATE TABLE IF NOT EXISTS entries (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  topic    TEXT NOT NULL,
  category TEXT,
  content  TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);
```

---

## Kolejność kroków dla agenta

1. `npm install better-sqlite3 && npm install --save-dev @types/better-sqlite3`
2. Utwórz `src/knowledge.ts` z funkcjami `searchKnowledge`, `getEntryById`, `listTopics`
3. Utwórz `src/seed.ts` — przeparsuj `data/data.txt` i załaduj do SQLite
4. Uruchom `npm run seed` — wygeneruje `data/knowledge.db`
5. Przepisz `src/api.ts` — dodaj typy `Tool`, `ToolCall`, zaktualizuj `sendMessage()`
6. Przepisz `src/chat.ts` — zamień pełny kontekst na pętlę agentic z dispatcherem
7. Zaktualizuj `src/config.ts` — usuń `knowledgeBasePath`
8. Zaktualizuj `config.json` — usuń `knowledgeBasePath`
9. Przetestuj: `npm run dev`

---

## Ważne uwagi techniczne

- **OpenRouter obsługuje tool calling** dla modeli takich jak `openai/gpt-4o` — format jest identyczny z OpenAI API
- **`better-sqlite3` jest synchroniczny** — nie wymaga `async/await`, co upraszcza kod
- **Pętla agentic** (`while(true)`) jest niezbędna — model może wywołać narzędzie wielokrotnie zanim da finalną odpowiedź
- **`tool_call_id`** musi być przekazane w wiadomości `role: 'tool'` — jest wymagane przez API
- Modele z OpenRouter mogą mieć różne nazwy pola w odpowiedzi — zawsze sprawdź `choices[0].message`
- `better-sqlite3` wymaga natywnych bindingów — na Windows może potrzebować `node-gyp` i Python

---

## Różnica konceptualna (podsumowanie)

| | Projekt 1 (obecny) | Projekt 3 (docelowy) |
|---|---|---|
| Baza wiedzy | Plik tekstowy w system prompt | SQLite — zapytania przez narzędzia |
| Kiedy dane trafiają do modelu | Zawsze — przed każdą wiadomością | Na żądanie — tylko gdy model wywoła narzędzie |
| Skalowanie | Ograniczone oknem kontekstu | Nieograniczone (model pyta o konkret) |
| Precyzja | Model musi sam znaleźć w tekście | Model formułuje precyzyjne zapytanie |
| Złożoność kodu | Prosta pętla | Pętla agentic + dispatcher narzędzi |
