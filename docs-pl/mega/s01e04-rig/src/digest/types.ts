// Plan morning-digest § 1. The contract every part of § 2 starts against.

export type RunStatus = 'ok' | 'retry' | 'fail';

// One line of runs/<night>.jsonl.
export type RunLine = {
  at: string;
  job: string;
  status: RunStatus;
  owner: string | null;
  error?: string;
};

// One row per job. Times keep the offset from the log.
export type DigestRow = {
  job: string;
  owner: string | null;
  runs: number;
  retries: number;
  lastStatus: RunStatus;
  lastError: string | null;
  firstAt: string;
  lastAt: string;
};

// A night with no file is `null`; an empty file is `{ rows: [], badLines: 0 }`.
export type Night = {
  night: string;
  rows: DigestRow[];
  badLines: number;
};

export type ReadNight = (runsDir: string, night: string) => Night | null;
