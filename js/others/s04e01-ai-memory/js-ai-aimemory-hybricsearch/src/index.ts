import fs from 'fs';
import path from 'path';
import readline from 'readline';
import dotenv from 'dotenv';
import { bm25Search } from './services/bm25Search';
import { vectorSearch, precomputeEmbeddings } from './services/vectorSearch';
import { hybridSearch } from './services/hybridSearch';
import { askLLM } from './services/openRouterClient';
import { displayColumns } from './utils/display';
import { logger } from './utils/logger';

dotenv.config();

interface Config {
  model: string;
  embeddingModel: string;
  topK: number;
  hybridWeights: { bm25: number; vector: number };
}

function loadConfig(): Config {
  const raw = fs.readFileSync(path.join(process.cwd(), 'config.json'), 'utf-8');
  return JSON.parse(raw) as Config;
}

function loadMemories(): string[] {
  const raw = fs.readFileSync(path.join(process.cwd(), 'data', 'memories.json'), 'utf-8');
  return JSON.parse(raw) as string[];
}

function ask(rl: readline.Interface, prompt: string): Promise<string> {
  return new Promise(resolve => rl.question(prompt, resolve));
}

const PRESET_QUERIES = [
  { label: 'password policy', note: 'BM25 wins (exact keyword match)' },
  { label: 'who is allowed to login?', note: 'Vector wins (semantic match)' },
  { label: 'data security rules', note: 'Hybrid wins (keywords + meaning)' },
];

async function runQuery(
  query: string,
  documents: string[],
  precomputed: number[][],
  config: Config,
  apiKey: string
): Promise<void> {
  logger.info(`Query: "${query}"`);

  const bm25Results = bm25Search(query, documents, config.topK);
  const vResults = await vectorSearch(query, documents, precomputed, config.embeddingModel, config.topK);
  const hResults = hybridSearch(
    bm25Results,
    vResults,
    documents,
    config.hybridWeights.bm25,
    config.hybridWeights.vector,
    config.topK
  );

  displayColumns(bm25Results, vResults, hResults, config.topK);

  logger.info('Calling LLM for answer...');
  const topContext = hResults.map(r => r.text);
  try {
    const answer = await askLLM(topContext, query, config.model, apiKey);
    console.log('[AI Answer]', answer);
    logger.info(`Answer: ${answer}`);
  } catch (err) {
    logger.error(`LLM call failed: ${err}`);
    console.error('Failed to get AI answer:', err);
  }
  console.log();
}

async function main(): Promise<void> {
  const config = loadConfig();
  const documents = loadMemories();

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    console.error('Missing OPENROUTER_API_KEY in .env');
    process.exit(1);
  }

  logger.info('Application started');
  logger.info(`Loaded ${documents.length} memories, model: ${config.model}`);

  // Pre-compute all document embeddings once at startup
  const precomputed = await precomputeEmbeddings(documents, config.embeddingModel);

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  console.log('='.repeat(80));
  console.log('  Hybrid Memory Search — BM25 + Vector + RAG');
  console.log('='.repeat(80));

  while (true) {
    console.log('\nSelect an option:');
    for (let i = 0; i < PRESET_QUERIES.length; i++) {
      console.log(`  ${i + 1}. ${PRESET_QUERIES[i].label.padEnd(30)} <- ${PRESET_QUERIES[i].note}`);
    }
    console.log(`  ${PRESET_QUERIES.length + 1}. Type your own query`);
    console.log('  0. Exit');

    const choice = (await ask(rl, '\n> ')).trim();

    if (choice === '0') {
      console.log('Goodbye!');
      logger.info('Application exited by user');
      rl.close();
      break;
    }

    const choiceNum = parseInt(choice, 10);

    let query: string;
    if (choiceNum >= 1 && choiceNum <= PRESET_QUERIES.length) {
      query = PRESET_QUERIES[choiceNum - 1].label;
      const note = PRESET_QUERIES[choiceNum - 1].note;
      console.log(`\n--- "${query}" -> ${note} ---`);
    } else if (choiceNum === PRESET_QUERIES.length + 1) {
      query = (await ask(rl, 'Your query: ')).trim();
      if (!query) continue;
      console.log(`\n--- "${query}" ---`);
    } else {
      console.log('Invalid option.');
      continue;
    }

    await runQuery(query, documents, precomputed, config, apiKey);
  }
}

main().catch(err => {
  logger.error(`Fatal error: ${err}`);
  console.error(err);
  process.exit(1);
});
