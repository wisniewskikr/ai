# Kompresja kontekstu w modelach językowych (LLM)

Wyobraź sobie, że model językowy to człowiek z bardzo małą **kartką papieru** — może zapamiętać tylko tyle, ile się na niej zmieści. Kompresja kontekstu to sposób, żeby na tej kartce zmieściło się więcej ważnych rzeczy.

---

## Podstawowe typy

### 1. Podsumowanie (Summarization)
**Analogia:** Czytasz grubą książkę, ale na kartce możesz zapisać tylko najważniejsze punkty, nie każde zdanie.

Model "czyta" starą część rozmowy i zastępuje ją krótkim podsumowaniem. Szczegóły giną, ale sens zostaje.

**Narzędzia JavaScript:**

| Narzędzie | Opis |
|-----------|------|
| **LangChain.js** (`langchain`) | Wbudowany `ConversationSummaryMemory` — automatycznie podsumowuje historię czatu po przekroczeniu limitu tokenów |
| **LlamaIndex.TS** (`llamaindex`) | `SummaryChatMemoryBuffer` — zarządza oknem pamięci przez podsumowywanie starszych wiadomości |
| **Vercel AI SDK** (`ai`) | Brak wbudowanego, ale łatwo zaimplementować własny hook `onFinish` do podsumowania i zapisu do stanu |
| **mem0** (`mem0ai`) | Chmurowa usługa pamięci z automatycznym streszczaniem historii konwersacji |

---

### 2. Wyrzucanie (Truncation)
**Analogia:** Szuflada jest pełna — wyrzucasz najstarsze rysunki, żeby zmieścić nowe.

Najstarsze wiadomości są po prostu usuwane. Proste, ale traci się historię.

**Narzędzia JavaScript:**

| Narzędzie | Opis |
|-----------|------|
| **LangChain.js** | `BufferWindowMemory` — trzyma ostatnie N wiadomości, resztę odrzuca |
| **Vercel AI SDK** | Funkcja pomocnicza `trimMessages()` do przycinania tablicy wiadomości przed wysłaniem do API |
| **tiktoken** (`js-tiktoken`) | Liczy tokeny — pozwala samemu wyciąć wiadomości przekraczające limit przed wywołaniem modelu |
| **Implementacja własna** | Prosta metoda: `messages.slice(-N)` lub filtrowanie według liczby tokenów |

---

### 3. Wybieranie ważnych fragmentów (RAG / Retrieval)
**Analogia:** Masz wielki segregator z notatkami, ale na biurko kładziesz tylko te kartki, które są potrzebne DO TEGO zadania.

Zamiast wciskać wszystko, model "sięga" do zewnętrznej bazy i pobiera tylko to, co jest teraz relevantne.

**Narzędzia JavaScript:**

| Narzędzie | Opis |
|-----------|------|
| **LangChain.js** | Pełny ekosystem RAG: `VectorStoreRetriever`, integracje z Pinecone, Chroma, Weaviate, pgvector |
| **LlamaIndex.TS** | Specjalizuje się w RAG — `VectorStoreIndex`, `QueryEngine`, parsowanie dokumentów |
| **Vercel AI SDK** | Funkcja `embed()` + `cosineSimilarity()` do budowania własnego prostego RAG |
| **Pinecone SDK** (`@pinecone-database/pinecone`) | Wektorowa baza danych — przechowuje i wyszukuje embeddingi |
| **Chroma** (`chromadb`) | Lokalna wektorowa baza danych, dobra do prototypowania |
| **pgvector** + **Drizzle/Prisma** | RAG oparty na PostgreSQL — embeddingi trzymane razem z danymi aplikacji |

---

### 4. Kompresja tokenów (Token Compression / KV Cache Merging)
**Analogia:** Zamiast pisać "Ala ma kota i Ala lubi kota i kot jest Ali" — piszesz po prostu "Ala ma kota, który jej się podoba."

Model łączy podobne, powtarzające się fragmenty w jeden, krótszy zapis.

**Narzędzia JavaScript:**

| Narzędzie | Opis |
|-----------|------|
| **LLMLingua** (port JS) | Algorytm kompresji promptów — usuwa nieistotne tokeny zachowując sens (głównie Python, ale dostępne przez API) |
| **Anthropic API — prompt caching** | Mechanizm `cache_control` w API Claude — nie kompresuje, ale cachuje powtarzające się fragmenty (system prompt, dokumenty) po stronie serwera, znacząco obniżając koszt i czas |
| **OpenAI Predicted Outputs** | Podobny mechanizm po stronie OpenAI dla powtarzalnych odpowiedzi |
| **tiktoken** / **gpt-tokenizer** | Liczenie tokenów — pomaga ręcznie wykryć i scalić powtórzenia przed wysłaniem |

---

### 5. Hierarchiczna pamięć (Memory Tiers)
**Analogia:** Masz pamięć krótkotrwałą (co jadłeś dziś rano), długotrwałą (że lubisz pizzę) i notatnik (gdzie zapisujesz ważne rzeczy).

Różne informacje trafiają do różnych "miejsc" — ostatnia rozmowa jest blisko, stare fakty gdzieś dalej, a kluczowe rzeczy są zapisane osobno.

**Narzędzia JavaScript:**

| Narzędzie | Opis |
|-----------|------|
| **mem0** (`mem0ai`) | Gotowy system pamięci trójwarstwowej: krótkotrwała (in-context), długotrwała (wektorowa), semantyczna (grafowa) |
| **LangChain.js** | Kompozycja: `BufferMemory` (krótka) + `VectorStoreMemory` (długa) + zewnętrzny store (Redis/Postgres) |
| **Zep** (`@getzep/zep-js`) | Dedykowana usługa pamięci konwersacyjnej z ekstrakcją faktów, podsumowaniem i wyszukiwaniem semantycznym |
| **Upstash Redis** (`@upstash/redis`) | Warstwa szybkiej pamięci krótkotrwałej (session-level) — bezserwerowy Redis |
| **Supabase** + **pgvector** | Warstwa długotrwała: relacyjne dane użytkownika + wektorowe embeddingi w jednej bazie |
| **LlamaIndex.TS** | `ChatMemoryBuffer` (krótka) + `VectorIndex` (długa) do zbudowania własnej hierarchii |

---

## Podsumowanie

| Typ | Co robi | Narzędzie JS (polecane) |
|-----|---------|------------------------|
| Podsumowanie | Skraca stare fragmenty | LangChain.js `ConversationSummaryMemory`, mem0 |
| Truncation | Usuwa najstarsze fragmenty | Vercel AI SDK `trimMessages()`, własne `slice()` |
| RAG | Dobiera tylko potrzebne fragmenty | LlamaIndex.TS, LangChain.js + Pinecone |
| Kompresja tokenów | Scala powtórzenia | Anthropic Prompt Caching, LLMLingua |
| Hierarchiczna pamięć | Sortuje info według ważności | mem0, Zep, LangChain.js kompozycja |

Każda metoda to kompromis: **szybkość vs. dokładność vs. koszt**.

---

## Observational Memory (Mastra)

**Observational Memory (OM)** to system pamięci od frameworka [Mastra](https://mastra.ai) — dwuagentowy pipeline inspirowany tym, jak człowiek przetwarza i zapamiętuje informacje. Osiągnął **94.87% na benchmarku LongMemEval** (najlepszy wynik spośród znanych systemów).

### Jak działa

Dwa agenty działają w tle i zarządzają oknem kontekstu:

**Observer** — obserwuje surowe wiadomości. Gdy historia przekroczy ~30 000 tokenów, kompresuje je w zwięzłe notatki-obserwacje i usuwa oryginalne wiadomości.

**Reflector** — obserwuje narastające obserwacje. Gdy przekroczą ~40 000 tokenów, łączy powiązane notatki, usuwa zdezaktualizowane informacje i kondensuje całość.

```
Wiadomości  →  [Observer]  →  Obserwacje  →  [Reflector]  →  Skondensowane obserwacje
  (raw)        (30k limit)   (dense notes)    (40k limit)      (restructured log)
```

### Gdzie wpisuje się w klasyfikację

| Komponent | Odpowiada typowi | Dlaczego |
|-----------|-----------------|----------|
| **Observer** | Podsumowanie + Truncation | Zamienia wiadomości w notatki, a oryginały usuwa |
| **Reflector** | Kompresja tokenów + Hierarchiczna pamięć | Scala powtórzenia, buduje warstwę wyższego rzędu nad obserwacjami |

### Co wyróżnia OM na tle klasycznych metod

| Cecha | Klasyczne podejścia | Observational Memory |
|-------|--------------------|--------------------|
| Pobieranie kontekstu | Dynamiczne (RAG co turę) | Statyczne — kontekst stabilny między turami |
| Prompt caching | Trudne (zmienny kontekst) | Naturalne — stabilny prefiks jest cacheowalny |
| Kompresja tool calls | Brak | 5–40x dla workloadów z wieloma wywołaniami narzędzi |
| Kompresja tekstu | — | 3–6x |