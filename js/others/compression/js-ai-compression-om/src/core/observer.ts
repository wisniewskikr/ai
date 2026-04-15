import { MemoryState, addObservations } from './memory';
import { logger } from '../utils/logger';

// The Observer is deterministic — no API call needed.
// The biography lines ARE the observations. We copy them directly.
// The LLM is reserved for the Reflector, which needs actual understanding.
export function runObserver(memory: MemoryState, recentLines: string[]): void {
  const observations = recentLines.map(l => l.trim());
  addObservations(memory, observations);
  logger.info(`Observer: added ${observations.length} observations. Active total: ${memory.active.length}`);
  logger.debug(`Observations added:\n${observations.join('\n')}`);
}
