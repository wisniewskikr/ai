import { Command } from "commander";
import { select } from "@inquirer/prompts";
import chalk from "chalk";
import { config } from "../config.js";
import type { RunStats } from "../services/monitor.js";
import type { SimMode } from "./simulate.js";

export interface CliOptions {
  articles: number;
  interval: number;
  once: boolean;
  dryRun: boolean;
  reprocessDlq: boolean;
  simMode: SimMode;
}

function parseCliFlags(): { opts: Record<string, any>; skipMenu: boolean } {
  const program = new Command();
  program
    .name("ai-workflow")
    .description("AI Workflow — Silent Degradation Demo")
    .option("--articles <n>", "articles per run", String(config.workflow.articles))
    .option("--interval <ms>", "ms between runs", String(config.workflow.intervalMs))
    .option("--once", "run once and exit")
    .option("--dry-run", "fetch articles, skip LLM calls")
    .option("--reprocess-dlq", "recover from DLQ and exit")
    .allowUnknownOption(false)
    .parse();

  const opts = program.opts();
  // If any flag was explicitly passed, skip the interactive menu
  const skipMenu =
    !!opts.once ||
    !!opts.dryRun ||
    !!opts.reprocessDlq ||
    opts.articles !== String(config.workflow.articles) ||
    opts.interval !== String(config.workflow.intervalMs);

  return { opts, skipMenu };
}

export async function getCliOptions(): Promise<CliOptions> {
  const { opts, skipMenu } = parseCliFlags();

  if (!skipMenu) {
    printHeader();

    const action = await select({
      message: "What do you want to do?",
      choices: [
        { name: "1) Run normally", value: "run" },
        { name: "2) Recover articles from DLQ", value: "dlq" },
        { name: "3) Simulate retry failure", value: "retry" },
        { name: "4) Simulate monitoring failure (canary check)", value: "canary" },
        { name: "5) Simulate Circuit Breaker failure", value: "breaker" },
        { name: "0) Exit", value: "exit" },
      ],
    });

    if (action === "exit") {
      process.exit(0);
    }

    return {
      articles: config.workflow.articles,
      interval: config.workflow.intervalMs,
      once: action !== "run",
      dryRun: false,
      reprocessDlq: action === "dlq",
      simMode: (["retry", "canary", "breaker"].includes(action) ? action : "none") as SimMode,
    };
  }

  return {
    articles: parseInt(opts.articles, 10),
    interval: parseInt(opts.interval, 10),
    once: !!opts.once,
    dryRun: !!opts.dryRun,
    reprocessDlq: !!opts.reprocessDlq,
    simMode: "none",
  };
}

export function printHeader() {
  console.log(chalk.bold("\nAI Workflow — Silent Degradation Demo"));
  console.log(chalk.bold("======================================\n"));
}

export function printRunHeader(runNumber: number) {
  console.log(chalk.gray("──────────────────────────────────────────"));
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
  const COL2 = W - COL1 - 3;

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

export function printRunSummary(
  runNumber: number,
  stats: RunStats,
  canaryPassed: boolean,
  dlqSize: number,
  breakerState: string
) {
  const avgLatency =
    stats.latencies.length > 0
      ? Math.round(stats.latencies.reduce((a, b) => a + b, 0) / stats.latencies.length)
      : 0;

  const errorRate =
    stats.processed + stats.failed > 0
      ? `${((stats.failed / (stats.processed + stats.failed)) * 100).toFixed(0)}%`
      : "0%";
  const retryRate =
    stats.processed > 0 ? `${((stats.retries / stats.processed) * 100).toFixed(0)}%` : "0%";

  const schemaStr =
    stats.schemaErrors === 0 ? chalk.green("ok") : chalk.red(`${stats.schemaErrors} err`);
  const lengthStr =
    stats.shortOutputs === 0 ? chalk.green("ok") : chalk.yellow(`${stats.shortOutputs} short`);
  const canaryStr = canaryPassed ? chalk.green("ok") : chalk.red("FAIL");
  const breakerStr =
    breakerState === "closed"
      ? chalk.green("closed")
      : breakerState === "open"
        ? chalk.red("open")
        : chalk.yellow("half-open");

  console.log(chalk.gray("──────────────────────────────────────────"));
  console.log(chalk.bold(`Run #${runNumber} Summary`));
  console.log(`  Processed  : ${chalk.green(stats.processed)} articles`);
  console.log(`  Retries    : ${stats.retries > 0 ? chalk.yellow(stats.retries) : stats.retries}`);
  console.log(`  Failed     : ${stats.failed > 0 ? chalk.red(stats.failed) : stats.failed}`);
  console.log(`  DLQ size   : ${dlqSize > 0 ? chalk.yellow(dlqSize) : dlqSize} pending`);
  console.log(`  Avg latency: ${avgLatency}ms\n`);
  console.log("  Monitoring");
  console.log(`  Layer 1 Infra    : error_rate=${errorRate}  avg_latency=${avgLatency}ms  breaker=${breakerStr}`);
  console.log(`  Layer 2 Pipeline : retry_rate=${retryRate}  failed=${stats.failed}  dlq=${dlqSize}`);
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
