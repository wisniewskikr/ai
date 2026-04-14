import { spawn, ChildProcess } from 'child_process';
import * as net from 'net';
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

const MCP_SESSION_HEADER = 'Mcp-Session-Id';

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

// ---------------------------------------------------------------------------
// HTTP-based MCP client for StreamableHTTP servers (e.g. uploadthing-mcp)
// ---------------------------------------------------------------------------

export class HttpMcpClient {
  private baseUrl: string;
  private sessionId: string | null = null;
  private proc: ChildProcess | null;
  private nextId = 1;

  constructor(port: number, proc?: ChildProcess) {
    this.baseUrl = `http://127.0.0.1:${port}/mcp`;
    this.proc = proc ?? null;
  }

  private async request(method: string, params?: unknown): Promise<unknown> {
    const id = this.nextId++;
    const body = JSON.stringify({ jsonrpc: '2.0', id, method, params });

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/event-stream',
    };
    if (this.sessionId) {
      headers[MCP_SESSION_HEADER] = this.sessionId;
    }

    const response = await fetch(this.baseUrl, { method: 'POST', headers, body });

    if (!this.sessionId) {
      const sid = response.headers.get(MCP_SESSION_HEADER);
      if (sid) this.sessionId = sid;
    }

    const contentType = response.headers.get('Content-Type') ?? '';
    let msg: JsonRpcMessage;

    if (contentType.includes('text/event-stream')) {
      const text = await response.text();
      const dataLine = text.split('\n').find((l) => l.startsWith('data: '));
      if (!dataLine) throw new Error('No data in SSE response');
      msg = JSON.parse(dataLine.slice(6)) as JsonRpcMessage;
    } else {
      msg = (await response.json()) as JsonRpcMessage;
    }

    if (msg.error) throw new Error(`MCP ${msg.error.code}: ${msg.error.message}`);
    return msg.result;
  }

  private async postNotify(method: string, params?: unknown): Promise<void> {
    const body = JSON.stringify({ jsonrpc: '2.0', method, params });
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (this.sessionId) headers[MCP_SESSION_HEADER] = this.sessionId;
    await fetch(this.baseUrl, { method: 'POST', headers, body }).catch(() => undefined);
  }

  async initialize(): Promise<void> {
    await this.request('initialize', {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: { name: 'js-ai-file-remote-uploadthing', version: '1.0.0' },
    });
    await this.postNotify('notifications/initialized', {});
  }

  async listTools(): Promise<McpTool[]> {
    const result = (await this.request('tools/list', {})) as { tools: McpTool[] };
    return result.tools;
  }

  async callTool(name: string, args: Record<string, unknown>): Promise<string> {
    const result = (await this.request('tools/call', { name, arguments: args })) as {
      content: { type: string; text: string }[];
    };
    return result.content.map((c) => c.text).join('');
  }

  close(): void {
    this.proc?.kill();
  }
}

async function waitForServer(url: string, maxAttempts = 30, delayMs = 500): Promise<void> {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      // not ready yet
    }
    await new Promise<void>((resolve) => setTimeout(resolve, delayMs));
  }
  throw new Error(`Server at ${url} did not start within ${maxAttempts * delayMs}ms`);
}

function getFreePort(start = 3000, end = 3099): Promise<number> {
  return new Promise((resolve, reject) => {
    let current = start;
    const tryNext = () => {
      if (current > end) { reject(new Error('No free port found')); return; }
      const server = net.createServer();
      server.once('error', () => { current++; tryNext(); });
      server.once('listening', () => { server.close(() => resolve(current)); });
      server.listen(current, '127.0.0.1');
    };
    tryNext();
  });
}

export async function createUploadThingMcpClient(): Promise<HttpMcpClient> {
  const mcpDir = path.join(process.cwd(), 'mcp', 'uploadthing-mcp');
  const port = await getFreePort();

  const tsxCli = path.join(mcpDir, 'node_modules', 'tsx', 'dist', 'cli.mjs');
  const proc = spawn(process.execPath, [tsxCli, path.join(mcpDir, 'src', 'index.ts')], {
    env: {
      ...process.env,
      PORT: String(port),
      HOST: '127.0.0.1',
      AUTH_STRATEGY: 'none',
      LOG_LEVEL: 'error',
    },
    stdio: 'ignore',
    cwd: mcpDir,
    detached: true,
    windowsHide: true,
  });
  proc.unref();

  await waitForServer(`http://127.0.0.1:${port}/health`);

  const client = new HttpMcpClient(port, proc);
  await client.initialize();
  return client;
}

// ---------------------------------------------------------------------------
// stdio-based MCP client (files-mcp)
// ---------------------------------------------------------------------------

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
