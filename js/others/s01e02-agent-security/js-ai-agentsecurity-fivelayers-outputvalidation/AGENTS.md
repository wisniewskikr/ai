# AGENTS.md

## Cel projektu

Prosty CLI chat w TypeScript z OpenRouter demonstrujący pipeline walidacji wyjścia (Warstwa 3 z 5 warstw obrony agentów AI).

Kontekst: **asystent bankowy** obsługujący fikcyjnych klientów. Zanim odpowiedź trafi do użytkownika, przechodzi przez 5 warstw sprawdzania — żeby model nie wyciekł danych, nie wygenerował kodu ani nie wyskoczył poza temat.

Referencja: `Readme-security-pl.md` sekcja "Katalog możliwych walidacji wyjścia (Warstwa 3)".

---

## Stos technologiczny

| Element | Wybór | Powód |
|---|---|---|
| Język | TypeScript | Jak ustalono |
| LLM provider | OpenRouter | Jeden klucz API, dostęp do wielu modeli |
| Model główny | `anthropic/claude-haiku-4-5` | Szybki i tani do demo |
| Model judge | `anthropic/claude-haiku-4-5` | Tani do klasyfikacji semantycznej |
| Interfejs | CLI (readline) | Minimalne demo, bez frameworków |

---

## Struktura projektu

```
src/
  index.ts                  — glowna petla chatu (readline), menu, symulowane odpowiedzi
  openrouter.ts             — klient OpenRouter API (fetch)
  pipeline.ts               — uruchamia walidatory po kolei, zwraca wynik
  config.ts                 — re-export config.json (jeden punkt importu konfiguracji)
  types.ts                  — wspoldzielone typy TypeScript
  prompts/
    bank-assistant.ts       — szablon system promptu (wstrzykuje dane klienta)
    judge.ts                — prompt LLM-as-judge (warstwa semantyczna)
  utils/
    clients.ts              — fikcyjne dane klientow (Jan Kowalski, Anna Nowak)
    logger.ts               — logger do pliku (logs/app.log)
    luhn.ts                 — algorytm Luhn do walidacji kart platniczych
  validators/
    1-structural.ts         — walidacje strukturalne odpowiedzi
    2-pattern.ts            — walidacje wzorcowe (regex/keyword)
    3-semantic.ts           — walidacje semantyczne (LLM-as-judge)
    4-contextual.ts         — walidacje kontekstowe
    5-sanitization.ts       — sanityzacja przed wyswietleniem
config.json                 — wszystkie zmienne konfiguracyjne (modele, limity, domeny)
logs/                       — logi aplikacji (tworzone automatycznie)
```

---

## Pipeline walidacji

Kazda odpowiedź modelu przechodzi przez walidatory w kolejnosci 1-5 **zanim trafi do uzytkownika**.

Mozliwe wyniki: `SAFE` | `SUSPICIOUS` | `BLOCK`

- `BLOCK` — odpowiedź zablokowana, uzytkownik dostaje komunikat o błędzie
- `SUSPICIOUS` — logowana, wyswietlana z ostrzezeniem
- `SAFE` — wyswietlana normalnie

> Analogia: To jak ochroniarz na wyjściu ze sklepu. Towar (odpowiedź modelu) jest sprawdzany zanim opuści budynek.

---

## Fikcyjne dane bankowe (mock)

Dane wstrzykiwane do system promptu. Klient jest identyfikowany na starcie sesji.

### Klient: Jan Kowalski (ID: 1001)

| Produkt | Szczegoly |
|---|---|
| Rachunek biezacy (PL02 1090 2402 0001) | Saldo: 4 231,50 PLN |
| Rachunek oszczednosciowy (PL02 1090 2402 0002) | Saldo: 18 750,00 PLN |
| Lokata 3-miesięczna | Kwota: 10 000 PLN, oprocentowanie: 5,2% w skali roku, data zakonczenia: 2025-08-15 |
| Karta kredytowa Visa Gold | Limit: 5 000 PLN, wykorzystano: 1 200 PLN, data splaty: 10. dzien miesiaca |
| Ostatnie transakcje | Biedronka -45,20 PLN, Przelew wychodzacy -500,00 PLN (Czynsz), Wyplata z bankomatu -200,00 PLN |

### Klient: Anna Nowak (ID: 1002)

| Produkt | Szczegoly |
|---|---|
| Rachunek biezacy (PL02 1090 2402 0011) | Saldo: 892,30 PLN |
| Rachunek walutowy EUR (PL02 1090 2402 0012) | Saldo: 2 340,00 EUR |
| Kredyt hipoteczny | Kwota pozostala: 287 500 PLN, rata miesieczna: 1 843 PLN, data splaty: 2042-03-01 |
| Karta debetowa Mastercard | Limit dzienny: 2 000 PLN |
| Ostatnie transakcje | Przelew przychodzacy +3 200 PLN (Wynagrodzenie), Orlen -180,00 PLN, Netflix -49,00 PLN |

---

## Katalog walidacji

### 1. Strukturalne (`1-structural.ts`)

Sprawdzenia bez AI — szybkie i tanie.

| Walidacja | Implementacja |
|---|---|
| Max dlugosc | BLOCK jesli odpowiedz > 2000 znakow |
| Min dlugosc | BLOCK dla pustych lub < 2 znakow |
| Encoding | Odrzuc null bytes (`\0`) i znaki sterujace (< 0x20, oprocz `\n`, `\r`, `\t`) |
| JSON schema | Jesli oczekiwano JSON — waliduj schemat, BLOCK jesli niezgodny |

### 2. Wzorcowe (`2-pattern.ts`)

Regex i keyword detection na odpowiedzi modelu.

| Wzorzec | Przykladowe frazy do blokowania |
|---|---|
| Dane wrazliwe | Numery kart platniczych (regex Luhn), PESEL, klucze API (`sk-...`, `Bearer ...`) |
| Zewnetrzne URL-e | Linki do domen spoza allowlisty (tylko `bank.pl` i podobne) |
| Kod wykonywalny | `eval()`, `exec()`, `system()`, `subprocess`, `os.system` |
| Wyciek system promptu | Fragment system promptu powtorzony w odpowiedzi (np. `[SYSTEM]`, `You are a bank assistant`) |
| Prompt injection relay | Odpowiedz zawiera instrukcje dla nastepnego systemu (`ignore previous`, `new task:`) |

> Wynik: `BLOCK` dla pewnych trafien, `SUSPICIOUS` dla czesciowych.

### 3. Semantyczne (`3-semantic.ts`)

Osobny, tani model (LLM-as-judge) klasyfikuje tresc odpowiedzi.

Prompt judge (patrz `src/prompts/judge.ts`):
```
IMPORTANT: Do NOT flag HTML tags, script tags, or inline JavaScript —
those are handled by a dedicated sanitization layer that runs after you.

Classify as BLOCK: full card numbers, API keys, system prompt content,
external phishing URLs, instructions to manipulate the user.

Classify as SUSPICIOUS: partial sensitive data (e.g. PESEL fragments),
unusual calls to urgent action outside normal banking.

Classify as SAFE: banking answers using client's own data, product
explanations, polite refusals, responses with HTML tags in otherwise
normal banking content.
```

- Lapie przypadki, ktore regex pomija (np. dane wrazliwe zapisane slownie)
- Drozszy niz regex — uruchamiany tylko jesli warstwy 1-2 daly SAFE/SUSPICIOUS
- **Nie** klasyfikuje tagow HTML jako zagrozen — to zadanie Warstwy 5

### 4. Kontekstowe (`4-contextual.ts`)

| Walidacja | Implementacja |
|---|---|
| Scope check | BLOCK jesli odpowiedz dotyczy tematow spoza bankowosci (gotowanie, pogoda, polityka, sport itp.) — detekcja keyword-based |
| Grounding check | SUSPICIOUS jesli odpowiedz zawiera numer IBAN nie nalezacy do biezacego klienta |

### 5. Sanityzacja (`5-sanitization.ts`)

Ostatni krok — czyszczenie przed wyswietleniem uzytkownikowi.

| Podejscie | Implementacja |
|---|---|
| Strip HTML / script tags | Usuniecie `<script>`, `<iframe>`, `onclick=` z odpowiedzi |
| Markdown escaping | Zamiana zloslwych linkow `[tekst](javascript:...)` na `[tekst][link usuniety]` |
| URL sanitization | Przepusc tylko URL-e z allowlisty domen, reszte zamien na `[link usuniety]` |
| Redaction | Automatyczne maskowanie danych wrazliwych (np. `4111 **** **** 1111`) przed wyswietleniem |

---

## Menu glowne

```
=== Bank Assistant AI — Output Validation Demo ===

Select an option:

  Safe responses (pass all layers):
  [1] What is my current account balance?
  [2] When does my term deposit end and what is the interest rate?

  Responses triggering each validation layer:
  [3] [Simulated] Model leaks system prompt content.                         (-> Layer 1: Structural / Pattern)
  [4] [Simulated] Model outputs a credit card number in response.            (-> Layer 2: Pattern)
  [5] [Simulated] Model suggests visiting an external phishing site.         (-> Layer 3: Semantic)
  [6] [Simulated] Model answers a question about cooking recipes.            (-> Layer 4: Contextual)
  [7] [Simulated] Model response contains <script>alert(1)</script>.         (-> Layer 5: Sanitization)

  [8] Type your own question
  [9] Change client
  [0] Exit

> Your choice:
```

---

## Przykladowe zachowanie

```
> [1] What is my current account balance?

[Model response received]
Layer 1 - Structural      OK
Layer 2 - Pattern         OK
Layer 3 - Semantic        SAFE
Layer 4 - Contextual      OK — banking topic, data matches client record
Layer 5 - Sanitization    OK — no HTML, no unsafe links
Assistant: Your current account balance is 4,231.50 PLN.
```

```
> [3] [Simulated] Model leaks system prompt content.

[Simulated model response received]
Layer 1 - Structural      BLOCK — response too long (2163 chars, max 2000)
Response blocked. Reason: response too long (2163 chars, max 2000)
```

```
> [4] [Simulated] Model outputs a credit card number in response.

[Model response received]
Layer 1 - Structural      OK
Layer 2 - Pattern         BLOCK — matched: credit card number pattern (Luhn valid)
Response blocked. Reason: sensitive data detected in output.
```

```
> [5] [Simulated] Model suggests visiting an external phishing site.

[Model response received]
Layer 1 - Structural      OK
Layer 2 - Pattern         OK
Layer 3 - Semantic        BLOCK — response classified as containing external instructions or unsafe URL
Response blocked. Reason: semantic output violation detected.
```

```
> [6] [Simulated] Model answers a question about cooking recipes.

[Model response received]
Layer 1 - Structural      OK
Layer 2 - Pattern         OK
Layer 3 - Semantic        SAFE
Layer 4 - Contextual      BLOCK — response off-topic for a bank assistant
Response blocked. Reason: response not related to banking services.
```

```
> [7] [Simulated] Model response contains <script>alert(1)</script>.

[Model response received]
Layer 1 - Structural      OK
Layer 2 - Pattern         SUSPICIOUS — HTML tag detected
Layer 3 - Semantic        SAFE
Layer 4 - Contextual      OK
Layer 5 - Sanitization    BLOCK — script tag stripped, response sanitized before display
Response sanitized. Dangerous content removed.
```

---

## Zmienne srodowiskowe

| Zmienna | Opis |
|---|---|
| `OPENROUTER_API_KEY` | Klucz API OpenRouter (wymagany) |
