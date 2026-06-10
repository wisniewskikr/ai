# Grounding — propozycja demo

## Co to jest grounding?

Wyobraz sobie, ze pytasz nowego pracownika o fakty. Moze odpowiedziec pewnie... ale zmyslac. **Grounding to sprawdzenie, czy to, co powiedzial, jest prawda.**

---

## Propozycja: Hallucination Benchmark

Najprostsze demo bez zadnych dodatkowych API — tylko OpenRouter.

### Jak to dziala?

```
Znane pytanie + znana odpowiedz (ground truth)
        |
        v
    Model odpowiada
        |
        v
  Porownaj: zgodne? --> wynik + confidence score
```

### Trzy kroki weryfikacji

| Krok | Pytanie | Co sprawdza? |
|------|---------|--------------|
| 1 | Czy odpowiedz jest zgodna z prawda? | Halucynacje faktyczne |
| 2 | Czy model jest pewny swojej odpowiedzi? | Kalibracja pewnosci |
| 3 | Ile % odpowiedzi bylo poprawnych? | Benchmark dla konkretnych pytan |

### Confidence score

- Wysoki (>=0.8) — odpowiedz zgodna, model pewny
- Sredni (0.5-0.8) — czesc sie zgadza
- Niski (<0.5) — blad lub brak odpowiedzi

---

## Stack

| Element | Technologia |
|---------|-------------|
| Jezyk | TypeScript |
| Model | OpenRouter (np. `openai/gpt-4o-mini`) |
| Test cases | lokalny plik JSON |
| Output | tabela w terminalu |

---

## Struktura projektu

```
src/
  benchmark.ts        # glowna logika
  questions.json      # zestaw 10 pytan ze znanymi odpowiedziami
  scorer.ts           # porownanie odpowiedzi modelu z ground truth
index.ts              # punkt wejscia CLI
```

---

## Przykladowy plik questions.json

```json
[
  {
    "id": 1,
    "question": "Ile planet jest w Ukladzie Slonecznym?",
    "expected": "8"
  },
  {
    "id": 2,
    "question": "W ktorym roku Neil Armstrong stangl na Ksiezycu?",
    "expected": "1969"
  },
  {
    "id": 3,
    "question": "Jaki jezyk programowania stworzyl Guido van Rossum?",
    "expected": "Python"
  }
]
```

---

## Przykladowy output w terminalu

```
Pytanie                                    Oczekiwano   Model odpowiedzial   Wynik
-----------------------------------------  -----------  ------------------  ------
Ile planet jest w Ukladzie Slonecznym?     8            8                   Wysoki
W ktorym roku Armstrong stangl...          1969         1969                Wysoki
Jaka jest stolica Australii?              Canberra     Sydney              Niski
```

**Wynik: 80% poprawnych odpowiedzi (8/10)**

---

## Dlaczego to dobre demo?

- Nie wymaga zadnych dodatkowych API (Google Search, itd.)
- Pokazuje wszystkie trzy warstwy weryfikacji z lekcji s05e04
- Latwo rozszerzyc o wiecej pytan lub inne modele
- Wynik jest czytelny i mierzalny

---

## Rozszerzenia (opcjonalne)

| Rozszerzenie | Opis |
|--------------|------|
| Multi-model | To samo pytanie do Claude + GPT — porownaj roznice |
| CSV export | Zapisz wyniki do pliku do analizy |
| Kategorie pytan | Geografia, historia, nauka — sprawdz, gdzie model halucynuje najczesciej |
