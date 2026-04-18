# Explainer Agent

Prosty agent pokazujący, czym są **skille** — ten sam model, dwa różne tryby odpowiedzi.

---

## Co robi?

Użytkownik zadaje pytanie i wybiera tryb:

| Tryb | Dla kogo? | Skąd pochodzi? |
|---|---|---|
| **Prosto** | Każdy, 5-latek | `src/prompts/explain-simple.md` (skill) |
| **Technicznie** | Programista, ekspert | `src/prompts/explain-expert.md` (skill) |
| Persona agenta | Zawsze aktywna | System prompt |

Analogia: ten sam kucharz (model), dwa różne przepisy (skille) — inne danie na wyjściu.

---

## Struktura projektu

```
explainer-agent/
├── src/
│   ├── prompts/
│   │   ├── explain-simple.md    ← skill: tłumacz prosto
│   │   └── explain-expert.md   ← skill: tłumacz technicznie
│   ├── services/
│   │   └── skillLoader.ts      ← wczytuje skill z pliku
│   └── index.ts                ← punkt wejścia, CLI
├── logs/                        ← logi aplikacji
├── config.json                  ← zmienne konfiguracyjne
├── .env                         ← klucz OpenRouter (nie commituj!)
├── .env.example                 ← szablon .env
└── Readme.md
```

---

## Stos technologiczny

| Co | Czym |
|---|---|
| Język | TypeScript (strict) |
| API | OpenRouter |
| Model | `google/gemini-flash-1.5` — szybki i tani, idealny do tego zadania |
| Interfejs | CLI (terminal) |

---

## Zasady kodu

- Każda funkcja robi **jedną rzecz**
- Zero hardcodowanych wartości — wszystko w `config.json` lub `.env`
- Prompty w `src/prompts/` — edytowalne bez zmiany kodu
- Logi w `logs/` — czytelne dla człowieka
- Kod czytelny jak tekst — bez zbędnej abstrakcji

---

## Jak uruchomić?

```bash
cp .env.example .env       # uzupełnij OPENROUTER_API_KEY
npm install
npm start
```

---

## Jak to pokazuje skille?

```
Użytkownik pyta → agent wczytuje skill → wstrzykuje do promptu → model odpowiada

System prompt:  "Jesteś pomocnym asystentem"          (zawsze)
Skill:          "Wyjaśnij jak dla 5-latka..."          (na żądanie)
```

Zmień treść pliku `src/prompts/explain-simple.md` — zachowanie agenta zmienia się **bez dotykania kodu**.
