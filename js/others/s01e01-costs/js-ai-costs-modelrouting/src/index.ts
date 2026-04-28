import * as readline from 'readline';
import { loadConfig } from './utils/config';
import { log } from './utils/logger';
import { routeQuery } from './services/router';

function printBanner(): void {
  console.log('');
  console.log('=== AI Model Routing Demo ===');
  console.log('Queries are routed to cheap or expensive models based on complexity.');
  console.log('Type your question or choose from examples below. Type /exit to quit.');
  console.log('');
}

function printExamples(queries: string[]): void {
  console.log('Example queries:');
  queries.forEach((q, i) => console.log(`  [${i + 1}] ${q}`));
  console.log('');
}

async function processQuery(query: string, config: ReturnType<typeof loadConfig>): Promise<void> {
  console.log('');
  console.log('Processing...');

  const result = await routeQuery(query, config);

  console.log('');
  console.log(`--- Answer ---`);
  console.log(result.answer);
  console.log('');
  console.log(`Agent used : ${result.agentUsed}`);
  console.log(`Query type : ${result.queryType}`);
  console.log(`Est. cost  : $${result.estimatedCostUsd.toFixed(6)}`);
  console.log('');
}

async function main(): Promise<void> {
  const config = loadConfig();

  printBanner();
  printExamples(config.exampleQueries);

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  const ask = (): void => {
    rl.question('> ', async (input) => {
      const trimmed = input.trim();

      if (!trimmed) {
        ask();
        return;
      }

      if (trimmed === '/exit') {
        console.log('Goodbye!');
        log('INFO', 'Session ended by user');
        rl.close();
        return;
      }

      // Allow selecting an example by number
      const index = parseInt(trimmed, 10);
      const query =
        !isNaN(index) && index >= 1 && index <= config.exampleQueries.length
          ? config.exampleQueries[index - 1]
          : trimmed;

      if (query !== trimmed) {
        console.log(`Selected: "${query}"`);
      }

      log('INFO', `User query: "${query}"`);

      try {
        await processQuery(query, config);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error(`Error: ${message}`);
        log('ERROR', `Query failed: ${message}`);
      }

      ask();
    });
  };

  rl.on('close', () => process.exit(0));

  ask();
}

main().catch((err) => {
  console.error('Startup error:', err instanceof Error ? err.message : String(err));
  process.exit(1);
});
