import { ValidationResult } from '../services/pipeline';
import { callOpenRouter } from '../services/openrouter';
import { getJudgePrompt } from '../prompts/judge-prompt';

export async function validateSemantic(message: string): Promise<ValidationResult> {
  try {
    const verdict = await callOpenRouter({
      model: 'judge',
      systemPrompt: getJudgePrompt(),
      userMessage: message,
    });

    const normalized = verdict.trim().toUpperCase();

    if (normalized.startsWith('BLOCK')) {
      return { status: 'BLOCK', reason: 'LLM judge detected malicious intent' };
    }
    if (normalized.startsWith('SUSPICIOUS')) {
      return { status: 'SUSPICIOUS', reason: 'LLM judge flagged suspicious intent' };
    }
    return { status: 'SAFE', reason: 'SAFE' };
  } catch {
    // On error, be conservative — flag as suspicious so the message still reaches contextual check
    return { status: 'SUSPICIOUS', reason: 'semantic validation unavailable (API error)' };
  }
}
