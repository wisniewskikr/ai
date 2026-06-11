import config from "../../config.json";

function tokenize(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 0)
  );
}

export function answersMatch(
  answerA: string,
  keywordsA: string[],
  answerB: string,
  keywordsB: string[]
): { match: boolean; overlap: number } {
  const { keywordOverlapThreshold } = config.verification;

  const wordsA = tokenize(answerA);
  const wordsB = tokenize(answerB);

  // Merge answer tokens with keywords for richer comparison
  const setA = new Set([...wordsA, ...keywordsA.map((k) => k.toLowerCase())]);
  const setB = new Set([...wordsB, ...keywordsB.map((k) => k.toLowerCase())]);

  const intersection = [...setA].filter((w) => setB.has(w)).length;
  const union = new Set([...setA, ...setB]).size;

  const jaccard = union === 0 ? 0 : intersection / union;
  const minSize = Math.min(setA.size, setB.size);
  const containment = minSize === 0 ? 0 : intersection / minSize;
  const overlap = Math.max(jaccard, containment);
  return { match: overlap >= keywordOverlapThreshold, overlap };
}
