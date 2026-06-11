import * as readline from "readline";
import config from "../../config.json";
import { verifyQuestion } from "../services/verifier";
import { answersMatch } from "../services/comparator";
import { checkWikipedia } from "../services/wikipedia";
import { runArbiter } from "../services/arbiter";
import { computeScore } from "../services/scorer";
import { getFromCache, setInCache, hasCached } from "../services/cache";
import { log } from "./logger";
import type { VerificationResult } from "../services/verifier";

const questions = config.questions;
const CUSTOM_OPTION = questions.length + 1;
const EXIT_OPTION = questions.length + 2;

function printMenu(): void {
  console.log("\n=== Grounding Demo ===\n");
  for (const q of questions) {
    console.log(` [${q.id}] ${q.question.padEnd(58)} (${q.domain} / ${q.difficulty})`);
  }
  console.log(` [${CUSTOM_OPTION}] Custom question`);
  console.log(`[${EXIT_OPTION}] Exit\n`);
}

async function processQuestion(question: string): Promise<void> {
  const cacheKey = question.toLowerCase().trim();
  const cached = hasCached(cacheKey);

  log.info(`Question: ${question}`);
  log.info(`Cache: ${cached ? "HIT" : "MISS"}`);

  console.log(`\nQuestion: ${question}\n`);
  if (cached) console.log("  (using cached result)\n");

  let result: VerificationResult;
  if (cached) {
    result = getFromCache<VerificationResult>(cacheKey)!;
  } else {
    result = await verifyQuestion(question);
    setInCache(cacheKey, result);
  }

  const { modelA, modelB } = result;
  const modelAName = config.models.modelA.split("/")[1];
  const modelBName = config.models.modelB.split("/")[1];

  log.info(`${config.models.modelA} responded (confidence: ${modelA.confidence}, language: ${modelA.language})`);
  log.info(`${config.models.modelB} responded (confidence: ${modelB.confidence}, language: ${modelB.language})`);

  // Layer 1 — semantic comparison
  const { match, overlap } = answersMatch(modelA.answer, modelA.keywords, modelB.answer, modelB.keywords);
  log.info(`Layer 1 — keywords overlap: ${overlap.toFixed(2)} → ${match ? "MATCH" : "NO MATCH"}`);

  console.log("Layer 1 — Multi-model (semantic):");
  console.log(`  ${modelAName.padEnd(22)}: "${modelA.answer}"  (confidence: ${modelA.confidence})`);
  console.log(`  ${modelBName.padEnd(22)}: "${modelB.answer}"  (confidence: ${modelB.confidence})`);
  console.log(`  Overlap               : ${overlap.toFixed(2)} → Match ${match ? "YES" : "NO"}\n`);

  // Layer 2 — Wikipedia
  const allKeywords = [...new Set([...modelA.keywords, ...modelB.keywords])];
  let layer2: number | null = null;
  let wikiExcerpt: string | null = null;

  try {
    const wikiResult = await checkWikipedia(allKeywords);
    wikiExcerpt = wikiResult.excerpt;

    if (wikiResult.excerpt) {
      layer2 = wikiResult.coverageScore;
      const confirmed = wikiResult.coverageScore >= config.verification.wikipediaCoverageThreshold;
      log.info(`Wikipedia: coverage ${wikiResult.keywordsFound}/${wikiResult.keywordsTotal} keywords → ${confirmed ? "CONFIRMED" : "NOT CONFIRMED"}`);

      console.log("Layer 2 — Wikipedia (coverage):");
      console.log(`  Query  : "${allKeywords[0]}" (keyword 1)`);
      console.log(`  Found  : ${wikiResult.keywordsFound}/${wikiResult.keywordsTotal} keywords → coverage: ${wikiResult.coverageScore.toFixed(2)}`);
      console.log(`  Result : ${confirmed ? "Confirmed" : "Not confirmed"}\n`);
    } else {
      log.warn("Wikipedia article not found — layer 2 skipped, weights redistributed");
      console.log("Layer 2 — Wikipedia: article not found (weights redistributed)\n");
    }
  } catch (err) {
    log.error(`Wikipedia API unavailable — layer 2 skipped, weights redistributed`);
    console.log("Layer 2 — Wikipedia: unavailable (weights redistributed)\n");
  }

  // Layer 3 — self-confidence
  const avgConfidence = (modelA.confidence + modelB.confidence) / 2;
  log.info(`Layer 3 — avg confidence: ${avgConfidence.toFixed(2)}`);
  console.log("Layer 3 — Self-confidence:");
  console.log(`  Average: ${avgConfidence.toFixed(2)} (weight: 10%)\n`);

  // Layer 4 — arbiter
  let arbiterScore = 0;
  try {
    const arbiter = await runArbiter(question, modelA.answer, modelB.answer, wikiExcerpt);
    arbiterScore = arbiter.score;
    log.info(`Arbiter: ${arbiter.consistent ? "consistent" : "inconsistent"} → ${arbiter.score.toFixed(2)}`);

    console.log("Layer 4 — Arbiter (claude-haiku):");
    console.log(`  Input  : question + both answers + wikipedia excerpt`);
    console.log(`  Output : ${arbiter.consistent ? "consistent" : "inconsistent"} → ${arbiter.score.toFixed(2)}`);
    console.log(`  Reason : ${arbiter.reasoning}\n`);
  } catch (err) {
    log.error(`Arbiter failed: ${err}`);
    console.log("Layer 4 — Arbiter: failed (score: 0)\n");
  }

  // Final score
  const score = computeScore(overlap, layer2, avgConfidence, arbiterScore);
  log.info(`Final confidence: ${score.final.toFixed(2)} → ${score.level}`);

  const w = config.weights;
  const layer2Part = layer2 !== null
    ? `(${layer2.toFixed(2)}*${w.layer2}) + `
    : "";
  console.log("---");
  console.log(
    `Weighted score: (${overlap.toFixed(2)}*${w.layer1}) + ${layer2Part}(${avgConfidence.toFixed(2)}*${w.layer3}) + (${arbiterScore.toFixed(2)}*${w.layer4}) = ${score.final.toFixed(2)}`
  );
  console.log(`Final confidence: ${score.level} (${score.final.toFixed(2)})\n`);

  if (!match) {
    log.warn("Models disagree — verify manually");
    console.log("WARNING: Models disagree — verify manually\n");
  }
}

export async function runCLI(): Promise<void> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const ask = (prompt: string): Promise<string> =>
    new Promise((resolve) => rl.question(prompt, resolve));

  while (true) {
    printMenu();
    const choice = (await ask("Select option: ")).trim();
    const num = parseInt(choice, 10);

    if (num === EXIT_OPTION) {
      console.log("Goodbye!");
      rl.close();
      break;
    }

    if (num === CUSTOM_OPTION) {
      const custom = (await ask("Your question: ")).trim();
      if (custom) await processQuestion(custom);
      continue;
    }

    const q = questions.find((q) => q.id === num);
    if (q) {
      await processQuestion(q.question);
    } else {
      console.log("Invalid option.\n");
    }
  }
}
