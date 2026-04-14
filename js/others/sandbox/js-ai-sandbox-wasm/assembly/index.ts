// ============================================================
// WASM module (AssemblyScript)
// Stores chat history in isolated WASM memory.
//
// SANDBOX RULE:
//   This module has NO disk access (no `import fs`).
//   Every write goes through hostWriteFile — a host function
//   provided by Node.js, which controls allowed paths.
// ============================================================

// Host function provided by Node.js (wasmBridge.ts).
// WASM cannot write files on its own — it must ask the host.
@external("env", "hostWriteFile")
declare function hostWriteFile(filePath: string, content: string): i32;

// Chat history stored exclusively in WASM memory (ArrayBuffer).
// Isolated from host memory — Node.js has no direct access to it.
let messages: Array<string> = new Array<string>();

// Escapes special JSON characters inside a string value.
function escapeJson(s: string): string {
  let result: string = "";
  for (let i: i32 = 0; i < s.length; i++) {
    const code: i32 = s.charCodeAt(i);
    if (code == 34) {       // "
      result += '\\"';
    } else if (code == 92) { // \
      result += "\\\\";
    } else if (code == 10) { // newline
      result += "\\n";
    } else if (code == 13) { // carriage return
      result += "\\r";
    } else if (code == 9) {  // tab
      result += "\\t";
    } else {
      result += String.fromCharCode(code);
    }
  }
  return result;
}

// Adds a message to the history stored in WASM memory.
export function addMessage(role: string, content: string): void {
  messages.push('{"role":"' + role + '","content":"' + escapeJson(content) + '"}');
}

// Returns the full history as a JSON string.
// The host can read it via __getString(ptr).
export function getHistoryJson(): string {
  if (messages.length == 0) return "[]";
  let json: string = "[";
  for (let i: i32 = 0; i < messages.length; i++) {
    if (i > 0) json += ",";
    json += messages[i];
  }
  return json + "]";
}

// Clears the history in WASM memory.
export function clearHistory(): void {
  messages = new Array<string>();
}

// Returns the number of messages in the history.
export function getMessageCount(): i32 {
  return messages.length;
}

// Saves history to a file — ONLY through a host function (sandbox boundary).
// The host checks whether the path is under C:/workspace and rejects all others.
export function saveHistory(filePath: string): i32 {
  const json = getHistoryJson();
  return hostWriteFile(filePath, json);
}
