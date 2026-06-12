# Memory Triad — Demo

> Wyobraz sobie asystenta, ktory ma trzy rodzaje pamieci — jak czlowiek:
> - **Notes na biurku** — pamietasz co bylo mowione przed chwila
> - **Szuflada z dokumentami** — pamietasz dane na stale
> - **Dziennik** — zapisujesz co zrobiles i co wyszlo

---

## Czym jest Memory Triad?

| Warstwa | Analogia | Co przechowuje | Gdzie |
|---------|----------|----------------|-------|
| **Short-term** | Notes na biurku | Biezaca rozmowa (sesja) | Pamiec RAM (tablica) |
| **Long-term** | Szuflada z dokumentami | Imie, preferencje, dane uzytkownika | SQLite |
| **Epizodyczna** | Dziennik | Co agent zrobil i z jakim skutkiem | SQLite |

Wiekszosc agentow ma tylko pierwsza warstwe. Dlatego zapominaja wszystko po restarcie.

---

## Co robi ten projekt?

Prosty asystent CLI w TypeScript, ktory:

- pyta Cie przez menu o co chcesz zrobic
- odpowiada przez OpenRouter (model LLM)
- pamietasz co mowisz w tej sesji (short-term)
- zapamietuje Twoje dane miedzy uruchomieniami (long-term)
- zapisuje kazda swoja akcje do dziennika (epizodyczna)

---

## Menu CLI

```
Co chcesz zrobic?

  1. Przedstaw sie   — agent mowi kim jestes (long-term)
  2. Zapamiętaj moje imie  — zapisuje imie do bazy (long-term)
  3. Podsumuj nasza rozmowe — skrot tej sesji (short-term)
  4. Pokaz historię akcji  — co agent robil wczesniej (epizodyczna)
> 5. Wpisz wlasne pytanie  — pytanie do LLM z pelnym kontekstem
  6. Wyjście
```

---

## Stack

| Element | Biblioteka |
|---------|-----------|
| Jezyk | TypeScript (Node.js) |
| CLI | `@inquirer/prompts` |
| LLM API | OpenRouter (fetch) |
| Baza danych | `better-sqlite3` |
| Srodowisko | `dotenv` |

---

## Struktura projektu

```
src/
  index.ts          — punkt wejscia, petla CLI
  memory/
    shortTerm.ts    — tablica wiadomosci biezacej sesji
    longTerm.ts     — zapis/odczyt danych z SQLite
    episodic.ts     — zapis akcji agenta do dziennika
  llm/
    openrouter.ts   — wywolanie modelu przez OpenRouter
  cli/
    menu.ts         — definicja opcji menu
db/
  memory.db         — baza SQLite (tworzona automatycznie)
.env                — klucz API
```

---

## Przeplyw danych

```
Uzytkownik wybiera opcje
        |
        v
CLI zbiera kontekst z trzech warstw pamieci
        |
        v
Wysyla prompt do OpenRouter
        |
        v
Odpowiedz trafia do short-term (historia sesji)
        |
        v
Akcja zapisywana do pamieci epizodycznej
        |
        v
Wynik wyswietlany uzytkownikowi
```

---

## Przyklad dzialania

**Pierwsze uruchomienie:**
```
Agent: Nie znam Twojego imienia. Wybierz opcje 2, zeby sie przedstawic.
```

**Po wybraniu opcji 2:**
```
Twoje imie: Marek
Agent: Zapisalem. Czesc, Marek!
```

**Po restarcie programu, opcja 1:**
```
Agent: Czesc, Marek! Milo cie widziec ponownie.
       Ostatnio pytales o pogode (2 dni temu).
```

Bez Memory Triad — agent by zapomnial wszystko.

---

## Konfiguracja

```env
OPENROUTER_API_KEY=sk-...
```

Model domyslny: `openai/gpt-4o-mini` (tani, wystarczajaco madry)

---

## Uruchomienie

```bash
npm install
npm run dev
```
