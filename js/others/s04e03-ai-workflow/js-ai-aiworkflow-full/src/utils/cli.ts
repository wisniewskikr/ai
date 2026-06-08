import { Command } from "commander";
import chalk from "chalk";
import { config } from "../config.js";
import type { RunStats } from "../services/monitor.js";

export interface CliOptions {
  articles: number;
  interval: number;
  once: boolean;
  dryRun: boolean;
}

export function parseCliOptions(): CliOptions {
  const program = new Command();

  program
    .name("ai-workflow")
    .description("AI Workflow — Silent Degradation Demo")
    .option("--articles <n>", "articles to process per run", String(config.workflow.articles))
    .option("--interval <ms>", "milliseconds between runs", String(config.workflow.intervalMs))
    .option("--once", "run once and exit")
    .option("--dry-run", "fetch articles, skip LLM calls")
    .helpOption("--help", "show help")
    .parse();

  const opts = program.opts();

  return {
    articles: parseInt(opts.articles, 10),
    interval: parseInt(opts.interval, 10),
    once: !!opts.once,
    dryRun: !!opts.dryRun,
  };
}

export function printHeader() {
  console.log(chalk.bold("\nAI Workflow — Silent Degradation Demo"));
  console.log(chalk.bold("======================================"));
  console.log(chalk.gray("Press Ctrl+C at any time to stop gracefully.\n"));
}

export function printRunHeader(runNumber: number) {
  const now = new Date().toISOString().replace("T", " ").slice(0, 19);
  console.log(chalk.bold(`Run #${runNumber} — ${now}\n`));
}

export function printArticleResult(
  index: number,
  title: string,
  summary: string,
  topics: string[],
  savedPath: string
) {
  const W = 55;
  const COL1 = 8;
  const COL2 = W - COL1 - 3; // 44

  const titleTrunc = `#${index} ${title}`.slice(0, W - 2);
  const topicsStr = topics.join(", ").slice(0, COL2);
  const savedTrunc = savedPath.slice(0, COL2);
  const summaryLines = wrapText(summary, COL2);

  console.log("┌" + "─".repeat(W) + "┐");
  console.log(`│ ${titleTrunc.padEnd(W - 1)}│`);
  console.log("├" + "─".repeat(COL1) + "┬" + "─".repeat(W - COL1 - 1) + "┤");

  summaryLines.forEach((line, i) => {
    const label = i === 0 ? " Summary " : "         ";
    console.log(`│${label}│ ${line.padEnd(COL2)}│`);
  });

  console.log("├" + "─".repeat(COL1) + "┼" + "─".repeat(W - COL1 - 1) + "┤");
  console.log(`│ Topics  │ ${topicsStr.padEnd(COL2)}│`);
  console.log("├" + "─".repeat(COL1) + "┼" + "─".repeat(W - COL1 - 1) + "┤");
  console.log(`│ Saved   │ ${savedTrunc.padEnd(COL2)}│`);
  console.log("└" + "─".repeat(COL1) + "┴" + "─".repeat(W - COL1 - 1) + "┘\n");
}

export function printRunSummary(runNumber: number, stats: RunStats, canaryPassed: boolean) {
  const avgLatency =
    stats.latencies.length > 0
      ? Math.round(stats.latencies.reduce((a, b) => a + b, 0) / stats.latencies.length)
      : 0;

  const errorRate =
    stats.processed > 0 ? `${((stats.failed / stats.processed) * 100).toFixed(0)}%` : "0%";
  const retryRate =
    stats.processed > 0 ? `${((stats.retries / stats.processed) * 100).toFixed(0)}%` : "0%";

  const schemaStr =
    stats.schemaErrors === 0 ? chalk.green("ok") : chalk.red(`${stats.schemaErrors} err`);
  const lengthStr =
    stats.shortOutputs === 0 ? chalk.green("ok") : chalk.yellow(`${stats.shortOutputs} short`);
  const canaryStr = canaryPassed ? chalk.green("ok") : chalk.red("FAIL");

  console.log(chalk.gray("──────────────────────────────────────────"));
  console.log(chalk.bold(`Run #${runNumber} Summary`));
  console.log(`  Processed  : ${chalk.green(stats.processed)} articles`);
  console.log(`  Retries    : ${stats.retries > 0 ? chalk.yellow(stats.retries) : stats.retries}`);
  console.log(`  Failed     : ${stats.failed > 0 ? chalk.red(stats.failed) : stats.failed}`);
  console.log(`  Avg latency: ${avgLatency}ms\n`);
  console.log("  Monitoring");
  console.log(`  Layer 1 Infra    : error_rate=${errorRate}  avg_latency=${avgLatency}ms`);
  console.log(`  Layer 2 Pipeline : retry_rate=${retryRate}  failed=${stats.failed}`);
  console.log(`  Layer 3 Quality  : schema=${schemaStr}  length=${lengthStr}  canary=${canaryStr}`);
  console.log(chalk.gray("──────────────────────────────────────────\n"));
}

function wrapText(text: string, width: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= width) {
      current = candidate;
    } else {
      if (current) lines.push(current);
      current = word.slice(0, width);
    }
  }
  if (current) lines.push(current);

  return lines.length > 0 ? lines : [""];
}
