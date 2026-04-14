// ============================================================
// wasmBridge.ts — Node.js host for the WASM module
//
// Responsibilities:
//   1. Loads the compiled WASM module (assembly/build/release.wasm)
//   2. Provides host function `hostWriteFile` — the only I/O path for WASM
//   3. Enforces sandbox policy: writes allowed only to C:/workspace
//   4. Exports a JS API for managing chat history through WASM
// ============================================================

import * as fs from 'fs';
import * as path from 'path';
import { instantiate } from '@assemblyscript/loader';

// Raw WASM exports — strings are passed as i32 (pointers)
interface WasmExports extends Record<string, unknown> {
  addMessage(rolePtr: number, contentPtr: number): void;
  getHistoryJson(): number;
  clearHistory(): void;
  getMessageCount(): number;
  saveHistory(filePathPtr: number): number;
  // AssemblyScript runtime utilities (available thanks to exportRuntime: true)
  __newString(value: string): number;
  __getString(pointer: number): string;
  __pin(pointer: number): number;
  __unpin(pointer: number): void;
}

// The only allowed write location — sandbox boundary
const WORKSPACE = 'C:/workspace';

// Checks whether a path points inside C:/workspace.
// The host rejects any request outside this directory.
function isAllowedPath(filePath: string): boolean {
  const norm = path.normalize(filePath).replace(/\\/g, '/');
  const ws = path.normalize(WORKSPACE).replace(/\\/g, '/');
  return norm.startsWith(ws + '/') || norm === ws;
}

// WASM module exports — set after initWasm()
let wasmExports: WasmExports | null = null;

// Loads and initializes the WASM module.
// Must be called before any other function in this module.
export async function initWasm(): Promise<void> {
  const wasmPath = path.join(process.cwd(), 'assembly', 'build', 'release.wasm');

  if (!fs.existsSync(wasmPath)) {
    throw new Error(
      `WASM file not found: ${wasmPath}\nRun first: npm run build:wasm`
    );
  }

  const wasmBuffer = fs.readFileSync(wasmPath);

  // ---- SANDBOX BOUNDARY ----
  // WASM calls this function, passing pointers to strings in its own memory.
  // The host reads strings via __getString(), validates the path, then writes.
  // Cast through unknown is needed because the loader types env only with
  // built-in AssemblyScript functions (abort, trace, etc.).
  const hostImports = {
    env: {
      hostWriteFile(filePathPtr: number, contentPtr: number): number {
        // wasmExports is set before this function can ever be called
        const filePath = wasmExports!.__getString(filePathPtr);
        const content  = wasmExports!.__getString(contentPtr);

        if (!isAllowedPath(filePath)) {
          console.error(
            `[WASM Sandbox] BLOCKED: write to "${filePath}" is outside ${WORKSPACE}`
          );
          return -1; // denied — outside sandbox
        }

        try {
          const dir = path.dirname(filePath);
          if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
          fs.writeFileSync(filePath, content, 'utf-8');
          console.log(`[WASM Sandbox] Write allowed: ${filePath}`);
          return 0; // success
        } catch (err) {
          console.error(`[WASM Sandbox] Write error: ${err}`);
          return -2; // I/O error
        }
      },
    },
  };

  const { exports } = await instantiate<WasmExports>(
    wasmBuffer,
    hostImports as unknown as Parameters<typeof instantiate>[1]
  );

  wasmExports = exports as unknown as WasmExports;
}

function getExports(): WasmExports {
  if (!wasmExports) {
    throw new Error('WASM module is not initialized. Call initWasm() first.');
  }
  return wasmExports;
}

// Adds a message to the history stored in WASM memory.
// Strings are allocated in isolated WASM memory via __newString().
export function wasmAddMessage(role: string, content: string): void {
  const e = getExports();
  // __pin prevents the object from being collected by the WASM GC during the call
  const rolePtr    = e.__pin(e.__newString(role));
  const contentPtr = e.__pin(e.__newString(content));
  try {
    e.addMessage(rolePtr, contentPtr);
  } finally {
    e.__unpin(rolePtr);
    e.__unpin(contentPtr);
  }
}

// Retrieves the history as a JSON string from WASM memory.
export function wasmGetHistory(): string {
  const e = getExports();
  const ptr = e.getHistoryJson();   // pointer to a string in WASM memory
  return e.__getString(ptr);        // read via loader
}

// Clears the history in WASM memory.
export function wasmClearHistory(): void {
  getExports().clearHistory();
}

// Returns the number of messages in the WASM history.
export function wasmGetMessageCount(): number {
  return getExports().getMessageCount();
}

// Saves history to a file — ONLY through the sandbox.
// The path must point to C:/workspace/, otherwise it will be blocked.
export function wasmSaveHistory(filePath: string): boolean {
  const e = getExports();
  const ptr = e.__pin(e.__newString(filePath));
  try {
    const result = e.saveHistory(ptr);
    return result === 0;
  } finally {
    e.__unpin(ptr);
  }
}
