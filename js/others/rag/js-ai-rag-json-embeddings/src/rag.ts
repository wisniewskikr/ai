import * as fs from 'fs';
import * as path from 'path';
import { pipeline } from '@xenova/transformers';
import { log } from './logger';

/*
 * JSON-embeddings RAG — pre-computes dense semantic vectors once (build mode)
 * and stores them in a JSON file.  At chat time the file is loaded directly,
 * so the knowledge base never needs to be re-embedded between sessions.
 *
 * The embedding model (all-MiniLM-L6-v2, ~23 MB) is still used at chat time
 * to embed each user query before comparing it against the stored vectors.
 *
 * Two entry points:
 *   buildEmbeddings()  — reads knowledge.txt → writes embeddings.json
 *   loadKnowledge()    — reads embeddings.json → returns KnowledgeBase
 */

const MODEL = 'Xenova/all-MiniLM-L6-v2';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let extractor: any = null;

async function embed(text: string): Promise<number[]> {
  if (!extractor) {
    extractor = await pipeline('feature-extraction', MODEL);
  }
  const output = await extractor(text, { pooling: 'mean', normalize: true });
  return Array.from(output.data as Float32Array);
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot  += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  if (magA === 0 || magB === 0) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

export interface KnowledgeBase {
  chunks: string[];
  chunkVectors: number[][];
}

interface EmbeddingsFile {
  chunks: string[];
  vectors: number[][];
}

export async function buildEmbeddings(knowledgeFile: string, embeddingsFile: string): Promise<void> {
  const absKnowledge = path.join(process.cwd(), knowledgeFile);
  if (!fs.existsSync(absKnowledge)) {
    throw new Error(`Knowledge file not found: ${absKnowledge}`);
  }

  const raw = fs.readFileSync(absKnowledge, 'utf-8');
  const chunks = raw.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  if (chunks.length === 0) throw new Error('Knowledge file is empty.');

  log('INFO', `Building embeddings for ${chunks.length} chunks, model: ${MODEL}`);
  console.log(`Loading embedding model: ${MODEL}`);
  const vectors = await Promise.all(chunks.map(embed));

  const store: EmbeddingsFile = { chunks, vectors };
  const absOutput = path.join(process.cwd(), embeddingsFile);
  const dir = path.dirname(absOutput);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(absOutput, JSON.stringify(store, null, 2), 'utf-8');

  log('INFO', `Embeddings saved to ${absOutput} — ${chunks.length} chunks`);
  console.log(`Embeddings saved to ${embeddingsFile} (${chunks.length} chunks)`);
}

export function loadKnowledge(embeddingsFile: string): KnowledgeBase {
  const absPath = path.join(process.cwd(), embeddingsFile);
  if (!fs.existsSync(absPath)) {
    log('INFO', `Embeddings file not found: ${absPath} — RAG disabled`);
    return { chunks: [], chunkVectors: [] };
  }

  const store = JSON.parse(fs.readFileSync(absPath, 'utf-8')) as EmbeddingsFile;
  log('INFO', `Embeddings loaded from ${embeddingsFile} — ${store.chunks.length} chunks`);
  return { chunks: store.chunks, chunkVectors: store.vectors };
}

export async function findRelevantChunks(question: string, kb: KnowledgeBase, topK: number): Promise<string[]> {
  if (kb.chunks.length === 0) return [];

  const qVector = await embed(question);

  const scored = kb.chunks.map((chunk, i) => ({
    chunk,
    score: cosineSimilarity(qVector, kb.chunkVectors[i]),
  }));

  scored.sort((a, b) => b.score - a.score);

  return scored
    .slice(0, topK)
    .map(s => s.chunk);
}
