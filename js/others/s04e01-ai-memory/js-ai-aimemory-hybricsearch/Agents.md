# Hybrid Memory Search — Propozycja projektu

## Czym to jest?

Wyobraź sobie bibliotekarza, który zna dwa triki:

- **BM25** — liczy słowa kluczowe, jak klasyczna wyszukiwarka
- **Vector Search** — rozumie znaczenie, jak człowiek

**Hybrid Search** = oba triki naraz. To co najlepsze z obu światów.

---

## Co pokaże ten demo?

Aplikacja CLI, gdzie wpisujesz pytanie i widzisz trzy wyniki obok siebie:

| Metoda | Jak działa | Znajduje |
|--------|-----------|---------|
| BM25 | Liczy pasujące słowa | Dokładne dopasowania słów kluczowych |
| Vector Search | Porównuje znaczenie | Teksty podobne semantycznie |
| Hybrid | Wynik BM25 + wynik wektorowy | To co najlepsze z obu |

Na końcu AI (przez OpenRouter) czyta top wyniki i daje ostateczną odpowiedź.

---

## Przepływ użytkownika

```
Select an option:
  1. password policy          <- BM25 wins (exact keyword match)
  2. who is allowed to login? <- Vector wins (no keyword overlap)
  3. data security rules      <- Hybrid wins (keywords + meaning together)
  4. Type your own query
  0. Exit

--- Option 1: "password policy"  →  BM25 wins ---
Query contains exact words from the database. BM25 scores them perfectly.
Vector search drifts to loosely related topics.

[BM25 results]                  [Vector results]             [Hybrid results]
1. "Password policy updated"    1. "Encryption standards"    1. "Password policy updated"
2. "Password must be 12 chars"  2. "Data retention rules"    2. "Password must be 12 chars"
3. "Policy review schedule"     3. "User account lifecycle"  3. "Encryption standards"

[AI Answer] Based on the top results: passwords must be at least 12 characters...

---

--- Option 2: "who is allowed to login?"  →  Vector wins ---
No keyword overlap with the database. BM25 finds nothing useful.
Vector understands the meaning: "login" = "authentication" = "access".

[BM25 results]                  [Vector results]             [Hybrid results]
1. "Login attempt logged"       1. "Only admins may access"  1. "Only admins may access"
2. "Policy login section"       2. "Two-factor auth required" 2. "Two-factor auth required"
3. "User login form"            3. "Role-based access control" 3. "Role-based access control"

[AI Answer] Based on the top results: only admins with 2FA enabled may log in...

---

--- Option 3: "data security rules"  →  Hybrid wins ---
Partial keyword match ("security", "rules") + semantic meaning ("data protection").
BM25 misses semantic variants. Vector misses exact rule documents. Hybrid gets both.

[BM25 results]                  [Vector results]             [Hybrid results]
1. "Security rules v2"          1. "Data encryption policy"  1. "Security rules v2"
2. "Access rules updated"       2. "GDPR compliance guide"   2. "Data encryption policy"
3. "Network security policy"    3. "Backup retention policy" 3. "GDPR compliance guide"

[AI Answer] Based on the top results: data must be encrypted at rest and comply with GDPR...

---

> 0
Goodbye!
```

---

## Rekomendowany model AI

| Rola | Model | Dlaczego |
|------|-------|---------|
| Generowanie odpowiedzi | `google/gemini-flash-1.5` via OpenRouter | Szybki, tani, świetny do demo |
| Embeddingi | `Xenova/all-MiniLM-L6-v2` (lokalny, przez `@xenova/transformers`) | Darmowy, bez klucza API, działa w Node.js |

> OpenRouter nie obsługuje endpointów embeddingów — lokalny model rozwiązuje ten problem bez dodatkowego API.

---

## Stack technologiczny

| Warstwa | Narzędzie |
|---------|----------|
| Język | TypeScript (strict) |
| LLM | OpenRouter (`google/gemini-flash-1.5`) |
| Embeddingi | `@xenova/transformers` (lokalny) |
| BM25 | `wink-bm25-text-search` |
| CLI | `readline` (wbudowany w Node.js) |
| Logowanie | Własny logger → katalog `logs/` |

---

## Struktura projektu

```
js-ai-aimemory-hybricsearch/
├── src/
│   ├── prompts/
│   │   └── answerPrompt.ts       <- prompt wysyłany do LLM przez OpenRouter
│   ├── services/
│   │   ├── bm25Search.ts         <- wyszukiwanie po słowach kluczowych
│   │   ├── vectorSearch.ts       <- wyszukiwanie na podstawie embeddingów
│   │   ├── hybridSearch.ts       <- łączy oba wyniki
│   │   └── openRouterClient.ts   <- wywołuje OpenRouter API
│   └── utils/
│       ├── logger.ts             <- zapisuje logi do katalogu logs/
│       └── display.ts            <- formatuje wyniki w kolumnach w CLI
├── logs/
├── config.json                   <- nazwa modelu, top-k, wagi wyników
├── .env                          <- OPENROUTER_API_KEY
├── .env.example
├── Agents.md                     <- ten plik
└── Readme.md
```

---

## Kształt config.json

```json
{
  "model": "google/gemini-flash-1.5",
  "embeddingModel": "Xenova/all-MiniLM-L6-v2",
  "topK": 3,
  "hybridWeights": {
    "bm25": 0.4,
    "vector": 0.6
  }
}
```

---

## Baza danych pamięci

Tablica ~30 krótkich zdań w `src/services/memoryDb.ts`:

- Polityki firmowe
- Fakty techniczne
- Osoby i role

To jest "pamięć AI" — to co system wie i po czym może szukać.

---

## Kluczowe pojęcia w demo

| Pojęcie | Gdzie widoczne |
|---------|---------------|
| Wyszukiwanie słów kluczowych vs semantyczne | Wyniki obok siebie w CLI |
| Łączenie wyników hybrid | `hybridSearch.ts` |
| RAG (Retrieval-Augmented Generation) | Top wyniki przekazane do LLM |
| Pamięć AI jako dane strukturalne | `memoryDb.ts` |

---

## Dlaczego ten model?

`google/gemini-flash-1.5` na OpenRouter:

- ~$0.075 za 1M tokenów wejściowych
- Szybki czas odpowiedzi
- Dobre rozumowanie przy zadaniach podsumowujących
- Nie potrzeba dużych możliwości — retrieval robi całą ciężką robotę

---

## Czego się nauczysz uruchamiając to demo

1. BM25 znajdzie "bezpieczeństwo" gdy wpiszesz "bezpieczeństwo" — nawet jeśli znaczenie się różni
2. Vector znajdzie "kontrola dostępu" gdy wpiszesz "kto może się zalogować?" — bez wspólnych słów
3. Hybrid łączy to co najlepsze z obu podejść
4. LLM czyta tylko pobrane wyniki — nie halucynuje z własnej pamięci
