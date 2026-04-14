import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import * as path from 'path';
import { Config } from './config';
import { Message, OnToolCall, ToolExecutor, sendMessage } from './api';
import { createMcpClient } from './mcp-client';
import { mcpToolsToDefinitions, ToolDefinition } from './tools';
import { log } from './logger';
import {
  initWasm,
  wasmAddMessage,
  wasmGetMessageCount,
  wasmSaveHistory,
  wasmClearHistory,
} from './wasmBridge';

function buildSystemPrompt(fsRoot: string): string {
  const mountName = path.basename(fsRoot);
  return `You are a helpful AI assistant with access to the local filesystem via sandboxed tools.

WORKSPACE: "${fsRoot}"
All file paths use the virtual prefix "${mountName}/" — for example:
  - Save a file → path: "${mountName}/chat.txt"
  - Read a file → path: "${mountName}/notes.md"

AVAILABLE TOOLS:
- fs_read   — read files or list directories (returns line numbers + checksum)
- fs_write  — create or update files (operation: "create" | "update")
- fs_search — find files by name or content
- fs_manage — delete, rename, move, copy, mkdir

When asked to save the conversation, format it as readable plain text with role labels.
When asked to save to an absolute path like "C:\\workspace\\file.txt", use the virtual path instead (e.g. "${mountName}/file.txt").`;
}

function printHistory(history: Message[]): void {
  const visible = history.filter((m) => m.role === 'user' || m.role === 'assistant');
  if (visible.length === 0) {
    console.log('(no messages yet)');
    return;
  }
  console.log('\n--- conversation history ---');
  for (const msg of visible) {
    const label = msg.role.toUpperCase().padEnd(9);
    console.log(`${label} ${msg.content}`);
  }
  console.log('--- end of history ---\n');
}

function makeOnToolCall(fsRoot: string): OnToolCall {
  const mountName = path.basename(fsRoot);
  return (name, args, result) => {
    let parsed: { success?: boolean; status?: string; message?: string } = {};
    try { parsed = JSON.parse(result) as typeof parsed; } catch { /* raw text */ }

    const ok = parsed.status === 'applied' || parsed.success === true;
    const filePath = (args.path as string | undefined) ?? '';
    const displayPath = filePath
      ? filePath.replace(mountName + '/', fsRoot + path.sep).replace(mountName + '\\', fsRoot + path.sep)
      : '';
    const status = ok ? '✓' : '✗';

    console.log(`\n[Tool] ${name} ${status}${displayPath ? ` → ${displayPath}` : ''}`);
    if (!ok && parsed.message) {
      console.log(`       Error: ${parsed.message}`);
    }
  };
}

export async function runChat(config: Config): Promise<void> {
  const rl = readline.createInterface({ input, output });

  console.log('Initializing WASM sandbox...');
  await initWasm();
  console.log('[WASM Sandbox] Moduł załadowany. Historia chatu przechowywana w izolowanej pamięci WASM.');

  console.log('Starting files-mcp server...');
  const mcpClient = await createMcpClient(config.fsRoot);
  const mcpTools = await mcpClient.listTools();
  const tools: ToolDefinition[] = mcpToolsToDefinitions(mcpTools);
  const executor: ToolExecutor = (name, args) => mcpClient.callTool(name, args);
  const onToolCall = makeOnToolCall(config.fsRoot);

  const history: Message[] = [
    { role: 'system', content: buildSystemPrompt(config.fsRoot) },
  ];

  function printHelp(): void {
    console.log(`Workspace: ${config.fsRoot}`);
    console.log('Available commands:');
    console.log('  /history  — show conversation history');
    console.log('  /save     — save chat history via WASM sandbox to C:/workspace/history.json');
    console.log('  /clear    — clear the console');
    console.log('  /exit     — quit');
    console.log();
    console.log('Examples:');
    console.log('  - Save this conversation to chat.txt');
    console.log('  - Read the file chat.txt');
    console.log('  - Remove the file chat.txt');
    console.log();
  }

  log('INFO', `Session started, fsRoot=${config.fsRoot}`);
  printHelp();

  while (true) {
    let userInput: string;
    try {
      userInput = await rl.question('You: ');
    } catch {
      log('INFO', 'Session ended (stdin closed)');
      console.log('\nGoodbye!');
      rl.close();
      mcpClient.close();
      return;
    }

    const trimmed = userInput.trim();
    if (!trimmed) continue;

    if (trimmed === '/exit') {
      log('INFO', 'Session ended by user');
      console.log('Goodbye!');
      rl.close();
      mcpClient.close();
      return;
    }

    if (trimmed === '/history') {
      printHistory(history);
      console.log(`[WASM] Wiadomości w pamięci WASM: ${wasmGetMessageCount()}`);
      continue;
    }

    if (trimmed === '/save') {
      const savePath = 'C:/workspace/history.json';
      const ok = wasmSaveHistory(savePath);
      if (ok) {
        console.log(`\n[WASM Sandbox] Historia zapisana do: ${savePath}\n`);
        log('INFO', `WASM saved history to ${savePath}`);
      } else {
        console.error('\n[WASM Sandbox] Zapis nieudany (ścieżka zablokowana lub błąd I/O)\n');
      }
      continue;
    }

    if (trimmed === '/clear') {
      console.clear();
      printHelp();
      continue;
    }

    log('USER', trimmed);
    history.push({ role: 'user', content: trimmed });
    wasmAddMessage('user', trimmed); // mirror do izolowanej pamięci WASM

    try {
      const reply = await sendMessage(history, config, tools, executor, onToolCall);
      history.push({ role: 'assistant', content: reply });
      wasmAddMessage('assistant', reply); // mirror do izolowanej pamięci WASM
      log('ASSISTANT', reply);
      console.log(`\nAssistant: ${reply}\n`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      log('ERROR', message);
      console.error(`Error: ${message}`);
      history.pop();
    }
  }
}
