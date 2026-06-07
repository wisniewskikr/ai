export function buildPrompt(question: string, context: string): string {
  return `Context (company knowledge base):
${context}

Question: ${question}

Answer based only on the context above.`;
}
