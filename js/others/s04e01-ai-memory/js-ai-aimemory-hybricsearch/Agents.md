# Hybrid Memory Search — Propozycja projektu

## Czym to jest?

Wyobraź sobie bibliotekarza, który zna dwa triki:

- **BM25** — liczy słowa kluczowe, jak klasyczna wyszukiwarka
- **Vector Search** — rozumie znaczenie, jak człowiek

**Hybrid Search** = oba triki naraz. To co najlepsze z obu światów.

---

## Co pokaże ten demo?

Aplikacja CLI, gdzie wpisujesz pytanie i widzisz trzy wyniki obok siebie z surowymi wynikami punktowymi:

| Metoda | Jak działa | Znajduje |
|--------|-----------|---------|
| BM25 | Liczy pasujące słowa | Dokładne dopasowania słów kluczowych |
| Vector Search | Porównuje znaczenie | Teksty podobne semantycznie |
| Hybrid | Znormalizowany BM25 + cosine similarity | To co najlepsze z obu |

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

[BM25 results]                         [Vector results]                      [Hybrid results]
1. [0.91] "Password policy updated"    1. [0.61] "Encryption standards"      1. [0.84] "Password policy updated"
2. [0.87] "Password must be 12 chars"  2. [0.54] "Data retention rules"      2. [0.79] "Password must be 12 chars"
3. [0.72] "Policy review schedule"     3. [0.49] "User account lifecycle"     3. [0.51] "Encryption standards"

[AI Answer] Based on the top results: passwords must be at least 12 characters...

---

--- Option 2: "who is allowed to login?"  →  Vector wins ---
No keyword overlap with the database. BM25 finds nothing useful.
Vector understands the meaning: "login" = "authentication" = "access".

[BM25 results]                         [Vector results]                         [Hybrid results]
1. [0.21] "Login attempt logged"        1. [0.89] "Only admins may access"       1. [0.71] "Only admins may access"
2. [0.18] "Policy login section"        2. [0.85] "Two-factor auth required"     2. [0.68] "Two-factor auth required"
3. [0.14] "User login form"             3. [0.81] "Role-based access control"    3. [0.65] "Role-based access control"

[AI Answer] Based on the top results: only admins with 2FA enabled may log in...

---

--- Option 3: "data security rules"  →  Hybrid wins ---
Partial keyword match ("security", "rules") + semantic meaning ("data protection").
BM25 misses semantic variants. Vector misses exact rule documents. Hybrid gets both.

[BM25 results]                         [Vector results]                      [Hybrid results]
1. [0.78] "Security rules v2"           1. [0.77] "Data encryption policy"   1. [0.81] "Security rules v2"
2. [0.65] "Access rules updated"        2. [0.71] "GDPR compliance guide"    2. [0.76] "Data encryption policy"
3. [0.61] "Network security policy"     3. [0.63] "Backup retention policy"  3. [0.72] "GDPR compliance guide"

[AI Answer] Based on the top results: data must be encrypted at rest and comply with GDPR...

---

> 0
Goodbye!
```

---

## Rekomendowany model AI

| Rola | Model | Dlaczego |
|------|-------|---------|
| Generowanie odpowiedzi | `openai/gpt-4o-mini` via OpenRouter | Tani, przewidywalny w zadaniach RAG, szeroko dostępny |
| Embeddingi | `Xenova/all-MiniLM-L6-v2` (lokalny, przez `@xenova/transformers`) | Darmowy, bez klucza API, działa w Node.js |

> OpenRouter nie obsługuje endpointów embeddingów — lokalny model rozwiązuje ten problem bez dodatkowego API.

> **Pierwsze uruchomienie:** `@xenova/transformers` pobiera model ~80MB. Kolejne uruchomienia korzystają z cache.

---

## Stack technologiczny

| Warstwa | Narzędzie |
|---------|----------|
| Język | TypeScript (strict) |
| LLM | OpenRouter (`openai/gpt-4o-mini`) |
| Embeddingi | `@xenova/transformers` (lokalny) |
| BM25 | Własna implementacja (~50 linii) |
| CLI | `readline` (wbudowany w Node.js) |
| Logowanie | Własny logger → katalog `logs/` |

> BM25 to prosty algorytm — własna implementacja jest bardziej edukacyjna niż zewnętrzna biblioteka i nie dodaje zbędnej zależności.

---

## Struktura projektu

```
js-ai-aimemory-hybricsearch/
├── src/
│   ├── prompts/
│   │   └── answerPrompt.ts       <- prompt wysyłany do LLM przez OpenRouter
│   ├── services/
│   │   ├── bm25Search.ts         <- własna implementacja BM25 (~50 linii)
│   │   ├── vectorSearch.ts       <- wyszukiwanie na podstawie embeddingów (cosine similarity)
│   │   ├── hybridSearch.ts       <- normalizuje oba wyniki i łączy wagami
│   │   └── openRouterClient.ts   <- wywołuje OpenRouter API
│   └── utils/
│       ├── logger.ts             <- zapisuje logi do katalogu logs/
│       └── display.ts            <- formatuje wyniki w kolumnach w CLI
├── data/
│   └── memories.json             <- baza pamięci, edytowalna bez zmiany kodu
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
  "model": "openai/gpt-4o-mini",
  "embeddingModel": "Xenova/all-MiniLM-L6-v2",
  "topK": 3,
  "hybridWeights": {
    "bm25": 0.4,
    "vector": 0.6
  }
}
```

---

## Kształt .env.example

```
OPENROUTER_API_KEY=your_key_here
```

---

## Baza danych pamięci

Plik `data/memories.json` — edytowalny bez dotykania kodu:

```json
[
  "Password policy requires minimum 12 characters.",
  "Only admins may access the production database.",
  "Two-factor authentication is required for all users.",
  "..."
]
```

Kategorie wpisów:

- Polityki firmowe
- Fakty techniczne
- Osoby i role

---

## Normalizacja wyników przed fuzją

BM25 i cosine similarity są na różnych skalach — nie można ich wprost sumować.
`hybridSearch.ts` najpierw normalizuje oba wyniki do przedziału `[0, 1]`, potem stosuje wagi:

```
hybrid_score = (bm25_norm * 0.4) + (vector_norm * 0.6)
```

---

## Kluczowe pojęcia w demo

| Pojęcie | Gdzie widoczne |
|---------|---------------|
| Wyszukiwanie słów kluczowych vs semantyczne | Wyniki z punktami obok siebie w CLI |
| Normalizacja i fuzja wyników | `hybridSearch.ts` |
| RAG (Retrieval-Augmented Generation) | Top wyniki przekazane do LLM |
| Pamięć AI jako dane strukturalne | `data/memories.json` |

---

## Dlaczego ten model?

`openai/gpt-4o-mini` na OpenRouter:

- ~$0.15 za 1M tokenów wejściowych
- Przewidywalny i stabilny w zadaniach RAG
- Nie potrzeba dużych możliwości — retrieval robi całą ciężką robotę

---

## Czego się nauczysz uruchamiając to demo

1. BM25 znajdzie "password policy" gdy wpiszesz "password policy" — nawet jeśli dokument mówi o czymś innym
2. Vector znajdzie "kontrola dostępu" gdy wpiszesz "kto może się zalogować?" — bez wspólnych słów
3. Hybrid łączy to co najlepsze z obu podejść — widać to w wynikach punktowych
4. LLM czyta tylko pobrane wyniki — nie halucynuje z własnej pamięci
