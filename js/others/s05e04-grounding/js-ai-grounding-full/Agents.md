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

| Opcja | Pytanie | Dziedzina |
|-------|---------|-----------|
| **1** | Kto odkryl penicyline? | Nauka |
| **2** | Jaka jest stolica Australii? | Geografia |
| **3** | Jaki jezyk programowania stworzyl Guido van Rossum? | Technologia |
| **4** | Wlasne pytanie | — |
| **5** | Wyjscie | — |

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
| Model B | `mistralai/mistral-7b-instruct` (przez OpenRouter) |
| Structured output | `response_format: { type: "json_object" }` w OpenRouter API |
| Weryfikacja zewnetrzna | Wikipedia REST API (darmowe, bez klucza) |
| CLI | `readline` (wbudowane w Node.js) |
| Output | tabela w terminalu |

---

## Struktura projektu

```
src/
  cli.ts              # menu glowne, petla CLI
  questions.ts        # 3 predefiniowane pytania z dziedzinami
  verifier.ts         # wywoluje oba modele, porownuje odpowiedzi
  scorer.ts           # liczy finalny confidence score (3 warstwy)
  openrouter.ts       # klient HTTP do OpenRouter API (structured output)
  wikipedia.ts        # klient Wikipedia REST API
index.ts              # punkt wejscia
.env                  # OPENROUTER_API_KEY
```

---

## Przykladowy output — pytanie predefiniowane

```
=== Grounding Demo ===

[1] Kto odkryl penicyline?
[2] Jaka jest stolica Australii?
[3] Jaki jezyk stworzyl Guido van Rossum?
[4] Wlasne pytanie
[5] Wyjscie

Wybierz opcje: 1

Pytanie: Kto odkryl penicyline?

Warstwa 1 — Multi-model:
  gpt-4o-mini : "Alexander Fleming odkryl penicyline w 1928 roku"  (pewnosc: 0.97)
  mistral-7b  : "Alexander Fleming"                                 (pewnosc: 0.91)
  Zgodnosc    : TAK ✓

Warstwa 2 — Wikipedia:
  Zapytanie   : "Alexander Fleming"
  Wynik       : Potwierdzono — artykul zawiera "penicylina" ✓

Warstwa 3 — Self-confidence:
  Srednia     : 0.94 ✓

---
Finalny confidence: WYSOKI ✓
```

---

## Przykladowy output — wlasne pytanie

```
Wybierz opcje: 4

Twoje pytanie: Ile ksiezycy ma Mars?

Warstwa 1 — Multi-model:
  gpt-4o-mini : "Mars ma 2 ksiezyce: Fobos i Deimos"  (pewnosc: 0.98)
  mistral-7b  : "2 ksiezyce — Fobos i Deimos"          (pewnosc: 0.96)
  Zgodnosc    : TAK ✓

Warstwa 2 — Wikipedia:
  Zapytanie   : "Mars"
  Wynik       : Potwierdzono — artykul zawiera "Fobos" i "Deimos" ✓

Warstwa 3 — Self-confidence:
  Srednia     : 0.97 ✓

---
Finalny confidence: WYSOKI ✓
```

---

## Dlaczego bez ground truth?

- Realistyczny scenariusz — w produkcji rzadko znamy "prawdziwa odpowiedz" z gory
- Trzy niezalezne warstwy weryfikacji zamiast jednej
- Uczy intuicji: **roznica miedzy modelami = sygnal do sprawdzenia**
- Wikipedia jako darmowe, zewnetrzne zrodlo faktow — bez zadnego API key
