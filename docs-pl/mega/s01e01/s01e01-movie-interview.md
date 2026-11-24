# S01E01 – Generowanie tekstu: od autouzupełniania do agenta

## Spis treści

- [Opis](#opis)
- [1. Model](#1-model)
- [2. Harness](#2-harness)
- [3. Harness vs Model](#3-harness-vs-model)
- [4. Role](#4-role)
- [5. System prompt](#5-system-prompt)
- [6. ChatML](#6-chatml)
- [7. Ograniczenia](#7-ograniczenia)
- [8. Narzędzia](#8-narzędzia)
- [9. Myślenie](#9-myślenie)
- [10. Agent](#10-agent)
- [11. Wnioski](#11-wnioski)
- [12. Pytania](#12-pytania)

---

## Opis

**Cel wykładu:** zrozumieć, jak LLM faktycznie generuje tekst, żeby skuteczniej budować i używać agentów AI.

| Sekcja | Co wyjaśnia | Powiązanie z celem |
|---|---|---|
| 1 | Tokeny, prawdopodobieństwa | Fundament: model nie „odpowiada”, tylko dopisuje kolejny token |
| 2–3 | Harness i jego relacja z modelem | Pokazuje, co robi model, a co program wokół niego |
| 4 | Role w rozmowie | Kto jest autorem każdej wiadomości w historii |
| 5 | System prompt i budżet kontekstu | Co harness dokłada do kontekstu poza wiadomością użytkownika |
| 6 | Format ChatML | Jak wygląda tekst, który faktycznie widzi model |
| 7 | Czego model nie wie i nie umie | Pokazuje, **dlaczego** potrzebne są narzędzia |
| 8–9 | Tool calls, reasoning | Mechanizmy, którymi model zdobywa dane i koryguje się |
| 10 | Pętla agenta | Złożenie wszystkiego w działającego agenta |
| 11–12 | Wnioski i pytania | Szybka powtórka |

---

## 1. Model

**Model to probabilistyczne autouzupełnianie tokenów.**

- **LLM = autocomplete** – przewiduje *następny token* na podstawie *poprzednich tokenów*, a nie całą odpowiedź naraz.
- **Token** – fragment tekstu (słowo, część słowa, spacja, znak interpunkcyjny), w którym model „widzi” tekst.
- **Tokenizer** – dzieli tekst na tokeny; różne tokenizery lepiej/gorzej radzą sobie np. z kodem.
- Przykład: `The capital of the US is` → `Washington`, `,`, ` D`, `.C.` …

**Prawdopodobieństwa i niedeterminizm:**

- Każdy kolejny token wybierany jest z rozkładu prawdopodobieństwa (np. `Certainly` 66%, `Sure` 14%, ` ``` ` 14%).
- Trening na „pomocnego asystenta” może wygrać z instrukcją (prośba „only code” → i tak `Certainly!`).
- „Losowa liczba” od modelu nie jest losowa (8 → 20%, 7 → 18%, 9 → 16%).
- **Token stopu** – model musi sam zasygnalizować koniec generowania. Stop służy też do wywołania narzędzia (patrz sekcja 8).

> Model nie pisze wiadomości jak człowiek – zgaduje, co najbardziej prawdopodobnie będzie dalej.

---

## 2. Harness

**Harness to program „opakowujący” model (np. Claude Code, Codex, Cursor).**

- Buduje kontekst, wysyła requesty, wykonuje narzędzia i prowadzi pętlę agenta (sekcje 5 i 8–10).

**Czy można bez harnessa?** Tak – ale coś zawsze musi wysłać tekst i odebrać odpowiedź; pytanie, jak cienka jest ta warstwa:

| Sposób | Harness? |
|---|---|
| Lokalny model, surowe completion (np. llama.cpp – demo z Qwen) | Nie – sam piszesz cały tekst z `<\|im_start\|>` |
| Bezpośrednie API (`curl`) | Nie – ale serwer zamienia JSON na format treningowy |
| Czat w przeglądarce (claude.ai, ChatGPT) | Tak – dokłada system prompt, historię, narzędzia |
| Claude Code, Codex, Cursor | Tak – pełny harness agentowy |

- Bez harnessa tracisz: **pamięć** (API jest bezstanowe), **wykonywanie narzędzi**, **pętlę**, **automatyczny kontekst** (CLAUDE.md, `git status`).
- Wtedy **Ty jesteś harnessem** – ręcznie doklejasz historię i wykonujesz komendy.

---

## 3. Harness vs Model

**Model tylko generuje tokeny – wszystko inne robi harness.**

| | Model (LLM) | Harness |
|---|---|---|
| Czym jest | Sieć z wagami, działa na serwerach dostawcy | Zwykły program, działa np. na Twoim komputerze |
| Co robi | Tylko generuje kolejne tokeny | Wszystko poza tym: składa prompt, dodaje narzędzia/CLAUDE.md, uruchamia komendy, dopisuje wyniki do historii |
| Analogia | Silnik | Samochód wokół silnika |

---

## 4. Role

**Rola mówi, kto jest autorem danej wiadomości w historii.**

| Rola | Gdzie występuje | Znaczenie |
|---|---|---|
| `system` | Prawie wszędzie | Instrukcje i kontekst (kim jest model, jakie ma narzędzia) |
| `user` | Wszędzie | Wiadomość użytkownika |
| `assistant` | Wszędzie | Odpowiedź modelu |
| `tool` | OpenAI, Harmony, wiele modeli open-source (np. Qwen) | Wynik wywołania narzędzia |
| `developer` | OpenAI (nowsze modele), Harmony | Instrukcje dewelopera; następca `system` przy niektórych modelach |
| `function` | Stare API OpenAI | Poprzednik `tool`, przestarzały |

- Zestaw ról zależy od **formatu treningowego** modelu – model rozumie tylko role, które widział w treningu.

---

## 5. System prompt

**System prompt steruje modelem i zużywa budżet kontekstu.**

- **System prompt** = treść wiadomości z rolą `system` (sekcja 4); może być kilka. Steruje zachowaniem i opisuje dostępne narzędzia.
- Proste „say hi” w Claude Code ≈ **21 000 tokenów** – bo w kontekście są:
  - system prompt harnessu i definicje narzędzi (sekcja 8),
  - `CLAUDE.md` (np. kim jest użytkownik),
  - dane zebrane przed requestem (np. `git status`).
- I to **mimo włączonego tool search**, który ten początkowy kontekst **zmniejsza**, a nie zwiększa:
  - zamiast pełnych definicji wszystkich narzędzi/MCP model dostaje tylko krótkie wzmianki, że istnieją,
  - pełną definicję (opis + schemat parametrów) pobiera na żądanie osobnym narzędziem do wyszukiwania narzędzi.
- Większość kontekstu **nie pochodzi od użytkownika**, tylko od harnessu i narzędzi.

---

## 6. ChatML

**Do modelu trafia nie wiadomość, tylko tekst w formacie treningowym (np. ChatML).**

- **Formaty treningowe** (tekst, który faktycznie widzi model): **ChatML**, **Harmony** (open-source od OpenAI).
- **Tokeny specjalne** (`<|im_start|>`, `<|im_end|>`) – oznaczają początek/koniec wiadomości; model zna je z treningu.

**Przykład ChatML** (to, co faktycznie widzi model):

```
<|im_start|>system
You are Qwen, a helpful assistant.<|im_end|>
<|im_start|>user
Write a JavaScript function that checks if a number is even.<|im_end|>
<|im_start|>assistant
```

- **Rola** (sekcja 4) = zwykły tekst zaraz po `<|im_start|>` – pole `"role"` z JSON-a API zamieniane jest na ten zapis.
- Ostatnia linia nie ma treści – model zaczyna od niej pisać odpowiedź.
- **Kluczowy trik:** harness na końcu dopisuje na sztywno `<|im_start|>assistant` – dzięki temu autocomplete „wie”, że teraz ma pisać odpowiedź asystenta.

---

## 7. Ograniczenia

**Sam model, bez narzędzi, ma ograniczenia.**

| Ograniczenie | Przyczyna | Rozwiązanie |
|---|---|---|
| Nie cofnie błędu (np. `isEven(7) → true`) | **Skąd błąd:** model zgaduje statystycznie pasujący token zamiast liczyć/wykonać kod. **Dlaczego nie cofnie:** generuje tylko do przodu – błędny token zostaje w historii i wpływa na kolejne | Reasoning (sekcja 9), narzędzia (np. uruchomienie testów) |
| Nie zna aktualnych informacji (np. dzisiejszej daty, najnowszych wersji pakietów) | Wiedza zamrożona w wagach w momencie treningu | Narzędzia |
| Nie widzi Twoich plików | Brak dostępu do świata | Narzędzia |

> Model zna tylko to, co jest w **wagach** albo w **historii (kontekście)**.

| Pojęcie | Definicja |
|---|---|
| **Wagi** | Liczbowe parametry sieci ustalone podczas treningu – „zamrożona” wiedza modelu; po treningu się nie zmieniają |
| **Historia (kontekst)** | Tekst przekazany w bieżącym requeście (system prompt, wiadomości, wyniki narzędzi) – „pamięć robocza” na czas rozmowy |

---

## 8. Narzędzia

**Model wywołuje narzędzia przez `<tool_call>` i dostaje wynik w `<tool_response>`.**

**Przebieg:**

1. Harness wysyła request: opis narzędzi + historia.
2. Model pisze tool call i się zatrzymuje (stop sequence `</tool_call>`).
3. Harness wykonuje narzędzie i dopisuje wynik do historii.
4. Nowy request → model pisze kolejny tool call albo odpowiedź.

- **Tool call** = prośba modelu do harnessu. Model sam niczego nie wykonuje.
- **Tool response** = wynik narzędzia; dla modelu to zwykły tekst w historii.

**Przykład craftowy tool call** (format Qwen):

```
<|im_start|>assistant
Sprawdzę pliki.
<tool_call>
{"name": "bash", "arguments": {"command": "ls"}}
</tool_call><|im_end|>
```

**Przykład craftowy tool response** (format Qwen):

```
<|im_start|>user
<tool_response>
cart.js
package.json
</tool_response><|im_end|>
<|im_start|>assistant
```

**Przykład API tool call** (format Qwen – API zgodne z OpenAI, odpowiedź modelu):

```json
{
  "finish_reason": "tool_calls",
  "message": {
    "role": "assistant",
    "content": "Sprawdzę pliki.",
    "tool_calls": [
      {"id": "call_01", "type": "function",
       "function": {"name": "bash", "arguments": "{\"command\": \"ls\"}"}}
    ]
  }
}
```

**Przykład API tool response** (format Qwen – API zgodne z OpenAI, kolejna wiadomość w `messages` następnego requestu):

```json
{
  "role": "tool",
  "tool_call_id": "call_01",
  "content": "cart.js\npackage.json"
}
```

- `tool_call_id` w wyniku = `id` z tool call.
- Serwer zamienia ten JSON na ChatML z przykładów craftowych.

---

## 9. Myślenie

**Modele reasoningowe najpierw myślą, potem odpowiadają.**

- Modele reasoningowe najpierw „myślą” (thinking traces), potem odpowiadają.
- W myśleniu model **może się poprawić** („nie, to źle, spróbuję inaczej”) → finalna odpowiedź jest trafniejsza.
- Obchodzi to ograniczenie „nie mogę cofnąć tokenu”.
- To **ten sam mechanizm** co zwykły LLM (autocomplete tokenów), a nie inna architektura – różnica jest w **treningu**:
  - model jest dodatkowo trenowany (głównie RL na sprawdzalnych zadaniach: matematyka, kod z testami),
  - uczy się, że opłaca się najpierw pomyśleć i poprawiać własne błędy.
- Myślenie to zwykłe tokeny w historii → model **sam buduje sobie lepszy kontekst** przed odpowiedzią.
- Dziś to raczej **tryb niż osobny rodzaj modelu** – modele hybrydowe myślą lub nie, zależnie od ustawień (np. parametr `thinking` w API, tryb *adaptive* – model sam decyduje, ile myśleć).
- Koszt: więcej tokenów, czasu i miejsca w kontekście – opłaca się przy trudnych zadaniach, nie przy „say hi”.

---

## 10. Agent

**Agent = LLM + narzędzia w pętli.**

- **Agent** – system, w którym LLM działa **w pętli** i wywołuje narzędzia, by zdobywać informacje i wprowadzać zmiany.
- Harness to dosłownie pętla `for`/`while` z limitem kroków (np. 40).

---

## 11. Wnioski

- Model **nie odpowiada na wiadomość** – dopisuje tekst do istniejącej historii.
- Czego nie ma w **historii** ani w **wagach**, tego model nie użyje.
- Historia **steruje** modelem w stronę właściwej wiedzy z wag.
- Model **tylko generuje tokeny** – resztę (kontekst, narzędzia, pętlę) robi **harness**.
- **Narzędzia** = sposób na dane spoza treningu i na działanie w świecie.
- Model **sam buduje swój kontekst** przez tool calls.
- **Pętla + narzędzia = agent.**
- Następny krok: nauczyć się **zarządzać kontekstem**, by agent był skuteczniejszy.

---

## 12. Pytania

| Pytanie | Krótka odpowiedź |
|---|---|
| Czym jest token? | Fragment tekstu, jednostka, na której operuje LLM |
| Jak LLM generuje odpowiedź? | Token po tokenie, wybierając najbardziej prawdopodobny następny |
| Czym jest harness? | Program wokół modelu: składa kontekst, wysyła requesty, wykonuje narzędzia, prowadzi pętlę |
| Czym różni się model od harnessa? | Model tylko generuje tokeny (silnik); harness robi całą resztę (samochód) |
| Jakie są role w rozmowie? | `system`, `user`, `assistant`, często też `tool`; zestaw zależy od formatu treningowego modelu |
| Czym jest ChatML? | Format tekstowy z tokenami specjalnymi oddzielającymi role w rozmowie |
| Jak działa tool call? | Model pisze składnię narzędzia → stop → harness wykonuje → wynik do historii → kolejny request |
| Dlaczego model nie zna daty? | Wiedza zamrożona w treningu; aktualne dane tylko przez narzędzia |
| Czy API pamięta rozmowę? | Nie – każdy request wysyła całą historię |
| Czym jest agent? | LLM w pętli, wywołujący narzędzia aż do końca zadania lub limitu kroków |
| Po co reasoning? | Pozwala modelowi poprawić się przed finalną odpowiedzią |
| Skąd duże zużycie tokenów przy „hi”? | System prompt, definicje narzędzi, CLAUDE.md, git status itd. |
