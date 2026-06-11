# Grounding — demo (TypeScript + OpenRouter)

## Co to jest grounding?

Wyobraz sobie, ze pytasz dwoch ekspertow o to samo. Jesli obaj mowia to samo — mozesz im ufac. Jesli sie roznia — cos jest nie tak. **Grounding to wlasnie to: weryfikacja odpowiedzi przez porownanie dwoch niezaleznych modeli AI oraz zewnetrznego zrodla.**

---

## Jak dziala aplikacja?

```
Pytanie (predefiniowane lub wlasne)
        |
        v
  Model A (gpt-4o-mini)     Model B (gemini-2.0-flash-lite)
        |                         |
        +----------+--------------+
                   | (rownolegly fetch — Promise.all)
                   v
  Structured output         Structured output
  { answer, confidence,     { answer, confidence,
    keywords, language }      keywords, language }
        |                         |
        +----------+--------------+
                   |
                   v
     Warstwa 1: Semantyczne porownanie odpowiedzi
     (keywords overlap, nie proste ===)
                   |
                   v
     Warstwa 2: Wikipedia API
     (wszystkie keywords, coverage score)
                   |
                   v
     Warstwa 3: Self-confidence modeli
     (srednia z pol confidence — niski weight)
                   |
                   v
     Warstwa 4: Arbiter LLM
     (trzeci model ocenia spojnosc wszystkiego)
                   |
                   v
         Finalny confidence score (0.0–1.0)
```

---

## Opcje CLI

| Opcja | Pytanie | Dziedzina | Trudnosc |
|-------|---------|-----------|----------|
| **1** | Ile planet jest w Ukladzie Slonecznym? | Nauka | Latwe |
| **2** | Kto odkryl penicyline? | Nauka | Latwe |
| **3** | Jaka jest stolica Australii? | Geografia | Srednie |
| **4** | Jaki jezyk programowania stworzyl Guido van Rossum? | Technologia | Latwe |
| **5** | W ktorym roku upadlo Cesarstwo Rzymskie? | Historia | Srednie |
| **6** | Ile wynosi predkosc swiatla w prozni (w km/s)? | Fizyka | Srednie |
| **7** | Kto napisal "Zbrodnie i kare"? | Literatura | Srednie |
| **8** | Jaki jest najciezszy pierwiastek naturalnie wystepujacy na Ziemi? | Chemia | Trudne |
| **9** | Wlasne pytanie | — | — |
| **10** | Wyjscie | — | — |

---

## Cztery warstwy weryfikacji

Kazda warstwa dodaje pewnosc. Razem daja finalny confidence score.

| Warstwa | Co sprawdza? | Jak? | Weight |
|---------|-------------|------|--------|
| **1. Multi-model** | Czy oba modele odpowiadaja to samo? | Semantyczne porownanie — keywords overlap, nie `===` | 35% |
| **2. Wikipedia API** | Czy zewnetrzne zrodlo potwierdza odpowiedz? | Coverage score: ile keywords pojawia sie w artykule | 35% |
| **3. Self-confidence** | Czy modele same sa pewne swoich odpowiedzi? | Srednia z pola `confidence` (0.0–1.0) — niski weight bo modele zawyzzaja | 10% |
| **4. Arbiter LLM** | Czy pytanie + obie odpowiedzi + Wikipedia tworza spojny obraz? | Lekki model (Haiku) jako sedzia | 20% |

### Dlaczego semantyczne porownanie zamiast ===?

Model A moze odpowiedziec: `"Alexander Fleming odkryl penicyline w 1928 roku"`
Model B moze odpowiedziec: `"Alexander Fleming"`

Oba sa poprawne — ale proste porownanie stringow powie `NIE`. Dlatego:

```
answersMatch(a, b):
  1. Wyodrebnij keywords z obu odpowiedzi
  2. Policz overlap (czesc wspolna / suma)
  3. Jesli overlap >= threshold (np. 0.5) → ZGODNE
```

### Dlaczego Wikipedia coverage score?

Samo sprawdzenie `keywords[0]` to za malo — jesli model ustawi zly pierwszy keyword, cala weryfikacja pada.

```
wikipeAdiaScore(keywords, articleText):
  1. Wyszukaj artykul dla keywords[0], potem keywords[1], itd.
     (az do pierwszego trafienia)
  2. Sprawdz ile z keywords[0..n] pojawia sie w tekscie artykulu
  3. coverage = znalezione / wszystkie keywords
  4. Jesli coverage >= 0.5 → POTWIERDZONE
```

### Finalny confidence score

```
score = (layer1 * 0.35) + (layer2 * 0.35) + (layer3 * 0.10) + (layer4 * 0.20)
```

| Wynik | Score |
|-------|-------|
| Wysoki | >= 0.8 |
| Sredni | >= 0.5 |
| Niski | < 0.5 |

> Analogia: dwoch ekspertow mowi to samo, encyklopedia sie zgadza, a trzeci ekspert-sedzia potwierdza spojnosc — dopiero wtedy mozesz im w pelni ufac.

---

## Structured output — format odpowiedzi modelu

Kazdy model zwraca JSON zamiast czystego tekstu:

```json
{
  "answer": "Alexander Fleming odkryl penicyline w 1928 roku",
  "confidence": 0.95,
  "keywords": ["Alexander Fleming", "penicylina", "1928"],
  "language": "pl"
}
```

- **`answer`** — odpowiedz modelu
- **`confidence`** — pewnosc modelu (0.0–1.0), deklarowana przez model
- **`keywords`** — slowa kluczowe do weryfikacji w Wikipedii
- **`language`** — jezyk odpowiedzi (normalizacja: oba modele musza odpowiadac w tym samym jezyku co pytanie)

> Pole `language` zapobiega sytuacji, gdy Model A odpowiada po polsku, a Model B po angielsku — wtedy semantyczne porownanie failuje z powodu jezyka, nie merytoryki.

---

## Robustness — co gdy cos sie wysypie?

| Problem | Rozwiazanie |
|---------|-------------|
| API nie odpowiada | Timeout 10s + 2 retry z exponential backoff |
| Wikipedia niedostepna | Layer 2 = `null`, score liczony bez tej warstwy (redistribute weights) |
| Model zwraca niepoprawny JSON | Retry z promptem przypominajacym o formacie |
| Ta sama odpytanie drugi raz | Cache w pamieci (Map) — unika ponownych wywolan API |
| Modele odpowiadaja w roznych jezykach | Wykryj jezyk z pola `language`, przetlumacz keywords przed porownaniem |

---

## Stack

| Element | Technologia |
|---------|-------------|
| Jezyk | TypeScript |
| Model A | `openai/gpt-4o-mini` (przez OpenRouter) |
| Model B | `google/gemini-2.0-flash-lite` (przez OpenRouter) |
| Model Arbiter (Layer 4) | `anthropic/claude-haiku-4-5` (przez OpenRouter) |
| Structured output | `response_format: { type: "json_object" }` w OpenRouter API |
| Weryfikacja zewnetrzna | Wikipedia REST API (darmowe, bez klucza) |
| Rownolegle wywolania | `Promise.all` dla Model A i Model B |
| CLI | `readline` (wbudowane w Node.js) |
| Cache | `Map<string, CachedResult>` w pamieci |
| Output | tabela w terminalu |

### Dlaczego te modele?

Kluczowa zasada: **modele musza pochodzic od roznych firm** — inaczej grounding nie ma sensu (te same dane treningowe = te same bledy).

| | Model A | Model B | Arbiter |
|--|---------|---------|---------|
| **Nazwa** | `openai/gpt-4o-mini` | `google/gemini-2.0-flash-lite` | `anthropic/claude-haiku-4-5` |
| **Firma** | OpenAI | Google | Anthropic |
| **Rola** | Odpowiedz | Odpowiedz | Ocena spojnosci |
| **JSON mode** | Tak | Tak | Tak |

> Analogia: pytasz o fakt amerykanskiego, europejskiego i azjatyckiego eksperta. Jesli wszyscy trojej sie zgadzaja — masz naprawde solidna podstawe.

---

## Struktura projektu

```
project/
├── src/
│   ├── prompts/
│   │   ├── verify.ts         # prompt do structured output (answer, confidence, keywords, language)
│   │   └── arbiter.ts        # prompt dla Layer 4 — arbiter LLM
│   ├── services/
│   │   ├── openrouter.ts     # klient OpenRouter API (z timeout + retry)
│   │   ├── wikipedia.ts      # klient Wikipedia REST API (coverage score, keyword fallback)
│   │   ├── verifier.ts       # wywoluje oba modele rownolegly (Promise.all)
│   │   ├── comparator.ts     # semantyczne porownanie odpowiedzi (keywords overlap)
│   │   ├── arbiter.ts        # Layer 4 — wywolanie modelu-arbitra
│   │   ├── scorer.ts         # liczy finalny confidence score (4 warstwy, weighted)
│   │   └── cache.ts          # cache w pamieci (Map) dla powtarzajacych sie pytan
│   └── utils/
│       ├── cli.ts            # menu glowne, petla CLI
│       └── logger.ts         # zapis logow do logs/
├── tests/
│   ├── comparator.test.ts    # testy dla semantycznego porownania
│   ├── scorer.test.ts        # testy dla weighted score
│   └── wikipedia.test.ts     # testy dla coverage score
├── logs/                     # logi aplikacji (auto-generowane)
├── config.json               # modele, progi confidence, lista 8 pytan
├── index.ts                  # punkt wejscia
├── .env                      # OPENROUTER_API_KEY (nie commituj!)
├── .env.example              # szablon zmiennych srodowiskowych
└── Readme.md                 # dokumentacja w jezyku angielskim
```

### config.json — co przechowuje?

```json
{
  "models": {
    "modelA": "openai/gpt-4o-mini",
    "modelB": "google/gemini-2.0-flash-lite",
    "arbiter": "anthropic/claude-haiku-4-5"
  },
  "confidence": {
    "highThreshold": 0.8,
    "mediumThreshold": 0.5
  },
  "weights": {
    "layer1": 0.35,
    "layer2": 0.35,
    "layer3": 0.10,
    "layer4": 0.20
  },
  "verification": {
    "keywordOverlapThreshold": 0.5,
    "wikipediaCoverageThreshold": 0.5,
    "timeoutMs": 10000,
    "maxRetries": 2
  },
  "questions": [
    { "id": 1, "question": "Ile planet jest w Ukladzie Slonecznym?", "domain": "Nauka", "difficulty": "Latwe" },
    { "id": 2, "question": "Kto odkryl penicyline?", "domain": "Nauka", "difficulty": "Latwe" }
  ]
}
```

### logs/ — format logow

```
[2026-06-10 14:32:01] [INFO]  Question: Who discovered penicillin?
[2026-06-10 14:32:01] [INFO]  Cache: MISS
[2026-06-10 14:32:02] [INFO]  gpt-4o-mini responded (confidence: 0.97, language: en)
[2026-06-10 14:32:02] [INFO]  gemini-lite responded (confidence: 0.91, language: en)
[2026-06-10 14:32:02] [INFO]  Layer 1 — keywords overlap: 0.80 → MATCH
[2026-06-10 14:32:03] [INFO]  Wikipedia: coverage 3/3 keywords → CONFIRMED
[2026-06-10 14:32:03] [INFO]  Layer 3 — avg confidence: 0.94
[2026-06-10 14:32:04] [INFO]  Arbiter: consistent → 0.95
[2026-06-10 14:32:04] [INFO]  Final confidence: 0.89 → HIGH
[2026-06-10 14:32:04] [WARN]  Models disagree — verify manually
[2026-06-10 14:32:04] [ERROR] Wikipedia API unavailable — layer 2 skipped, weights redistributed
```

---

## Przykladowy output — pytanie predefiniowane

```
=== Grounding Demo ===

 [1] How many planets are in the Solar System?         (Science / Easy)
 [2] Who discovered penicillin?                        (Science / Easy)
 [3] What is the capital of Australia?                 (Geography / Medium)
 [4] What programming language did Guido van Rossum create? (Technology / Easy)
 [5] In what year did the Roman Empire fall?           (History / Medium)
 [6] What is the speed of light in a vacuum (km/s)?   (Physics / Medium)
 [7] Who wrote "Crime and Punishment"?                 (Literature / Medium)
 [8] What is the heaviest naturally occurring element? (Chemistry / Hard)
 [9] Custom question
[10] Exit

Select option: 2

Question: Who discovered penicillin?

Layer 1 — Multi-model (semantic):
  gpt-4o-mini : "Alexander Fleming discovered penicillin in 1928"  (confidence: 0.97)
  gemini-lite : "Alexander Fleming"                                 (confidence: 0.91)
  Overlap     : 0.80 → Match YES

Layer 2 — Wikipedia (coverage):
  Query  : "Alexander Fleming" (keyword 1)
  Found  : 3/3 keywords in article → coverage: 1.00
  Result : Confirmed

Layer 3 — Self-confidence:
  Average: 0.94 (weight: 10%)

Layer 4 — Arbiter (claude-haiku):
  Input  : question + both answers + wikipedia excerpt
  Output : consistent → 0.95

---
Weighted score: (0.80*0.35) + (1.00*0.35) + (0.94*0.10) + (0.95*0.20) = 0.90
Final confidence: HIGH (0.90)
```

---

## Przykladowy output — wlasne pytanie

```
Select option: 9

Your question: How many moons does Mars have?

Layer 1 — Multi-model (semantic):
  gpt-4o-mini : "Mars has 2 moons: Phobos and Deimos"  (confidence: 0.98)
  gemini-lite : "2 moons — Phobos and Deimos"           (confidence: 0.96)
  Overlap     : 1.00 → Match YES

Layer 2 — Wikipedia (coverage):
  Query  : "Mars" (keyword 1)
  Found  : 3/3 keywords in article → coverage: 1.00
  Result : Confirmed

Layer 3 — Self-confidence:
  Average: 0.97 (weight: 10%)

Layer 4 — Arbiter (claude-haiku):
  Input  : question + both answers + wikipedia excerpt
  Output : consistent → 0.98

---
Weighted score: (1.00*0.35) + (1.00*0.35) + (0.97*0.10) + (0.98*0.20) = 0.99
Final confidence: HIGH (0.99)
```

---

## Readme.md — struktura i styl

Plik `Readme.md` w jezyku **angielskim**, pisany prosto i zwiezle (zasady: krotko, tabele, punkty, analogie tam gdzie mozliwe).

### Sekcje

| Sekcja | Zawartosc |
|--------|-----------|
| **What is this?** | Jednozdaniowy opis — czym jest grounding i co robi aplikacja |
| **How it works** | Cztery warstwy weryfikacji w punktach |
| **Requirements** | Node.js >= 18, klucz OpenRouter API |
| **Installation** | 3 kroki: clone, `npm install`, skopiuj `.env.example` do `.env` |
| **Run** | `npm start` |
| **File structure** | Tabela z plikami i ich rolami |
| **Configuration** | Co mozna zmienic w `config.json` (modele, progi, wagi, pytania) |

### Przykladowa tresc sekcji "What is this?"

> AI answers with confidence — but sometimes it's just guessing.
> This app asks two models the same question, cross-checks with Wikipedia,
> and uses a third model as a judge — then shows you how sure we really are.

---

## Dlaczego bez ground truth?

- Realistyczny scenariusz — w produkcji rzadko znamy "prawdziwa odpowiedz" z gory
- Cztery niezalezne warstwy weryfikacji zamiast jednej
- Uczy intuicji: **roznica miedzy modelami = sygnal do sprawdzenia**
- Wikipedia jako darmowe, zewnetrzne zrodlo faktow — bez zadnego API key
- Semantyczne porownanie zamiast string-matching — odporne na rozne style odpowiedzi
