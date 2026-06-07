import { SearchResult } from '../services/bm25Search';

const COL_WIDTH = 42;

function truncate(text: string, maxLen: number): string {
  return text.length > maxLen ? text.slice(0, maxLen - 3) + '...' : text;
}

function formatResult(result: SearchResult): string {
  const score = `[${result.score.toFixed(2)}]`;
  const available = COL_WIDTH - score.length - 1;
  return `${score} ${truncate(result.text, available)}`;
}

export function displayColumns(
  bm25Results: SearchResult[],
  vectorResults: SearchResult[],
  hybridResults: SearchResult[],
  topK: number
): void {
  const header = (title: string) => title.padEnd(COL_WIDTH);

  console.log(
    header('[BM25 results]') + ' ' +
    header('[Vector results]') + ' ' +
    '[Hybrid results]'
  );
  console.log('-'.repeat(COL_WIDTH * 3 + 2));

  for (let i = 0; i < topK; i++) {
    const b = bm25Results[i] ? formatResult(bm25Results[i]) : '';
    const v = vectorResults[i] ? formatResult(vectorResults[i]) : '';
    const h = hybridResults[i] ? formatResult(hybridResults[i]) : '';
    console.log(b.padEnd(COL_WIDTH) + ' ' + v.padEnd(COL_WIDTH) + ' ' + h);
  }
  console.log();
}
