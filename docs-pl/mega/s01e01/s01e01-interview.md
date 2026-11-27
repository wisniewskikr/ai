# S01E01 – Generowanie tekstu: od tokenu do agenta

## Spis treści

- [Opis](#opis)
- [1. Model](#1-model)
- [2. Model - Wejście](#2-model---wejście)
- [3. Model - Wyjście](#3-model---wyjście)
- [4. Model - Ograniczenia](#4-model---ograniczenia)
- [5. Model - Rozwiązania ograniczeń](#5-model---rozwiązania-ograniczeń)
- [6. Harness](#6-harness)
- [7. Narzędzia](#7-narzędzia)
- [8. Strategie narzędzi](#8-strategie-narzędzi)
- [9. Strategie narzędzi - Function calling](#9-strategie-narzędzi---function-calling)
- [10. Strategie narzędzi - Dispatcher](#10-strategie-narzędzi---dispatcher)
- [11. Strategie narzędzi - Tool search](#11-strategie-narzędzi---tool-search)
- [12. Strategie narzędzi - Code mode](#12-strategie-narzędzi---code-mode)
- [13. Źródła narzędzi](#13-źródła-narzędzi)
- [14. Źródła narzędzi - Własne narzędzia](#14-źródła-narzędzi---własne-narzędzia)
- [15. Źródła narzędzi - CLI](#15-źródła-narzędzi---cli)
- [16. Źródła narzędzi - Serwery MCP](#16-źródła-narzędzi---serwery-mcp)
- [17. Agent](#17-agent)
- [18. Wnioski](#18-wnioski)
- [19. Pytania](#19-pytania)

---

## Opis

**Cel wykładu:** zrozumieć, jak LLM faktycznie generuje tekst, żeby świadomie wykorzystywać mocne strony modeli, omijać ich słabości i skutecznie budować agentów AI.

| Część | Sekcje | O czym |
|---|---|---|
| **Model** | 1–5 | Czym jest LLM, co dostaje (wejście), co oddaje (wyjście), czego nie potrafi i jak sobie z tym radzić |
| **Harness** | 6 | Program wokół modelu, który robi wszystko poza generowaniem tokenów |
| **Narzędzia** | 7–16 | Jak model kontaktuje się ze światem: **strategie** (8–12) – jak pokazać narzędzia modelowi, **źródła** (13–16) – skąd harness je bierze |
| **Agent** | 17 | LLM + narzędzia w pętli |
| **Podsumowanie** | 18–19 | Wnioski i pytania kontrolne |

> Najpierw **silnik** (model), potem **samochód** (harness), na końcu **kierowca w trasie** (agent z narzędziami).

---

## 1. Model

**Model (LLM) to sieć z wagami, na serwerach dostawcy. Czyli to program, który czyta tekst i dopisuje do niego dalszy ciąg, zgadując, co powinno być dalej.**

Z LLM powiązane są elementy:

1. **Wejście** – format treningowy (ChatML) – sekcja 2.
2. **Wyjście** – tokeny – sekcja 3.
3. **Ograniczenia** – czego model nie potrafi – sekcja 4.
4. **Rozwiązania ograniczeń** – jak sobie z nimi radzić – sekcja 5.
5. **Obudowa** – harness – sekcja 6.

### Dostawcy

| Dostawca | Mocna strona |
|---|---|
| OpenAI | Prawie pełna multimodalność (ChatGPT, Codex) |
| Anthropic | Generowanie tekstu, rozumienie obrazów (Claude, Claude Code) |
| Google DeepMind | Multimodalność, w tym wideo (Gemini) |
| xAI | Cel: pełna multimodalność (Grok) |
| OpenRouter | Dostęp do modeli wszystkich labów i open-source |

---

## 2. Model - Wejście

**Wejście do modelu to wszystko, co wysyłasz do LLM, żeby dostać odpowiedź – model dostaje je jako tekst w formacie treningowym (np. ChatML) do „dokończenia”.**

### Komunikacja bezpośrednia i pośrednia

**Z LLM można komunikować się na dwa sposoby: bezpośrednio i pośrednio. Model zawsze dostaje tekst w formacie treningowym – różnica jest tylko w tym, kto ten tekst składa.**

| Komunikacja | Przykład | Co wysyłasz | Kto składa format treningowy |
|---|---|---|---|
| **Bezpośrednia** | Lokalny model, surowe completion (np. llama.cpp) | Gotowy tekst z `<\|im_start\|>`, `<\|im_end\|>` | Ty |
| **Pośrednia** | API (OpenAI, Anthropic, OpenRouter) | JSON: wiadomości z rolami + ustawienia | Serwer API dostawcy |

```
Bezpośrednia: Ty ─────────────────────────────tekst ChatML──────────► tokenizer ──► model
Pośrednia:    Ty ──JSON (role + ustawienia)──► serwer API ──ChatML──► tokenizer ──► model
```

### Elementy wejścia LLM

**Request = wiadomości z rolami + ustawienia. Serwer API zamienia go na kontekst – tekst, który widzi model.**

| Element | Zawartość |
|---|---|
| Wiadomości | Tablica wiadomości z rolami do „dokończenia” odpowiedzią AI |
| Ustawienia | Model, poziom reasoning, dostępne narzędzia, pola specyficzne dla platformy |

### Kontekst

**Kontekst to cały tekst, który model widzi w jednym requeście: wiadomości z rolami (system prompt, historia rozmowy, wyniki narzędzi) + ustawienia zamienione na tekst (np. definicje narzędzi) – jego „pamięć robocza”.**

Kontekst jest ograniczony, a większość z niego nie pochodzi od użytkownika.

- **System prompt** – treść wiadomości z rolą `system`; steruje zachowaniem modelu.
- Proste „say hi” w Claude Code ≈ **21 000 tokenów**: system prompt harnessu, opisy narzędzi, `CLAUDE.md`, dane typu `git status`.
- **Context window** – limit tokenów naraz: ok. **250k–1M**.
- **Auto-compaction** – harness kompresuje lub przycina historię; model traci z oczu część danych (np. pierwotne polecenie) i jakość **po cichu** spada.
- **Context understanding** – jakość rozumowania spada przy długim kontekście; reguła: poniżej **30–40%** limitu.

> To, że model obsłuży 1M tokenów, nie znaczy, że warto ich tyle używać.

### Ustawienia

**Ustawienia to parametry requestu, które mówią, jak ma przebiec generowanie – a nie, co model ma przeczytać.**

| Ustawienie | Kto je czyta | Czy trafia do formatu treningowego? |
|---|---|---|
| `model` | Serwer API – wybiera model | Nie |
| `temperature`, `max_tokens` | Silnik – losowanie i długość odpowiedzi | Nie |
| `tools` | Serwer API – wpisuje je do `<tools>` | Tak, jako tekst |
| Poziom reasoning | Serwer API – np. włącza lub wyłącza myślenie | Często tak, jako tekst |

- Część ustawień **występuje też w formacie treningowym** – serwer API zamienia je na zwykły tekst w kontekście.
- Przy komunikacji bezpośredniej takie ustawienia **wpisujesz sam** do tekstu.

### Role

**Rola mówi, kto jest autorem danej wiadomości w historii.**

| Rola | Gdzie występuje | Znaczenie |
|---|---|---|
| `system` | Prawie wszędzie | Instrukcje i kontekst (kim jest model, co ma do dyspozycji) |
| `user` | Wszędzie | Wiadomość użytkownika |
| `assistant` | Wszędzie | Odpowiedź modelu |
| `tool` | OpenAI, Harmony, wiele modeli open-source (np. Qwen) | Wynik wywołania narzędzia |
| `developer` | OpenAI (nowsze modele), Harmony | Następca `system` przy niektórych modelach |

- Zestaw ról zależy od **formatu treningowego** – model rozumie tylko role, które widział w treningu.

### ChatML

**Do modelu trafia nie JSON z wiadomościami, tylko tekst w formacie treningowym.**

- **Formaty treningowe:** **ChatML**, **Harmony** (open-source od OpenAI). Serwer API zamienia JSON z requestu na taki tekst.
- **Tokeny specjalne** (`<|im_start|>`, `<|im_end|>`) – oddzielają wiadomości; rola to zwykły tekst zaraz po `<|im_start|>`.
- `<|im_end|>` wpisany przez użytkownika to **6 zwykłych tokenów** – użytkownik nie zamknie sam swojej tury.

**Przykład** (format ChatML – to, co faktycznie widzi model):

```
<|im_start|>system
You are Qwen, a helpful assistant.<|im_end|>
<|im_start|>user
Write a JavaScript function that checks if a number is even.<|im_end|>
<|im_start|>assistant
```

> **Kluczowy trik:** na końcu dopisuje się na sztywno `<|im_start|>assistant` – dzięki temu autocomplete „wie”, że teraz pisze odpowiedź asystenta.

---

## 3. Model - Wyjście

**LLM to probabilistyczne autouzupełnianie: dopisuje token po tokenie, a każdy wybiera z rozkładu prawdopodobieństwa, nie przez sprawdzanie faktów.**

- **Token** – fragment tekstu (słowo, część słowa, znak); sieć widzi tylko jego ID liczbowe.
- **Tokenizer** – słownik zamieniający tekst na ID (encode) i z powrotem (decode); każdy model ma swój, a tekst nieangielski lub emoji = więcej tokenów.
- **Token stopu** – model sam sygnalizuje koniec generowania.
- **Niedeterminizm** – ten sam prompt ≠ ta sama odpowiedź; nawet `temperature: 0` nie gwarantuje powtarzalności.

> Wybranego tokenu **nie da się cofnąć** – błąd się kumuluje. Pracujemy na zwiększaniu szansy, a nie na pewności.

### Structured outputs

**Model może zwrócić JSON zgodny ze schematem, który łatwo przetworzyć w kodzie.**

- Structured output to sposób, żeby odpowiedź modelu mógł przeczytać **program**, a nie człowiek.
- Pozwala **wyciągać dane** z dokumentów i używać LLM **w logice aplikacji**.
- Cały **function calling** (sekcja 9) stoi na tym samym mechanizmie: model ma wygenerować JSON pasujący do schematu.

> Schemat kontroluje kształt odpowiedzi, a nie jej prawdziwość.

**Przykład** (format Qwen, ChatML – schemat i odpowiedź to zwykły tekst):

```
<|im_start|>system
Wyciągnij dane. Odpowiedz tylko JSON-em:
{"city": string, "population": number}<|im_end|>
<|im_start|>user
Kyoto liczy ok. 1,4 mln mieszkańców.<|im_end|>
<|im_start|>assistant
{"city": "Kyoto", "population": 1400000}<|im_end|>
```

---

## 4. Model - Ograniczenia

**Model zna tylko to, co jest w wagach albo w kontekście, nie ma dostępu do świata zewnętrznego i zgaduje – więc nie gwarantuje ani poprawnego, ani powtarzalnego wyniku.**

| Ograniczenie | Przyczyna | Rozwiązanie |
|---|---|---|
| **Kumulacja błędów** – nie cofnie złego tokenu (np. `isEven(7) → true`) | Zgaduje pasujący token zamiast liczyć; generuje tylko do przodu | Reasoning, uruchomienie testów narzędziem |
| **Niedeterminizm** – ten sam prompt daje różne odpowiedzi (sekcja 3) | Token losowany z rozkładu; nawet `temperature: 0` nie gwarantuje powtarzalności (sprzęt, batching) | Sprawdzanie wyniku (structured outputs, testy), ponowienie próby, ocena na wielu przebiegach |
| **Konfabulacja** – wymyślona, wiarygodnie brzmiąca odpowiedź | Prawdopodobieństwo zamiast faktów; dziś głównie **brak lub błędny kontekst** („Tell me about Alice.”) | Dostarczyć właściwy kontekst; całkiem wyeliminować się nie da |
| **Brak dostępu do świata zewnętrznego** – nie zna aktualnych informacji (data, wersje pakietów), nie widzi Twoich plików | **Knowledge cutoff** – wiedza zamrożona w treningu; model tylko generuje tekst | Narzędzia |
| **Premise order** – zawodzi przy innej kolejności informacji | Słabość zwłaszcza mniejszych modeli | Większy model, przemyślana kolejność |
| **Brak pamięci** – każdy request startuje od zera | API jest bezstanowe; model widzi tylko to, co dostał w requeście | Harness wysyła całą historię; memory (sekcja 5) |
| **Ograniczony kontekst** – przy długiej historii jakość po cichu spada (sekcja 2) | Context window, auto-compaction, gorsze rozumienie długiego tekstu | Poniżej 30–40% okna, subagenty (sekcja 5) |
| **Prompt injection** – wykona polecenie ukryte w danych | Dla modelu instrukcja i dane to ten sam tekst w kontekście | Uprawnienia, sandbox, zaufane źródła |
| **Słabość tokenizacji** – myli się przy liczeniu liter i w arytmetyce (np. ile „r” w „strawberry”) | Widzi ID tokenów, nie pojedyncze litery czy cyfry (sekcja 3) | Narzędzie (kod) |
| **Przytakiwanie** (*sycophancy*) – zgadza się z użytkownikiem, nawet gdy ten nie ma racji | Trening na ocenach ludzi, którzy wolą zgodę | Neutralne pytania, prośba o krytykę |

---

## 5. Model - Rozwiązania ograniczeń

**Ograniczeń modelu nie da się usunąć – można tylko zwiększyć szansę na dobry wynik: daj modelowi lepszy kontekst i sprawdzaj, co oddaje.**

| Rozwiązanie | Jak działa | Na jakie ograniczenie (sekcja 4) |
|---|---|---|
| **Reasoning** – model najpierw „myśli” w tokenach, potem odpowiada | Thinking tokens to zwykłe tokeny w kontekście – model sam buduje sobie lepszy kontekst i może się poprawić („nie, to źle, spróbuję inaczej”); dziś raczej tryb (`thinking`, *adaptive*) niż rodzaj modelu; koszt: tokeny, czas, kontekst → wybierz najniższy poziom, który daje poprawny wynik | Kumulacja błędów |
| **Self-querying** – model sam wydobywa wiedzę z wag | Model zadaje sobie pytania pomocnicze i odpowiada na nie, zanim odpowie na właściwe pytanie – wiedza z wag trafia do kontekstu | Konfabulacja, kumulacja błędów |
| **Właściwy kontekst** – fakty zamiast zgadywania | Wklej dane, dokumentację, przykłady (*few-shot*); pozwól odpowiedzieć „nie wiem”; długie dane na początku, pytanie na końcu | Konfabulacja, brak pamięci, premise order |
| **Memory** – pamięć poza modelem | Każdy wątek startuje od zera, więc harness zapisuje ważne informacje (np. pliki, baza) i wkłada je do kontekstu, gdy są potrzebne | Brak pamięci |
| **Narzędzia** – program robi to, czego model nie wie albo nie policzy | Aktualne dane (data, wersje pakietów) i Twoje pliki → narzędzie; liczenie liter i arytmetyka → kod (sekcje 7–16) | Brak dostępu do świata zewnętrznego, słabość tokenizacji |
| **Sprawdzanie wyniku** – nie ufaj, sprawdzaj | Structured outputs (sekcja 3) sprawdzają kształt; testy, kompilator, linter – czy kod działa; kilka przebiegów lub ponowienie próby; drugi model jako sędzia | Niedeterminizm, kumulacja błędów |
| **Krótki kontekst** – mniej tekstu, lepsze rozumienie | Poniżej 30–40% okna; nowy wątek na nowe zadanie; podsumowania zamiast pełnej historii | Ograniczony kontekst |
| **Subagenty** – osobne konteksty na części zadania | Każdy subagent dostaje tylko swój fragment (np. 1 subagent na umowę: 79–80/80 pól vs 75–79 dla jednego agenta) i oddaje krótki wynik | Ograniczony kontekst |
| **Dobór modelu** – większy do trudnych zadań, mniejszy taniej i szybciej | Zacznij od mocnego modelu, potem sprawdź, czy słabszy też da radę | Premise order, trudne zadania |
| **Bezpieczeństwo** – załóż, że model wykona ukryte polecenie | Uprawnienia, sandbox, zaufane źródła; człowiek zatwierdza ryzykowne akcje (usuwanie, wysyłka, płatności) | Prompt injection |
| **Neutralne pytania** – nie podpowiadaj odpowiedzi | Pytaj bez sugestii („Oceń to rozwiązanie”, a nie „Dobre, prawda?”); poproś wprost o krytykę | Przytakiwanie |

---

## 6. Harness

**Model tylko generuje tokeny – wszystko inne robi harness (np. Claude Code, Codex, Cursor).**

| | Model (LLM) | Harness |
|---|---|---|
| Czym jest | Sieć z wagami, na serwerach dostawcy | Zwykły program, np. na Twoim komputerze |
| Co robi | Generuje kolejne tokeny | Składa kontekst, wysyła requesty, dopisuje odpowiedzi do historii |
| Analogia | Silnik | Samochód wokół silnika |

| Sposób pracy | Harness? |
|---|---|
| Lokalny model, surowe completion (np. llama.cpp) | Nie – sam piszesz tekst z `<\|im_start\|>` |
| Bezpośrednie API (`curl`) | Nie – sam doklejasz historię |
| Czat w przeglądarce (claude.ai, ChatGPT) | Tak |
| Claude Code, Codex, Cursor | Tak – pełny harness agentowy |

### Harness a serwery

**Harness to nie serwer – to klient, który rozmawia z dwoma rodzajami serwerów.**

| | Serwer API dostawcy | Harness | Serwer MCP (sekcja 16) |
|---|---|---|---|
| Gdzie działa | U dostawcy (OpenAI, Anthropic) | Zwykle na Twoim komputerze | Lokalnie albo zdalnie, jako osobny program |
| Co robi | Zamienia JSON z requestu na ChatML, uruchamia model, oddaje tokeny | Składa kontekst, wysyła requesty, wykonuje tool calle, prowadzi pętlę | Wystawia narzędzia (`tools/list`, `tools/call`) |
| Kto go pisze | Dostawca modelu | Np. Anthropic (Claude Code), OpenAI (Codex) | Autor serwera (np. GitHub, Playwright) |

```
HARNESS ──request (JSON)──► SERWER API ──ChatML──► MODEL
   │
   └──tools/call──► SERWER MCP ──► świat (GitHub, przeglądarka…)
```

- Model nie widzi żadnego serwera – widzi tylko tekst w kontekście.

- Wybierz harness, który działa z modelami wielu dostawców (np. Pi, OpenCode, T3 Code) – wtedy łatwo zmienisz model na lepszy.

> Bez harnessa **Ty jesteś harnessem**.

---

## 7. Narzędzia

**Narzędzia to jedyny sposób kontaktu modelu ze światem – model prosi o nie tool callem, a harness je wykonuje.**

| | Na jakie pytanie odpowiada | Przykłady |
|---|---|---|
| **Strategie narzędzi** (sekcje 8–12) | **Jak** pokazać narzędzia modelowi? | Function calling, dispatcher, tool search, code mode |
| **Źródła narzędzi** (sekcje 13–16) | **Skąd** harness bierze narzędzia? | Własne narzędzia, CLI, serwery MCP |

```
MODEL
  │  tool call (JSON)                  ← jedyny „kanał wyjścia” modelu
  ▼
HARNESS
  │  strategia: function calling / dispatcher / tool search / code mode
  │  źródło:    własne narzędzia / CLI / serwery MCP
  ▼
ŚWIAT (pliki, API, przeglądarka, baza danych…)
```

---

## 8. Strategie narzędzi

**Strategia decyduje, ile model wie o narzędziach z góry – im mniej w kontekście, tym taniej, ale tym więcej model musi zgadnąć lub doczytać.**

Co model widzi w każdym podejściu (dla jednego narzędzia):

| | Function calling (sekcja 9) | Dispatcher (sekcja 10) | Tool search (sekcja 11) | Code mode (sekcja 12) |
|---|---|---|---|---|
| Schematy w `<tools>` | Wszystkie narzędzia | 1 (`call_tool`) | 1 (`tool_search`) + już pobrane | 2 (`find`, `execute`) |
| Nazwa | ✅ | ✅ | ✅ | 🔍 po `find` |
| Opis narzędzia | ✅ | ❌ | 🔍 po wyszukaniu | ❌ |
| Nazwy argumentów | ✅ | ✅ | 🔍 po wyszukaniu | 🔍 po `find` |
| Typy argumentów | ✅ | ❌ | 🔍 po wyszukaniu | 🔍 po `find` |
| Opisy argumentów | ✅ | ❌ | 🔍 po wyszukaniu | ❌ |
| Wymagane pola, dozwolone wartości | ✅ | ❌ | 🔍 po wyszukaniu | ❌ |

**Przykład: to samo narzędzie `get_user` w każdej strategii:**

```
// Function calling – pełny schemat w <tools>
{"name": "get_user", "description": "Get user profile by ID", "parameters": {"type": "object", "properties": {"id": {"type": "string", "description": "User ID or 'me'"}}, "required": ["id"]}}

// Dispatcher – sama sygnatura w system prompcie
get_user(id)

// Tool search – na starcie sama nazwa; po tool_search("get_user") pełny schemat jak w function calling
get_user

// Code mode – nic na starcie; po find("user") w tool response:
api.getUser(id: string): {name, email}
```

**Inne strategie:**

- **Tool RAG** – harness (nie model) przed każdym requestem wybiera kilka pasujących narzędzi i tylko je wkłada do kontekstu.
- **Grupy narzędzi / router** – model najpierw wybiera kategorię (np. „poczta”), a potem dostaje tylko jej narzędzia.
- **Bash jako jedyne narzędzie** – model dostaje tylko `bash` i sam odkrywa komendy przez `--help`.
- **Skills** – model widzi nazwę i opis skilla, a pełną instrukcję wczytuje dopiero, gdy jej potrzebuje.

---

## 9. Strategie narzędzi - Function calling

**Model w ustrukturyzowanej formie prosi o narzędzie – harness je wykonuje (function calling).**

1. Użytkownik zadaje pytanie, które wymaga narzędzia (np. „Jakie pliki są w projekcie?”).
2. Model dostaje w system prompcie listę dostępnych narzędzi (nazwa, opis, schemat argumentów).
3. Harness wysyła request: system prompt z narzędziami + historia.
4. Model pisze tool call i się zatrzymuje (stop sequence `</tool_call>` – jak token stopu, sekcja 3).
5. Harness wykonuje narzędzie i dopisuje wynik do historii.
6. Nowy request → kolejny tool call albo odpowiedź.

- **Tool call** = prośba do harnessu; model sam niczego nie wykonuje.
- **Tool response** = dla modelu zwykły tekst w historii.

**Przykład: lista narzędzi, pytanie, tool call i tool response** (format Qwen, ChatML):

```
<|im_start|>system
You are a helpful assistant.

# Tools
<tools>
{"name": "bash", "description": "Run a shell command", "parameters": {"type": "object", "properties": {"command": {"type": "string"}}, "required": ["command"]}}
</tools><|im_end|>
<|im_start|>user
Jakie pliki są w projekcie?<|im_end|>
<|im_start|>assistant
<tool_call>
{"name": "bash", "arguments": {"command": "ls"}}
</tool_call><|im_end|>
<|im_start|>user
<tool_response>
cart.js
package.json
</tool_response><|im_end|>
<|im_start|>assistant
```

| Ograniczenie | Rozwiązanie |
|---|---|
| Wszystkie schematy narzędzi zajmują kontekst | **Tool search** (sekcja 11) – model widzi tylko wzmianki o narzędziach, pełną definicję pobiera na żądanie; albo **dispatcher** (sekcja 10), albo **code mode** (sekcja 12) |

---

## 10. Strategie narzędzi - Dispatcher

**Zamiast wielu narzędzi model dostaje jedno (`call_tool`) i podaje w nim nazwę narzędzia do wywołania.**

| | Function calling | Dispatcher |
|---|---|---|
| W kontekście | Wszystkie schematy | 1 schemat + krótka lista nazw narzędzi |
| Koszt kontekstu | Wysoki | Niski |
| Wdrożenie | Proste | Proste – bez sandboxa; harness po nazwie wybiera właściwą funkcję |
| Ryzyko | Mniejsze – schemat pilnuje argumentów | Model może pomylić argumenty, bo nie widzi ich schematu |

- W `<tools>` jest tylko 1 schemat, a nie 30. Nazwy pozostałych narzędzi są zwykłym tekstem w system prompcie.
- `call_tool` dostaje **nazwę i argumenty**. Harness sprawdza nazwę i wywołuje właściwe narzędzie.
- Różnica względem code mode: model **nie pisze kodu**, tylko wybiera jedno narzędzie na raz.

**Przykład: lista narzędzi, pytanie, `call_tool` i odpowiedź** (format Qwen, ChatML):

```
<|im_start|>system
You are a helpful assistant.
Available tools for call_tool: get_user(id), list_orders(user_id), send_email(to, body)

# Tools
<tools>
{"name": "call_tool", "description": "Call one of the available tools by name", "parameters": {"type": "object", "properties": {"name": {"type": "string"}, "args": {"type": "object"}}, "required": ["name", "args"]}}
</tools><|im_end|>
<|im_start|>user
Jaki jest mój e-mail?<|im_end|>
<|im_start|>assistant
<tool_call>
{"name": "call_tool", "arguments": {"name": "get_user", "args": {"id": "me"}}}
</tool_call><|im_end|>
<|im_start|>user
<tool_response>
{"name": "Jan", "email": "jan@example.com"}
</tool_response><|im_end|>
<|im_start|>assistant
Twój e-mail to jan@example.com.<|im_end|>
```

---

## 11. Strategie narzędzi - Tool search

**Zamiast wszystkich schematów model dostaje listę nazw i jedno narzędzie (`tool_search`), którym pobiera pełny schemat, gdy go potrzebuje.**

| | Function calling | Tool search |
|---|---|---|
| W kontekście | Wszystkie schematy | 1 schemat + lista nazw + schematy już pobrane |
| Koszt kontekstu | Wysoki | Niski – rośnie tylko o narzędzia faktycznie użyte |
| Wdrożenie | Proste | Proste – harness trzyma katalog narzędzi i wyszukiwarkę; bywa wbudowane u dostawcy (np. API Anthropic, Claude Code) |
| Ryzyko | Mniejsze – model widzi wszystko od razu | Model może źle wyszukać i nie znaleźć narzędzia; dodatkowy krok przed wywołaniem |

- W `<tools>` jest tylko 1 schemat, a nie 30. Nazwy pozostałych narzędzi są zwykłym tekstem w system prompcie.
- Po wyszukaniu model woła narzędzie **normalnie**, z pełnym schematem – jak w function calling (sekcja 9).
- Pobrany schemat zostaje w historii – przy kolejnym wywołaniu nie trzeba szukać ponownie.
- Różnica względem dispatchera i code mode: model **zna pełny schemat** przed wywołaniem, więc rzadziej myli argumenty.

**Przykład: lista narzędzi, pytanie, `tool_search`, wywołanie i odpowiedź** (format Qwen, ChatML):

```
<|im_start|>system
You are a helpful assistant.
Deferred tools (load with tool_search): get_user, list_orders, send_email

# Tools
<tools>
{"name": "tool_search", "description": "Load full definitions of deferred tools", "parameters": {"type": "object", "properties": {"query": {"type": "string"}}, "required": ["query"]}}
</tools><|im_end|>
<|im_start|>user
Jaki jest mój e-mail?<|im_end|>
<|im_start|>assistant
<tool_call>
{"name": "tool_search", "arguments": {"query": "get_user"}}
</tool_call><|im_end|>
<|im_start|>user
<tool_response>
{"name": "get_user", "description": "Get user profile by ID", "parameters": {"type": "object", "properties": {"id": {"type": "string", "description": "User ID or 'me'"}}, "required": ["id"]}}
</tool_response><|im_end|>
<|im_start|>assistant
<tool_call>
{"name": "get_user", "arguments": {"id": "me"}}
</tool_call><|im_end|>
<|im_start|>user
<tool_response>
{"name": "Jan", "email": "jan@example.com"}
</tool_response><|im_end|>
<|im_start|>assistant
Twój e-mail to jan@example.com.<|im_end|>
```

---

## 12. Strategie narzędzi - Code mode

**Zamiast wielu narzędzi model dostaje dwa (`find`, `execute`) i pisze kod.**

| | Function calling | Code mode |
|---|---|---|
| W kontekście | Wszystkie schematy | Tylko `find` i `execute` |
| Koszt kontekstu | Wysoki (≈ 2 300 z 3 000 tokenów przy 30 narzędziach) | Niski |
| Wdrożenie | Proste | Wymaga sandboxa (np. Daytona, Cloudflare); lokalnie proste |

- W `<tools>` są tylko 2 schematy, a nie 30. Resztę model poznaje przez `find`.
- `execute` dostaje **kod jako tekst**. Funkcje `api.*` istnieją tylko w sandboxie harnessu.

**Przykład: lista narzędzi, pytanie, `find`, `execute` i odpowiedź** (format Qwen, ChatML):

```
<|im_start|>system
You are a helpful assistant.

# Tools
<tools>
{"name": "find", "description": "Search available API functions", "parameters": {"type": "object", "properties": {"query": {"type": "string"}}, "required": ["query"]}}
{"name": "execute", "description": "Run JavaScript in a sandbox with access to `api`", "parameters": {"type": "object", "properties": {"code": {"type": "string"}}, "required": ["code"]}}
</tools><|im_end|>
<|im_start|>user
Jaki jest mój e-mail?<|im_end|>
<|im_start|>assistant
<tool_call>
{"name": "find", "arguments": {"query": "user"}}
</tool_call><|im_end|>
<|im_start|>user
<tool_response>
api.getUser(id: string): {name, email}
</tool_response><|im_end|>
<|im_start|>assistant
<tool_call>
{"name": "execute", "arguments": {"code": "return (await api.getUser('me')).email"}}
</tool_call><|im_end|>
<|im_start|>user
<tool_response>
jan@example.com
</tool_response><|im_end|>
<|im_start|>assistant
Twój e-mail to jan@example.com.<|im_end|>
```

---

## 13. Źródła narzędzi

**Źródło decyduje, skąd harness bierze narzędzia – model widzi je tak samo, bez względu na źródło.**

| | Własne narzędzia (sekcja 14) | CLI (sekcja 15) | Serwery MCP (sekcja 16) |
|---|---|---|---|
| Kto pisze kod narzędzia | Ty, w kodzie harnessu | Autor programu (`git`, `gh`, `curl`) | Autor serwera MCP |
| Gdzie działa | W procesie harnessu | W terminalu (przez `bash`) | W osobnym programie (lokalnie lub zdalnie) |
| Schematy w `<tools>` | Każde narzędzie osobno | 1 (`bash`) | Wszystkie narzędzia serwera |
| Skąd model zna narzędzie | Ze schematu | Z wag (trening) albo z `--help` | Ze schematu podanego przez serwer |
| Kontrola | Pełna | Średnia – `bash` może wszystko | Mała – kod jest cudzy |
| Gdzie najlepiej | Logika aplikacji | Lokalnie | Produkcja, wiele harnessów |

- **Źródło ≠ strategia** – narzędzia z każdego źródła można pokazać dowolną strategią (sekcje 8–12).
- Dla modelu tool call to zawsze ten sam JSON – różnicę widzi tylko harness.

**Przykład: to samo pytanie „Jaki jest mój e-mail?” z każdego źródła:**

```
// Własne narzędzie – funkcja w kodzie harnessu
{"name": "get_user", "arguments": {"id": "me"}}

// CLI – komenda przez bash
{"name": "bash", "arguments": {"command": "gh api user --jq .email"}}

// Serwer MCP – narzędzie serwera, nazwa z prefiksem serwera (np. w Claude Code)
{"name": "mcp__github__get_me", "arguments": {}}
```

---

## 14. Źródła narzędzi - Własne narzędzia

**Własne narzędzie to funkcja w kodzie harnessu + schemat, który opisuje ją modelowi.**

1. Piszesz funkcję (np. `getUser(id)`).
2. Opisujesz ją schematem: nazwa, opis, argumenty.
3. Harness wkłada schemat do `<tools>`.
4. Model pisze tool call z nazwą narzędzia.
5. Harness po nazwie wybiera funkcję, wywołuje ją i dopisuje wynik do historii.

- **Opis jest dla modelu** – po nim model decyduje, kiedy i jak użyć narzędzia.
- Harness kontroluje wszystko: argumenty, uprawnienia, długość wyniku.

**Przykład: lista narzędzi, pytanie, tool call i odpowiedź** (format Qwen, ChatML):

```
<|im_start|>system
You are a helpful assistant.

# Tools
<tools>
{"name": "get_user", "description": "Get user profile by ID", "parameters": {"type": "object", "properties": {"id": {"type": "string", "description": "User ID or 'me'"}}, "required": ["id"]}}
</tools><|im_end|>
<|im_start|>user
Jaki jest mój e-mail?<|im_end|>
<|im_start|>assistant
<tool_call>
{"name": "get_user", "arguments": {"id": "me"}}
</tool_call><|im_end|>
<|im_start|>user
<tool_response>
{"name": "Jan", "email": "jan@example.com"}
</tool_response><|im_end|>
<|im_start|>assistant
Twój e-mail to jan@example.com.<|im_end|>
```

| Ograniczenie | Rozwiązanie |
|---|---|
| Każde narzędzie trzeba napisać i utrzymać | **CLI** (sekcja 15) – gotowe programy |
| Narzędzie działa tylko w jednym harnessie | **Serwer MCP** (sekcja 16) – jedno narzędzie dla wielu harnessów |

---

## 15. Źródła narzędzi - CLI

**Zamiast wielu narzędzi model dostaje `bash` i sam używa gotowych programów wiersza poleceń (`git`, `gh`, `curl`, `npm`).**

| | Własne narzędzia | CLI |
|---|---|---|
| W kontekście | Schemat każdego narzędzia | 1 schemat (`bash`) |
| Koszt kontekstu | Rośnie z liczbą narzędzi | Niski – model zna popularne CLI z wag (sekcja 4) |
| Wdrożenie | Trzeba napisać kod | Gotowe – wystarczy zainstalowany program |
| Ryzyko | Mniejsze – funkcja robi tylko to, co napisano | Większe – `bash` może wszystko (np. usunąć pliki); potrzebne uprawnienia lub sandbox |

- Nieznane CLI → model sam czyta `--help`.
- Długi wynik zajmuje kontekst – pomagają flagi typu `--json`, `--jq`, `| head`.
- Działa najlepiej **lokalnie**, gdzie programy są już zainstalowane i zalogowane.

**Przykład: lista narzędzi, pytanie, komenda i odpowiedź** (format Qwen, ChatML):

```
<|im_start|>system
You are a helpful assistant.

# Tools
<tools>
{"name": "bash", "description": "Run a shell command", "parameters": {"type": "object", "properties": {"command": {"type": "string"}}, "required": ["command"]}}
</tools><|im_end|>
<|im_start|>user
Jaki jest mój e-mail?<|im_end|>
<|im_start|>assistant
<tool_call>
{"name": "bash", "arguments": {"command": "gh api user --jq .email"}}
</tool_call><|im_end|>
<|im_start|>user
<tool_response>
jan@example.com
</tool_response><|im_end|>
<|im_start|>assistant
Twój e-mail to jan@example.com.<|im_end|>
```

---

## 16. Źródła narzędzi - Serwery MCP

**MCP (Model Context Protocol) to standard, w którym osobny program (serwer) wystawia narzędzia, a harness (klient) je pobiera i pokazuje modelowi.**

1. Harness łączy się z serwerem MCP – lokalnie (`stdio`) albo zdalnie (HTTP).
2. Pyta o listę narzędzi (`tools/list`) i dostaje nazwy, opisy, schematy.
3. Wkłada schematy do `<tools>` (często z prefiksem serwera, np. `mcp__github__get_me`).
4. Model pisze tool call → harness wysyła `tools/call` do serwera.
5. Wynik z serwera trafia do historii jako tool response.

| | Własne narzędzia | Serwer MCP |
|---|---|---|
| W kontekście | Tylko Twoje schematy | Wszystkie narzędzia serwera (często dziesiątki) |
| Koszt kontekstu | Pod Twoją kontrolą | Wysoki – dlatego warto użyć innej strategii niż function calling: dispatcher (sekcja 10), tool search (sekcja 11) lub code mode (sekcja 12) |
| Wdrożenie | Kod w harnessie | Konfiguracja serwera; jeden serwer działa w wielu harnessach (Claude Code, Codex, Cursor) |
| Ryzyko | Mniejsze – kod jest Twój | Kod serwera jest cudzy – trzeba mu ufać; jego opisy trafiają do kontekstu (prompt injection) |

- **Model nie wie o MCP** – widzi zwykłe narzędzia w `<tools>`.
- Logowanie (np. OAuth) i uprawnienia są po stronie serwera → dobre na **produkcję**.
- Przykłady: Playwright MCP (przeglądarka), GitHub MCP.

**Przykład: lista narzędzi, pytanie, tool call i odpowiedź** (format Qwen, ChatML):

```
<|im_start|>system
You are a helpful assistant.

# Tools
<tools>
{"name": "mcp__github__get_me", "description": "Get my GitHub profile", "parameters": {"type": "object", "properties": {}}}
</tools><|im_end|>
<|im_start|>user
Jaki jest mój e-mail?<|im_end|>
<|im_start|>assistant
<tool_call>
{"name": "mcp__github__get_me", "arguments": {}}
</tool_call><|im_end|>
<|im_start|>user
<tool_response>
{"email": "jan@example.com"}
</tool_response><|im_end|>
<|im_start|>assistant
Twój e-mail to jan@example.com.<|im_end|>
```

---

## 17. Agent

**Agent = LLM + narzędzia w pętli.**

- Tool call → pętla trwa; odpowiedź tekstem → pętla się kończy.
- Harness to dosłownie pętla `while` z limitem kroków (np. 40); za niski limit zatrzyma agenta przed odpowiedzią.
- Narzędzia mogą pochodzić z dowolnego źródła (sekcje 13–16): **CLI lokalnie, MCP na produkcji**.
- Minimalny agent jest prosty, **trwałe agenty do długich zadań** – dużo bardziej złożone.
- **Self-management** – agent sam zarządza swoimi ustawieniami (np. Pi, OpenCode 2).
- **Ambient, durable agents** – zdalne agenty działające wg harmonogramu i zdarzeń; wymagają bezpiecznych narzędzi (sandbox, dedykowane konta).

---

## 18. Wnioski

| Sekcja | Wniosek |
|---|---|
| 2. Model - Wejście | Dla modelu **czat to tekst** z tokenami specjalnymi (ChatML). |
| 2. Model - Wejście | **Długie konteksty są stratne** – trzymaj się poniżej 30–40% okna. |
| 3. Model - Wyjście | Model **nie odpowiada na wiadomość** – dopisuje token po tokenie do historii i nie cofnie wybranego. |
| 3. Model - Wyjście | **Schemat kontroluje kształt, nie prawdę.** |
| 4. Model - Ograniczenia | Wyniki są **niedeterministyczne** – pracujemy na prawdopodobieństwie, nie na pewności. |
| 4. Model - Ograniczenia | Czego nie ma w **wagach** ani w **kontekście**, tego model nie użyje; **konfabulacja** wynika dziś głównie z braku kontekstu. |
| 5. Model - Rozwiązania ograniczeń | Ograniczeń **nie da się usunąć** – daj modelowi lepszy kontekst (reasoning, fakty, memory, subagenty) i **sprawdzaj wynik**. |
| 6. Harness | Model **tylko generuje tokeny** – resztę robi **harness**. |
| 7. Narzędzia | **Narzędzia** dają dane spoza treningu i działanie w świecie. |
| 8–12. Strategie narzędzi | **Im mniej o narzędziach w kontekście, tym taniej** – ale tym więcej model musi zgadnąć lub doczytać. |
| 13–16. Źródła narzędzi | **Źródło narzędzia** (własne, CLI, MCP) zmienia pracę harnessu, nie to, co widzi model. |
| 17. Agent | **Pętla + narzędzia = agent.** |
| Całość | **Harness ukrywa mechanikę**, a mechanika jest stabilna od 2022 – pozwala **rozumować od pierwszych zasad**. |

---

## 19. Pytania

| Sekcja | Pytanie | Krótka odpowiedź |
|---|---|---|
| 1. Model | Czym jest LLM? | Siecią z wagami, która dopisuje dalszy ciąg tekstu, zgadując kolejne tokeny |
| 2. Model - Wejście | Jakie są role w rozmowie? | `system`, `user`, `assistant`, często `tool`; zestaw zależy od formatu treningowego |
| 2. Model - Wejście | Czym jest ChatML? | Formatem, który tokenami specjalnymi zamienia rozmowę w tekst do dokończenia |
| 2. Model - Wejście | Czy API pamięta rozmowę? | Nie – każdy request wysyła całą historię |
| 2. Model - Wejście | Skąd ≈ 21k tokenów przy „say hi”? | System prompt, opisy narzędzi, `CLAUDE.md`, `git status` itd. |
| 2. Model - Wejście | Dlaczego nie warto zapełniać 1M tokenów? | Jakość rozumowania spada; najlepiej poniżej 30–40% okna |
| 3. Model - Wyjście | Jak LLM generuje tekst? | Token po tokenie, aż wybierze token stopu; wybranego tokenu nie cofnie |
| 3. Model - Wyjście | Czym jest tokenizer? | Słownikiem zamieniającym tekst na ID tokenów i z powrotem |
| 3. Model - Wyjście | Czy `temperature: 0` gwarantuje powtarzalność? | Nie – wpływ mają też m.in. sprzęt i infrastruktura |
| 3. Model - Wyjście | Co gwarantuje structured output? | Tylko kształt odpowiedzi, nie prawdziwość |
| 4. Model - Ograniczenia | Skąd dziś biorą się halucynacje? | Głównie z brakującego lub błędnego kontekstu |
| 4. Model - Ograniczenia | Dlaczego model nie zna daty? | Knowledge cutoff; aktualne dane tylko przez narzędzia |
| 4. Model - Ograniczenia | Czym jest prompt injection? | Model wykonuje polecenie ukryte w danych, bo instrukcja i dane to dla niego ten sam tekst |
| 4. Model - Ograniczenia | Dlaczego model przytakuje? | Trenowano go na ocenach ludzi, którzy wolą zgodę |
| 5. Model - Rozwiązania ograniczeń | Jak radzić sobie z ograniczeniami modelu? | Nie da się ich usunąć – dawaj lepszy kontekst i sprawdzaj wynik |
| 5. Model - Rozwiązania ograniczeń | Po co reasoning? | Model buduje lepszy kontekst i poprawia się przed odpowiedzią |
| 5. Model - Rozwiązania ograniczeń | Czym jest self-querying? | Model zadaje sobie pytania pomocnicze, by wydobyć wiedzę z wag do kontekstu |
| 5. Model - Rozwiązania ograniczeń | Jak sprawdzić wynik modelu? | Structured outputs, testy, kilka przebiegów, drugi model jako sędzia |
| 5. Model - Rozwiązania ograniczeń | Jak dać agentowi pamięć? | Harness zapisuje ważne informacje poza modelem i wkłada je do kontekstu, gdy są potrzebne |
| 5. Model - Rozwiązania ograniczeń | Po co subagenty? | Osobne konteksty na części zadania poprawiają jakość dużych zadań |
| 6. Harness | Czym różni się model od harnessa? | Model tylko generuje tokeny (silnik); harness robi resztę (samochód) |
| 7. Narzędzia | Po co modelowi narzędzia? | To jedyny kontakt ze światem – model prosi tool callem, harness wykonuje |
| 8. Strategie narzędzi | Czym różnią się strategie narzędzi? | Tym, ile model wie z góry: function calling – pełne schematy, dispatcher – same sygnatury, tool search – same nazwy, schemat pobiera na żądanie, code mode – nic, doczytuje przez `find` |
| 9. Strategie narzędzi - Function calling | Jak działa tool call? | Model pisze wywołanie → stop → harness wykonuje → wynik do historii → kolejny request |
| 10. Strategie narzędzi - Dispatcher | Czym jest dispatcher? | Jedno narzędzie `call_tool(name, args)` – model podaje nazwę, harness wywołuje właściwe narzędzie |
| 11. Strategie narzędzi - Tool search | Czym jest tool search? | Model widzi nazwy narzędzi i pełny schemat pobiera przez `tool_search` dopiero, gdy go potrzebuje |
| 12. Strategie narzędzi - Code mode | Czym jest code mode? | Model dostaje `find` i `execute` i pisze kod zamiast wołać wiele narzędzi |
| 13. Źródła narzędzi | Czym różnią się źródła narzędzi? | Tym, kto pisze i gdzie działa kod: własne – w harnessie, CLI – gotowe programy przez `bash`, MCP – osobny serwer |
| 14. Źródła narzędzi - Własne narzędzia | Jak dodać własne narzędzie? | Napisać funkcję i schemat; harness wkłada schemat do `<tools>` i woła funkcję po nazwie |
| 15. Źródła narzędzi - CLI | Dlaczego CLI jest tanie w kontekście? | Wystarczy 1 schemat (`bash`); popularne CLI model zna z wag |
| 16. Źródła narzędzi - Serwery MCP | Czym jest serwer MCP? | Osobnym programem, który wystawia narzędzia (`tools/list`, `tools/call`) dla wielu harnessów |
| 16. Źródła narzędzi - Serwery MCP | CLI czy MCP? | CLI lokalnie, MCP na produkcji |
| 17. Agent | Czym jest agent? | LLM w pętli: tool call kontynuuje, odpowiedź tekstowa kończy |
| 17. Agent | Czym są ambient, durable agents? | Zdalne agenty działające wg harmonogramu i zdarzeń, z bezpiecznymi narzędziami |
