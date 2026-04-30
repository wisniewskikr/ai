import { ValidationResult } from '../services/pipeline';

// Wraps user message in untrusted tags so the main model knows to treat it as external data
export function wrapUntrusted(message: string): string {
  return `[UNTRUSTED] ${message} [/UNTRUSTED]`;
}

// This layer always passes — its purpose is tagging and signaling to the pipeline
export function validateArchitectural(_message: string): ValidationResult {
  return { status: 'SAFE', reason: 'tagged [UNTRUSTED], prompt hardening active' };
}
