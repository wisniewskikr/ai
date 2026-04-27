import { logger } from '../utils/logger.js';
import type { StandardResult } from './standard.js';
import type { BatchResult } from './batch.js';

export function compareResults(standard: StandardResult, batch: BatchResult) {
  const batchMap = new Map(batch.results.map((r) => [r.id, r.sentiment]));

  let matches = 0;
  for (const sr of standard.results) {
    if (batchMap.get(sr.id) === sr.sentiment) matches++;
  }

  const savings = standard.totalCost - batch.totalCost;
  const savingsPct = standard.totalCost > 0
    ? ((savings / standard.totalCost) * 100).toFixed(0)
    : '0';

  const lines = [
    '',
    '=== Summary ===',
    `Standard API:     ${(standard.durationMs / 1000).toFixed(1)}s  |  cost: $${standard.totalCost.toFixed(6)}`,
    `Batch API:        ${(batch.durationMs / 1000).toFixed(1)}s  |  cost: $${batch.totalCost.toFixed(6)}`,
    `Savings:          $${savings.toFixed(6)}  (${savingsPct}%)`,
    `Matching results: ${matches}/${standard.results.length}`,
  ];

  const summary = lines.join('\n');
  logger.info(summary);
  console.log(summary);
}
