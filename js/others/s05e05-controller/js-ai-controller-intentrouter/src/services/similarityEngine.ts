import { employees, Employee } from "../utils/employees";
import { config } from "../utils/config";

interface SimilarityResult {
  employee: Employee;
  score: number;
}

// Keyword-based scoring — counts overlapping words between query and description.
// Not cosine similarity over vectors, but named "similarity" to avoid confusion.
function scoreKeywordOverlap(query: string, text: string): number {
  const queryWords = new Set(
    query
      .toLowerCase()
      .replace(/[^a-z\s]/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 2)
  );

  const textWords = text
    .toLowerCase()
    .replace(/[^a-z\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 2);

  if (queryWords.size === 0) return 0;

  const matches = textWords.filter((w) => queryWords.has(w)).length;
  return matches / queryWords.size;
}

export function query(question: string): string {
  const results: SimilarityResult[] = employees
    .map((emp) => ({
      employee: emp,
      score: scoreKeywordOverlap(question, emp.description),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, config.vectorTopK);

  if (results.every((r) => r.score === 0)) {
    // No keyword overlap — return top employees by description length as fallback
    const fallback = [...employees]
      .sort((a, b) => b.description.length - a.description.length)
      .slice(0, config.vectorTopK);

    return fallback
      .map((e) => `${e.name} (${e.title})`)
      .join(", ");
  }

  return results
    .map((r) => `${r.employee.name} (${r.employee.title}, score: ${r.score.toFixed(2)})`)
    .join("\n");
}
