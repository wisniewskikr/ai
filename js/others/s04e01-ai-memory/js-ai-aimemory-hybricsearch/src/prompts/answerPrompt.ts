export function buildAnswerPrompt(context: string[], query: string): string {
  const contextText = context.map((doc, i) => `${i + 1}. ${doc}`).join('\n');
  return [
    'Answer the question using ONLY the information provided below.',
    'Be concise and direct. Do not add information not present in the context.',
    '',
    'Context:',
    contextText,
    '',
    `Question: ${query}`,
  ].join('\n');
}
