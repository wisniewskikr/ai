import "dotenv/config";
import fs from "fs";
import chalk from "chalk";
import ora from "ora";
import { config } from "./config.js";
import { fetchArticles } from "./services/news-fetcher.js";
import { callLLM, runCanaryCheck } from "./services/llm-client.js";
import {
  log,
  createRunStats,
  logPipelineStats,
  logQualityCheck,
} from "./services/monitor.js";
import {
  parseCliOptions,
  printHeader,
  printRunHeader,
  printArticleResult,
  printRunSummary,
} from "./utils/cli.js";

const cliOpts = parseCliOptions();

if (!process.env.OPENROUTER_API_KEY) {
  console.error(chalk.red("Error: OPENROUTER_API_KEY not set in .env"));
  process.exit(1);
}

fs.mkdirSync("workflow/articles", { recursive: true });

let isShuttingDown = false;

function onShutdown() {
  isShuttingDown = true;
  log.info("Shutdown signal received — finishing current article...");
  console.log(chalk.yellow("\nShutdown signal received — finishing current article..."));
}

process.on("SIGINT", onShutdown);
process.on("SIGTERM", onShutdown);

async function processRun(runNumber: number): Promise<void> {
  printRunHeader(runNumber);

  const stats = createRunStats();
  let canaryPassed = true;

  // Canary check — skipped in dry-run
  if (!cliOpts.dryRun) {
    const spinner = ora("Running canary health check...").start();
    canaryPassed = await runCanaryCheck();
    if (canaryPassed) {
      spinner.succeed(chalk.green("Canary check passed"));
    } else {
      spinner.fail(chalk.red("Canary failed — output drift detected!"));
      logQualityCheck(stats, false);
      logPipelineStats(stats);
      printRunSummary(runNumber, stats, false);
      return;
    }
  }

  // Fetch articles
  const fetchSpinner = ora("Fetching top stories from Hacker News...").start();
  const fetchStart = Date.now();
  const articles = await fetchArticles(cliOpts.articles);
  fetchSpinner.succeed(`Fetching top stories from Hacker News... done (${Date.now() - fetchStart}ms)`);
  console.log();

  // Process each article
  for (let i = 0; i < articles.length; i++) {
    if (isShuttingDown) break;

    const article = articles[i]!;

    // Deduplication: check if already processed in a previous run
    const alreadyProcessed = fs
      .readdirSync("workflow/articles")
      .some((f) => f.endsWith(`-${article.id}.json`));

    if (alreadyProcessed) {
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
      const outputPath = `workflow/articles/${timestamp}-${article.id}.json`;
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
      printArticleResult(i + 1, article.title, parsed.summary ?? "", parsed.topics ?? [], outputPath);
    } catch (err) {
      stats.failed++;
      spinner.fail(chalk.red(`        Failed: ${String(err)}`));
      log.error({ layer: "pipeline", id: article.id, error: String(err) }, "article failed");
    }
  }

  logPipelineStats(stats);
  logQualityCheck(stats, canaryPassed);
  printRunSummary(runNumber, stats, canaryPassed);
}

async function main() {
  printHeader();

  let runNumber = 1;

  while (!isShuttingDown) {
    await processRun(runNumber);

    if (cliOpts.once || isShuttingDown) break;

    const nextIn = cliOpts.interval / 1000;
    console.log(chalk.gray(`Next run in ${nextIn}s. Press Ctrl+C to stop.\n`));

    // Wait for interval, checking for shutdown every second
    const end = Date.now() + cliOpts.interval;
    while (Date.now() < end && !isShuttingDown) {
      await new Promise((r) => setTimeout(r, 1000));
    }

    runNumber++;
  }

  log.info("Shutdown complete.");
  console.log(chalk.green("\nShutdown complete."));
  process.exit(0);
}

main().catch((err) => {
  console.error(chalk.red("Fatal error:"), err);
  process.exit(1);
});
