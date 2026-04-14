// ============================================================
// WASM module (AssemblyScript)
// Przechowuje historię chatu w izolowanej pamięci WASM.
//
// ZASADA SANDBOX:
//   Ten moduł NIE MA dostępu do dysku (brak `import fs`).
//   Każdy zapis przechodzi przez hostWriteFile — host function
//   dostarczoną przez Node.js, który kontroluje dozwolone ścieżki.
// ============================================================

// Host function dostarczana przez Node.js (wasmBridge.ts).
// WASM nie może samodzielnie pisać plików — musi poprosić hosta.
@external("env", "hostWriteFile")
declare function hostWriteFile(filePath: string, content: string): i32;

// Historia chatu przechowywana wyłącznie w pamięci WASM (ArrayBuffer).
// Odizolowana od pamięci hosta — Node.js nie ma do niej bezpośredniego dostępu.
let messages: Array<string> = new Array<string>();

// Escapuje znaki specjalne JSON wewnątrz wartości tekstowej.
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

// Dodaje wiadomość do historii przechowywanej w pamięci WASM.
export function addMessage(role: string, content: string): void {
  messages.push('{"role":"' + role + '","content":"' + escapeJson(content) + '"}');
}

// Zwraca całą historię jako string JSON.
// Hosta może ją odczytać przez __getString(ptr).
export function getHistoryJson(): string {
  if (messages.length == 0) return "[]";
  let json: string = "[";
  for (let i: i32 = 0; i < messages.length; i++) {
    if (i > 0) json += ",";
    json += messages[i];
  }
  return json + "]";
}

// Czyści historię w pamięci WASM.
export function clearHistory(): void {
  messages = new Array<string>();
}

// Zwraca liczbę wiadomości w historii.
export function getMessageCount(): i32 {
  return messages.length;
}

// Zapisuje historię do pliku — WYŁĄCZNIE przez host function (sandbox boundary).
// Host sprawdza, czy ścieżka jest w C:/workspace, i odrzuca inne żądania.
export function saveHistory(filePath: string): i32 {
  const json = getHistoryJson();
  return hostWriteFile(filePath, json);
}
