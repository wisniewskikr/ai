import { SearchResult } from './bm25Search';

function minMaxNormalize(results: SearchResult[]): Map<number, number> {
  if (results.length === 0) return new Map();

  const scores = results.map(r => r.score);
  const min = Math.min(...scores);
  const max = Math.max(...scores);
  const range = max - min;

  const normalized = new Map<number, number>();
  for (const r of results) {
    normalized.set(r.index, range === 0 ? 1 : (r.score - min) / range);
  }
  return normalized;
}

export function hybridSearch(
  bm25Results: SearchResult[],
  vectorResults: SearchResult[],
  allDocuments: string[],
  bm25Weight: number,
  vectorWeight: number,
  topK: number
): SearchResult[] {
  const bm25Norm = minMaxNormalize(bm25Results);
  const vectorNorm = minMaxNormalize(vectorResults);

  // Union of candidates from both retrieval methods
  const candidateIndices = new Set([
    ...bm25Results.map(r => r.index),
    ...vectorResults.map(r => r.index),
  ]);

  const combined: SearchResult[] = [];
  for (const idx of candidateIndices) {
    const bScore = bm25Norm.get(idx) ?? 0;
    const vScore = vectorNorm.get(idx) ?? 0;
    combined.push({
      score: bScore * bm25Weight + vScore * vectorWeight,
      text: allDocuments[idx],
      index: idx,
    });
  }

  return combined.sort((a, b) => b.score - a.score).slice(0, topK);
}
