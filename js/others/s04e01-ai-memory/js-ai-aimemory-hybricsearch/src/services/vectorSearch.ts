import { SearchResult } from './bm25Search';

// Cached pipeline instance — loaded once, reused on every query
let embedder: any = null;

async function getEmbedder(modelName: string): Promise<any> {
  if (!embedder) {
    const { pipeline } = await import('@xenova/transformers');
    console.log('Loading embedding model (first run downloads ~80MB)...');
    embedder = await pipeline('feature-extraction', modelName);
    console.log('Embedding model ready.\n');
  }
  return embedder;
}

async function embed(text: string, modelName: string): Promise<number[]> {
  const pipe = await getEmbedder(modelName);
  const result = await pipe(text, { pooling: 'mean', normalize: true });
  return Array.from(result.data as Float32Array);
}

// Dot product works as cosine similarity because vectors are L2-normalized
function dotProduct(a: number[], b: number[]): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) sum += a[i] * b[i];
  return sum;
}

export async function precomputeEmbeddings(
  documents: string[],
  modelName: string
): Promise<number[][]> {
  console.log(`Pre-computing embeddings for ${documents.length} documents...`);
  const embeddings: number[][] = [];
  for (const doc of documents) {
    embeddings.push(await embed(doc, modelName));
  }
  console.log('All embeddings ready.\n');
  return embeddings;
}

export async function vectorSearch(
  query: string,
  documents: string[],
  precomputed: number[][],
  modelName: string,
  topK: number
): Promise<SearchResult[]> {
  const queryVec = await embed(query, modelName);

  return documents
    .map((text, index) => ({
      score: dotProduct(queryVec, precomputed[index]),
      text,
      index,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}
