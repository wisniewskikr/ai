import { MemoryState } from '../core/memory';

export interface UsageStats {
  estimated: number;
  actual: number;
  calibration: number;
}

export interface ReflectorStats {
  beforeMessages: number;
  beforeTokens: number;
  afterTokens: number;
}

export function printStartBanner(lineCount: number): void {
  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║   ObservationalMemory Demo  —  powered by OpenRouter ║');
  console.log(`║   Loading ${lineCount} facts about the user...                 ║`);
  console.log('╚══════════════════════════════════════════════════════╝');
  console.log('');
}

export function printObserverBanner(): void {
  console.log('');
  console.log('╔══════════════════════════════════════════╗');
  console.log('║  🔍  OBSERVER  —  extracting facts...   ║');
  console.log('╚══════════════════════════════════════════╝');
}

export function printReflectorBanner(stats: ReflectorStats): void {
  const ratio = stats.beforeTokens > 0
    ? (stats.beforeTokens / stats.afterTokens).toFixed(1)
    : '0';
  const saved = stats.beforeTokens > 0
    ? Math.round((1 - stats.afterTokens / stats.beforeTokens) * 100)
    : 0;

  // Pad lines to fixed width so the box stays aligned
  const line = (text: string, width = 50) => {
    const padded = text.padEnd(width);
    return `║  ${padded}  ║`;
  };

  console.log('');
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║  🗜  REFLECTOR  —  compressing memory...         ║');
  console.log('║                                                  ║');
  console.log(line(`Before:  ${stats.beforeMessages} messages  ~${stats.beforeTokens} tokens`));
  console.log(line(`After:    1 message    ~${stats.afterTokens} tokens`));
  console.log(line(`Ratio:   ${ratio}x compression  |  saved ${saved}%`));
  console.log('║                                                  ║');
  console.log('║  History wiped. Compressed context only.         ║');
  console.log('╚══════════════════════════════════════════════════╝');
}

export function printSummaryBanner(): void {
  console.log('');
  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║  📋  FINAL SUMMARY  —  What survived compression?   ║');
  console.log('╚══════════════════════════════════════════════════════╝');
  console.log('');
}

export function printUserLine(msgNum: number, line: string): void {
  console.log('');
  console.log(`[msg ${msgNum}] USER: ${line}`);
}

export function printMemoryStatus(memory: MemoryState, usage: UsageStats): void {
  const obs = memory.active.length > 0;
  const tokens = memory.compressedTokens;
  const gen = memory.generation;
  const sealed = memory.sealed.length;
  const active = memory.active.length;

  console.log(`memory: observations=${obs} tokens=${tokens} generation=${gen} gen ${gen} (reflector run) [${sealed} sealed, ${active} active]`);
  console.log(`usage:  estimated=${usage.estimated} actual=${usage.actual} calibration=${usage.calibration.toFixed(2)}`);
}
