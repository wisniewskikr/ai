# AGENTS.md — js-ai-access-dryrun

## Co to jest?

Demo projektu "Dry Run Mode" — agent AI, który **zawsze pyta zanim coś zrobi**.

Jak dobry asystent: najpierw mówi co zamierza zrobić, czeka na Twoje "tak" lub "nie", dopiero potem działa.

---

## Cel projektu

Pokazać w praktyce zasady z dokumentu `Readme-security-pl.md`, sekcja **s01e03 — Warunki dostępu agentów AI**.

---

## Co demonstruje

| Zasada | Co to znaczy? | Jak to widać w kodzie? |
|--------|--------------|------------------------|
| **Dry Run** | Agent pokazuje plan zanim działa | Lista operacji przed wykonaniem |
| **Human in the Loop (HITL)** | Człowiek musi powiedzieć "tak" | Pytanie `[tak/nie]` w CLI |
| **Audit trail** | Każda akcja jest zapisana | Wpisy do `logs/audit.log` z czasem |
| **Zasada najniższych uprawnień** | Agent robi tylko to, co musi | Tylko czyta + pyta, nie decyduje sam |

---

## Stack

| Element | Technologia |
|---------|-------------|
| Język | TypeScript |
| Uruchomienie | `tsx` (bez kompilacji) |
| AI | OpenRouter (przez `openai` SDK) |
| Input od użytkownika | `readline` (wbudowany w Node.js) |

---

## Struktura projektu

```
js-ai-access-dryrun/
├── src/
│   ├── index.ts       # start — pętla CLI
│   ├── planner.ts     # wysyła listę plików do LLM → dostaje plan (JSON)
│   └── executor.ts    # przenosi pliki + zapisuje do logu
├── workspace/         # przykładowe pliki do organizacji
├── logs/              # audit.log (pomijany przez git)
├── package.json
├── tsconfig.json
└── .env               # OPENROUTER_API_KEY
```

---

## Jak działa krok po kroku

```
1. Scan        workspace/ → lista plików
2. Plan        LLM dostaje listę → zwraca JSON z planem przeniesień
3. Preview     CLI wyświetla plan czytelnie dla użytkownika
4. Confirm     Pytanie: "Continue? [yes/no]"
5a. YES        Pliki są przenoszone + wpis do logs/audit.log
5b. NO         Nic się nie dzieje — czyste wyjście
```

---

## Przykład działania

```
Planning 3 operation(s):
  [MOVE] invoice_2024_01.pdf   →  invoices/invoice_2024_01.pdf
  [MOVE] cat_vacation.jpg      →  photos/cat_vacation.jpg
  [MOVE] rental_agreement.docx →  documents/rental_agreement.docx

Continue? [yes/no]: yes

[OK] invoice_2024_01.pdf → invoices/invoice_2024_01.pdf
[OK] cat_vacation.jpg → photos/cat_vacation.jpg
[OK] rental_agreement.docx → documents/rental_agreement.docx

Logged to logs/audit.log
```

---

## Podstawa teoretyczna

Dokument: `../../../../Readme-security-pl.md`

| Sekcja | Temat |
|--------|-------|
| s01e03 — Poziom 2 | Dry Run Mode |
| s01e03 — Cztery zasady | HITL, backup, logi, potwierdzenie |
| s01e03 — Zasada najniższych uprawnień | Agent dostaje tylko to, czego potrzebuje |
