# AI Memory Demo: Graf wiedzy

> Graf to jak filofax z zakładkami — wiesz dokladnie, gdzie co jest.

---

## Co robi ten projekt?

Demo pamieci AI opartej na grafie wiedzy. Pokazuje, ze pytania o relacje maja zawsze precyzyjna odpowiedz — bez zgadywania.

| Pytanie | Graf |
|---|---|
| "Kto raportuje do Boba?" | zawsze trafne |
| "Kto jest managerem Grace?" | zawsze trafne |
| "Ile osob zarzadza Alice?" | precyzyjnie |

---

## Graf wiedzy — dane demo

Prosta hierarchia firmy (wezly + krawedzie):

```
Alice Smith (CEO)
+-- Bob Johnson (CTO)
|   +-- Dave Brown (Lead Developer)
|   |   +-- Grace Wilson (Developer)
|   |   +-- Henry Moore (Developer)
|   +-- Eve Davis (DevOps Engineer)
+-- Carol White (CFO)
    +-- Frank Miller (Senior Accountant)
```

---

## Propozycja implementacji

### Technologie

| Co | Czym |
|---|---|
| Jezyk | TypeScript (strict mode) |
| API | OpenRouter |
| Model AI | `google/gemini-2.0-flash-lite-001` |
| Graf | In-memory (wezly + krawedzie w TypeScript) |
| CLI | Node.js `readline` (bez zewnetrznych bibliotek) |

### Dlaczego ten model?

`google/gemini-2.0-flash-lite-001` — wybrany bo:

- Tani: $0.10/M input, $0.40/M output
- Szybki — idealny do demo
- Wystarczajacy do ekstrakcji intencji z pytania uzytkownika

### Struktura projektu

```
src/
  index.ts                  <- glowna petla CLI
  prompts/
    extractPerson.ts        <- wyodrebnij imie z pytania (LLM)
    detectQueryType.ts      <- typ zapytania: direct reports / manager of (LLM)
  services/
    graphMemory.ts          <- graf + traversal (deterministyczny, bez AI)
    openRouter.ts           <- klient API
  utils/
    config.ts               <- laduje config.json
    logger.ts               <- logi do logs/app.log
logs/
config.json                 <- model, maxTokens, pytanie demo
.env                        <- OPENROUTER_API_KEY
.env.example
Readme.md
```

---

## CLI — opcje

| Opcja | Co robi | Uzywa AI? |
|---|---|---|
| `[1]` | Pokaz caly graf (wezly i krawedzie) | Nie |
| `[2]` | Kto raportuje do X? — predefiniowane pytanie | Nie |
| `[3]` | Kto jest managerem X? — predefiniowane pytanie | Nie |
| `[4]` | Wpisz wlasne pytanie (LLM wyodrebnia intencje + Graf odpowiada) | Tak (LLM) |
| `[0]` | Wyjscie | Nie |

### Jak dziala opcja [4]?

```
Pytanie uzytkownika
        |
        v
LLM wyodrebnia imie i typ zapytania
        |
        v
Graf traversal (deterministyczny)
        |
        v
Odpowiedz
```

---

## Przyklad odpowiedzi

```
Pytanie: "Who reports to Bob?"

[GRAPH] Bob Johnson (CTO) manages 2 people:
          - Dave Brown (Lead Developer)
          - Eve Davis (DevOps Engineer)
        Czas: < 1ms, zawsze poprawne
```

---

## Zrodla

- `Readme-security-pl.md` — sekcja `s04e01 PAMIEC AI`
- Przyklady edukacyjne: `Knowledge Graph vs Vector`
