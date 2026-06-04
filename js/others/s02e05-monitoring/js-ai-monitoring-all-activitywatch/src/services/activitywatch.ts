type Bucket = {
  id: string;
  last_updated: string;
  [key: string]: unknown;
};

export type AnyEvent<T> = {
  id: number;
  timestamp: string;
  duration: number;
  data: T;
};

export async function discoverBuckets(
  baseUrl: string
): Promise<{ windowBucket: string; afkBucket: string }> {
  let response: Response;
  try {
    response = await fetch(`${baseUrl}/buckets/`);
  } catch {
    throw new Error(
      "ActivityWatch unavailable — is aw-server running on port 5600?"
    );
  }

  if (!response.ok) {
    throw new Error(`ActivityWatch responded with HTTP ${response.status}`);
  }

  const bucketsMap: Record<string, Bucket> = await response.json();
  const buckets = Object.values(bucketsMap);

  const windowBuckets = buckets.filter((b) =>
    b.id.toLowerCase().startsWith("aw-watcher-window_")
  );
  const afkBuckets = buckets.filter((b) =>
    b.id.toLowerCase().startsWith("aw-watcher-afk_")
  );

  if (windowBuckets.length === 0) {
    throw new Error(
      "Bucket aw-watcher-window_* not found — is aw-watcher-window running?"
    );
  }
  if (afkBuckets.length === 0) {
    throw new Error(
      "Bucket aw-watcher-afk_* not found — is aw-watcher-afk running?"
    );
  }

  const pickLatest = (arr: Bucket[]) =>
    arr.sort((a, b) => b.last_updated.localeCompare(a.last_updated))[0].id;

  return {
    windowBucket: pickLatest(windowBuckets),
    afkBucket: pickLatest(afkBuckets),
  };
}

export async function getLatestEvent<T>(
  baseUrl: string,
  bucketId: string
): Promise<AnyEvent<T> | null> {
  try {
    const response = await fetch(
      `${baseUrl}/buckets/${bucketId}/events?limit=1`
    );
    if (!response.ok) return null;
    const events: AnyEvent<T>[] = await response.json();
    return events[0] ?? null;
  } catch {
    return null;
  }
}
