interface CacheEntry {
  result: unknown;
  timestamp: number;
}

const store = new Map<string, CacheEntry>();

export function getFromCache<T>(key: string): T | null {
  const entry = store.get(key);
  if (!entry) return null;
  return entry.result as T;
}

export function setInCache(key: string, result: unknown): void {
  store.set(key, { result, timestamp: Date.now() });
}

export function hasCached(key: string): boolean {
  return store.has(key);
}
