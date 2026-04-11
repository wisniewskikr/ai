import * as fs from 'fs';
import * as path from 'path';
import { pipeline } from '@xenova/transformers';
import { log } from './logger';

/*
 * Neutral-embeddings RAG — uses a pre-trained sentence-transformer model
 * (all-MiniLM-L6-v2) to create dense semantic vectors for each chunk.
 *
 * Unlike bag-of-words, this approach captures semantic meaning, so queries
 * like "Where do I reside?" will match "I live in Szczecin, Poland." even
 * though they share no common words.
 *
 * The model is downloaded and cached locally on first run (~23 MB).
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

export async function loadKnowledge(filePath: string): Promise<KnowledgeBase> {
  const absPath = path.join(process.cwd(), filePath);

  if (!fs.existsSync(absPath)) {
    log('INFO', `Knowledge file not found: ${absPath} — RAG disabled`);
    return { chunks: [], chunkVectors: [] };
  }

  const raw = fs.readFileSync(absPath, 'utf-8');
  const chunks = raw.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  if (chunks.length === 0) {
    log('INFO', 'Knowledge file is empty — RAG disabled');
    return { chunks: [], chunkVectors: [] };
  }

  log('INFO', `Loading embedding model: ${MODEL}`);
  const chunkVectors = await Promise.all(chunks.map(embed));

  log('INFO', `Knowledge base ready — ${chunks.length} chunks, model: ${MODEL}`);
  return { chunks, chunkVectors };
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
