import { validateStructural } from './validators/1-structural';
import { validatePattern } from './validators/2-pattern';
import { validateSemantic } from './validators/3-semantic';
import { validateContextual } from './validators/4-contextual';
import { validateSanitization } from './validators/5-sanitization';
import { PipelineResult, LayerResult, ValidationContext, ValidatorStatus } from './types';
import { logger } from './utils/logger';
import config from './config';

function addLayer(layers: LayerResult[], num: number, name: string, status: ValidatorStatus, reason?: string): void {
  layers.push({ num, name, status, reason });
  logger.info(`Layer ${num} (${name}): ${status}${reason ? ` — ${reason}` : ''}`);
}

export async function runPipeline(response: string, context: ValidationContext): Promise<PipelineResult> {
  const layers: LayerResult[] = [];

  // Layer 1: Structural
  const l1 = validateStructural(response);
  addLayer(layers, 1, 'Structural', l1.status, l1.reason);
  if (l1.status === 'BLOCK') {
    return { blocked: true, sanitized: false, blockReason: l1.reason, layers };
  }

  // Layer 2: Pattern
  const l2 = validatePattern(response);
  addLayer(layers, 2, 'Pattern', l2.status, l2.reason);
  if (l2.status === 'BLOCK') {
    return { blocked: true, sanitized: false, blockReason: l2.reason, layers };
  }

  // Layer 3: Semantic (LLM-as-judge) — only if layers 1-2 did not block
  const l3 = await validateSemantic(response);
  addLayer(layers, 3, 'Semantic', l3.status, l3.reason);
  if (l3.status === 'BLOCK') {
    return { blocked: true, sanitized: false, blockReason: l3.reason, layers };
  }

  // Layer 4: Contextual
  const l4 = validateContextual(response, context);
  addLayer(layers, 4, 'Contextual', l4.status, l4.reason);
  if (l4.status === 'BLOCK') {
    return { blocked: true, sanitized: false, blockReason: l4.reason, layers };
  }

  // Layer 5: Sanitization — always runs, cleans before display
  const l5 = validateSanitization(response, config.allowedDomains);
  addLayer(layers, 5, 'Sanitization', l5.status, l5.reason);

  const displayResponse = l5.sanitizedText ?? response;

  if (l5.status === 'BLOCK') {
    // Dangerous content was stripped — response sanitized but not fully passed
    return { blocked: true, sanitized: true, displayResponse, blockReason: l5.reason, layers };
  }

  return {
    blocked: false,
    sanitized: displayResponse !== response,
    displayResponse,
    layers,
  };
}
