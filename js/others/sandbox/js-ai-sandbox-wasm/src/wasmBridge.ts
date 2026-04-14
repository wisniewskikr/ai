// ============================================================
// wasmBridge.ts — Node.js host dla modułu WASM
//
// Odpowiedzialności:
//   1. Ładuje skompilowany moduł WASM (assembly/build/release.wasm)
//   2. Dostarcza host function `hostWriteFile` — jedyną drogę I/O dla WASM
//   3. Egzekwuje politykę sandbox: zapis dozwolony wyłącznie do C:/workspace
//   4. Eksportuje JS API do zarządzania historią chatu przez WASM
// ============================================================

import * as fs from 'fs';
import * as path from 'path';
import { instantiate } from '@assemblyscript/loader';

// Surowe eksporty WASM — stringi są przekazywane jako i32 (wskaźniki)
interface WasmExports extends Record<string, unknown> {
  addMessage(rolePtr: number, contentPtr: number): void;
  getHistoryJson(): number;
  clearHistory(): void;
  getMessageCount(): number;
  saveHistory(filePathPtr: number): number;
  // Narzędzia runtime AssemblyScript (dostępne dzięki exportRuntime: true)
  __newString(value: string): number;
  __getString(pointer: number): string;
  __pin(pointer: number): number;
  __unpin(pointer: number): void;
}

// Jedyna dozwolona lokalizacja zapisu — granica sandbox
const WORKSPACE = 'C:/workspace';

// Sprawdza, czy ścieżka wskazuje na folder C:/workspace.
// Host odrzuca każde żądanie spoza tego folderu.
function isAllowedPath(filePath: string): boolean {
  const norm = path.normalize(filePath).replace(/\\/g, '/');
  const ws = path.normalize(WORKSPACE).replace(/\\/g, '/');
  return norm.startsWith(ws + '/') || norm === ws;
}

// Eksporty modułu WASM — ustawiane po initWasm()
let wasmExports: WasmExports | null = null;

// Ładuje i inicjalizuje moduł WASM.
// Musi być wywołane przed użyciem pozostałych funkcji.
export async function initWasm(): Promise<void> {
  const wasmPath = path.join(process.cwd(), 'assembly', 'build', 'release.wasm');

  if (!fs.existsSync(wasmPath)) {
    throw new Error(
      `Brak pliku WASM: ${wasmPath}\nUruchom najpierw: npm run build:wasm`
    );
  }

  const wasmBuffer = fs.readFileSync(wasmPath);

  // ---- GRANICA SANDBOX ----
  // WASM woła tę funkcję, przekazując wskaźniki do stringów w swojej pamięci.
  // Host odczytuje stringi przez __getString(), waliduje ścieżkę, i zapisuje.
  // Rzutowanie przez unknown potrzebne, bo loader typuje env tylko
  // z wbudowanymi funkcjami AssemblyScript (abort, trace itp.).
  const hostImports = {
    env: {
      hostWriteFile(filePathPtr: number, contentPtr: number): number {
        // wasmExports jest ustawiony przed pierwszym wywołaniem tej funkcji
        const filePath = wasmExports!.__getString(filePathPtr);
        const content  = wasmExports!.__getString(contentPtr);

        if (!isAllowedPath(filePath)) {
          console.error(
            `[WASM Sandbox] ZABLOKOWANO: zapis do "${filePath}" jest poza ${WORKSPACE}`
          );
          return -1; // odmowa — poza sandbox
        }

        try {
          const dir = path.dirname(filePath);
          if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
          fs.writeFileSync(filePath, content, 'utf-8');
          console.log(`[WASM Sandbox] Dozwolono zapis: ${filePath}`);
          return 0; // sukces
        } catch (err) {
          console.error(`[WASM Sandbox] Błąd zapisu: ${err}`);
          return -2; // błąd I/O
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
    throw new Error('Moduł WASM nie jest zainicjalizowany. Wywołaj initWasm() najpierw.');
  }
  return wasmExports;
}

// Dodaje wiadomość do historii przechowywanej w pamięci WASM.
// Stringi są alokowane w izolowanej pamięci WASM przez __newString().
export function wasmAddMessage(role: string, content: string): void {
  const e = getExports();
  // __pin zapobiega usunięciu obiektu przez GC WASM podczas wywołania
  const rolePtr    = e.__pin(e.__newString(role));
  const contentPtr = e.__pin(e.__newString(content));
  try {
    e.addMessage(rolePtr, contentPtr);
  } finally {
    e.__unpin(rolePtr);
    e.__unpin(contentPtr);
  }
}

// Pobiera historię jako JSON string z pamięci WASM.
export function wasmGetHistory(): string {
  const e = getExports();
  const ptr = e.getHistoryJson();   // wskaźnik do stringa w pamięci WASM
  return e.__getString(ptr);        // odczyt przez loader
}

// Czyści historię w pamięci WASM.
export function wasmClearHistory(): void {
  getExports().clearHistory();
}

// Zwraca liczbę wiadomości w historii WASM.
export function wasmGetMessageCount(): number {
  return getExports().getMessageCount();
}

// Zapisuje historię do pliku — WYŁĄCZNIE przez sandbox.
// Ścieżka musi wskazywać na C:/workspace/, inaczej zostanie zablokowana.
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
