import * as lockfile from 'proper-lockfile';
import * as fs from 'fs';
import config from '../../config.json';

function ensureLockFile(): void {
  if (!fs.existsSync(config.lockFilePath)) {
    fs.writeFileSync(config.lockFilePath, '');
  }
}

// Returns a release function. Throws if another instance holds the lock.
export async function acquireLock(): Promise<() => Promise<void>> {
  ensureLockFile();

  try {
    const release = await lockfile.lock(config.lockFilePath, {
      stale: config.lockTtlMinutes * 60 * 1000,
      retries: 0,
    });
    return release;
  } catch (err: any) {
    if (err.code === 'ELOCKED') {
      throw new Error('Lock file exists — another instance is already running');
    }
    throw err;
  }
}
