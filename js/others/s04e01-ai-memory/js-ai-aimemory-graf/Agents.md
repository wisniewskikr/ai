# AI Memory Demo: Graf vs Vector Search

> Graf to jak filofax z zakładkami — wiesz dokładnie, gdzie co jest.
> Vector Search to jak szukanie w stercie kartek — znajdziesz cos podobnego, ale nie konkretne polaczenia.

---

## Co robi ten projekt?

Pokazuje roznice miedzy dwoma rodzajami pamieci AI na prostym przykladzie firmy.

| Pytanie | Vector Search | Graf |
|---|---|---|
| "Kto pracuje w IT?" | tak, dziala | tak, dziala |
| "Kto raportuje do Boba?" | moze sie mylic | zawsze trafne |
| "Ile osob zarzadza Alice?" | zgaduje | precyzyjnie |

---

## Kluczowy wniosek

> Zacznij od pytania, nie od narzedzia.

| Typ pytania | Narzedzie |
|---|---|
| Podobienstwo ("znajdz podobne") | Vector Search |
| Relacje ("kto zarzadza kim?") | Graf |
| Globalny przeglad ("podsumuj wszystko") | GraphRAG |

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
    detectQueryType.ts      <- typ zapytania: relacja / podobienstwo (LLM)
  services/
    graphMemory.ts          <- graf + traversal (bez AI, deterministyczny)
    vectorSearch.ts         <- LLM z plaskim tekstem (symulacja RAG)
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
| `[1]` | Pokaz graf (wszystkie wezly i krawedzie) | Nie |
| `[2]` | Zapytaj Graf — "Who reports to Bob?" | Nie |
| `[3]` | Zapytaj przez Vector Search — to samo pytanie | Tak (LLM) |
| `[4]` | Porownaj obie metody obok siebie | Tak (LLM) |
| `[5]` | Wpisz wlasne pytanie (AI + Graf) | Tak (LLM) |
| `[0]` | Wyjscie | Nie |

### Jak dziala opcja [5]?

```
Pytanie uzytkownika
        |
        v
LLM wykrywa typ zapytania
   |               |
relacja         podobienstwo
   |               |
Graf             LLM z
traversal     plaskim tekstem
   |               |
   +-------+-------+
           |
      Odpowiedz
```

To jest **intent routing** — koncept z dokumentu s04e01.

---

## Porownanie metod — kluczowa roznica

```
Pytanie: "Who reports to Bob?"

[GRAPH]  Bob Johnson (CTO) manages 2 people:
           - Dave Brown (Lead Developer)
           - Eve Davis (DevOps Engineer)
         Czas: < 1ms, zawsze poprawne

[VECTOR] Bob Johnson manages Dave Brown and Eve Davis...
         Czas: ~1s (API call), moze halucynowac
```

Graf jest deterministyczny. LLM zgaduje na podstawie tekstu.

---

## Zrodla

- `Readme-security-pl.md` — sekcja `s04e01 PAMIEC AI`
- Przyklady edukacyjne: `Knowledge Graph vs Vector`
