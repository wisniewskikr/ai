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
     Odpowiedz A             Odpowiedz B
        |                         |
        +----------+--------------+
                   |
                   v
         Czy odpowiedzi sa zgodne?
         TAK --> Wysoki confidence
         NIE --> Flaga ostrzezenia
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

## Confidence score — jak sie liczy?

Brak zewnetrznego "ground truth". Score oparty na zgodnosci modeli:

| Wynik | Znaczenie |
|-------|-----------|
| Wysoki | Oba modele odpowiedzialy tak samo (lub bardzo podobnie) |
| Sredni | Odpowiedzi czesciowo sie pokrywaja |
| Niski | Odpowiedzi sa sprzeczne — mozliwa halucynacja, sprawdz recznie |

> Analogia: dwoch tlumaczy przetlumaczonych ten sam tekst inaczej — ktos sie myli. Nie wiesz kto, ale wiesz, ze warto sprawdzic.

---

## Stack

| Element | Technologia |
|---------|-------------|
| Jezyk | TypeScript |
| Model A | `openai/gpt-4o-mini` (przez OpenRouter) |
| Model B | `mistralai/mistral-7b-instruct` (przez OpenRouter) |
| CLI | `readline` (wbudowane w Node.js) |
| Output | tabela w terminalu |

---

## Struktura projektu

```
src/
  cli.ts              # menu glowne, petla CLI
  benchmarks.ts       # dwa zestawy predefiniowanych pytan
  verifier.ts         # wywoluje oba modele, porownuje odpowiedzi
  scorer.ts           # liczy confidence score na podstawie zgodnosci
  openrouter.ts       # klient HTTP do OpenRouter API
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

Pytanie: Ile planet jest w Ukladzie Slonecznym?
  gpt-4o-mini : "8 planet"
  mistral-7b  : "8"
  Confidence  : Wysoki ✓

Pytanie: Kto odkryl penicyline?
  gpt-4o-mini : "Alexander Fleming"
  mistral-7b  : "Alexander Fleming w 1928 roku"
  Confidence  : Wysoki ✓

Pytanie: W ktorym roku zakonczyla sie II Wojna Swiatowa?
  gpt-4o-mini : "1945"
  mistral-7b  : "1944"
  Confidence  : Niski ⚠ Odpowiedzi sie roznia — sprawdz recznie

=== Wynik: 4/5 zgodnych odpowiedzi ===
```

---

## Przykladowy output — wlasne pytanie

```
Twoje pytanie: Ile ksiezycy ma Mars?

  gpt-4o-mini : "Mars ma 2 ksiezyce: Fobos i Deimos"
  mistral-7b  : "2 ksiezyce"
  Confidence  : Wysoki ✓
```

---

## Dlaczego bez ground truth?

- Realistyczny scenariusz — w produkcji rzadko znamy "prawdziwa odpowiedz" z gory
- Dwa niezalezne modele to praktyczna i tania weryfikacja
- Uczy intuicji: **roznica miedzy modelami = sygnal do sprawdzenia**
- Latwo rozszerzyc o trzeci model lub zewnetrzne zrodlo (np. Wikipedia API)
