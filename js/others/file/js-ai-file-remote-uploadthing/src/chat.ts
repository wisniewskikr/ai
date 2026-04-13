import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { Config } from './config';
import { Message, OnToolCall, ToolExecutor, sendMessage } from './api';
import { createUploadThingMcpClient } from './mcp-client';
import { mcpToolsToDefinitions, ToolDefinition } from './tools';
import { log } from './logger';

function buildSystemPrompt(): string {
  return `You are a helpful AI assistant with access to UploadThing cloud storage via MCP tools.

AVAILABLE TOOLS:
- upload_files  — upload files to UploadThing cloud (accepts base64-encoded content, 1-10 files per call)
- list_files    — list uploaded files with pagination, or get info about a specific file by key
- manage_files  — delete, rename, update ACL (public/private), or get a signed URL for a file

UPLOADING FILES:
- Encode file content as raw base64 (without "data:" URI prefix)
- Provide a file name with the correct extension matching the MIME type
- Example — save plain text: { files: [{ base64: "<base64>", name: "chat.txt", type: "text/plain" }] }
- After a successful upload the tool returns the public URL — always share it with the user

SAVING THE CONVERSATION:
- When asked to save the conversation, format it as readable plain text with role labels (USER / ASSISTANT)
- Encode the text as base64 and upload it via upload_files with type "text/plain"

MANAGING FILES:
- Use list_files to browse previously uploaded files and retrieve their keys
- Use manage_files with action "delete" to remove files (requires fileKeys array)
- Use manage_files with action "get_url" to obtain a signed URL for private files`;
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

function makeOnToolCall(): OnToolCall {
  return (name, _args, result) => {
    let parsed: { success?: boolean; status?: string; message?: string; count?: number } = {};
    try { parsed = JSON.parse(result) as typeof parsed; } catch { /* raw text */ }

    const ok = parsed.success === true || parsed.status === 'applied' || parsed.count !== undefined;
    const status = ok ? '✓' : '✗';

    console.log(`\n[Tool] ${name} ${status}`);
    if (!ok && parsed.message) {
      console.log(`       Error: ${parsed.message}`);
    }
  };
}

export async function runChat(config: Config): Promise<void> {
  const rl = readline.createInterface({ input, output });

  console.log('Starting uploadthing-mcp server...');
  const mcpClient = await createUploadThingMcpClient();
  const mcpTools = await mcpClient.listTools();
  const tools: ToolDefinition[] = mcpToolsToDefinitions(mcpTools);
  const executor: ToolExecutor = (name, args) => mcpClient.callTool(name, args);
  const onToolCall = makeOnToolCall();

  const history: Message[] = [
    { role: 'system', content: buildSystemPrompt() },
  ];

  function printHelp(): void {
    console.log('Available commands:');
    console.log('  /history  — show conversation history');
    console.log('  /clear    — clear the console');
    console.log('  /exit     — quit');
    console.log();
    console.log('Examples:');
    console.log('  - Save this conversation to chat.txt');
    console.log('  - List my uploaded files');
    console.log('  - Delete the file with key <key>');
    console.log();
  }

  log('INFO', `Session started, model=${config.model}`);
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
      continue;
    }

    if (trimmed === '/clear') {
      console.clear();
      printHelp();
      continue;
    }

    log('USER', trimmed);
    history.push({ role: 'user', content: trimmed });

    try {
      const reply = await sendMessage(history, config, tools, executor, onToolCall);
      history.push({ role: 'assistant', content: reply });
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
