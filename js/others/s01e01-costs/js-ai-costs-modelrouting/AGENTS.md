# AGENTS.md — Model Routing Demo

## Co to jest?

Wyobraź sobie recepcjonistę w firmie. Proste pytania ("Gdzie jest toaleta?") rozwiązuje sam. Trudne ("Jak zoptymalizować nasz budżet?") przekazuje do eksperta. Tak działa ten projekt.

## 3 agenty

| Agent | Model | Zadanie |
|---|---|---|
| **Classifier** | `meta-llama/llama-3.1-8b-instruct` | Ocenia, czy zapytanie jest proste czy skomplikowane |
| **Simple Agent** | `google/gemini-flash-2.0` | Odpowiada na proste pytania — szybko i tanio |
| **Complex Agent** | `anthropic/claude-sonnet-4-5` | Odpowiada na trudne pytania — dokładnie i szczegółowo |

## Jak to działa?

```
Zapytanie
   ↓
Classifier Agent → "simple" lub "complex"
   ↓
Simple Agent          Complex Agent
(tanie pytania)       (trudne pytania)
   ↓                        ↓
         Odpowiedź
    + który agent użyty
    + szacowany koszt
```

## Przykłady routingu

Pytania są w języku angielskim. Na starcie programu lista pytań jest wyświetlana użytkownikowi — może wybrać jedno lub wpisać własne.

| Zapytanie | Klasyfikacja | Agent |
|---|---|---|
| "What is the capital of France?" | simple | Simple Agent |
| "What is 2 + 2?" | simple | Simple Agent |
| "Write a quicksort algorithm in TypeScript and explain its complexity" | complex | Complex Agent |
| "Analyze the pros and cons of microservices architecture" | complex | Complex Agent |

## Konfiguracja — `config.json`

Wszystkie pytania przykładowe trzymamy w jednym pliku. Jak lista zakupów — łatwo dodać, usunąć, zmienić.

```json
{
  "exampleQueries": [
    "What is the capital of France?",
    "What is 2 + 2?",
    "Write a quicksort algorithm in TypeScript and explain its complexity",
    "Analyze the pros and cons of microservices architecture"
  ]
}
```

Żeby dodać nowe pytanie — wystarczy dopisać linijkę w `config.json`. Bez dotykania kodu.

## Stack techniczny

- **TypeScript**
- **OpenAI SDK** (kompatybilny z OpenRouter)
- **OpenRouter** jako bramka do wszystkich modeli
- `.env` — klucz `OPENROUTER_API_KEY`
- `config.json` — przykładowe pytania

## System prompty

- **Classifier** — klasyfikuje TYLKO, nie odpowiada na pytanie
- **Simple Agent** — krótkie i zwięzłe odpowiedzi
- **Complex Agent** — szczegółowa analiza, kod, rozumowanie krok po kroku
