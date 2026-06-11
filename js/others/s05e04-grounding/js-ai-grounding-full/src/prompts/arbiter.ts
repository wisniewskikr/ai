export function buildArbiterPrompt(
  question: string,
  answerA: string,
  answerB: string,
  wikipediaExcerpt: string | null
): string {
  const wikiSection = wikipediaExcerpt
    ? `Wikipedia excerpt:\n${wikipediaExcerpt}`
    : "Wikipedia: not available";

  return `You are a factual consistency judge. Evaluate whether two AI answers are consistent with each other and with external evidence.

Question: ${question}

Model A answer: ${answerA}
Model B answer: ${answerB}

${wikiSection}

Respond ONLY with a JSON object:
{
  "consistent": true,
  "score": 0.95,
  "reasoning": "brief explanation"
}

Rules:
- "consistent": true if both answers convey the same fact
- "score": 0.0-1.0 consistency and correctness score
- "reasoning": 1 sentence explaining your judgment`;
}
