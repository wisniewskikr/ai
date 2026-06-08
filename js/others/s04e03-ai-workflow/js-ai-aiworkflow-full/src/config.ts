import { z } from "zod";
import fs from "fs";

const ConfigSchema = z.object({
  model: z.string(),
  retry: z.object({
    attempts: z.number().min(1),
    minTimeoutMs: z.number().min(0),
    factor: z.number().min(1),
  }),
  circuitBreaker: z.object({
    failureThreshold: z.number().min(1).max(100),
    timeoutMs: z.number().min(1000),
    resetTimeoutMs: z.number().min(1000),
  }),
  monitor: z.object({
    minSummaryLength: z.number().min(1),
    schemaErrorRateAlertThreshold: z.number().min(0).max(1),
  }),
  dlq: z.object({
    reprocessBatchSize: z.number().min(1),
    maxSize: z.number().min(1),
  }),
  workflow: z.object({
    intervalMs: z.number().min(1000),
    articles: z.number().min(1),
  }),
});

export type Config = z.infer<typeof ConfigSchema>;

export const config = ConfigSchema.parse(
  JSON.parse(fs.readFileSync("config.json", "utf-8"))
);
