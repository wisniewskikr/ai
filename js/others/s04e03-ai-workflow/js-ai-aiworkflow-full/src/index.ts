import "dotenv/config";
import fs from "fs";
import chalk from "chalk";
import ora from "ora";
import { config } from "./config.js";
import { fetchArticles } from "./services/news-fetcher.js";
import { mockArticles } from "./utils/mock-articles.js";
import { callLLM, runCanaryCheck, breaker } from "./services/llm-client.js";
import { getBreakerState } from "./services/circuit-breaker.js";
import { pushToDLQ, getDLQPending, getAllDLQPending, markDLQItem, getDLQSize } from "./services/dlq.js";
import {
  log,
  createRunStats,
  logPipelineStats,
  logQualityCheck,
} from "./services/monitor.js";
import {
  getCliOptions,
  printHeader,
  printRunHeader,
  printArticleResult,
  printRunSummary,
} from "./utils/cli.js";
import { setSimMode, getSimMode } from "./utils/simulate.js";
import type { Article } from "./services/news-fetcher.js";

if (!process.env.OPENROUTER_API_KEY) {
  console.error(chalk.red("Error: OPENROUTER_API_KEY not set in .env"));
  process.exit(1);
}

fs.mkdirSync("workspace/articles", { recursive: true });

const cliOpts = await getCliOptions();

// Activate simulation mode before any runs
if (cliOpts.simMode !== "none") {
  setSimMode(cliOpts.simMode);
  console.log(chalk.yellow(`\nSimulation mode: ${cliOpts.simMode.toUpperCase()}\n`));
}

if (!cliOpts.simMode) {
  // Only print header for normal runs (menu already printed it for interactive)
  printHeader();
}

console.log(chalk.gray("Press Ctrl+C at any time to stop gracefully.\n"));

let isShuttingDown = false;

function onShutdown() {
  isShuttingDown = true;
  log.info("Shutdown signal received — finishing current article...");
  console.log(chalk.yellow("\nShutdown signal received — finishing current article..."));
}

process.on("SIGINT", onShutdown);
process.on("SIGTERM", onShutdown);

// ─── Option 2: Recover from DLQ ───────────────────────────────────────────
if (cliOpts.reprocessDlq) {
  const items = getAllDLQPending();
  if (items.length === 0) {
    console.log(chalk.green("DLQ is empty — nothing to reprocess."));
    process.exit(0);
  }

  console.log(chalk.bold(`Reprocessing ${items.length} pending DLQ items...\n`));

  for (const item of items) {
    const payload = JSON.parse(item.payload) as Article;
    const spinner = ora(`  [DLQ] "${payload.title}"`).start();

    try {
      const result = await callLLM(`Title: ${payload.title}\n\n${payload.text}`);
      const parsed = JSON.parse(result.content) as { summary?: string; topics?: string[] };

      const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
      const outputPath = `workspace/articles/${timestamp}-${payload.id}.json`;
      fs.writeFileSync(
        outputPath,
        JSON.stringify(
          {
            id: payload.id,
            fetchedAt: new Date().toISOString(),
            title: payload.title,
            text: payload.text,
            summary: parsed.summary ?? "",
            topics: parsed.topics ?? [],
          },
          null,
          2
        )
      );

      markDLQItem(item.id, "reprocessed");
      spinner.succeed(chalk.green(`  [DLQ] Reprocessed: "${payload.title}"`));
      log.info({ layer: "pipeline", dlq: "reprocessed", id: payload.id }, "DLQ item reprocessed");
    } catch (err) {
      markDLQItem(item.id, "manual_review");
      spinner.fail(chalk.red(`  [DLQ] Failed — needs manual review: "${payload.title}"`));
      log.warn({ layer: "pipeline", dlq: "manual_review", id: payload.id }, "DLQ item needs manual review");
    }
  }

  console.log(chalk.green("\nDLQ reprocessing complete."));
  process.exit(0);
}

// ─── Main workflow loop ────────────────────────────────────────────────────

let runNumber = 1;
let lastRunHadErrors = false;

while (!isShuttingDown) {
  printRunHeader(runNumber);
  const stats = createRunStats();
  let canaryPassed = true;

  // Canary check — every 10 runs or after an error (never in dry-run)
  const shouldRunCanary = !cliOpts.dryRun && (runNumber % 10 === 1 || lastRunHadErrors || getSimMode() === "canary");
  if (shouldRunCanary) {
    const spinner = ora("Running canary health check...").start();
    canaryPassed = await runCanaryCheck();
    if (canaryPassed) {
      spinner.succeed(chalk.green("Canary check passed"));
    } else {
      spinner.fail(chalk.red("Canary failed — output drift detected!"));
      logQualityCheck(stats, false);
      logPipelineStats(stats);
      printRunSummary(runNumber, stats, false, getDLQSize(), getBreakerState(breaker));
      lastRunHadErrors = true;
      break; // Stop loop on canary failure — operator should investigate
    }
  }

  // Reprocess pending DLQ items at the start of each run (if breaker is closed)
  const breakerState = getBreakerState(breaker);
  if (breakerState === "closed" && getSimMode() === "none") {
    const dlqItems = getDLQPending(config.dlq.reprocessBatchSize);
    for (const item of dlqItems) {
      if (isShuttingDown) break;
      const payload = JSON.parse(item.payload) as Article;

      // Skip if already processed (deduplication)
      const alreadyDone = fs
        .readdirSync("workspace/articles")
        .some((f) => f.endsWith(`-${payload.id}.json`));
      if (alreadyDone) {
        markDLQItem(item.id, "reprocessed");
        continue;
      }

      const spinner = ora(`  [DLQ] Reprocessing: "${payload.title}"`).start();
      try {
        const result = await callLLM(`Title: ${payload.title}\n\n${payload.text}`);
        const parsed = JSON.parse(result.content) as { summary?: string; topics?: string[] };
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
        const outputPath = `workspace/articles/${timestamp}-${payload.id}.json`;
        fs.writeFileSync(
          outputPath,
          JSON.stringify(
            {
              id: payload.id,
              fetchedAt: new Date().toISOString(),
              title: payload.title,
              text: payload.text,
              summary: parsed.summary ?? "",
              topics: parsed.topics ?? [],
            },
            null,
            2
          )
        );
        markDLQItem(item.id, "reprocessed");
        spinner.succeed(chalk.green(`  [DLQ] Reprocessed: "${payload.title}"`));
        log.info({ layer: "pipeline", dlq: "reprocessed", id: payload.id }, "DLQ item reprocessed");
      } catch {
        markDLQItem(item.id, "manual_review");
        spinner.fail(chalk.red(`  [DLQ] Manual review needed: "${payload.title}"`));
        log.warn({ layer: "pipeline", dlq: "manual_review", id: payload.id }, "DLQ item needs manual review");
      }
    }
  }

  // Backpressure: skip new articles if DLQ is too large
  if (getDLQSize() > config.dlq.maxSize) {
    log.warn({ layer: "pipeline", dlqSize: getDLQSize() }, "DLQ backpressure — skipping new articles");
    console.log(chalk.yellow(`  DLQ backpressure (${getDLQSize()} pending) — skipping new articles this run.`));
  } else {
    // Fetch articles — use mock data in simulation mode (no real HN fetch)
    const fetchSpinner = ora("Fetching top stories from Hacker News...").start();
    const fetchStart = Date.now();
    const articles =
      getSimMode() !== "none"
        ? mockArticles.slice(0, cliOpts.articles)
        : await fetchArticles(cliOpts.articles);
    fetchSpinner.succeed(`Fetching top stories... done (${Date.now() - fetchStart}ms)`);
    console.log();

    for (let i = 0; i < articles.length; i++) {
      if (isShuttingDown) break;

      const article = articles[i]!;

      // Deduplication: skip articles already saved in a previous run
      const alreadyProcessed = fs
        .readdirSync("workspace/articles")
        .some((f) => f.endsWith(`-${article.id}.json`));

      if (alreadyProcessed && getSimMode() === "none") {
        log.info({ layer: "pipeline", id: article.id }, "skipped — already processed");
        console.log(
          `  [${i + 1}/${articles.length}] ${chalk.gray(`Skipping: "${article.title}" (already processed)`)}`
        );
        continue;
      }

      console.log(`  [${i + 1}/${articles.length}] Processing: "${chalk.cyan(article.title)}"`);

      if (cliOpts.dryRun) {
        console.log(chalk.gray("        (dry-run — LLM call skipped)\n"));
        continue;
      }

      // Circuit breaker check: if open, send directly to DLQ
      if (getBreakerState(breaker) === "open") {
        console.log(chalk.red("        Circuit breaker OPEN — sending to DLQ"));
        pushToDLQ(article.id, article, "breaker_open", 0);
        stats.failed++;
        continue;
      }

      const spinner = ora("        Calling LLM...").start();

      try {
        const result = await callLLM(
          `Title: ${article.title}\n\n${article.text}`,
          (attempt, reason) => {
            spinner.text = chalk.yellow(
              `        Retry ${attempt}/${config.retry.attempts} — ${reason}...`
            );
            stats.retries++;
          }
        );

        stats.latencies.push(result.latencyMs);

        // Parse output
        let parsed: { summary?: string; topics?: string[] } = {};
        try {
          parsed = JSON.parse(result.content);
        } catch {
          // fallback handled below
        }

        // Layer 3: Schema validation
        if (!parsed.summary || !Array.isArray(parsed.topics)) {
          stats.schemaErrors++;
          log.warn({ layer: "quality", check: "schema", content: result.content }, "schema error");
          parsed.summary = parsed.summary ?? result.content.slice(0, 200);
          parsed.topics = parsed.topics ?? [];
        }

        // Layer 3: Length check
        const summaryLen = parsed.summary?.length ?? 0;
        if (summaryLen < config.monitor.minSummaryLength) {
          stats.shortOutputs++;
          log.warn({ layer: "quality", check: "length", chars: summaryLen }, "output too short");
        }

        // Save result
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
        const outputPath = `workspace/articles/${timestamp}-${article.id}.json`;
        const output = {
          id: article.id,
          fetchedAt: new Date().toISOString(),
          title: article.title,
          text: article.text,
          summary: parsed.summary ?? "",
          topics: parsed.topics ?? [],
        };
        fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
        stats.processed++;

        spinner.succeed(chalk.green(`        Done (${result.latencyMs}ms)`));
        printArticleResult(
          i + 1,
          article.title,
          parsed.summary ?? "",
          parsed.topics ?? [],
          outputPath
        );
      } catch (err) {
        stats.failed++;
        const errMsg = String(err);
        const errorType = errMsg.toLowerCase().includes("open") ? "breaker_open" : "retry_exhausted";
        spinner.fail(chalk.red(`        Failed: ${errMsg}`));
        log.error({ layer: "pipeline", id: article.id, error: errMsg }, "article failed");
        pushToDLQ(article.id, article, errorType, config.retry.attempts);
      }
    }
  }

  lastRunHadErrors = stats.failed > 0 || stats.schemaErrors > 0;

  logPipelineStats(stats);
  logQualityCheck(stats, canaryPassed);
  printRunSummary(runNumber, stats, canaryPassed, getDLQSize(), getBreakerState(breaker));

  if (cliOpts.once || isShuttingDown) break;

  const nextIn = cliOpts.interval / 1000;
  console.log(chalk.gray(`Next run in ${nextIn}s. Press Ctrl+C to stop.\n`));

  const end = Date.now() + cliOpts.interval;
  while (Date.now() < end && !isShuttingDown) {
    await new Promise((r) => setTimeout(r, 1000));
  }

  runNumber++;
}

log.info("Shutdown complete.");
await new Promise((r) => setTimeout(r, 500));
console.log(chalk.green("\nShutdown complete."));
process.exit(0);
