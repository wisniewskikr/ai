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
> Co wiesz o politykach bezpieczeństwa?

[Wyniki BM25]              [Wyniki Vector]           [Wyniki Hybrid]
1. "Polityka bezp..."      1. "Kontrola dostępu..."  1. "Polityka bezp..."
2. "Aktualizacja pol..."   2. "Ochrona danych..."    2. "Kontrola dostępu..."
3. "Zasady dostępu..."     3. "Aktualizacja pol..."  3. "Ochrona danych..."

[Odpowiedź AI] Na podstawie znalezionych wyników: ...
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
