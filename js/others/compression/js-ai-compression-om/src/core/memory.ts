export interface MemoryState {
  sealed: string[];         // observations already processed by the Reflector (immutable)
  active: string[];         // observations not yet reflected (still accumulating)
  generation: number;       // how many times the Reflector has run this session
  compressedMemory: string | null; // the current compressed prose paragraph
  compressedTokens: number; // estimated tokens in the compressed memory block
}

export function createMemory(): MemoryState {
  return {
    sealed: [],
    active: [],
    generation: 0,
    compressedMemory: null,
    compressedTokens: 0,
  };
}

export function addObservations(memory: MemoryState, lines: string[]): void {
  memory.active.push(...lines);
}

export function hasActiveObservations(memory: MemoryState): boolean {
  return memory.active.length > 0;
}

// Called by the Reflector after it produces the compressed prose.
// Moves active observations to sealed, increments generation, stores prose.
export function sealAndCompress(memory: MemoryState, prose: string): void {
  memory.sealed.push(...memory.active);
  memory.active = [];
  memory.generation++;
  memory.compressedMemory = prose;
  memory.compressedTokens = Math.ceil(prose.length / 4);
}
