export function buildParseQuestionPrompt(question: string, nodeNames: string[]): string {
  return `You are a query parser for a company org-chart knowledge graph.

People in the graph:
${nodeNames.map(n => `- ${n}`).join('\n')}

User question: "${question}"

Return ONLY a JSON object with two fields:
- "person": the full name from the list above that the question is about (must match exactly)
- "queryType": "direct_reports" if asking who someone manages/who reports to them, or "manager" if asking who someone reports to/who their boss is

If you cannot determine either field, return: {"person": null, "queryType": "unknown"}

Return ONLY the JSON object, no markdown, no explanation.`;
}
