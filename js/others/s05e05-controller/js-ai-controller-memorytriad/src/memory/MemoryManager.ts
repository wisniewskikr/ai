import { DatabaseSync } from 'node:sqlite';
import { ShortTermMemory } from './shortTerm';
import { LongTermMemory } from './longTerm';
import { EpisodicMemory } from './episodic';
import config from '../../config.json';

export class MemoryManager {
  public readonly shortTerm: ShortTermMemory;
  public readonly longTerm: LongTermMemory;
  public readonly episodic: EpisodicMemory;

  constructor(db: DatabaseSync) {
    this.shortTerm = new ShortTermMemory(config.maxShortTermMessages);
    this.longTerm = new LongTermMemory(db);
    this.episodic = new EpisodicMemory(db, config.maxEpisodicSummaryEntries);
  }
}
