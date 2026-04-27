# AGENTS.md

## Co to jest ten projekt?

To projekt demo pokazujący różnicę między zwykłym API a Batch API dla modeli AI.

Wyobraź sobie, że masz 10 pytań do asystenta. Możesz:
- **zapytać o każde z osobna** (jak w kolejce w sklepie — jedno po drugim), albo
- **wysłać wszystkie naraz w paczce** (Batch API — jak zamówienie hurtowe ze zniżką)

---

## Co robi projekt?

| Krok | Opis |
|------|------|
| 1 | Wczytuje dane o użytkowniku z `data/data.txt` |
| 2 | Wczytuje listę pytań z `config.json` |
| 3 | Wysyła pytania **na bieżąco** (standardowe API) i mierzy koszt |
| 4 | Wysyła te same pytania **w trybie Batch API** i mierzy koszt |
| 5 | Wyświetla porównanie kosztów obu podejść |

---

## Stack technologiczny

| Element | Wybor |
|---------|-------|
| Jezyk | TypeScript |
| Srodowisko | Node.js |
| Provider AI | OpenRouter |
| Model | `openai/gpt-4o-mini` (tani, obsluguje Batch API) |

Klucz API przechowuj w `.env` jako `OPENROUTER_API_KEY`.

---

## Pliki projektu

| Plik | Rola |
|------|------|
| `data/data.txt` | Dane wejsciowe (profil uzytkownika Joe Doe) |
| `config.json` | Lista 10 pytan do zadania modelowi AI |
| `.env` | Klucz API (nie commituj!) |

---

## Pytania w config.json

10 pytan na podstawie `data/data.txt`:

| # | Pytanie |
|---|---------|
| 1 | Jak nazywa sie uzytkownik? |
| 2 | Gdzie pracuje i w jakim miescie? |
| 3 | Jakie sa hobby uzytkownika? |
| 4 | Jakie gatunki ksiazek lubi czytac? |
| 5 | Na jakim instrumencie gra uzytkownik? |
| 6 | Jak ma na imie zona uzytkownika? |
| 7 | Ile dzieci ma uzytkownik i jak sie nazywaja? |
| 8 | Jak nazywa sie pies uzytkownika i jakiej jest rasy? |
| 9 | Co uzytkownik robi w weekendy? |
| 10 | W jakich zawodach sportowych bierze udzial uzytkownik? |

---

## Jak dziala roznica miedzy API a Batch API?

| Cecha | Standardowe API | Batch API |
|-------|----------------|-----------|
| Szybkosc | Natychmiastowa odpowiedz | Odpowiedz z opoznieniem (do 24h); projekt czeka w petli az wyniki beda gotowe |
| Koszt | Pelna cena | Nawet 50% taniej |
| Uzycie | Pojedyncze zapytania | Duzo zapytan naraz |

> Batch API to jak zamowienie pizzy dla calej firmy zamiast dla jednej osoby — taniej na sztuke.

---

## Wynik dzialania

Po uruchomieniu projektu uzytkownik zobaczy:

```
--- Standardowe API ---
Pytanie 1: [odpowiedz]
...
Koszt: X tokenow / $Y

--- Batch API ---
Pytanie 1: [odpowiedz]
...
Koszt: X tokenow / $Y (oszczednosc: Z%)

--- Podsumowanie ---
Oszczednosc przy uzyciu Batch API: $...
```
