import { spawn, ChildProcess } from 'child_process';
import * as readline from 'readline';
import * as fs from 'fs';
import * as path from 'path';

interface JsonRpcMessage {
  jsonrpc: '2.0';
  id?: number;
  method?: string;
  params?: unknown;
  result?: unknown;
  error?: { code: number; message: string };
}

export interface McpTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

export class McpClient {
  private proc: ChildProcess;
  private rl: readline.Interface;
  private pending = new Map<number, { resolve: (v: unknown) => void; reject: (e: Error) => void }>();
  private nextId = 1;

  constructor(proc: ChildProcess) {
    this.proc = proc;
    this.rl = readline.createInterface({ input: proc.stdout! });

    this.rl.on('line', (line) => {
      if (!line.trim()) return;
      try {
        const msg = JSON.parse(line) as JsonRpcMessage;
        if (msg.id === undefined) return; // notification — ignore
        const handler = this.pending.get(msg.id);
        if (!handler) return;
        this.pending.delete(msg.id);
        if (msg.error) {
          handler.reject(new Error(`MCP ${msg.error.code}: ${msg.error.message}`));
        } else {
          handler.resolve(msg.result);
        }
      } catch {
        // ignore non-JSON lines
      }
    });

    this.proc.on('exit', (code) => {
      for (const [, h] of this.pending) {
        h.reject(new Error(`MCP server exited (code ${code})`));
      }
      this.pending.clear();
    });
  }

  private request(method: string, params?: unknown): Promise<unknown> {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      const msg = JSON.stringify({ jsonrpc: '2.0', id, method, params });
      this.proc.stdin!.write(msg + '\n');
    });
  }

  private notify(method: string, params?: unknown): void {
    const msg = JSON.stringify({ jsonrpc: '2.0', method, params });
    this.proc.stdin!.write(msg + '\n');
  }

  async initialize(): Promise<void> {
    await this.request('initialize', {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: { name: 'js-ai-file-remote-uploadthing', version: '1.0.0' },
    });
    this.notify('notifications/initialized', {});
  }

  async listTools(): Promise<McpTool[]> {
    const result = await this.request('tools/list', {}) as { tools: McpTool[] };
    return result.tools;
  }

  async callTool(name: string, args: Record<string, unknown>): Promise<string> {
    const result = await this.request('tools/call', { name, arguments: args }) as {
      content: { type: string; text: string }[];
    };
    return result.content.map((c) => c.text).join('');
  }

  close(): void {
    this.rl.close();
    this.proc.stdin?.end();
    this.proc.kill();
  }
}

export async function createMcpClient(fsRoot: string): Promise<McpClient> {
  const mcpDir = path.join(process.cwd(), 'mcp', 'files-mcp');
  const distPath = path.join(mcpDir, 'dist', 'index.js');

  let command: string;
  let args: string[];

  if (fs.existsSync(distPath)) {
    command = 'node';
    args = [distPath];
  } else {
    command = 'bun';
    args = ['run', path.join(mcpDir, 'src', 'index.ts')];
  }

  const proc = spawn(command, args, {
    env: { ...process.env, FS_ROOT: fsRoot, LOG_LEVEL: 'error' },
    stdio: ['pipe', 'pipe', 'pipe'],
    cwd: mcpDir,
  });

  // Suppress server stderr
  proc.stderr?.resume();

  const client = new McpClient(proc);
  await client.initialize();
  return client;
}
