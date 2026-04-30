import { ValidationResult } from '../services/pipeline';

// Wraps user message in untrusted tags so the main model knows to treat it as external data
export function wrapUntrusted(message: string): string {
  return `[UNTRUSTED] ${message} [/UNTRUSTED]`;
}

// Detects attempts to escape the [UNTRUSTED] wrapper by injecting the closing tag
export function validateArchitectural(message: string): ValidationResult {
  if (/\[\/UNTRUSTED\]/i.test(message)) {
    return { status: 'BLOCK', reason: 'untrusted tag escape attempt detected' };
  }
  return { status: 'SAFE', reason: 'tagged [UNTRUSTED], prompt hardening active' };
}
