# Agent AI z WASM Sandbox — ustalenia projektowe

## Cel projektu

Zbudowanie agenta AI (Node.js + OpenRouter) demonstrującego działanie sandboxu typu WebAssembly (WASM).
Moduł I/O (zapis/odczyt historii chatu) jest skompilowany do WASM za pomocą AssemblyScript.

## Stack technologiczny

| Warstwa | Technologia |
|---|---|
| Host / agent | Node.js + TypeScript |
| API modelu AI | OpenRouter |
| WASM module | AssemblyScript |
| Loader WASM | `@assemblyscript/loader` |

## Architektura

```
Node.js Host (TypeScript)
│
├── openrouter.ts    — wywołania OpenRouter API (HTTP)
├── wasmBridge.ts    — ładuje moduł WASM, dostarcza host functions, wykonuje I/O
└── index.ts         — pętla chata (CLI)

WASM Module (AssemblyScript → .wasm)
└── assembly/index.ts
    ├── przechowuje historię chatu w pamięci WASM
    ├── eksportuje: addMessage(), getHistoryJson(), clearHistory()
    └── NIE MA bezpośredniego dostępu do dysku
```

## Zasada sandboxu WASM

WASM nie może samodzielnie czytać ani pisać plików.
Każda operacja I/O musi przejść przez **host functions** — funkcje dostarczone przez hosta (Node.js):

```
WASM wywołuje hostWriteFile()
       ↓
Node.js sprawdza: czy ścieżka jest w C:/workspace?
       ├── TAK → wykonuje zapis
       └── NIE → odrzuca żądanie
```

Host kontroluje, co WASM może zrobić. To jest granica sandboxu.

## Folder roboczy

Historia chatu zapisywana wyłącznie do: `C:/workspace`

## Co demonstruje projekt?

| Concept WASM sandbox | Gdzie widoczny w kodzie |
|---|---|
| Brak dostępu do dysku | `assembly/index.ts` — brak `import fs` |
| Granica sandboxu (host functions) | `wasmBridge.ts` — explicite nadane uprawnienia |
| Izolowana pamięć WASM | własny `ArrayBuffer`, oddzielony od hosta |
| Kontrola ścieżek | host odrzuca ścieżki poza `C:/workspace` |

## Dlaczego nie czysty TypeScript do WASM?

JS/TS nie kompiluje się bezpośrednio do WASM.
**AssemblyScript** to język inspirowany TypeScriptem, który kompiluje się do WASM — jest najbliższym odpowiednikiem dla JS/TS developerów.
