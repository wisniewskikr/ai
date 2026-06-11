export function buildVerifyPrompt(question: string): string {
  return `Answer the following question factually and concisely.

Question: ${question}

Respond ONLY with a JSON object in this exact format:
{
  "answer": "your answer here",
  "confidence": 0.95,
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "language": "en"
}

Rules:
- "answer": direct, factual answer
- "confidence": your confidence from 0.0 to 1.0
- "keywords": 2-5 key terms best suited for Wikipedia search to verify your answer
- "language": language code matching the question language (e.g. "en", "pl", "de")`;
}
