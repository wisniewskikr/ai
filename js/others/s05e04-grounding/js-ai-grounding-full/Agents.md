# Grounding — demo (TypeScript + OpenRouter)

## Co to jest grounding?

Wyobraz sobie, ze pytasz dwoch ekspertow o to samo. Jesli obaj mowia to samo — mozesz im ufac. Jesli sie roznia — cos jest nie tak. **Grounding to wlasnie to: weryfikacja odpowiedzi przez porownanie dwoch niezaleznych modeli AI oraz zewnetrznego zrodla.**

---

## Jak dziala aplikacja?

```
Pytanie (predefiniowane lub wlasne)
        |
        v
  Model A (gpt-4o-mini)     Model B (mistral-7b)
        |                         |
        v                         v
  Structured output         Structured output
  { answer, confidence,     { answer, confidence,
    keywords }                keywords }
        |                         |
        +----------+--------------+
                   |
                   v
     Warstwa 1: Czy odpowiedzi modeli sa zgodne?
                   |
                   v
     Warstwa 2: Wikipedia API
     (szukaj keywords z odpowiedzi)
                   |
                   v
     Warstwa 3: Self-confidence modeli
     (srednia z pol confidence)
                   |
                   v
         Finalny confidence score
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

## Trzy warstwy weryfikacji

Kazda warstwa dodaje pewnosc. Razem daja finalny confidence score.

| Warstwa | Co sprawdza? | Jak? |
|---------|-------------|------|
| **1. Multi-model** | Czy oba modele odpowiadaja tak samo? | Porownanie `answer` z structured output |
| **2. Wikipedia API** | Czy zewnetrzne zrodlo potwierdza odpowiedz? | Szukaj `keywords` z odpowiedzi w Wikipedii |
| **3. Self-confidence** | Czy modele same sa pewne swoich odpowiedzi? | Srednia z pola `confidence` (0.0–1.0) |

### Finalny confidence score

| Wynik | Warunki |
|-------|---------|
| Wysoki | Modele zgodne + Wikipedia potwierdza + sredni confidence >= 0.8 |
| Sredni | Dwa z trzech powyzszych warunkow spelnione |
| Niski | Jeden lub zero warunkow — sprawdz recznie |

> Analogia: dwoch ekspertow mowi to samo, a encyklopedia sie zgadza — mozesz im ufac. Jesli chociaz jedno sie rozni — sprawdz recznie.

---

## Structured output — format odpowiedzi modelu

Kazdy model zwraca JSON zamiast czystego tekstu:

```json
{
  "answer": "Alexander Fleming odkryl penicyline w 1928 roku",
  "confidence": 0.95,
  "keywords": ["Alexander Fleming", "penicylina", "1928"]
}
```

- **`answer`** — odpowiedz modelu
- **`confidence`** — pewnosc modelu (0.0–1.0), deklarowana przez model
- **`keywords`** — slowa kluczowe do weryfikacji w Wikipedii

Wikipedia API dostaje `keywords[0]` jako zapytanie i sprawdza, czy `answer` pokrywa sie z trescia artykulu.

---

## Stack

| Element | Technologia |
|---------|-------------|
| Jezyk | TypeScript |
| Model A | `openai/gpt-4o-mini` (przez OpenRouter) |
| Model B | `google/gemini-2.0-flash-lite` (przez OpenRouter) |
| Structured output | `response_format: { type: "json_object" }` w OpenRouter API |
| Weryfikacja zewnetrzna | Wikipedia REST API (darmowe, bez klucza) |
| CLI | `readline` (wbudowane w Node.js) |
| Output | tabela w terminalu |

### Dlaczego te dwa modele?

Kluczowa zasada: **modele musza pochodzic od roznych firm** — inaczej grounding nie ma sensu (te same dane treningowe = te same bledy).

| | Model A | Model B |
|--|---------|---------|
| **Nazwa** | `openai/gpt-4o-mini` | `google/gemini-2.0-flash-lite` |
| **Firma** | OpenAI | Google |
| **Cena** | $0.15 / 1M tokenow | $0.075 / 1M tokenow |
| **JSON mode** | Tak | Tak |
| **Mocna strona** | Fakty, precyzja | Szerokie dane, aktualnosc |
| **Dane treningowe** | Rozne od Google | Rozne od OpenAI |

> Analogia: pytasz o fakt amerykanskiego i europejskiego eksperta. Jesli obaj mowia to samo — bardziej mozesz im ufac niz gdybys pytal dwoch absolwentow tej samej uczelni.

---

## Struktura projektu

```
project/
├── src/
│   ├── prompts/
│   │   └── verify.ts         # prompt do structured output (answer, confidence, keywords)
│   ├── services/
│   │   ├── openrouter.ts     # klient OpenRouter API
│   │   ├── wikipedia.ts      # klient Wikipedia REST API
│   │   ├── verifier.ts       # wywoluje oba modele, porownuje odpowiedzi
│   │   └── scorer.ts         # liczy finalny confidence score (3 warstwy)
│   └── utils/
│       ├── cli.ts            # menu glowne, petla CLI
│       └── logger.ts         # zapis logow do logs/
├── logs/                     # logi aplikacji (auto-generowane)
├── config.json               # modele, progi confidence, lista 8 pytan
├── index.ts                  # punkt wejscia
├── .env                      # OPENROUTER_API_KEY (nie commituj!)
├── .env.example              # szablon zmiennych srodowiskowych
└── Readme.md                 # dokumentacja w jezyku angielskim (patrz nizej)
```

### config.json — co przechowuje?

```json
{
  "models": {
    "modelA": "openai/gpt-4o-mini",
    "modelB": "google/gemini-2.0-flash-lite"
  },
  "confidence": {
    "highThreshold": 0.8,
    "mediumThreshold": 0.5
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
[2026-06-10 14:32:02] [INFO]  gpt-4o-mini responded (confidence: 0.97)
[2026-06-10 14:32:03] [INFO]  gemini-lite responded (confidence: 0.91)
[2026-06-10 14:32:03] [INFO]  Wikipedia: confirmed
[2026-06-10 14:32:03] [INFO]  Final confidence: HIGH
[2026-06-10 14:32:03] [WARN]  Models disagree — verify manually
[2026-06-10 14:32:03] [ERROR] Wikipedia API unavailable — layer 2 skipped
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

Layer 1 — Multi-model:
  gpt-4o-mini : "Alexander Fleming discovered penicillin in 1928"  (confidence: 0.97)
  gemini-lite : "Alexander Fleming"                                 (confidence: 0.91)
  Match       : YES ✓

Layer 2 — Wikipedia:
  Query  : "Alexander Fleming"
  Result : Confirmed — article contains "penicillin" ✓

Layer 3 — Self-confidence:
  Average: 0.94 ✓

---
Final confidence: HIGH ✓
```

---

## Przykladowy output — wlasne pytanie

```
Select option: 9

Your question: How many moons does Mars have?

Layer 1 — Multi-model:
  gpt-4o-mini : "Mars has 2 moons: Phobos and Deimos"  (confidence: 0.98)
  gemini-lite : "2 moons — Phobos and Deimos"           (confidence: 0.96)
  Match       : YES ✓

Layer 2 — Wikipedia:
  Query  : "Mars"
  Result : Confirmed — article contains "Phobos" and "Deimos" ✓

Layer 3 — Self-confidence:
  Average: 0.97 ✓

---
Final confidence: HIGH ✓
```

---

## Readme.md — struktura i styl

Plik `Readme.md` w jezyku **angielskim**, pisany prosto i zwiezle (zasady: krotko, tabele, punkty, analogie tam gdzie mozliwe).

### Sekcje

| Sekcja | Zawartosc |
|--------|-----------|
| **What is this?** | Jednozdaniowy opis — czym jest grounding i co robi aplikacja |
| **How it works** | Trzy warstwy weryfikacji w punktach |
| **Requirements** | Node.js >= 18, klucz OpenRouter API |
| **Installation** | 3 kroki: clone, `npm install`, skopiuj `.env.example` do `.env` |
| **Run** | `npm start` |
| **File structure** | Tabela z plikami i ich rolami |
| **Configuration** | Co mozna zmienic w `config.json` (modele, progi, pytania) |

### Przykladowa tresc sekcji "What is this?"

> AI answers with confidence — but sometimes it's just guessing.
> This app asks two models the same question, cross-checks with Wikipedia,
> and shows you how sure we really are.

---

## Dlaczego bez ground truth?

- Realistyczny scenariusz — w produkcji rzadko znamy "prawdziwa odpowiedz" z gory
- Trzy niezalezne warstwy weryfikacji zamiast jednej
- Uczy intuicji: **roznica miedzy modelami = sygnal do sprawdzenia**
- Wikipedia jako darmowe, zewnetrzne zrodlo faktow — bez zadnego API key
