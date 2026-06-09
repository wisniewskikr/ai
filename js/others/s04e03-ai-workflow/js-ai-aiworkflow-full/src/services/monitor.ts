import pino from "pino";
import fs from "fs";

if (!fs.existsSync("logs")) {
  fs.mkdirSync("logs");
}

export const log = pino({
  transport: {
    targets: [
      {
        // File: full info logs for debugging and metrics
        target: "pino-pretty",
        level: "info",
        options: {
          colorize: false,
          translateTime: "yyyy-mm-dd HH:MM:ss",
          ignore: "pid,hostname",
          destination: "logs/app.log",
          append: true,
        },
      },
    ],
  },
});

export interface RunStats {
  processed: number;
  retries: number;
  failed: number;
  latencies: number[];
  schemaErrors: number;
  shortOutputs: number;
}

export function createRunStats(): RunStats {
  return {
    processed: 0,
    retries: 0,
    failed: 0,
    latencies: [],
    schemaErrors: 0,
    shortOutputs: 0,
  };
}

export function logInfraCall(latencyMs: number, tokens: { prompt?: number; completion?: number; total?: number }) {
  log.info({ layer: "infra", latencyMs, tokens }, "llm call");
}

export function logPipelineStats(stats: RunStats) {
  const retryRate =
    stats.processed > 0
      ? `${((stats.retries / stats.processed) * 100).toFixed(1)}%`
      : "0%";

  log.info(
    {
      layer: "pipeline",
      processed: stats.processed,
      retries: stats.retries,
      failed: stats.failed,
      retryRate,
    },
    "pipeline stats"
  );
}

export function logQualityCheck(stats: RunStats, canaryPassed: boolean) {
  const schemaStatus = stats.schemaErrors === 0 ? "ok" : `${stats.schemaErrors} errors`;
  const lengthStatus = stats.shortOutputs === 0 ? "ok" : `${stats.shortOutputs} short`;
  const canaryStatus = canaryPassed ? "ok" : "FAIL";

  log.info(
    { layer: "quality", schema: schemaStatus, length: lengthStatus, canary: canaryStatus },
    "quality check"
  );

  if (!canaryPassed) {
    log.error({ layer: "quality", check: "canary" }, "canary failed — check model!");
  }
}
