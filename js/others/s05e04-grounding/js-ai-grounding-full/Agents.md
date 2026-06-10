# Grounding — demo (TypeScript + OpenRouter)

## Co to jest grounding?

Wyobraz sobie, ze pytasz dwoch ekspertow o to samo. Jesli obaj mowia to samo — mozesz im ufac. Jesli sie roznia — cos jest nie tak. **Grounding to wlasnie to: weryfikacja odpowiedzi przez porownanie dwoch niezaleznych modeli AI.**

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
         Warstwa 1: Czy odpowiedzi sa zgodne?
                   |
                   v
         Warstwa 2: Wikipedia API
         (szukaj keywords z odpowiedzi)
                   |
                   v
         Czy Wikipedia potwierdza?
                   |
                   v
         Finalny confidence score
```

---

## Opcje CLI

| Opcja | Opis | Jak dziala? |
|-------|------|-------------|
| **1** | Benchmark: Nauka i historia | 5 predefiniowanych pytan, oba modele odpowiadaja, pokazuje zgodnosc |
| **2** | Benchmark: Technologia i geografia | 5 innych predefiniowanych pytan, ten sam mechanizm |
| **3** | Wlasne pytanie | Uzytkownik wpisuje pytanie, oba modele odpowiadaja i sa porownywane |
| **4** | Wyjscie | Koniec programu |

---

## Trzy warstwy weryfikacji

Kazda warstwa dodaje pewnosc. Razem daja finalny confidence score.

| Warstwa | Co sprawdza? | Jak? |
|---------|-------------|------|
| **1. Multi-model** | Czy oba modele odpowiadaja tak samo? | Porownanie `answer` z structured output |
| **2. Wikipedia API** | Czy zewnetrzne zrodlo potwierdza odpowiedz? | Szukaj `keywords` z odpowiedzi w Wikipedii |
| **3. Self-confidence** | Czy modele same sa pewne swoich odpowiedzi? | Pole `confidence` ze structured output (0.0–1.0) |

### Finalny confidence score

| Wynik | Warunki |
|-------|---------|
| Wysoki | Modele zgodne + Wikipedia potwierdza + oba confidence >= 0.8 |
| Sredni | Modele zgodne LUB Wikipedia potwierdza, ale nie oba |
| Niski | Modele sprzeczne i/lub Wikipedia nie potwierdza |

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
  benchmarks.ts       # dwa zestawy predefiniowanych pytan
  verifier.ts         # wywoluje oba modele, porownuje odpowiedzi
  scorer.ts           # liczy finalny confidence score (3 warstwy)
  openrouter.ts       # klient HTTP do OpenRouter API (structured output)
  wikipedia.ts        # klient Wikipedia REST API
index.ts              # punkt wejscia
.env                  # OPENROUTER_API_KEY
```

---

## Przykladowe pytania — zestaw 1 (Nauka i historia)

```json
[
  "Ile planet jest w Ukladzie Slonecznym?",
  "W ktorym roku wybuchl wulkan Wezuwiusz niszczac Pompeje?",
  "Kto odkryl penicyline?",
  "Jaki pierwiastek ma symbol chemiczny Au?",
  "W ktorym roku zakonczyla sie II Wojna Swiatowa?"
]
```

## Przykladowe pytania — zestaw 2 (Technologia i geografia)

```json
[
  "Jaki jezyk programowania stworzyl Guido van Rossum?",
  "Ile bajtow ma jeden kilobajt?",
  "Jaka jest stolica Australii?",
  "Kto zalozyl firme Apple?",
  "W jakim kraju znajduje sie Mount Everest?"
]
```

---

## Przykladowy output w terminalu

```
=== Benchmark: Nauka i historia ===

Pytanie: Kto odkryl penicyline?
  gpt-4o-mini : "Alexander Fleming odkryl penicyline w 1928 roku"  (pewnosc: 0.97)
  mistral-7b  : "Alexander Fleming"                                 (pewnosc: 0.91)
  Wikipedia   : Potwierdzono (artykul: "Alexander Fleming")
  Confidence  : Wysoki ✓

Pytanie: W ktorym roku zakonczyla sie II Wojna Swiatowa?
  gpt-4o-mini : "1945"  (pewnosc: 0.99)
  mistral-7b  : "1944"  (pewnosc: 0.72)
  Wikipedia   : Potwierdzono "1945" (artykul: "II Wojna Swiatowa")
  Confidence  : Sredni ⚡ Modele sie roznia, Wikipedia wskazuje 1945

=== Wynik: 4/5 wysokich confidence ===
```

---

## Przykladowy output — wlasne pytanie

```
Twoje pytanie: Ile ksiezycy ma Mars?

  gpt-4o-mini : "Mars ma 2 ksiezyce: Fobos i Deimos"  (pewnosc: 0.98)
  mistral-7b  : "2 ksiezyce — Fobos i Deimos"          (pewnosc: 0.96)
  Wikipedia   : Potwierdzono (artykul: "Mars")
  Confidence  : Wysoki ✓
```

---

## Dlaczego bez ground truth?

- Realistyczny scenariusz — w produkcji rzadko znamy "prawdziwa odpowiedz" z gory
- Trzy niezalezne warstwy weryfikacji zamiast jednej
- Uczy intuicji: **roznica miedzy modelami = sygnal do sprawdzenia**
- Wikipedia jako darmowe, zewnetrzne zrodlo faktow — bez zadnego API key
