# AGENTS.md

## Co to jest ten projekt?

Demo pokazujące różnicę między zwykłym API a Batch API na realnym przykładzie biznesowym.

Wyobraź sobie, że masz sklep i 100 recenzji produktów do przeanalizowania. Możesz:
- **pytać o każdą z osobna** (drogie, wolne — jak taxi kurs po kursie), albo
- **wysłać wszystkie naraz w paczce** (Batch API — jak bus z 100 pasażerami naraz)

---

## Zadanie projektu

Sklasyfikuj 100 recenzji słuchawek jako `positive`, `neutral` lub `negative`.

| Krok | Opis |
|------|------|
| 1 | Wczytaj 100 recenzji z `data/reviews.json` |
| 2 | Wyslij kazda recenzje **po kolei** (standardowe API) — zmierz koszt i czas |
| 3 | Wyslij wszystkie recenzje **naraz** (Batch API) — czekaj w petli az wyniki beda gotowe |
| 4 | Pokaz porownanie: koszt, czas, oszczednosc |

---

## Stack technologiczny

| Element | Wybor |
|---------|-------|
| Jezyk | TypeScript |
| Srodowisko | Node.js |
| Provider AI | OpenRouter |
| Model | `openai/gpt-4o-mini` (tani, obsluguje Batch API) |

Klucz API w `.env` jako `OPENROUTER_API_KEY`.

---

## Struktura projektu

```
s01e01-costs/
  data/
    reviews.json       # 100 recenzji slowuchawek (wygenerowane)
  src/
    standard.ts        # wysyla zapytania po kolei
    batch.ts           # wysyla zapytania w trybie batch
    compare.ts         # pokazuje porownaie kosztow
    index.ts           # punkt wejscia
  config.json          # konfiguracja: model, liczba recenzji, prompt
  .env                 # OPENROUTER_API_KEY
  package.json
  tsconfig.json
```

---

## Format danych

**`data/reviews.json`** — tablica 100 recenzji:
```json
[
  { "id": 1, "text": "Amazing sound quality, very comfortable to wear all day." },
  { "id": 2, "text": "Broke after two weeks. Terrible build quality." },
  ...
]
```

**`config.json`** — ustawienia projektu:
```json
{
  "model": "openai/gpt-4o-mini",
  "reviewsFile": "data/reviews.json",
  "prompt": "Classify the sentiment of this product review as: positive, neutral, or negative. Reply with one word only."
}
```

---

## Jak dziala roznica miedzy API a Batch API?

| Cecha | Standardowe API | Batch API |
|-------|----------------|-----------|
| Szybkosc | Natychmiastowa odpowiedz | Opoznienie (minuty); projekt czeka w petli |
| Koszt | Pelna cena | ~50% taniej |
| Uzycie | Pojedyncze zapytania | Duzo zapytan naraz |
| Kiedy ma sens | Chatbot, real-time | Analiza danych, raporty noclne |

> Batch API to jak pranie w pralce — nie dostajesz koszulki czystej od razu, ale placisz mniej pradku na sztuke.

---

## Oczekiwany wynik

```
Analiza 100 recenzji slowuchawek
================================

--- Standardowe API ---
[1/100] "Amazing sound quality..." → positive
[2/100] "Broke after two weeks..." → negative
...
Czas:  ~45 sekund
Koszt: ~$0.042

--- Batch API ---
Wyslano paczke. Czekam na wyniki...
[polling co 10s] Status: in_progress...
[polling co 10s] Status: completed!
Czas:  ~2-5 minut (czas oczekiwania)
Koszt: ~$0.021

--- Podsumowanie ---
Oszczednosc:  $0.021  (50%)
Wyniki zgodne: 100/100
```

---

## Kiedy uzywac Batch API?

Uzywaj gdy:
- Masz **duzo zapytan naraz** (50+)
- **Nie potrzebujesz odpowiedzi od razu** (raporty, analizy nocne)
- Chcesz **obnizyc koszty** bez zmiany jakosci odpowiedzi
