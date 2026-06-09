import "dotenv/config";
import fs from "fs";
import chalk from "chalk";
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
  printRunTable,
  type ArticleResult,
} from "./utils/cli.js";
import { setSimMode, getSimMode } from "./utils/simulate.js";
import type { Article } from "./services/news-fetcher.js";

if (!process.env.OPENROUTER_API_KEY) {
  console.error(chalk.red("Error: OPENROUTER_API_KEY not set in .env"));
  process.exit(1);
}

fs.mkdirSync("workspace/articles", { recursive: true });

let isShuttingDown = false;

function onShutdown() {
  isShuttingDown = true;
  log.info("Shutdown signal received — finishing current article...");
}

process.on("SIGINT", onShutdown);
process.on("SIGTERM", onShutdown);

// ─── Main menu loop ────────────────────────────────────────────────────────
while (true) {
  isShuttingDown = false;
  setSimMode("none");

  const cliOpts = await getCliOptions();

  // Activate simulation mode before any runs
  if (cliOpts.simMode !== "none") {
    setSimMode(cliOpts.simMode);
  }

  // ─── Option 2: Recover from DLQ ─────────────────────────────────────────
  if (cliOpts.reprocessDlq) {
  const items = getAllDLQPending();
  if (items.length === 0) {
    continue;
  }

  console.log("\nIn progress ...\n");

  for (const item of items) {
    const payload = JSON.parse(item.payload) as Article;

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
      log.info({ layer: "pipeline", dlq: "reprocessed", id: payload.id }, "DLQ item reprocessed");
    } catch (err) {
      markDLQItem(item.id, "manual_review");
      log.warn({ layer: "pipeline", dlq: "manual_review", id: payload.id }, "DLQ item needs manual review");
    }
  }

  continue;
  }

  // ─── Main workflow loop ──────────────────────────────────────────────────
  let runNumber = 1;
  let lastRunHadErrors = false;

  while (!isShuttingDown) {
    console.log("\nIn progress ...\n");
    const stats = createRunStats();
    const articleResults: ArticleResult[] = [];
    let canaryPassed = true;

    // Canary check — every 10 runs or after an error (never in dry-run)
    const shouldRunCanary = !cliOpts.dryRun && (runNumber % 10 === 1 || lastRunHadErrors || getSimMode() === "canary");
    if (shouldRunCanary) {
      canaryPassed = await runCanaryCheck();
      if (!canaryPassed) {
        logQualityCheck(stats, false);
        logPipelineStats(stats);
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
          log.info({ layer: "pipeline", dlq: "reprocessed", id: payload.id }, "DLQ item reprocessed");
        } catch {
          markDLQItem(item.id, "manual_review");
          log.warn({ layer: "pipeline", dlq: "manual_review", id: payload.id }, "DLQ item needs manual review");
        }
      }
    }

    // Backpressure: skip new articles if DLQ is too large
    if (getDLQSize() > config.dlq.maxSize) {
      log.warn({ layer: "pipeline", dlqSize: getDLQSize() }, "DLQ backpressure — skipping new articles");
    } else {
      // Fetch articles — use mock data in simulation mode (no real HN fetch)
      const articles =
        getSimMode() !== "none"
          ? mockArticles.slice(0, cliOpts.articles)
          : await fetchArticles(cliOpts.articles);

      for (let i = 0; i < articles.length; i++) {
        if (isShuttingDown) break;

        const article = articles[i]!;

        // Deduplication: skip articles already saved in a previous run
        const alreadyProcessed = fs
          .readdirSync("workspace/articles")
          .some((f) => f.endsWith(`-${article.id}.json`));

        if (alreadyProcessed && getSimMode() === "none") {
          log.info({ layer: "pipeline", id: article.id }, "skipped — already processed");
          articleResults.push({ title: article.title, retries: 0, breakerOpen: false, schemaError: false, lengthError: false, status: "skipped" });
          continue;
        }

        if (cliOpts.dryRun) {
          articleResults.push({ title: article.title, retries: 0, breakerOpen: false, schemaError: false, lengthError: false, status: "dry-run" });
          continue;
        }

        // Circuit breaker check: if open, send directly to DLQ
        if (getBreakerState(breaker) === "open") {
          pushToDLQ(article.id, article, "breaker_open", 0);
          stats.failed++;
          articleResults.push({ title: article.title, retries: 0, breakerOpen: true, schemaError: false, lengthError: false, status: "dlq" });
          continue;
        }

        let articleRetries = 0;
        let articleSchemaError = false;
        let articleLengthError = false;

        try {
          const result = await callLLM(
            `Title: ${article.title}\n\n${article.text}`,
            (_attempt, _reason) => {
              stats.retries++;
              articleRetries++;
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
            articleSchemaError = true;
            log.warn({ layer: "quality", check: "schema", content: result.content }, "schema error");
            parsed.summary = parsed.summary ?? result.content.slice(0, 200);
            parsed.topics = parsed.topics ?? [];
          }

          // Layer 3: Length check
          const summaryLen = parsed.summary?.length ?? 0;
          if (summaryLen < config.monitor.minSummaryLength) {
            stats.shortOutputs++;
            articleLengthError = true;
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

          articleResults.push({ title: article.title, retries: articleRetries, breakerOpen: false, schemaError: articleSchemaError, lengthError: articleLengthError, status: "saved" });
        } catch (err) {
          stats.failed++;
          const errMsg = String(err);
          const errorType = errMsg.toLowerCase().includes("open") ? "breaker_open" : "retry_exhausted";
          log.error({ layer: "pipeline", id: article.id, error: errMsg }, "article failed");
          pushToDLQ(article.id, article, errorType, config.retry.attempts);
          articleResults.push({ title: article.title, retries: articleRetries, breakerOpen: errorType === "breaker_open", schemaError: false, lengthError: false, status: "dlq" });
        }
      }
    }

    lastRunHadErrors = stats.failed > 0 || stats.schemaErrors > 0;

    logPipelineStats(stats);
    logQualityCheck(stats, canaryPassed);
    printRunTable(articleResults);

    if (cliOpts.once || isShuttingDown) break;

    const end = Date.now() + cliOpts.interval;
    while (Date.now() < end && !isShuttingDown) {
      await new Promise((r) => setTimeout(r, 1000));
    }

    runNumber++;
  }
}
