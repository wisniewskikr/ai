import * as os from 'os';
import * as path from 'path';
import { LocalIndex } from 'vectra';
import { Config } from './config';

export async function buildIndex(
  chunks: string[],
  embeddings: number[][],
  config: Config
): Promise<LocalIndex> {
  const indexPath = path.join(os.tmpdir(), `rag-index-${Date.now()}`);
  const index = new LocalIndex(indexPath);

  if (!await index.isIndexCreated()) {
    await index.createIndex();
  }

  for (let i = 0; i < chunks.length; i++) {
    await index.insertItem({
      vector: embeddings[i],
      metadata: { text: chunks[i] },
    });
  }

  return index;
}

export async function searchIndex(
  index: LocalIndex,
  queryEmbedding: number[],
  topK: number
): Promise<string[]> {
  const results = await index.queryItems(queryEmbedding, '', topK);
  return results.map(r => (r.item.metadata as { text: string }).text);
}
