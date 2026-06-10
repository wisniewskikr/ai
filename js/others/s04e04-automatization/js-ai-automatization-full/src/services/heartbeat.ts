export async function ping(url: string): Promise<void> {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(10_000),
  });

  if (!response.ok) {
    throw new Error(`Heartbeat failed: HTTP ${response.status} from ${url}`);
  }
}
