export function buildEmailPrompt(topic: string, recipient: string, concept: string): string {
  return `Write a formal business email with the following details:

Topic: ${topic}
Recipient: ${recipient}
Concept: ${concept}

Output only the email — subject line first, then the body. No signature. No AI footer.`;
}
