# Chatbot TypeScript z lokalnym LLM (Ollama)

Projekt to chatbot napisany w TypeScript, który używa lokalnego modelu AI przez Ollama. Działa bez internetu — model działa na Twoim komputerze, nie w chmurze.

---

## Szybki start

Masz już Ollama? Trzy komendy i działa:

```bash
ollama pull llama3.2
npm install
npm run dev
```

---

## Instalacja Ollama na Windows

### 1. Pobierz instalator

Pobierz plik `OllamaSetup.exe` ze strony **https://ollama.com/download/windows** i uruchom go. Ollama zainstaluje się jako serwis systemowy.

### 2. Sprawdź instalację

```bash
ollama --version
```

Ollama nasłuchuje domyślnie na `http://localhost:11434`.

### 3. Pobierz model

```bash
# Lekkie modele — dobre na start
ollama pull llama3.2        # 2 GB — dobry ogólny model
ollama pull mistral         # 4 GB — bardzo dobry model
ollama pull phi3            # 2.3 GB — szybki, od Microsoft
ollama pull qwen2.5-coder   # 4.7 GB — dobry do kodu

# Lista pobranych modeli
ollama list
```

### 4. Przetestuj w terminalu

```bash
ollama run llama3.2
```

### 5. Sprawdź API

```bash
curl http://localhost:11434/api/tags
```

### 6. Usuń model

```bash
# Usuń konkretny model
ollama rm llama3.2

# Sprawdź, co zostało
ollama list
```

Pliki modeli są domyślnie przechowywane w:
```
C:\Users\<TwójUser>\.ollama\models
```
Możesz je usunąć ręcznie, jeśli chcesz zwolnić miejsce na dysku.

### 7. Odinstaluj Ollama z Windows

1. Otwórz **Ustawienia → Aplikacje → Zainstalowane aplikacje**
2. Znajdź **Ollama** i kliknij **Odinstaluj**

Następnie ręcznie usuń pozostałości:

```bash
# Usuń pliki modeli i konfigurację
rmdir /s /q "%USERPROFILE%\.ollama"
```

Lub w PowerShell:
```powershell
Remove-Item -Recurse -Force "$env:USERPROFILE\.ollama"
```

---

## Wymagania sprzętowe

| Rozmiar modelu | Przykład | RAM | GPU VRAM |
|----------------|----------|-----|----------|
| 3B | llama3.2, phi3 | 4 GB | 3 GB |
| 7B | mistral | 8 GB | 6 GB |
| 13B | codellama:13b | 16 GB | 12 GB |
| 70B | llama3:70b | 64 GB | 48 GB |

> Bez GPU też działa — tylko wolniej. Na start polecam modele 3B.

---

## Ollama vs LM Studio

Jak wybór między samochodem z GPS a bez — oba dowożą, ale inaczej.

| Cecha | Ollama | LM Studio |
|-------|--------|-----------|
| Interfejs | Terminal | Okienko (GUI) |
| Łatwość startu | Średnia | Bardzo łatwa |
| API | Własne + OpenAI | OpenAI |
| Zarządzanie modelami | Komenda w terminalu | Klikasz myszką |
| Wydajność | Bardzo dobra | Bardzo dobra |
| Działa w tle | Tak (automatycznie) | Nie (trzeba uruchomić) |
| Docker | Tak | Nie |
| Open source | Tak | Częściowo |

### Kiedy wybrać?

- **Ollama** — piszesz kod, chcesz API, lubisz terminal
- **LM Studio** — testujesz modele, wolisz klikać niż pisać

---

## Konfiguracja projektu

### Struktura katalogów

```
projekt/
  src/
    index.ts      # pętla czatu (REPL)
    chat.ts       # historia rozmowy + wywołanie modelu
    config.ts     # łączy config.json i .env
  config.json     # ustawienia Ollamy
  .env            # sekrety (klucze API)
  package.json
  tsconfig.json
```

### package.json

```bash
npm init -y
npm install ollama dotenv
npm install -D typescript tsx @types/node
```

```json
{
  "scripts": {
    "dev": "tsx src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  }
}
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "dist",
    "strict": true
  },
  "include": ["src"]
}
```

### config.json

Ustawienia Ollamy — możesz tu swobodnie zmieniać model czy adres serwera:

```json
{
  "ollama": {
    "host": "http://localhost:11434",
    "model": "llama3.2",
    "systemPrompt": "Jesteś pomocnym asystentem. Odpowiadaj krótko i zwięźle."
  }
}
```

### .env

Tylko sekrety — klucze API, których nie wrzucasz do repozytorium:

```env
# OpenRouter (opcjonalne — do przyszłej integracji z modelami chmurowymi)
OPENROUTER_API_KEY=
```

---

## Integracja z TypeScript

Ollama ma oficjalną bibliotekę dla Node.js:

```bash
npm install ollama
```

### config.ts

Czyta ustawienia z `config.json`, a sekrety z `.env`:

```typescript
import "dotenv/config";
import configJson from "../config.json" assert { type: "json" };

export const config = {
  ollama: {
    host: configJson.ollama.host,
    model: configJson.ollama.model,
    systemPrompt: configJson.ollama.systemPrompt,
  },
  openRouter: {
    apiKey: process.env.OPENROUTER_API_KEY ?? "",
  },
};
```

### chat.ts

```typescript
import { Ollama } from "ollama";
import { config } from "./config.js";

const ollama = new Ollama({ host: config.ollama.host });

type Message = { role: "user" | "assistant" | "system"; content: string };

const history: Message[] = [
  { role: "system", content: config.ollama.systemPrompt },
];

export async function chat(userMessage: string): Promise<void> {
  history.push({ role: "user", content: userMessage });

  const stream = await ollama.chat({
    model: config.ollama.model,
    messages: history,
    stream: true,
  });

  let response = "";
  process.stdout.write("\nAsystent: ");

  for await (const chunk of stream) {
    process.stdout.write(chunk.message.content);
    response += chunk.message.content;
  }

  history.push({ role: "assistant", content: response });
  console.log("\n");
}

export function clearHistory(): void {
  history.splice(1); // zostaw system prompt
}
```

### index.ts

```typescript
import * as readline from "readline";
import { chat, clearHistory } from "./chat.js";
import { config } from "./config.js";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log(`Chatbot gotowy. Model: ${config.ollama.model}`);
console.log("Komendy: /exit — wyjście, /clear — nowa rozmowa\n");

const prompt = () => {
  rl.question("Ty: ", async (input) => {
    const text = input.trim();
    if (!text) return prompt();
    if (text === "/exit") { rl.close(); return; }
    if (text === "/clear") { clearHistory(); console.log("Historia wyczyszczona.\n"); return prompt(); }

    await chat(text);
    prompt();
  });
};

prompt();
```

---

## Troubleshooting

| Problem | Przyczyna | Rozwiązanie |
|---------|-----------|-------------|
| `connection refused` na porcie 11434 | Ollama nie działa | `ollama serve` lub uruchom serwis w Ustawieniach Windows |
| Model odpowiada bardzo wolno | Za mało RAM / brak GPU | Użyj mniejszego modelu (3B) |
| `model not found` | Model nie pobrany | `ollama pull llama3.2` |
| Terminal się zawiesza | Brak streamu | Upewnij się, że używasz `stream: true` |
| Port 11434 zajęty | Inny proces | `netstat -ano \| findstr 11434` — znajdź i zamknij proces |
