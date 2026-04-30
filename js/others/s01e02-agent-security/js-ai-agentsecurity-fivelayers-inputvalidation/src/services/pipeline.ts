import { validateStructural } from '../validators/1-structural';
import { validatePattern } from '../validators/2-pattern';
import { validateSemantic } from '../validators/3-semantic';
import { validateContextual } from '../validators/4-contextual';
import { validateArchitectural, wrapUntrusted } from '../validators/5-architectural';

export type ValidationStatus = 'SAFE' | 'SUSPICIOUS' | 'BLOCK';

export interface ValidationResult {
  status: ValidationStatus;
  reason: string;
}

export interface PipelineStep {
  name: string;
  result: ValidationResult;
}

export interface PipelineResult {
  passed: boolean;
  steps: PipelineStep[];
  processedMessage?: string;
  blockReason?: string;
}

export async function runPipeline(message: string): Promise<PipelineResult> {
  const steps: PipelineStep[] = [];

  const structural = validateStructural(message);
  steps.push({ name: 'Structural', result: structural });
  if (structural.status === 'BLOCK') {
    return { passed: false, steps, blockReason: structural.reason };
  }

  const pattern = validatePattern(message);
  steps.push({ name: 'Pattern', result: pattern });
  if (pattern.status === 'BLOCK') {
    return { passed: false, steps, blockReason: pattern.reason };
  }

  const semantic = await validateSemantic(message);
  steps.push({ name: 'Semantic', result: semantic });
  if (semantic.status === 'BLOCK') {
    return { passed: false, steps, blockReason: semantic.reason };
  }

  const contextual = validateContextual(message);
  steps.push({ name: 'Contextual', result: contextual });
  if (contextual.status === 'BLOCK') {
    return { passed: false, steps, blockReason: contextual.reason };
  }

  const architectural = validateArchitectural(message);
  steps.push({ name: 'Architectural', result: architectural });
  if (architectural.status === 'BLOCK') {
    return { passed: false, steps, blockReason: architectural.reason };
  }

  return {
    passed: true,
    steps,
    processedMessage: wrapUntrusted(message),
  };
}
