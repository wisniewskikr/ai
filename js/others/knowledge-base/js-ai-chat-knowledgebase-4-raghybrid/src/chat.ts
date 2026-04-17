import * as readline from 'node:readline/promises';
import * as fs from 'fs';
import * as path from 'path';
import { stdin as input, stdout as output } from 'node:process';
import { Config } from './config';
import { Message, sendMessage } from './api';
import { log } from './logger';
import { splitIntoChunks } from './chunker';
import { embedText, embedBatch } from './embeddings';
import { buildIndex, searchIndex } from './vectorStore';

function loadKnowledgeBase(knowledgeBasePath: string): string {
  const filePath = path.join(process.cwd(), knowledgeBasePath);
  return fs.readFileSync(filePath, 'utf-8');
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
    console.log(`${label} ${msg.content}`);
  }
  console.log('--- end of history ---\n');
}

export async function runChat(config: Config): Promise<void> {
  const rl = readline.createInterface({ input, output });

  // --- Initialization: build RAG index ---
  console.log('Loading knowledge base...');
  const knowledgeBase = loadKnowledgeBase(config.knowledgeBasePath);

  console.log('Splitting into chunks...');
  const chunks = await splitIntoChunks(knowledgeBase, config.chunkSize, config.chunkOverlap);
  log('INFO', `Indexed ${chunks.length} chunks`);
  console.log(`Indexed ${chunks.length} chunks.`);

  console.log('Generating embeddings...');
  const embeddings = await embedBatch(chunks, config);

  console.log('Building hybrid index...');
  const db = await buildIndex(chunks, embeddings, config);
  console.log('Hybrid index ready.\n');

  const history: Message[] = [
    {
      role: 'system',
      content: 'You are a helpful assistant. Answer questions based only on the provided context. If the answer is not in the context, say so clearly.',
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

    if (trimmed === '/history') {
      printHistory(history);
      continue;
    }

    if (trimmed === '/clear') {
      console.clear();
      printHelp();
      continue;
    }

    log('USER', trimmed);

    try {
      // RAG: embed question, hybrid search, build context
      const queryEmbedding = await embedText(trimmed, config);
      const relevantChunks = await searchIndex(db, queryEmbedding, trimmed, config);
      log('INFO', `Retrieved ${relevantChunks.length} chunks (hybrid search)`);

      const context = relevantChunks
        .map((chunk, i) => `[${i + 1}] ${chunk}`)
        .join('\n\n');

      const ragMessage: Message = {
        role: 'user',
        content: `Context:\n${context}\n\nQuestion: ${trimmed}`,
      };

      const messagesForApi = [...history, ragMessage];
      const reply = await sendMessage(messagesForApi, config);

      // Store only the original question in history (not RAG context)
      history.push({ role: 'user', content: trimmed });
      history.push({ role: 'assistant', content: reply });

      log('ASSISTANT', reply);
      console.log(`\nAssistant: ${reply}\n`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      log('ERROR', message);
      console.error(`Error: ${message}`);
    }
  }
}
