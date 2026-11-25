# S01E01 – Generowanie tekstu: od tokenu do agenta

## Spis treści

- [Opis](#opis)
- [1. Tokeny](#1-tokeny)
- [2. Tokenizer](#2-tokenizer)
- [3. Prawdopodobieństwo](#3-prawdopodobieństwo)
- [4. Role](#4-role)
- [5. Request](#5-request)
- [6. ChatML](#6-chatml)
- [7. Harness](#7-harness)
- [8. Kontekst](#8-kontekst)
- [9. Ograniczenia](#9-ograniczenia)
- [10. Reasoning](#10-reasoning)
- [11. Structured outputs](#11-structured-outputs)
- [12. Narzędzia](#12-narzędzia)
- [13. Strategie narzędzi](#13-strategie-narzędzi)
- [14. Function calling](#14-function-calling)
- [15. Dispatcher](#15-dispatcher)
- [16. Tool search](#16-tool-search)
- [17. Code mode](#17-code-mode)
- [18. Źródła narzędzi](#18-źródła-narzędzi)
- [19. Własne narzędzia](#19-własne-narzędzia)
- [20. CLI](#20-cli)
- [21. Serwery MCP](#21-serwery-mcp)
- [22. Agent](#22-agent)
- [23. Harness od środka](#23-harness-od-środka)
- [24. Dostawcy](#24-dostawcy)
- [25. Sterowanie](#25-sterowanie)
- [26. Wnioski](#26-wnioski)
- [27. Pytania](#27-pytania)

---

## Opis

**Cel wykładu:** zrozumieć, jak LLM faktycznie generuje tekst, żeby świadomie wykorzystywać mocne strony modeli, omijać ich słabości i skutecznie budować agentów AI.

| Sekcja | Co wyjaśnia | Powiązanie z celem |
|---|---|---|
| 1–3 | Tokeny, tokenizer, prawdopodobieństwo | Fundament: model nie „odpowiada”, tylko dopisuje kolejny token |
| 4–6 | Role, request, ChatML | Co faktycznie trafia do modelu |
| 7–8 | Harness i kontekst | Co robi program wokół modelu i ile model „widzi” |
| 9 | Czego model nie wie i nie umie | Pokazuje, **dlaczego** potrzebne są kolejne mechanizmy |
| 10–17 | Reasoning, structured outputs, narzędzia, strategie narzędzi, function calling, dispatcher, tool search, code mode | Jak model się koryguje i przechodzi „od odpowiedzi do działań” |
| 18–21 | Źródła narzędzi: własne narzędzia, CLI, serwery MCP | Skąd harness bierze narzędzia, które pokazuje modelowi |
| 22 | Pętla agenta | Złożenie wszystkiego w działającego agenta |
| 23–25 | Ukryta mechanika, dostawcy, sterowanie | Jak świadomie pracować z gotowymi narzędziami AI |
| 26–27 | Wnioski i pytania | Szybka powtórka |

---

## 1. Tokeny

**LLM to probabilistyczne autouzupełnianie tokenów.**

- **LLM** – sieć neuronowa trenowana na dużych zbiorach tekstu: wejście (prompt) → wyjście (completion).
- **Token** – fragment tekstu (słowo, część słowa, spacja, znak interpunkcyjny), w którym model „widzi” tekst.
- **Next token prediction** – model dopisuje token po tokenie na podstawie poprzednich, a nie całą odpowiedź naraz.
- **Token stopu (end token)** – model musi sam zasygnalizować koniec generowania.
- Przykład: `The capital of the US is` → `Washington`, `,`, ` D`, `.C.` …

> Wybranego tokenu **nie da się cofnąć** – staje się częścią tekstu, który model czyta w następnym kroku, więc błąd się kumuluje.

---

## 2. Tokenizer

**Tokenizer działa w obie strony: tekst → liczby i liczby → tekst.**

| Kierunek | Nazwa | Przykład (ID poglądowe) |
|---|---|---|
| Człowiek → model | **encode** | `"Have a nice"` → `[12522, 264, 6555]` |
| Model → człowiek | **decode** | `[1938]` → `" day"` |

```
tekst → [encode] → ID tokenów → MODEL → nowe ID → [decode] → tekst odpowiedzi
```

- **Tokenizer ≠ model** – zwykły słownik z regułami cięcia; sieć widzi tylko liczby.
- **Każdy model ma swój tokenizer** – ten sam tekst w GPT i w Claude daje inną liczbę tokenów.
- Słownik najlepiej „zna” częsty tekst (angielski) – inny język lub emoji = **więcej tokenów**.
- **Multimodalność** – obrazy, audio, wideo też są tokenizowane; model gorzej widzi detale (dokładne kolory, **godzina na zegarze**).

---

## 3. Prawdopodobieństwo

**Każdy token wybierany jest z rozkładu prawdopodobieństwa, a nie przez sprawdzanie faktów.**

- Przykład rozkładu: `Certainly` 66%, `Sure` 14%, ` ``` ` 14%.
- Trening na „pomocnego asystenta” może wygrać z instrukcją (prośba „only code” → i tak `Certainly!`).
- „Losowa liczba” od modelu nie jest losowa (8 → 20%, 7 → 18%, 9 → 16%).
- **Niedeterminizm** – ten sam prompt ≠ ta sama odpowiedź (przyczyny: model, ustawienia, nawet sprzęt). Psuje powtarzalność, ale daje kreatywność.

| Parametr | Działanie |
|---|---|
| `temperature` | Losowość wyboru; `0` = najbardziej prawdopodobne tokeny, ale **bez gwarancji powtarzalności** |
| `top_p` | Ogranicza pulę tokenów branych pod uwagę |

> Pracujemy na zwiększaniu szansy, a nie na pewności.

---

## 4. Role

**Rola mówi, kto jest autorem danej wiadomości w historii.**

| Rola | Gdzie występuje | Znaczenie |
|---|---|---|
| `system` | Prawie wszędzie | Instrukcje i kontekst (kim jest model, co ma do dyspozycji) |
| `user` | Wszędzie | Wiadomość użytkownika |
| `assistant` | Wszędzie | Odpowiedź modelu |
| `tool` | OpenAI, Harmony, wiele modeli open-source (np. Qwen) | Wynik wywołania narzędzia |
| `developer` | OpenAI (nowsze modele), Harmony | Następca `system` przy niektórych modelach |

- Zestaw ról zależy od **formatu treningowego** – model rozumie tylko role, które widział w treningu.

---

## 5. Request

**Każdy request do LLM = kontekst + ustawienia.**

| Element | Zawartość |
|---|---|
| Kontekst | Tablica wiadomości z rolami (sekcja 4) do „dokończenia” odpowiedzią AI |
| Ustawienia | Model, poziom reasoning, dostępne narzędzia, pola specyficzne dla platformy |

- **API jest bezstanowe** – każdy request wysyła **całą historię**.
- **Responses API** (OpenAI) – obecnie najpopularniejszy format API.
- W odpowiedzi: `usage` (zużycie tokenów), a `output` to **lista**, nie pojedynczy string.

---

## 6. ChatML

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

## 7. Harness

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

> Bez harnessa **Ty jesteś harnessem**.

---

## 8. Kontekst

**Kontekst jest ograniczony, a większość z niego nie pochodzi od użytkownika.**

- **System prompt** – treść wiadomości z rolą `system`; steruje zachowaniem modelu.
- Proste „say hi” w Claude Code ≈ **21 000 tokenów**: system prompt harnessu, opisy narzędzi, `CLAUDE.md`, dane typu `git status`.
- **Context window** – limit tokenów naraz: ok. **250k–1M**.
- **Auto-compaction** – harness kompresuje lub przycina historię; model traci z oczu część danych (np. pierwotne polecenie) i jakość **po cichu** spada.
- **Context understanding** – jakość rozumowania spada przy długim kontekście; reguła: poniżej **30–40%** limitu.

> To, że model obsłuży 1M tokenów, nie znaczy, że warto ich tyle używać.

---

## 9. Ograniczenia

**Model zna tylko to, co jest w wagach albo w kontekście.**

- **Wagi** – parametry ustalone w treningu, „zamrożona” wiedza.
- **Kontekst (historia)** – tekst bieżącego requestu, „pamięć robocza”.

| Ograniczenie | Przyczyna | Rozwiązanie |
|---|---|---|
| Nie cofnie błędu (np. `isEven(7) → true`) | Zgaduje pasujący token zamiast liczyć; generuje tylko do przodu | Reasoning, uruchomienie testów narzędziem |
| **Konfabulacja** – wymyślona, wiarygodnie brzmiąca odpowiedź | Prawdopodobieństwo zamiast faktów; dziś głównie **brak lub błędny kontekst** („Tell me about Alice.”) | Dostarczyć właściwy kontekst; całkiem wyeliminować się nie da |
| Nie zna aktualnych informacji (data, wersje pakietów) | **Knowledge cutoff** – wiedza zamrożona w treningu | Narzędzia |
| Nie widzi Twoich plików | Brak dostępu do świata | Narzędzia |
| **Premise order** – zawodzi przy innej kolejności informacji | Słabość zwłaszcza mniejszych modeli | Większy model, przemyślana kolejność |

---

## 10. Reasoning

**Model najpierw „myśli” w tokenach, potem odpowiada – i może się po drodze poprawić.**

- **Thinking tokens** – zwykłe tokeny w kontekście; przesuwają prawdopodobieństwo w stronę trafnej odpowiedzi → model **sam buduje sobie lepszy kontekst**.
- Obchodzi ograniczenie „nie cofnę tokenu” („nie, to źle, spróbuję inaczej”).
- **Ten sam mechanizm**, inna różnica: **trening** (głównie RL na sprawdzalnych zadaniach – matematyka, kod z testami).
- Dziś raczej **tryb niż rodzaj modelu** (parametr `thinking`, tryb *adaptive*).
- Koszt: tokeny, czas, kontekst → szukaj **najniższego poziomu, który daje poprawny wynik**.

---

## 11. Structured outputs

**Model może zwrócić JSON zgodny ze schematem, który łatwo przetworzyć w kodzie.**

- Structured output to sposób, żeby odpowiedź modelu mógł przeczytać **program**, a nie człowiek.
- Pozwala **wyciągać dane** z dokumentów i używać LLM **w logice aplikacji**.
- Cały **function calling** (sekcja 14) stoi na tym samym mechanizmie: model ma wygenerować JSON pasujący do schematu.

> Schemat kontroluje kształt odpowiedzi, a nie jej prawdziwość.

**Przykład bez API** (format Qwen, ChatML – schemat i odpowiedź to zwykły tekst):

```
<|im_start|>system
Wyciągnij dane. Odpowiedz tylko JSON-em:
{"city": string, "population": number}<|im_end|>
<|im_start|>user
Kyoto liczy ok. 1,4 mln mieszkańców.<|im_end|>
<|im_start|>assistant
{"city": "Kyoto", "population": 1400000}<|im_end|>
```

**Przykład z API** (OpenAI Responses API – schemat w ustawieniach requestu, nie w wiadomościach):

```json
{
  "model": "...",
  "input": "Kyoto liczy ok. 1,4 mln mieszkańców.",
  "text": { "format": {
    "type": "json_schema", "name": "city", "strict": true,
    "schema": {
      "type": "object",
      "properties": { "city": {"type": "string"}, "population": {"type": "number"} },
      "required": ["city", "population"],
      "additionalProperties": false
    }
  }}
}
```

---

## 12. Narzędzia

**Narzędzia to jedyny sposób kontaktu modelu ze światem – model prosi o nie tool callem, a harness je wykonuje.**

| | Na jakie pytanie odpowiada | Przykłady |
|---|---|---|
| **Strategie narzędzi** (sekcje 13–17) | **Jak** pokazać narzędzia modelowi? | Function calling, dispatcher, tool search, code mode |
| **Źródła narzędzi** (sekcje 18–21) | **Skąd** harness bierze narzędzia? | Własne narzędzia, CLI, serwery MCP |

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

## 13. Strategie narzędzi

**Strategia decyduje, ile model wie o narzędziach z góry – im mniej w kontekście, tym taniej, ale tym więcej model musi zgadnąć lub doczytać.**

Co model widzi w każdym podejściu (dla jednego narzędzia):

| | Function calling (sekcja 14) | Dispatcher (sekcja 15) | Tool search (sekcja 16) | Code mode (sekcja 17) |
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
- **Skills** (sekcja 23) – model widzi nazwę i opis skilla, a pełną instrukcję wczytuje dopiero, gdy jej potrzebuje.

---

## 14. Function calling

**Model w ustrukturyzowanej formie prosi o narzędzie – harness je wykonuje (function calling).**

1. Użytkownik zadaje pytanie, które wymaga narzędzia (np. „Jakie pliki są w projekcie?”).
2. Model dostaje w system prompcie listę dostępnych narzędzi (nazwa, opis, schemat argumentów).
3. Harness wysyła request: system prompt z narzędziami + historia.
4. Model pisze tool call i się zatrzymuje (stop sequence `</tool_call>` – jak token stopu, sekcja 1).
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
| Wszystkie schematy narzędzi zajmują kontekst | **Tool search** (sekcja 16) – model widzi tylko wzmianki o narzędziach, pełną definicję pobiera na żądanie; albo **dispatcher** (sekcja 15), albo **code mode** (sekcja 17) |

---

## 15. Dispatcher

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

## 16. Tool search

**Zamiast wszystkich schematów model dostaje listę nazw i jedno narzędzie (`tool_search`), którym pobiera pełny schemat, gdy go potrzebuje.**

| | Function calling | Tool search |
|---|---|---|
| W kontekście | Wszystkie schematy | 1 schemat + lista nazw + schematy już pobrane |
| Koszt kontekstu | Wysoki | Niski – rośnie tylko o narzędzia faktycznie użyte |
| Wdrożenie | Proste | Proste – harness trzyma katalog narzędzi i wyszukiwarkę; bywa wbudowane u dostawcy (np. API Anthropic, Claude Code) |
| Ryzyko | Mniejsze – model widzi wszystko od razu | Model może źle wyszukać i nie znaleźć narzędzia; dodatkowy krok przed wywołaniem |

- W `<tools>` jest tylko 1 schemat, a nie 30. Nazwy pozostałych narzędzi są zwykłym tekstem w system prompcie.
- Po wyszukaniu model woła narzędzie **normalnie**, z pełnym schematem – jak w function calling (sekcja 14).
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

## 17. Code mode

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

## 18. Źródła narzędzi

**Źródło decyduje, skąd harness bierze narzędzia – model widzi je tak samo, bez względu na źródło.**

| | Własne narzędzia (sekcja 19) | CLI (sekcja 20) | Serwery MCP (sekcja 21) |
|---|---|---|---|
| Kto pisze kod narzędzia | Ty, w kodzie harnessu | Autor programu (`git`, `gh`, `curl`) | Autor serwera MCP |
| Gdzie działa | W procesie harnessu | W terminalu (przez `bash`) | W osobnym programie (lokalnie lub zdalnie) |
| Schematy w `<tools>` | Każde narzędzie osobno | 1 (`bash`) | Wszystkie narzędzia serwera |
| Skąd model zna narzędzie | Ze schematu | Z wag (trening) albo z `--help` | Ze schematu podanego przez serwer |
| Kontrola | Pełna | Średnia – `bash` może wszystko | Mała – kod jest cudzy |
| Gdzie najlepiej | Logika aplikacji | Lokalnie | Produkcja, wiele harnessów |

- **Źródło ≠ strategia** – narzędzia z każdego źródła można pokazać dowolną strategią (sekcje 13–17).
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

## 19. Własne narzędzia

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
| Każde narzędzie trzeba napisać i utrzymać | **CLI** (sekcja 20) – gotowe programy |
| Narzędzie działa tylko w jednym harnessie | **Serwer MCP** (sekcja 21) – jedno narzędzie dla wielu harnessów |

---

## 20. CLI

**Zamiast wielu narzędzi model dostaje `bash` i sam używa gotowych programów wiersza poleceń (`git`, `gh`, `curl`, `npm`).**

| | Własne narzędzia | CLI |
|---|---|---|
| W kontekście | Schemat każdego narzędzia | 1 schemat (`bash`) |
| Koszt kontekstu | Rośnie z liczbą narzędzi | Niski – model zna popularne CLI z wag (sekcja 9) |
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

## 21. Serwery MCP

**MCP (Model Context Protocol) to standard, w którym osobny program (serwer) wystawia narzędzia, a harness (klient) je pobiera i pokazuje modelowi.**

1. Harness łączy się z serwerem MCP – lokalnie (`stdio`) albo zdalnie (HTTP).
2. Pyta o listę narzędzi (`tools/list`) i dostaje nazwy, opisy, schematy.
3. Wkłada schematy do `<tools>` (często z prefiksem serwera, np. `mcp__github__get_me`).
4. Model pisze tool call → harness wysyła `tools/call` do serwera.
5. Wynik z serwera trafia do historii jako tool response.

| | Własne narzędzia | Serwer MCP |
|---|---|---|
| W kontekście | Tylko Twoje schematy | Wszystkie narzędzia serwera (często dziesiątki) |
| Koszt kontekstu | Pod Twoją kontrolą | Wysoki – dlatego warto użyć innej strategii niż function calling: dispatcher (sekcja 15), tool search (sekcja 16) lub code mode (sekcja 17) |
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

## 22. Agent

**Agent = LLM + narzędzia w pętli.**

- Tool call → pętla trwa; odpowiedź tekstem → pętla się kończy.
- Harness to dosłownie pętla `while` z limitem kroków (np. 40); za niski limit zatrzyma agenta przed odpowiedzią.
- Narzędzia mogą pochodzić z dowolnego źródła (sekcje 18–21): **CLI lokalnie, MCP na produkcji**.
- Minimalny agent jest prosty, **trwałe agenty do długich zadań** – dużo bardziej złożone.

---

## 23. Harness od środka

**Harness ukrywa mechanikę modelu – upraszcza pracę, ale model widzi więcej i mniej, niż sugeruje UI.**

| Mechanizm | Co ukrywa / ryzyko |
|---|---|
| **Auto-compaction** (sekcja 8) | Agent „wie, o czym mówimy”, a widzi tylko część historii |
| **Plan mode** | Pomaga, chyba że plan jest za szeroki lub za szczegółowy |
| **Skills** | Model wybiera skill po nazwie i opisie – bywa pominięty lub użyty niepotrzebnie |
| **Attachments** | Treść plików bywa ładowana częściowo albo wcale |
| **Environment** | Zmiany (pliki, git) dokładane jako `<system-reminder>`, bo początku kontekstu nie zmienia się przez cache |

> Nasza wiadomość nie jest jedyną rzeczą, którą dostaje model.

---

## 24. Dostawcy

**Najlepszy model zmienia się często – unikaj vendor lock-in.**

| Dostawca | Mocna strona |
|---|---|
| OpenAI | Prawie pełna multimodalność (ChatGPT, Codex) |
| Anthropic | Generowanie tekstu, rozumienie obrazów (Claude, Claude Code) |
| Google DeepMind | Multimodalność, w tym wideo (Gemini) |
| xAI | Cel: pełna multimodalność (Grok) |
| OpenRouter | Dostęp do modeli wszystkich labów i open-source |

- Domyślnie najlepszy model; przy skali – niższy reasoning lub mniejszy model.
- Harness-agnostic ≈ provider-agnostic (np. Pi, OpenCode, T3 Code).

---

## 25. Sterowanie

**Zamiast precyzyjnych instrukcji kierujemy model w stronę pożądanych zachowań – bo wszystko przed tokenem wpływa na jego wybór (sekcja 1).**

| Technika | Idea |
|---|---|
| **Subagenty** | Osobne konteksty na części zadania (1 subagent na umowę: 79–80/80 pól vs 75–79 dla jednego agenta) |
| **Self-querying** | Model zadaje sobie pytania pomocnicze, by wydobyć wiedzę z wag do kontekstu |
| **Memory** | Każdy wątek startuje od zera – agent potrzebuje dostępu do wymaganych informacji |
| **Self-management** | Agent sam zarządza swoimi ustawieniami (np. Pi, OpenCode 2) |
| **Ambient, durable agents** | Zdalne agenty działające wg harmonogramu i zdarzeń; wymagają bezpiecznych narzędzi (sandbox, dedykowane konta) |

---

## 26. Wnioski

- Model **nie odpowiada na wiadomość** – dopisuje token po tokenie do historii i nie cofnie wybranego.
- Wyniki są **niedeterministyczne** – pracujemy na prawdopodobieństwie, nie na pewności.
- Dla modelu **czat to tekst** z tokenami specjalnymi (ChatML).
- Model **tylko generuje tokeny** – resztę robi **harness**.
- Czego nie ma w **wagach** ani w **kontekście**, tego model nie użyje; **konfabulacja** wynika dziś głównie z braku kontekstu.
- **Długie konteksty są stratne** – trzymaj się poniżej 30–40% okna.
- **Schemat kontroluje kształt, nie prawdę.**
- **Narzędzia** dają dane spoza treningu i działanie w świecie; **pętla + narzędzia = agent.**
- **Źródło narzędzia** (własne, CLI, MCP) zmienia pracę harnessu, nie to, co widzi model.
- **Harness ukrywa mechanikę**, a mechanika jest stabilna od 2022 – pozwala **rozumować od pierwszych zasad**.

---

## 27. Pytania

| Pytanie | Krótka odpowiedź |
|---|---|
| Jak LLM generuje tekst? | Token po tokenie, aż wybierze token stopu; wybranego tokenu nie cofnie |
| Czym jest tokenizer? | Słownikiem zamieniającym tekst na ID tokenów i z powrotem |
| Czy `temperature: 0` gwarantuje powtarzalność? | Nie – wpływ mają też m.in. sprzęt i infrastruktura |
| Jakie są role w rozmowie? | `system`, `user`, `assistant`, często `tool`; zestaw zależy od formatu treningowego |
| Czy API pamięta rozmowę? | Nie – każdy request wysyła całą historię |
| Czym jest ChatML? | Formatem, który tokenami specjalnymi zamienia rozmowę w tekst do dokończenia |
| Czym różni się model od harnessa? | Model tylko generuje tokeny (silnik); harness robi resztę (samochód) |
| Skąd ≈ 21k tokenów przy „say hi”? | System prompt, opisy narzędzi, `CLAUDE.md`, `git status` itd. |
| Dlaczego nie warto zapełniać 1M tokenów? | Jakość rozumowania spada; najlepiej poniżej 30–40% okna |
| Skąd dziś biorą się halucynacje? | Głównie z brakującego lub błędnego kontekstu |
| Dlaczego model nie zna daty? | Knowledge cutoff; aktualne dane tylko przez narzędzia |
| Po co reasoning? | Model buduje lepszy kontekst i poprawia się przed odpowiedzią |
| Co gwarantuje structured output? | Tylko kształt odpowiedzi, nie prawdziwość |
| Czym różnią się strategie narzędzi? | Tym, ile model wie z góry: function calling – pełne schematy, dispatcher – same sygnatury, code mode – nic, doczytuje przez `find`, tool search – same nazwy, schemat pobiera na żądanie |
| Jak działa tool call? | Model pisze wywołanie → stop → harness wykonuje → wynik do historii → kolejny request |
| Czym jest dispatcher? | Jedno narzędzie `call_tool(name, args)` – model podaje nazwę, harness wywołuje właściwe narzędzie |
| Czym jest tool search? | Model widzi nazwy narzędzi i pełny schemat pobiera przez `tool_search` dopiero, gdy go potrzebuje |
| Czym jest code mode? | Model dostaje `find` i `execute` i pisze kod zamiast wołać wiele narzędzi |
| Czym różnią się źródła narzędzi? | Tym, kto pisze i gdzie działa kod: własne – w harnessie, CLI – gotowe programy przez `bash`, MCP – osobny serwer |
| Jak dodać własne narzędzie? | Napisać funkcję i schemat; harness wkłada schemat do `<tools>` i woła funkcję po nazwie |
| Dlaczego CLI jest tanie w kontekście? | Wystarczy 1 schemat (`bash`); popularne CLI model zna z wag |
| Czym jest serwer MCP? | Osobnym programem, który wystawia narzędzia (`tools/list`, `tools/call`) dla wielu harnessów |
| Czym jest agent? | LLM w pętli: tool call kontynuuje, odpowiedź tekstowa kończy |
| CLI czy MCP? | CLI lokalnie, MCP na produkcji |
| Dlaczego agent może „nie widzieć” załącznika? | Harness ładuje treść częściowo lub wcale |
| Po co subagenty? | Osobne konteksty i perspektywy poprawiają jakość dużych zadań |
