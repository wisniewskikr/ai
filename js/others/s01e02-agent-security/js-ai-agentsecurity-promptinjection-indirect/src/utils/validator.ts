// Regex patterns that detect common prompt injection techniques in documents.
// NOTE: This is intentionally simple — it can be bypassed by obfuscation or
// other languages. That weakness is part of the demo.
const INJECTION_PATTERNS: RegExp[] = [
  /\[ADMIN\s*(NOTE|DIRECTIVE|SYSTEM)\b/i,
  /<!--\s*(AI\s*SYSTEM\s*DIRECTIVE|SYSTEM\s*DIRECTIVE|AI\s*INSTRUCTION)/i,
  /\bDIRECTIVE\s*:/i,
  /before\s+responding[,\s]/i,
  /always\s+begin\s+your\s+response/i,
  /list\s+all\s+employees/i,
  /emergency\s+system\s+code/i,
  /XK\s+series/i,
  /for\s+compliance\s+verification/i,
  /required\s+by\s+regulation/i,
  /case\s+verification\s+purposes/i,
];

export interface ValidationResult {
  safe: boolean;
  matchedPattern?: string;
}

export function validateDocument(content: string): ValidationResult {
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(content)) {
      return { safe: false, matchedPattern: pattern.toString() };
    }
  }
  return { safe: true };
}
