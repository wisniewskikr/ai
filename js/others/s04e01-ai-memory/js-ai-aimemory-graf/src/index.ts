import * as readline from 'readline';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { getDirectReports, getManager, getAllNodes, getNodeNames } from './services/graphMemory';
import { callLLM } from './services/openRouter';
import { buildParseQuestionPrompt } from './prompts/parseQuestion';
import { logger } from './utils/logger';

dotenv.config();

interface Config {
  model: string;
  maxTokens: number;
  demoQuestions: {
    directReports: string;
    manager: string;
  };
}

const config: Config = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../config.json'), 'utf-8')
);

const apiKey = process.env.OPENROUTER_API_KEY;
if (!apiKey) {
  console.error('ERROR: OPENROUTER_API_KEY is not set in .env');
  process.exit(1);
}
const API_KEY = apiKey as string;

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

function ask(question: string): Promise<string> {
  return new Promise(resolve => rl.question(question, resolve));
}

function showMenu(): void {
  console.log('\n========================================');
  console.log('  AI Memory Demo: Knowledge Graph');
  console.log('========================================');
  console.log('[1] Show full graph (nodes and edges)');
  console.log(`[2] Who reports to ${config.demoQuestions.directReports}?`);
  console.log(`[3] Who is ${config.demoQuestions.manager}'s manager?`);
  console.log('[4] Ask your own question (AI-powered)');
  console.log('[0] Exit\n');
}

function showGraph(): void {
  const { nodes, edges } = getAllNodes();

  const children = new Map<string, string[]>();
  const hasParent = new Set<string>();

  for (const edge of edges) {
    if (!children.has(edge.from)) children.set(edge.from, []);
    children.get(edge.from)!.push(edge.to);
    hasParent.add(edge.to);
  }

  const nodeMap = new Map(nodes.map(n => [n.id, n]));

  function printNode(id: string, ownPrefix: string, childIndent: string): void {
    const node = nodeMap.get(id)!;
    console.log(`${ownPrefix}${node.name} (${node.title})`);
    const kids = children.get(id) ?? [];
    kids.forEach((kid, i) => {
      const isLast = i === kids.length - 1;
      printNode(kid, childIndent + '+-- ', childIndent + (isLast ? '    ' : '|   '));
    });
  }

  console.log('\n[GRAPH] Full company hierarchy:\n');
  for (const node of nodes) {
    if (!hasParent.has(node.id)) printNode(node.id, '', '');
  }

  logger.info('User viewed full graph');
}

function showDirectReports(name: string): void {
  const start = Date.now();
  const result = getDirectReports(name);
  const ms = Date.now() - start;

  if (!result.found || !result.person) {
    console.log(`\n[GRAPH] Person not found: "${name}"`);
    logger.warn(`Person not found: ${name}`);
    return;
  }

  const { person, reports } = result;
  if (reports.length === 0) {
    console.log(`\n[GRAPH] ${person.name} (${person.title}) has no direct reports.`);
  } else {
    console.log(`\n[GRAPH] ${person.name} (${person.title}) manages ${reports.length} ${reports.length === 1 ? 'person' : 'people'}:`);
    reports.forEach(r => console.log(`          - ${r.name} (${r.title})`));
  }
  console.log(`        Time: ${ms < 1 ? '< 1' : ms}ms, always correct`);
  logger.info(`Direct reports for "${name}": ${reports.map(r => r.name).join(', ') || 'none'}`);
}

function showManager(name: string): void {
  const start = Date.now();
  const result = getManager(name);
  const ms = Date.now() - start;

  if (!result.found || !result.person) {
    console.log(`\n[GRAPH] Person not found: "${name}"`);
    logger.warn(`Person not found: ${name}`);
    return;
  }

  const { person, manager } = result;
  if (!manager) {
    console.log(`\n[GRAPH] ${person.name} (${person.title}) has no manager — they are at the top.`);
  } else {
    console.log(`\n[GRAPH] ${person.name} (${person.title}) reports to ${manager.name} (${manager.title}).`);
  }
  console.log(`        Time: ${ms < 1 ? '< 1' : ms}ms, always correct`);
  logger.info(`Manager for "${name}": ${manager?.name ?? 'none'}`);
}

interface ParsedQuestion {
  person: string | null;
  queryType: 'direct_reports' | 'manager' | 'unknown';
}

async function handleCustomQuestion(): Promise<void> {
  const question = (await ask('Your question: ')).trim();
  if (!question) return;

  console.log('\n[AI] Parsing your question...');
  logger.info(`Custom question: ${question}`);

  const prompt = buildParseQuestionPrompt(question, getNodeNames());

  try {
    const response = await callLLM(API_KEY, config.model, prompt, config.maxTokens);
    logger.info(`LLM response: ${response}`);

    let parsed: ParsedQuestion;
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON in response');
      parsed = JSON.parse(jsonMatch[0]) as ParsedQuestion;
    } catch {
      console.log('\n[ERROR] Could not parse AI response. Try rephrasing your question.');
      logger.error(`Failed to parse LLM JSON: ${response}`);
      return;
    }

    if (!parsed.person || parsed.queryType === 'unknown') {
      console.log('\n[GRAPH] Could not understand the question. Ask about a specific person.');
      return;
    }

    if (parsed.queryType === 'direct_reports') {
      showDirectReports(parsed.person);
    } else {
      showManager(parsed.person);
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.log(`\n[ERROR] API call failed: ${msg}`);
    logger.error(`API error: ${msg}`);
  }
}

async function main(): Promise<void> {
  logger.info('Application started');

  while (true) {
    showMenu();
    const choice = (await ask('Choose option: ')).trim();

    switch (choice) {
      case '1':
        showGraph();
        break;
      case '2':
        showDirectReports(config.demoQuestions.directReports);
        break;
      case '3':
        showManager(config.demoQuestions.manager);
        break;
      case '4':
        await handleCustomQuestion();
        break;
      case '0':
        logger.info('Application exited by user');
        console.log('\nGoodbye!');
        rl.close();
        process.exit(0);
      default:
        console.log('\nInvalid option. Choose 0-4.');
    }
  }
}

main().catch(err => {
  logger.error(`Fatal error: ${String(err)}`);
  console.error('Fatal error:', err);
  process.exit(1);
});
