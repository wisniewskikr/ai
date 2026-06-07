# Demo: Pamięć AI — Wzbogacenie Kontekstu

> Jak dodanie kilku słów do dokumentu sprawia, że AI odpowiada mądrzej.

---

## Co to jest?

Wyobraź sobie bibliotekę. Masz dwie kartki z opisem tej samej książki:

| Wersja | Opis |
|--------|------|
| **Surowa** | "Hobbit. Opowieść o przygodzie." |
| **Wzbogacona** | "Hobbit. Opowieść o przygodzie. Autor: Tolkien. Seria: Władca Pierścieni. Gatunek: fantasy, przygoda." |

Gdy ktoś pyta *"jakie książki pasują do Władcy Pierścieni?"* — znajdzie drugą kartę, nie pierwszą.

**To właśnie wzbogacenie kontekstu.**

---

## Co robi ta aplikacja?

CLI, które zadaje to samo pytanie AI w trzech krokach:

1. Odpytuje AI z **surowym** kontekstem — tylko opisy dokumentów
2. **Pokazuje na ekranie** jakie dokumenty trafiły do każdego zapytania
3. Dynamicznie **wzbogaca** dokumenty (dodaje zależności, tagi) i odpytuje ponownie

Pokazuje różnicę w odpowiedziach i ujawnia DLACZEGO ta różnica powstała.

---

## Scenariusz

Baza wiedzy małej firmy — 10 dokumentów (wystarczająco dużo, żeby różnica była wyraźna):

| Dokument | Opis |
|----------|------|
| Project Alpha | System e-commerce |
| Project Beta | Panel administracyjny |
| Project Gamma | Aplikacja mobilna |
| Project Delta | System raportowania |
| Payment API | Moduł obsługi płatności |
| Auth Service | Logowanie i autoryzacja |
| Notification Service | Powiadomienia email/SMS |
| Database Core | Główna baza danych |
| File Storage | Przechowywanie plików |
| Audit Logger | Dziennik zdarzeń systemowych |

### Surowy dokument

```
Payment API: Moduł obsługi płatności online.
```

### Wzbogacony dokument

```
Payment API: Moduł obsługi płatności online.
Zależności: Database.
Używają: Alpha, Beta.
Tagi: Stripe, PayU, transakcje, faktura.
```

---

## Menu CLI

```
=== COMPANY KNOWLEDGE BASE — AI Memory Demo ===

Select a question:
  1. Which projects use the Payment API?
  2. Which components depend on Auth Service?
  3. What do I know about databases in our system?
  4. Ask your own question...
  5. Exit
```

---

## Przykładowy wynik

```
Question: "Which projects use the Payment API?"

--- STEP 1: PLAIN CONTEXT SENT TO AI ---
> Payment API: Module for online payments.
> Project Alpha: E-commerce system.
> Project Beta: Admin panel.
> ... (10 documents, no dependency info)

Answer: "I don't have enough information about dependencies between projects."

--- STEP 2: ENRICHING DOCUMENTS... ---
> Payment API: Module for online payments.
>   Dependencies: Database Core.
>   Used by: Alpha, Beta, Gamma.
>   Tags: Stripe, PayU, transactions, invoice.
> ... (enrichment added to all 10 documents)

--- STEP 3: ENRICHED CONTEXT SENT TO AI ---
Answer: "According to the documentation, Payment API is used by
         Project Alpha, Project Beta, and Project Gamma."

Takeaway: context enrichment revealed dependencies invisible in plain text.
```

---

## Stack

| Element | Technologia |
|---------|-------------|
| Jezyk | TypeScript (Node.js ESM) |
| AI | OpenRouter API |
| Model | `google/gemma-3-27b-it:free` (darmowy, lepszy reasoning) |
| Menu CLI | Inquirer.js |
| Baza danych | Brak — wszystko in-memory |

---

## Struktura projektu

```
project/
├── src/
│   ├── prompts/
│   │   ├── system.ts           # prompt systemowy dla AI
│   │   └── question-context.ts # szablon pytania z kontekstem
│   ├── services/
│   │   ├── ai-client.ts        # klient OpenRouter (obsługa 429, timeout)
│   │   ├── enricher.ts         # dynamiczne wzbogacanie dokumentów
│   │   └── compare.ts          # logika porownywania odpowiedzi
│   └── utils/
│       ├── knowledge-base.ts   # 10 dokumentów (surowe)
│       └── logger.ts           # zapis logow do /logs
├── logs/                       # logi aplikacji (auto-generowane)
├── config.json                 # model, timeouty, retry limit
├── index.ts                    # punkt wejscia, menu CLI
├── package.json
├── tsconfig.json
├── .env                        # OPENROUTER_API_KEY (nie commituj!)
├── .env.example                # szablon zmiennych
└── Readme.md                   # dokumentacja (EN) — stworzona z /wisniewk-doc-rules
```

### config.json — przykład zawartości

```json
{
  "model": "google/gemma-3-27b-it:free",
  "timeout_ms": 30000,
  "retry_limit": 3,
  "retry_delay_ms": 2000
}
```

---

## Uruchomienie

```bash
npm install
cp .env.example .env   # wpisz klucz OpenRouter
npm start
```

---

## Czego uczysz sie z tego demo?

- Czym jest wzbogacenie kontekstu i kiedy go uzywac
- Dlaczego AI odpowiada lepiej, gdy dasz jej wiecej powiazan
- Jak male zmiany w dokumentach = duza roznica w wynikach
