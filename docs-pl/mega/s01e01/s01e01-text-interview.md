# S01E01 – Mechanika generatywnej AI

## Spis treści

- [Opis](#opis)
- [1. Tokeny](#1-tokeny)
- [2. Tokenizer](#2-tokenizer)
- [3. Cechy prawdopodobieństwa tokenów](#3-cechy-prawdopodobieństwa-tokenów)
- [4. Reasoning – zwiększanie szansy na trafne tokeny](#4-reasoning--zwiększanie-szansy-na-trafne-tokeny)
- [5. Request](#5-request)
- [6. ChatML](#6-chatml)
- [7. Okno kontekstu](#7-okno-kontekstu)
- [8. Multimodalność](#8-multimodalność)
- [9. Structured outputs](#9-structured-outputs)
- [10. Function calling](#10-function-calling)
- [11. Code mode](#11-code-mode)
- [12. Agent](#12-agent)
- [13. Harness](#13-harness)
- [14. Dostawcy](#14-dostawcy)
- [15. Sterowanie](#15-sterowanie)
- [16. Wnioski](#16-wnioski)
- [17. Pytania](#17-pytania)

---

## Opis

**Cel wykładu:** zrozumieć podstawową mechanikę LLM, żeby świadomie wykorzystywać mocne strony modeli i omijać ich słabości przy pracy z agentami i ich budowaniu.

| Sekcja | Co wyjaśnia | Powiązanie z celem |
|---|---|---|
| 1–2 | Tokenizacja, tokenizer, przewidywanie następnego tokenu | Fundament: model operuje na liczbach i dopisuje token po tokenie |
| 3–4 | Niedeterminizm i konfabulacja, reasoning | Naturalne cechy i słabości modelu, z którymi trzeba żyć |
| 5–6 | Request i format ChatML | Co faktycznie trafia do modelu |
| 7–8 | Okno kontekstu, multimodalność | Ile i jak model „widzi” |
| 9–11 | Structured outputs, function calling, code mode | Jak przejść „od odpowiedzi do działań” |
| 12 | Pętla agenta, CLI / MCP | Złożenie mechanizmów w agenta |
| 13 | Ukryta mechanika harnessów | Dlaczego narzędzia AI zachowują się tak, a nie inaczej |
| 14 | Dostawcy i vendor lock-in | Wybór modelu do zadania |
| 15 | Sterowanie zachowaniem modelu | Jak zwiększyć szansę na dobry wynik |
| 16–17 | Wnioski i pytania | Szybka powtórka |

---

## 1. Tokeny

**LLM operuje na tokenach i generuje tekst, przewidując kolejny token.**

- **LLM** – sieć neuronowa trenowana na dużych zbiorach tekstu; funkcja: wejście (prompt) → wyjście (completion). Dziś raczej system: multimodalne wejście/wyjście + „rozumowanie”.
- **Tokenizer** – zamienia fragmenty tekstu na identyfikatory liczbowe i z powrotem (szczegóły: sekcja 2).
- **Next token prediction** – model dopisuje token po tokenie, aż wybierze specjalny **end token**.
- Wybranego tokenu **nie da się cofnąć** – jedna zła decyzja wpływa na kolejne tokeny i efekt się kumuluje.

> Każdy wybrany token staje się częścią tekstu, który model czyta w następnym kroku.

---

## 2. Tokenizer

**Tokenizer działa w obie strony: tekst → liczby i liczby → tekst.**

> Analogia: tokenizer to **tłumacz z rozmówkami**. Model zna tylko liczby, Ty znasz tylko słowa. Tłumacz zamienia Twoje słowa na liczby dla modelu, a liczby od modelu z powrotem na słowa dla Ciebie.

| Kierunek | Nazwa | Co robi | Przykład (ID poglądowe) |
|---|---|---|---|
| Człowiek → model | **encode** | Tnie tekst na kawałki i każdemu daje numer ID ze słownika | `"Have a nice"` → `[12522, 264, 6555]` |
| Model → człowiek | **decode** | Zamienia ID wygenerowanych tokenów na kawałki tekstu i je skleja | `[1938]` → `" day"` |

```
Twój tekst → [encode] → ID tokenów → MODEL → nowe ID → [decode] → tekst odpowiedzi
```

- **Tokenizer ≠ model** – to zwykły słownik z regułami cięcia, bez „inteligencji”. Sieć widzi tylko liczby.
- **Jeden słownik w obie strony** – dlatego decode odtwarza dokładnie ten sam tekst („round trip”).
- **Każdy model ma swój tokenizer** – ten sam tekst w GPT i w Claude może dać inną liczbę tokenów.
- **Słownik jest zoptymalizowany** – pod liczbę i rozmiar kawałków; najlepiej „zna” częsty tekst (angielski).
- Emoji lub inny język niż angielski → **więcej tokenów** dla tego samego zdania (mniej gotowych kawałków w słowniku).

---

## 3. Cechy prawdopodobieństwa tokenów

**Model wybiera tokeny według prawdopodobieństwa, a nie sprawdza faktów. Stąd dwie naturalne cechy, z którymi trzeba żyć.**

| Cecha | Co to znaczy | Problem? |
|---|---|---|
| **Niedeterminizm** | Ten sam prompt ≠ ta sama odpowiedź | **Cecha** – psuje powtarzalność, ale daje kreatywność |
| **Konfabulacja** | Wymyślona, ale wiarygodnie brzmiąca odpowiedź | **Słabość** – fałsz podany pewnym tonem |

> Analogia: kucharz **niedeterministyczny** za każdym razem gotuje zupę trochę inaczej. Kucharz **konfabulujący** nie ma składnika, więc po cichu wrzuca coś podobnego – zupa wygląda dobrze, ale smak się nie zgadza.

### Niedeterminizm

- Przyczyny: model, ustawienia, a nawet **sprzęt**.
- Nigdy nie mamy pełnej pewności wyniku – odwrotność tego, czego uczy klasyczne programowanie.

| Parametr | Działanie |
|---|---|
| `temperature` | Wpływa na losowość wyboru tokenów; `0` = wybór najbardziej prawdopodobnych, ale **bez gwarancji powtarzalności** |
| `top_p` | Ogranicza pulę tokenów branych pod uwagę przy wyborze |

### Konfabulacja

**Modele popełniają błędy – pracujemy na zwiększaniu szansy, a nie na pewności.**

- **Konfabulacja (halucynacja)** – wymyślona, ale wiarygodnie brzmiąca odpowiedź.
- **Knowledge cutoff** – wiedza modelu jest ograniczona w czasie (moment treningu).

| Przyczyna | Skutek |
|---|---|
| Ograniczony zbiór treningowy | Model nie wie wszystkiego |
| Generowanie na podstawie prawdopodobieństw | Odpowiedź „pasuje”, ale nie musi być prawdziwa |
| Brak lub błędny kontekst | Dziś główne źródło halucynacji (np. „Tell me about Alice.” bez kontekstu) |

> Nie ma sposobu na całkowite wyeliminowanie konfabulacji.

---

## 4. Reasoning – zwiększanie szansy na trafne tokeny

**Model „myśli” przed odpowiedzią: thinking tokens trafiają do kontekstu i przesuwają prawdopodobieństwo kolejnych tokenów w stronę trafnej odpowiedzi – to zwiększa szansę, ale nie daje pewności.**

- **Thinking tokens** – tokeny generowane przed odpowiedzią.
- **J-space** – mały zbiór reprezentacji podobnych do słów, przez które przechodzi „ciche” myślenie (badanie Anthropic; analogia do global workspace w mózgu).
- Więcej myślenia → często lepszy wynik, ale **więcej czasu i kosztu**.
- Ustawienie reasoning effort zależy od modelu i zadania – warto szukać **najniższego poziomu, który daje poprawny wynik** (także na mniejszym modelu).
- **Premise order** – modele (zwłaszcza mniejsze) potrafią zawieść tylko dlatego, że informacje podano w innej kolejności.

---

## 5. Request

**Każdy request do LLM = kontekst + ustawienia.**

| Element | Zawartość |
|---|---|
| Kontekst | Zwykle tablica wiadomości do „dokończenia” odpowiedzią AI |
| Ustawienia | Model, poziom reasoning, dostępne narzędzia, pola specyficzne dla platformy |

- **Responses API** (OpenAI) – obecnie najpopularniejszy format API.
- W odpowiedzi warto zwrócić uwagę na `usage` (zużycie tokenów) i na to, że `output` to **lista**, a nie pojedynczy string.

---

## 6. ChatML

**Dla modelu wiadomości czatu to po prostu tekst z tokenami specjalnymi.**

- **ChatML** – format strukturyzujący kontekst tokenami specjalnymi; dzięki niemu completion wygląda jak rozmowa.
- **Tokeny specjalne** – oddzielają role: co napisał użytkownik, co wygenerował model, a co dodał twórca narzędzia.
- `<|im_end|>` wpisany przez użytkownika to **6 zwykłych tokenów** – użytkownik nie może sam zamknąć swojej tury.

**Przykład** (format ChatML):

```
<|im_start|>system
You are a helpful assistant.<|im_end|>
<|im_start|>user
Hello<|im_end|>
<|im_start|>assistant
```

---

## 7. Okno kontekstu

**Kontekst jest ograniczony, a długie rozmowy są stratne.**

- **Context window** – limit tokenów, które model przetwarza naraz: ok. **250k–1M** tokenów.
- **Auto-compaction** – harness kompresuje lub przycina historię, żeby nie przekroczyć limitu.
- Kompresja = utrata lub „wyciągnięcie” części danych → model traci z oczu pierwotne polecenie, co **po cichu** obniża jakość.
- **Context understanding** – jakość rozumowania spada przy długim kontekście; reguła: najlepiej poniżej **30–40%** limitu.
- Proste zadania (wyszukanie informacji w długim tekście) nowe modele robią bardzo dobrze.

> To, że model obsłuży 1M tokenów, nie znaczy, że warto ich tyle używać.

---

## 8. Multimodalność

**Model przetwarza liczby, a nie samą informację.**

- Niektóre modele obsługują obrazy, audio, a nawet wideo – te dane też są tokenizowane (inaczej niż tekst).
- Model „postrzega” dane inaczej niż człowiek: ma problem z detalami, np. nakładającymi się elementami, dokładnymi kolorami, **godziną na zegarze**.

---

## 9. Structured outputs

**Model może zwrócić JSON, który łatwo przetworzyć w kodzie.**

- Pozwala **wyciągać dane** z nieustrukturyzowanych dokumentów.
- Pozwala używać LLM **w logice aplikacji** (często w formie agentów).
- Przykład: Kyoto i nieistniejące Tarvenmoor – obie odpowiedzi przechodzą walidację schematu.

> Schemat kontroluje kształt odpowiedzi, a nie jej prawdziwość.

---

## 10. Function calling

**Model w JSON-ie wskazuje nazwę narzędzia i jego argumenty – kod wykonuje akcję.**

1. Model zwraca nazwę funkcji i payload.
2. Kod wykonuje akcję z wygenerowanym payloadem.
3. Wynik wraca do modelu.

- Model fizycznie nic nie robi – tylko zwraca strukturę, która umożliwia wywołanie API.
- Ograniczenie: **wszystkie schematy narzędzi muszą być w kontekście** (rozwiązanie: sekcja 11).

---

## 11. Code mode

**Zamiast wielu narzędzi model dostaje dwa (`find`, `execute`) i pisze kod.**

| | Function calling | Code mode |
|---|---|---|
| Narzędzia w kontekście | Wszystkie schematy | Tylko `find` i `execute` |
| Koszt kontekstu | Wysoki (ok. 2 300 z 3 000 tokenów wejścia na schematy przy 30 narzędziach) | Niski |
| Wdrożenie | Proste | Trudniejsze – kod wymaga sandboxa (np. Daytona, Cloudflare) |
| Lokalnie (agent na komputerze) | Proste | Proste – skrypty uruchamiane lokalnie |

- Zadanie z jednym wywołaniem („Who am I?”) może być **droższe** w code mode.

---

## 12. Agent

**Agent = pętla, w której model wywołuje narzędzie i działa dalej albo odpowiada tekstem i kończy.**

- Tool call → pętla trwa; tekst → pętla się kończy i wynik wraca.
- Limit kroków (np. `1`) może zatrzymać pętlę, zanim model odpowie.
- Minimalny agent jest prosty, ale **trwałe agenty do długich zadań** są dużo bardziej złożone.

| Sposób rozszerzenia | Gdzie najlepiej |
|---|---|
| **CLI** – znane narzędzia wiersza poleceń | Lokalnie |
| **MCP** (Model Context Protocol) – protokół wystawiania narzędzi, wspierany przez prawie wszystkie platformy | Produkcja |

- Narzędzia z CLI / MCP agent używa przez function calling lub code mode (np. Playwright MCP – obsługa przeglądarki).

---

## 13. Harness

**Harness ukrywa mechanikę modelu, co upraszcza pracę, ale wymaga uogólnień.**

- Narzędzia (Cursor, Claude Code, Pi, T3 Code) mają ten sam fundament – model; różni je „opakowanie”.

| Mechanizm | Co ukrywa / ryzyko |
|---|---|
| **Auto compaction** | Wydaje się, że agent „wie, o czym mówimy”, a widzi tylko część historii |
| **Plan mode** | Pomaga, chyba że plan jest za szeroki lub za szczegółowy – lepiej dzielić na mniejsze zadania |
| **Skills** | Po włączeniu zostają w kontekście; model wybiera skill tylko po nazwie i opisie – bywa pominięty lub wybrany niepotrzebnie |
| **Attachments** | UI sugeruje, że model widzi pliki/kod, a treść często jest ładowana częściowo albo wcale |
| **Environment** | Zmiany środowiska (pliki, git) harness dokłada jako dodatkowe treści (np. `<system-reminder>`), bo instrukcji nie można zmieniać przez cache |

> Nasza wiadomość nie jest jedyną rzeczą, którą dostaje model.

---

## 14. Dostawcy

**Najlepszy model zmienia się często, więc warto unikać vendor lock-in.**

| Dostawca | Mocna strona | Produkty / API |
|---|---|---|
| OpenAI | Prawie pełna multimodalność (obraz, audio, wideo) | ChatGPT, Codex, Responses API |
| Anthropic | Generowanie tekstu, rozumienie obrazów | Claude, Claude Code |
| xAI | Pełna multimodalność (cel) | Grok, Grok Bot |
| DeepMind / Google | Pełna multimodalność, w tym rozumienie wideo | Gemini, Interactions API |
| OpenRouter | Dostęp do modeli wszystkich labów i open-source | – |

- **Różne modele do różnych zadań** (koszt, szybkość) albo **wiele modeli do jednego zadania** (jakość).
- Domyślnie najlepszy model; przy automatyzacji i skali – niższy reasoning lub mniejszy model.
- Harness-agnostic ≈ provider-agnostic (np. Pi, OpenCode, T3 Code, Superset zamiast Codex).

---

## 15. Sterowanie

**Zamiast precyzyjnych instrukcji kierujemy model w stronę pożądanych zachowań.**

| Technika | Idea |
|---|---|
| **Różne perspektywy** | Wiele modeli lub **subagentów** na części zadania (np. 1 subagent na umowę: 79–80/80 pól vs 75–79 dla jednego agenta) |
| **Self-querying** | Model zadaje sobie pytania pomocnicze, by „wyciągnąć” wiedzę z wag do kontekstu (working memory) |
| **Memory** | Każdy wątek startuje od zera – agent potrzebuje dostępu do wymaganych informacji |
| **Self-management** | Agent sam zarządza ustawieniami (np. Pi, OpenCode 2) – agenty jako first-class citizens w oprogramowaniu |
| **Ambient, durable agents** | Zdalne agenty działające wg harmonogramu i zdarzeń; potrzebują dostępu do danych i bezpiecznych narzędzi (sandbox, własny VPS, dedykowane konta) |

- Działa, bo wszystko, co poprzedza token, wpływa na to, jaki token zostanie wygenerowany (sekcja 1).

---

## 16. Wnioski

- LLM **przewiduje kolejny token** i nie może cofnąć raz wybranego.
- Wyniki są **niedeterministyczne** – pracujemy na prawdopodobieństwie, nie na pewności.
- **Konfabulacji nie da się wyeliminować**; dziś wynika głównie z brakującego lub złego kontekstu.
- Dla modelu **czat to tekst** z tokenami specjalnymi (ChatML).
- **Długie konteksty są stratne** – trzymaj się poniżej 30–40% okna.
- **Schemat kontroluje kształt, nie prawdę.**
- **Function calling / code mode** przenoszą AI „od odpowiedzi do działań”.
- **Agent = pętla**: narzędzie → dalej, tekst → koniec.
- **Harness ukrywa mechanikę** – model widzi więcej i mniej, niż sugeruje UI.
- Unikaj **vendor lock-in**, dobieraj model do zadania.
- Mechanika jest stabilna od 2022 – pozwala **rozumować od pierwszych zasad** i odróżniać hype od wartości.

---

## 17. Pytania

| Pytanie | Krótka odpowiedź |
|---|---|
| Czym jest tokenizer? | Zamienia fragmenty tekstu na liczby (ID tokenów) i z powrotem |
| Jak LLM generuje tekst? | Token po tokenie, aż wybierze end token; wybranego tokenu nie cofnie |
| Czy `temperature: 0` gwarantuje powtarzalność? | Nie – wpływ mają też m.in. sprzęt i infrastruktura |
| Czym jest knowledge cutoff? | Moment, na którym kończy się wiedza modelu z treningu |
| Skąd dziś biorą się halucynacje? | Głównie z brakującego lub błędnego kontekstu |
| Z czego składa się request do LLM? | Z kontekstu (wiadomości) i ustawień (model, reasoning, narzędzia) |
| Czym jest ChatML? | Formatem, który tokenami specjalnymi zamienia rozmowę w tekst do dokończenia |
| Dlaczego nie warto zapełniać 1M tokenów? | Jakość rozumowania spada; najlepiej poniżej 30–40% okna |
| Co gwarantuje structured output? | Tylko kształt odpowiedzi, nie jej prawdziwość |
| Jak działa function calling? | Model zwraca nazwę narzędzia i argumenty, kod wykonuje akcję i odsyła wynik |
| Czym jest code mode? | Model dostaje `find` i `execute` i pisze kod zamiast wywoływać wiele narzędzi |
| Czym jest agent? | Pętlą: tool call kontynuuje pracę, odpowiedź tekstowa ją kończy |
| CLI czy MCP? | CLI lokalnie, MCP na produkcji |
| Dlaczego agent może „nie widzieć” załącznika? | Harness ładuje treść częściowo lub wcale, mimo że UI sugeruje inaczej |
| Po co subagenty? | Dają osobne konteksty i perspektywy, co poprawia jakość przy dużych zadaniach |
| Czym jest self-querying? | Model zadaje sobie pytania, by przed zadaniem wydobyć wiedzę do kontekstu |
