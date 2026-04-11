import * as fs from 'fs';
import * as path from 'path';
import { log } from './logger';

/*
 * Bag-of-words RAG — no external dependencies, no API calls.
 *
 * Works well for personal knowledge bases where queries share vocabulary
 * with stored facts ("What is my name?" ↔ "My name is Krzysztof.").
 *
 * To upgrade to neural embeddings: replace embed() with any embedding
 * API (OpenAI, Ollama, etc.) and keep findRelevantChunks() as-is.
 */

function tokenize(text: string): string[] {
  return text.toLowerCase().match(/\b\w+\b/g) ?? [];
}

function buildVector(tokens: string[], vocabulary: string[]): number[] {
  const freq = new Map<string, number>();
  for (const t of tokens) freq.set(t, (freq.get(t) ?? 0) + 1);
  return vocabulary.map(word => freq.get(word) ?? 0);
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
  vocabulary: string[];
  chunkVectors: number[][];
}

export function loadKnowledge(filePath: string): KnowledgeBase {
  const absPath = path.join(process.cwd(), filePath);

  if (!fs.existsSync(absPath)) {
    log('INFO', `Knowledge file not found: ${absPath} — RAG disabled`);
    return { chunks: [], vocabulary: [], chunkVectors: [] };
  }

  const raw = fs.readFileSync(absPath, 'utf-8');
  const chunks = raw.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  if (chunks.length === 0) {
    log('INFO', 'Knowledge file is empty — RAG disabled');
    return { chunks: [], vocabulary: [], chunkVectors: [] };
  }

  const allTokens = chunks.map(tokenize);

  // Vocabulary = unique words across all chunks
  const vocabSet = new Set<string>();
  for (const tokens of allTokens) {
    for (const t of tokens) vocabSet.add(t);
  }
  const vocabulary = Array.from(vocabSet);

  const chunkVectors = allTokens.map(tokens => buildVector(tokens, vocabulary));

  log('INFO', `Knowledge base ready — ${chunks.length} chunks, ${vocabulary.length} unique words`);
  return { chunks, vocabulary, chunkVectors };
}

export function findRelevantChunks(question: string, kb: KnowledgeBase, topK: number): string[] {
  if (kb.chunks.length === 0) return [];

  const qVector = buildVector(tokenize(question), kb.vocabulary);

  const scored = kb.chunks.map((chunk, i) => ({
    chunk,
    score: cosineSimilarity(qVector, kb.chunkVectors[i]),
  }));

  scored.sort((a, b) => b.score - a.score);

  return scored
    .filter(s => s.score > 0)
    .slice(0, topK)
    .map(s => s.chunk);
}
