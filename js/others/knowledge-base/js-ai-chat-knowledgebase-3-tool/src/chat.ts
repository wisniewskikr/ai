import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { Config } from './config';
import { Message, ToolCall, sendMessage, KNOWLEDGE_TOOLS } from './api';
import { searchKnowledge, getEntryById, listTopics } from './knowledge';
import { log } from './logger';

function executeTool(name: string, args: Record<string, unknown>): string {
  switch (name) {
    case 'search_knowledge': {
      const results = searchKnowledge(args.query as string);
      if (results.length === 0) return 'No results found.';
      return JSON.stringify(results, null, 2);
    }
    case 'list_topics': {
      const topics = listTopics();
      if (topics.length === 0) return 'No topics in knowledge base.';
      return JSON.stringify(topics, null, 2);
    }
    case 'get_entry_by_id': {
      const entry = getEntryById(args.id as number);
      if (!entry) return `Entry with id ${args.id} not found.`;
      return JSON.stringify(entry, null, 2);
    }
    default:
      return `Unknown tool: ${name}`;
  }
}

function printHistory(history: Message[]): void {
  const visible = history.filter(m => m.role !== 'system');
  if (visible.length === 0) {
    console.log('(no messages yet)');
    return;
  }
  console.log('\n--- conversation history ---');
  for (const msg of visible) {
    const label = msg.role.toUpperCase().padEnd(9);
    const content = msg.content ?? `[tool_calls: ${msg.tool_calls?.map((t: ToolCall) => t.function.name).join(', ')}]`;
    console.log(`${label} ${content}`);
  }
  console.log('--- end of history ---\n');
}

export async function runChat(config: Config): Promise<void> {
  const rl = readline.createInterface({ input, output });

  const history: Message[] = [
    {
      role: 'system',
      content: 'You are a helpful assistant with access to a knowledge base. Use the provided tools to search for information when needed. If you cannot find the answer, say so clearly.',
    },
  ];

  function printHelp(): void {
    console.log('Available commands:');
    console.log('  /history  — show conversation history');
    console.log('  /clear    — clear the console');
    console.log('  /exit     — quit the chatbot');
    console.log();
  }

  log('INFO', 'Session started');
  printHelp();

  while (true) {
    let userInput: string;
    try {
      userInput = await rl.question('You: ');
    } catch {
      log('INFO', 'Session ended (stdin closed)');
      console.log('\nGoodbye!');
      rl.close();
      return;
    }
    const trimmed = userInput.trim();

    if (!trimmed) continue;
    if (trimmed === '/exit') {
      log('INFO', 'Session ended by user');
      console.log('Goodbye!');
      rl.close();
      return;
    }
    if (trimmed === '/history') { printHistory(history); continue; }
    if (trimmed === '/clear') { console.clear(); printHelp(); continue; }

    log('USER', trimmed);
    history.push({ role: 'user', content: trimmed });

    try {
      while (true) {
        const response = await sendMessage(history, config, KNOWLEDGE_TOOLS);

        if (response.tool_calls && response.tool_calls.length > 0) {
          history.push({
            role: 'assistant',
            content: response.content,
            tool_calls: response.tool_calls,
          });

          for (const toolCall of response.tool_calls) {
            const args = JSON.parse(toolCall.function.arguments) as Record<string, unknown>;
            log('INFO', `Tool call: ${toolCall.function.name}(${JSON.stringify(args)})`);
            console.log(`[calling tool: ${toolCall.function.name}]`);

            const result = executeTool(toolCall.function.name, args);

            history.push({
              role: 'tool',
              content: result,
              tool_call_id: toolCall.id,
            });
          }
        } else {
          const reply = response.content ?? '';
          history.push({ role: 'assistant', content: reply });
          log('ASSISTANT', reply);
          console.log(`\nAssistant: ${reply}\n`);
          break;
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      log('ERROR', message);
      console.error(`Error: ${message}`);
      history.pop();
    }
  }
}
