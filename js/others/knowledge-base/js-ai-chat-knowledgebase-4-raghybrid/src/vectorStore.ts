import { create, insertMultiple, search, Orama } from '@orama/orama';
import { Config } from './config';

export type OramaDB = Orama<any>;

export async function buildIndex(
  chunks: string[],
  embeddings: number[][],
  config: Config
): Promise<OramaDB> {
  const db = await create({
    schema: {
      id: 'string',
      text: 'string',
      embedding: `vector[${config.embeddingDimension}]`,
    } as any,
  });

  await insertMultiple(db, chunks.map((text, i) => ({
    id: `chunk-${i}`,
    text,
    embedding: embeddings[i],
  })));

  return db;
}

export async function searchIndex(
  db: OramaDB,
  queryEmbedding: number[],
  query: string,
  topK: number
): Promise<string[]> {
  const results = await search(db, {
    mode: 'hybrid',
    term: query,
    vector: {
      value: queryEmbedding,
      property: 'embedding',
    },
    limit: topK,
  } as any);

  return results.hits.map((hit: any) => hit.document.text as string);
}
