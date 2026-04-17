import { ChromaClient, Collection } from 'chromadb';
import { Config } from './config';

export async function buildIndex(
  chunks: string[],
  embeddings: number[][],
  config: Config
): Promise<Collection> {
  const client = new ChromaClient({ path: config.chromaUrl ?? 'http://localhost:8000' });

  const collection = await client.createCollection({
    name: `rag-${Date.now()}`,
    embeddingFunction: undefined,
  });

  await collection.add({
    ids: chunks.map((_, i) => `chunk-${i}`),
    embeddings: embeddings,
    documents: chunks,
  });

  return collection;
}

export async function searchIndex(
  collection: Collection,
  queryEmbedding: number[],
  topK: number
): Promise<string[]> {
  const results = await collection.query({
    queryEmbeddings: [queryEmbedding],
    nResults: topK,
  });
  return (results.documents[0] ?? []).filter((d): d is string => d !== null);
}
