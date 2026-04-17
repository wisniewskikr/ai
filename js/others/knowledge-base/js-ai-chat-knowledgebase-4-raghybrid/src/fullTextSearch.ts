import MiniSearch from 'minisearch';

export function buildFullTextIndex(chunks: string[]): MiniSearch {
  const index = new MiniSearch({ fields: ['text'], storeFields: ['text'] });
  const docs = chunks.map((text, id) => ({ id, text }));
  index.addAll(docs);
  return index;
}

export function searchFullText(index: MiniSearch, query: string, topK: number): string[] {
  const results = index.search(query);
  return results.slice(0, topK).map(r => r.text as string);
}
