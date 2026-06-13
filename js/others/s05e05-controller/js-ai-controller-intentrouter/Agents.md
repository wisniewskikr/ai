# Intent Router — propozycja projektu demo

## Czym jest Intent Router?

Wyobraź sobie bibliotekę z trzema działami: **encyklopedią**, **drzewem genealogicznym** i **streszczeniem całej wiedzy**.
Bibliotekarz (agent) słyszy pytanie i decyduje, do którego działu Cię skierować.
To właśnie robi Intent Router.

---

## Trzy typy pytań

| Typ | Pytanie przykładowe | Gdzie szukamy |
|-----|---------------------|---------------|
| **Podobienstwo** | "Kto jest podobny do Anny?" | Similarity Engine (porownanie opisow tekstowych) |
| **Relacja** | "Kto raportuje do Jana?" | Graf (chodzimy po polaczeniach) |
| **Globalne** | "Jak wyglada struktura calej firmy?" | GraphRAG (czytamy streszczenie) |

---

## Architektura — jak to dziala?

```
Pytanie uzytkownika
        |
        v
  [Intent Router]  <-- OpenRouter LLM klasyfikuje typ pytania
        |
   -----+------+----------+
   |           |          |
   v           v          v
Similarity   Graf      GraphRAG
Engine      (relacje)  (globalne)
(podobne)              streszczenie
   |           |          |
   +-----+-----+----------+
         |
         v
    Odpowiedz CLI
```

---

## Stack techniczny

| Warstwa | Technologia | Uwaga |
|---------|-------------|-------|
| Jezyk | TypeScript (Node.js) | strict mode |
| LLM / routing | OpenRouter API | klasyfikacja intencji |
| Similarity Engine | symulowany in-memory | word overlap / keyword scoring na opisach tekstowych |
| Graf | symulowany in-memory | adjacency list (`Map`) |
| GraphRAG | symulowany in-memory | gotowe streszczenie jako string |
| CLI | `readline` (wbudowany) | bez zewnetrznych zaleznosci |

> Demo = prawdziwy routing przez LLM, symulowane bazy danych.
> Celem jest pokazanie mechanizmu, nie infrastruktury.

> **Uwaga do Similarity Engine:** Cosine similarity bez prawdziwych embeddingów to tak naprawdę porównanie słów kluczowych, nie wektorów. Silnik jest nazwany `similarityEngine` (nie `vectorEngine`), żeby nie wprowadzać w błąd. Chcesz prawdziwych embeddingów? Podłącz `text-embedding-3-small` przez OpenRouter — wystarczy zamienić funkcję scoringową.

---

## Dane testowe (in-memory)

Prosta "firma" z pracownikami:

```
Anna (CEO)
├── Jan (CTO)
│   ├── Piotr (Dev)
│   └── Maria (Dev)
└── Ewa (CFO)
    └── Tomasz (Accountant)
```

Kazdy pracownik ma opis tekstowy (do similarity search) i polaczenia w grafie (do relacji).

---

## CLI — opcje menu

```
=== Intent Router Demo ===

Select an option:
  1. [Similarity]  Who is most similar to Anna?
  2. [Similarity]  Find someone with leadership skills
  3. [Relation]    Who reports to Jan?
  4. [Relation]    What is the path between Piotr and Ewa?
  5. [Global]      Describe the overall company structure
  6. [Global]      What are the main departments and their responsibilities?
  7. [Custom]      Type your own question
  0. Exit
```

- Opcje 1-6: pytania z gory zdefiniowane, pokazuja kazdy typ routingu
- Opcja 7: uzytkownik wpisuje wlasne pytanie — LLM klasyfikuje i kieruje
- Opcja 0: wyjscie + `rl.close()` (graceful shutdown)

Dla opcji 1-6 znamy z gory oczekiwany typ intencji — dlatego CLI pokazuje weryfikacje:

```
> You selected: "Who reports to Jan?"
> Expected intent:  relation
> Detected intent:  relation
> Verdict:          CORRECT
>
> Result (graph engine): Jan -> Piotr, Jan -> Maria
```

Jesli LLM sie pomyli:

```
> You selected: "Describe the overall company structure"
> Expected intent:  global
> Detected intent:  similarity    <-- pomylka modelu
> Verdict:          WRONG (expected: global)
>
> Result (similarity engine): Anna - CEO, leadership score: 0.91 ...
```

Dzieki temu uzytkownik widzi na zywo, jak dobrze (lub zle) LLM klasyfikuje intencje.

---

## Przeplyw dla opcji 7 (custom)

```
1. Uzytkownik wpisuje pytanie
2. LLM (OpenRouter) klasyfikuje: similarity | relation | global
3. Walidacja odpowiedzi LLM — jesli zwrocil nieznany typ, fallback na "similarity"
4. CLI pokazuje: "Detected intent: [TYP]"  (brak weryfikacji — brak oczekiwanego typu)
5. Wywolanie odpowiedniej funkcji (similarity / graph / summary)
6. Wyswietlenie wyniku z etykieta zrodla
```

---

## Prompt klasyfikacyjny (`classifyIntent.md`)

To najwazniejszy plik w projekcie. Od niego zalezy jakosc routingu.

```markdown
You are an intent classifier. Your job is to read a question and return exactly one word.

## Classes

| Class      | When to use                                              |
|------------|----------------------------------------------------------|
| similarity | Question asks who is most like someone, or find by trait |
| relation   | Question asks about hierarchy, reporting, or path        |
| global     | Question asks about the whole company, structure, summary |

## Examples

Question: "Who is most similar to Anna?"
Answer: similarity

Question: "Who reports to Jan?"
Answer: relation

Question: "Who is on the path between Piotr and Ewa?"
Answer: relation

Question: "Describe the overall company structure"
Answer: global

Question: "What departments exist in the company?"
Answer: global

Question: "Find someone with leadership skills"
Answer: similarity

## Rules

- Return ONLY one word: similarity | relation | global
- No punctuation, no explanation, no extra words
- If unsure, return: similarity

## Question to classify

{{question}}
```

---

## Walidacja odpowiedzi LLM

LLM moze zwrocic niespodziewany string. Zawsze waliduj:

```typescript
const VALID_INTENTS = ["similarity", "relation", "global"] as const;
type Intent = typeof VALID_INTENTS[number];

function parseIntent(raw: string): Intent {
  const normalized = raw.trim().toLowerCase();
  if (VALID_INTENTS.includes(normalized as Intent)) {
    return normalized as Intent;
  }
  logger.warn(`Invalid intent received: "${raw}" — falling back to similarity`);
  return "similarity";
}
```

---

## Struktura plikow

```
project/
├── src/
│   ├── prompts/
│   │   └── classifyIntent.md     # prompt dla LLM — klasyfikacja intencji
│   ├── services/
│   │   ├── router.ts             # klasyfikacja intencji przez OpenRouter
│   │   ├── similarityEngine.ts   # keyword-based similarity search
│   │   ├── graphEngine.ts        # symulowany graf relacji
│   │   └── graphragEngine.ts     # symulowane streszczenie globalne
│   └── utils/
│       ├── logger.ts             # zapis logow do logs/
│       ├── config.ts             # ladowanie config.json i .env
│       └── employees.ts          # dane testowe (in-memory)
├── logs/                         # logi aplikacji (auto-generowane)
├── index.ts                      # CLI, petla menu
├── config.json                   # timeouty, nazwa modelu, limity
├── tsconfig.json                 # TypeScript strict mode
├── package.json                  # zaleznosci i skrypty npm
├── .env                          # OPENROUTER_API_KEY
├── .env.example                  # szablon zmiennych
└── Readme.md                     # dokumentacja po angielsku
```

### Co gdzie trafia?

| Plik | Odpowiedzialnosc |
|------|-----------------|
| `index.ts` | menu CLI, petla, weryfikacja CORRECT/WRONG, graceful shutdown |
| `services/router.ts` | jedno zadanie: wyslij pytanie do LLM, zwroc typ intencji + walidacja |
| `services/*Engine.ts` | kazdy engine robi jedna rzecz: przyjmij pytanie, zwroc wynik |
| `prompts/classifyIntent.md` | edytowalny prompt z few-shot examples, bez dotykania kodu |
| `utils/logger.ts` | zapis do `logs/` w formacie `[YYYY-MM-DD HH:mm:ss] [LEVEL]` |
| `utils/config.ts` | czyta `config.json` + `.env`, eksportuje gotowy obiekt |
| `config.json` | nazwa modelu, timeout, liczba wynikow, retry, log level |

---

## Co pokazuje ten projekt?

| Koncept | Jak jest zilustrowany |
|---------|----------------------|
| Routing Intelligence | LLM decyduje o sciezce, nie if-else |
| Weryfikacja klasyfikacji | dla opcji 1-6: Expected vs Detected + CORRECT/WRONG |
| Trzy typy wyszukiwania | kazdy engine odpowiada inaczej na to samo pytanie |
| Tool Registry (uproszczony) | kazdy engine ma nazwe, opis i funkcje `query()` |
| CLI jako interfejs | prosty, bez frameworkow frontendowych |
| Obsluga bledow LLM | walidacja + fallback gdy model zwroci nieoczekiwany wynik |

---

## Model AI

Zadanie routera to **prosta klasyfikacja 3-opcyjna** (similarity / relation / global).
Nie potrzeba duzego modelu — potrzeba szybkiego i taniego.

### Rekomendacja: `google/gemini-flash-1.5`

| Kryterium | Ocena |
|-----------|-------|
| Szybkosc | bardzo szybki (< 1s dla krotkich promptow) |
| Koszt | jeden z najtanszych w OpenRouter |
| Jakosc klasyfikacji | wysoka dla prostych, dobrze opisanych klas |
| Dostepnosc | stabilny, produkcyjny |

> Analogia: do sortowania listow na trzy kupki nie potrzebujesz profesora — wystarczy bystry praktykant.

### Alternatywy

| Model | Kiedy uzyc |
|-------|------------|
| `meta-llama/llama-3.1-8b-instruct` | jesli chcesz opcji darmowej (free tier) |
| `anthropic/claude-haiku-4-5` | jesli zalezy Ci na przewidywalnosci i stalej jakosci |
| `openai/gpt-4o-mini` | jesli projekt rozrosnie sie o bardziej zlozony routing |

---

## Konfiguracja (`config.json`)

```json
{
  "model": "google/gemini-flash-1.5",
  "requestTimeoutMs": 10000,
  "maxRetries": 2,
  "vectorTopK": 3,
  "logLevel": "info"
}
```

| Pole | Co robi |
|------|---------|
| `model` | latwy do zmiany bez dotykania kodu |
| `requestTimeoutMs` | ile ms czekamy na odpowiedz LLM |
| `maxRetries` | ile razy ponawiac przy timeout (0 = bez retry) |
| `vectorTopK` | ile wynikow zwraca similarity engine |
| `logLevel` | `info` / `warn` / `error` |

---

## Skrypty npm (`package.json`)

```json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "ts-node index.ts"
  }
}
```

Uruchomienie: `npm run dev` (development) lub `npm run build && npm start` (production).

---

## Logowanie

Kazda akcja trafia do `logs/app.log`:

```
[2026-06-13 14:32:01] [INFO]  Selected question: "Who reports to Jan?"
[2026-06-13 14:32:02] [INFO]  Detected intent: relation (expected: relation) — CORRECT
[2026-06-13 14:32:02] [INFO]  Graph engine result: Jan -> Piotr, Jan -> Maria
[2026-06-13 14:32:05] [WARN]  Detected intent: similarity (expected: global) — WRONG
[2026-06-13 14:32:07] [WARN]  Invalid intent received: "vector" — falling back to similarity
[2026-06-13 14:32:10] [ERROR] OpenRouter request failed: timeout after 10000ms, retrying (1/2)
```

---

## Zaleznosci

```json
{
  "dependencies": {
    "openai": "^4.x",
    "dotenv": "^16.x"
  },
  "devDependencies": {
    "typescript": "^5.x",
    "@types/node": "^20.x",
    "ts-node": "^10.x"
  }
}
```

> `openai` obsługuje OpenRouter przez zmiane `baseURL`.
> `dotenv` laduje `.env`.
> `ts-node` pozwala uruchamiac TypeScript bezposrednio w trybie dev.
> TypeScript w strict mode — bledy widoczne w kompilacji, nie w runtime.

---

## Readme.md — zawartosc i styl

Plik w jezyku **angielskim**. Pisany jak dla 5-latka — krotko, prosto, z tabelami i analogiami.

### Sekcje

| Sekcja | Co zawiera |
|--------|------------|
| **What is this?** | 2-3 zdania + analogia bibliotekarza |
| **How it works** | tabela: typ pytania → silnik → przyklad |
| **Requirements** | lista: Node.js >= 20, klucz OpenRouter |
| **Installation** | 3 kroki jako ponumerowana lista |
| **Usage** | jak uruchomic + przykladowe wyjscie CLI |
| **File structure** | drzewo katalogow (skrocone) |
| **Configuration** | tabela pol z `config.json` i ich znaczenie |

### Styl pisania (doc-rules)

- Krotkie zdania — jedno zdanie, jedna mysl
- Tabele zamiast akapitow wszedzie, gdzie to mozliwe
- Analogia na poczatku — "Think of it as a librarian..."
- Zero zbednych slow — jezeli mozna wyrzucic slowo, wyrzuc je

### Przykladowy fragment (sekcja "How it works")

```markdown
## How it works

Think of it as a librarian. You ask a question — the librarian decides which shelf to check.

| Question type | Example | Engine used |
|---------------|---------|-------------|
| Similarity    | "Who is most like Anna?" | Keyword similarity |
| Relation      | "Who reports to Jan?"    | Graph traversal |
| Global        | "Describe the whole company" | GraphRAG summary |

The LLM (via OpenRouter) classifies your question. The right engine answers it.
```
