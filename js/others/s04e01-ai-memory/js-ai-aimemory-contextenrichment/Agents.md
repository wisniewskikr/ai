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

CLI, które zadaje to samo pytanie AI dwa razy:

1. Z **surowym** kontekstem — tylko opisy dokumentów
2. Z **wzbogaconym** kontekstem — opisy + zależności, tagi, powiązania

Pokazuje różnicę w odpowiedziach na ekranie.

---

## Scenariusz

Baza wiedzy małej firmy — 4 dokumenty:

| Dokument | Opis |
|----------|------|
| Project Alpha | System e-commerce |
| Project Beta | Panel administracyjny |
| Payment API | Moduł obsługi płatności |
| Auth Service | Logowanie i autoryzacja |

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
=== BAZA WIEDZY FIRMY — Demo Pamięci AI ===

Wybierz pytanie:
  1. Które projekty używają API płatności?
  2. Jakie komponenty zależą od Auth Service?
  3. Co wiem o bazach danych w naszym systemie?
  4. Własne pytanie...
  5. Wyjście
```

---

## Przykładowy wynik

```
Pytanie: "Które projekty używają API płatności?"

--- KONTEKST SUROWY ---
"Nie mam wystarczających informacji o zależnościach między projektami."

--- KONTEKST WZBOGACONY ---
"Z dokumentacji wynika, że Payment API jest używane przez Project Alpha i Project Beta."

Wniosek: wzbogacenie kontekstu ujawnilo zaleznosci niewidoczne w surowym tekscie.
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
│   │   ├── system.ts          # prompt systemowy dla AI
│   │   └── question-context.ts # szablon pytania z kontekstem
│   ├── services/
│   │   ├── ai-client.ts       # klient OpenRouter
│   │   └── compare.ts         # logika porownywania odpowiedzi
│   └── utils/
│       ├── knowledge-base.ts  # dokumenty surowe i wzbogacone
│       └── logger.ts          # zapis logow do /logs
├── logs/                      # logi aplikacji (auto-generowane)
├── config.json                # model, timeouty, limity
├── index.ts                   # punkt wejscia, menu CLI
├── .env                       # OPENROUTER_API_KEY (nie commituj!)
├── .env.example               # szablon zmiennych
└── Readme.md                  # dokumentacja (EN)
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
