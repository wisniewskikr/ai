export interface SearchResult {
  score: number;
  text: string;
  index: number;
}

const K1 = 1.5;
const B = 0.75;

function tokenize(text: string): string[] {
  return text.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter(Boolean);
}

function computeIdf(tokenizedDocs: string[][]): Map<string, number> {
  const N = tokenizedDocs.length;
  const df = new Map<string, number>();

  for (const doc of tokenizedDocs) {
    const seen = new Set<string>();
    for (const term of doc) {
      if (!seen.has(term)) {
        df.set(term, (df.get(term) ?? 0) + 1);
        seen.add(term);
      }
    }
  }

  const idf = new Map<string, number>();
  for (const [term, freq] of df) {
    idf.set(term, Math.log((N - freq + 0.5) / (freq + 0.5) + 1));
  }
  return idf;
}

export function bm25Search(query: string, documents: string[], topK: number): SearchResult[] {
  const tokenizedDocs = documents.map(tokenize);
  const N = documents.length;
  const avgDocLen = tokenizedDocs.reduce((sum, doc) => sum + doc.length, 0) / N;
  const idf = computeIdf(tokenizedDocs);
  const queryTerms = tokenize(query);

  const scores = tokenizedDocs.map((doc, i) => {
    const tf = new Map<string, number>();
    for (const term of doc) tf.set(term, (tf.get(term) ?? 0) + 1);

    let score = 0;
    for (const term of queryTerms) {
      const termTf = tf.get(term) ?? 0;
      const termIdf = idf.get(term) ?? 0;
      const normTf = (termTf * (K1 + 1)) / (termTf + K1 * (1 - B + B * doc.length / avgDocLen));
      score += termIdf * normTf;
    }
    return { score, text: documents[i], index: i };
  });

  return scores.sort((a, b) => b.score - a.score).slice(0, topK);
}
