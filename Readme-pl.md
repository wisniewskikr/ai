# Praca z modelami AI

## Spis treści

- [Podstawowe pojęcia](#podstawowe-pojęcia)
- [Typy modeli](#typy-modeli)
- [Fundamentalna lista AI](#fundamentalna-lista-ai)
- [Architektury](#architektury)
- [Wymiary ortogonalne](#wymiary-ortogonalne)
- [Single call vs Workflow](#single-call-vs-workflow)
- [RAG](#rag-retrieval-augmented-generation)
- [RAG vs Agent z search](#rag-vs-agent-z-search)
- [Natywne narzędzie vs MCP](#natywne-narzędzie-vs-mcp)
- [Prompt engineering](#prompt-engineering)
- [Structured output](#structured-output)
- [Architektura agentów](#architektura-agentów)
- [Baza wiedzy](#baza-wiedzy)
- [Fine-tuning](#fine-tuning)
- [Parametry generowania](#parametry-generowania)
- [Trenowanie modeli](#trenowanie-modeli)
- [Bezpieczeństwo](#bezpieczeństwo)
- [Ewaluacja](#ewaluacja)
- [Słownik skrótów](#słownik-skrótów)

---

## Podstawowe pojęcia

| Pojęcie | Co to jest? | Analogia |
|---|---|---|
| **Model AI** | Program, który rozumie i generuje tekst | Mózg asystenta |
| **Agent AI** | Model + zdolność do działania (narzędzia, decyzje) | Asystent z rękoma |
| **LLM** | Large Language Model — model językowy trenowany na ogromnych zbiorach tekstu | Ktoś, kto przeczytał całą bibliotekę |
| **Token** | Kawałek tekstu (słowo lub jego część) | Literka w scrabble |
| **Prompt** | Wiadomość/pytanie wysyłane do modelu | Zadanie domowe dla AI |
| **Context window** | Ile tekstu model "widzi" naraz | Pamięć krótkotrwała |

---

## Typy modeli

| Typ | Co potrafi | Przykłady |
|---|---|---|
| **Text** | Czyta i pisze tekst | Claude, GPT-4, Llama |
| **Multimodal** | Tekst + obrazy/audio/wideo | Claude 3, GPT-4o |
| **Embedding** | Zamienia tekst na liczby (wektory) | text-embedding-3 |
| **Code** | Specjalizuje się w kodowaniu | Codex, DeepSeek Coder |
| **Reasoning** | Myśli krok po kroku, rozwiązuje złożone problemy | Claude 3.7, o3 |

---

## Fundamentalna lista AI

Podstawowe koncepcje działania LLM, na których opierają się wszystkie architektury.

| # | Koncepcja | Opis |
|---|---|---|
| 1 | **Model jako funkcja** | Model przyjmuje tekst na wejściu i zwraca tekst na wyjściu. Nie wiesz co jest w środku — traktuj go jak dowolną zewnętrzną funkcję. |
| 2 | **API & Chat Completion** | API to sposób komunikacji z modelem. Wysyłasz prompt przez HTTP POST, otrzymujesz odpowiedź (completion). |
| 3 | **Prompt = Instrukcja + Historia** | Model nie ma pamięci między wywołaniami. Każde zapytanie musi zawierać pełną historię rozmowy: system prompt → poprzednie wiadomości → nowe zapytanie. |
| 4 | **Narzędzia = Schematy JSON** | Narzędzia to nie kod uruchamiany przez model. To schematy JSON dołączane do promptu — model czyta je jak tekst i decyduje, jaki JSON zwrócić. |
| 5 | **Function Calling** | Model zwraca JSON opisujący co wywołać. Twój kod go odczytuje i uruchamia właściwą funkcję, a wynik odsyła z powrotem do modelu. |
| 6 | **Agent Loop** | Pętla wywołań API. W każdej iteracji model decyduje: zwróć JSON (wywołaj narzędzie → kontynuuj pętlę) lub zwróć tekst (odpowiedź końcowa → zatrzymaj się). |

---

## Architektury

| Architektura | Opis |
|---|---|
| **Single call** | Pojedyncze zapytanie, brak pętli |
| **Workflow** | Deterministyczny przepływ: chain, routing, map-reduce, parallelization |
| **Agent** | Model sam decyduje co dalej — pętla: *think → act → observe* |
| **Multi-agent** | Orkiestrator + subagenci lub agenci peer-to-peer |

> **Kluczowe pytanie:** Czy przepływ jest z góry znany? → Workflow. Czy model go odkrywa? → Agent.

```
Model (LLM):    Użytkownik → [Prompt] → Model → [Odpowiedź]

Agent:          Użytkownik → [Prompt] → Agent → [Myśli] → [Narzędzie] → [Wynik] → [Odpowiedź]
                                                 Pętla: Myśl → Działaj → Obserwuj → Myśl...
```

---

## Wymiary ortogonalne

Każda architektura może być skonfigurowana wzdłuż tych osi niezależnie:

| Wymiar | Opcje |
|---|---|
| **Narzędzia** | Brak / Natywne / MCP (protokół transportu narzędzi) |
| **Pamięć** | W wagach (trening/fine-tuning) / Kontekstowa (okno kontekstu) / Cache (KV cache) / Zewnętrzna (vector DB, pliki, baza danych) |
| **Nadzór** | Pełny automat / Human-in-the-loop / Human-on-the-loop |
| **Ewaluacja** | Testy automatyczne / LLM-as-judge / Human-as-judge |

---

## Single call vs Workflow

| | Single call | Workflow |
|---|---|---|
| **Liczba wywołań** | 1 | Wiele |
| **Przepływ** | Brak | Wynik jednego kroku → wejście następnego |
| **Złożoność** | Niska | Wysoka |
| **Kiedy używać** | Proste zadania | Zadania wieloetapowe, walidacja, równoległość |

**Workflow stosuj gdy:**
- jeden prompt jest zbyt skomplikowany dla modelu
- kroki mogą być wykonane równolegle
- wynik pośredni wymaga walidacji przed dalszym przetwarzaniem
- każdy krok potrzebuje innego promptu lub modelu

---

## RAG (Retrieval-Augmented Generation)

Technika dostępu do danych — może działać w każdej architekturze:

```
Pytanie → [Wyszukiwarka] → Fragmenty dokumentów → Prompt + fragmenty → Odpowiedź
```

| Architektura | RAG wewnątrz |
|---|---|
| Single call | Retrieve raz → generate (klasyczny RAG) |
| Workflow | Retrieval jako jeden z kroków |
| Agent | Model sam decyduje kiedy i czy wyszukać |

---

## RAG vs Agent z search

| | RAG | Agent z search |
|---|---|---|
| **Kto decyduje o wyszukaniu** | System (zawsze) | Model (sam ocenia czy potrzebuje) |
| **Kiedy** | Przed odpowiedzią, raz | W dowolnym momencie, wielokrotnie |
| **Architektura** | Single call / Workflow | Agent |
| **Przewidywalność** | Wysoka | Niska |
| **Kiedy używać** | Znane, powtarzalne zapytania | Złożone zadania wymagające iteracji |

---

## Natywne narzędzie vs MCP

| | Natywne narzędzie | MCP |
|---|---|---|
| **Gdzie żyje kod narzędzia** | W aplikacji | Na zewnętrznym serwerze |
| **Protokół** | Brak (bezpośrednie wywołanie) | MCP (JSON-RPC) |
| **Wielokrotne użycie** | Tylko w tej aplikacji | Dowolna aplikacja/agent |
| **Przykład** | Funkcja `search()` w kodzie | Serwer `filesystem`, `github`, `postgres` |

> Z perspektywy modelu nie ma różnicy — w obu przypadkach dostaje listę narzędzi i wywołuje je tak samo.

---

## Prompt engineering

Podstawa działania każdej architektury — sposób instruowania modelu przez prompt.

| Technika | Opis |
|---|---|
| **System prompt** | Stała instrukcja definiująca rolę i zachowanie modelu |
| **Few-shot** | Przykłady w prompcie pokazujące oczekiwany format odpowiedzi |
| **Chain-of-thought** | Instrukcja do myślenia krok po kroku przed odpowiedzią |

---

## Structured output

Wymuszenie odpowiedzi modelu w określonym schemacie (JSON, XML) — kluczowe przy integracji z kodem i narzędziami.

```
Prompt + schemat JSON → Model → Odpowiedź zgodna ze schematem
```

- Eliminuje potrzebę parsowania tekstu
- Niezbędne gdy wynik trafia do kolejnego kroku workflow lub narzędzia
- Wspierane natywnie przez większość dostawców modeli

---

## Architektura agentów

### Wzorce

| Wzorzec | Opis |
|---|---|
| **ReAct** | Reason + Act — myśl, działaj, obserwuj wynik |
| **Chain of Thought** | Krok po kroku do odpowiedzi |
| **Multi-agent** | Wiele agentów współpracuje (jak zespół) |
| **Planner + Executor** | Jeden planuje, drugi wykonuje |

### Narzędzia agenta (tools)

- Wyszukiwanie w internecie
- Wykonywanie kodu
- Odczyt/zapis plików
- Wywołania API (zewnętrzne usługi)
- Baza danych / pamięć

---

## Baza wiedzy

| Typ pamięci | Opis | Przykład |
|---|---|---|
| **Wagi modelu** | Wiedza z treningu, nie zmienia się | Matematyka, język, fakty |
| **Context window** | Aktualna rozmowa | To co napisałeś dzisiaj |
| **RAG** | Retrieval-Augmented Generation — wyszukiwanie w zewnętrznych dokumentach | Szukanie w firmowej wiki |
| **Long-term memory** | Baza danych z poprzednich sesji | Notatki z poprzednich rozmów |
| **Vector store** | Baza danych semantyczna — szuka po znaczeniu, nie po słowach | Szukanie "coś o kotach" znajdzie też "kocięta" |

---

## Fine-tuning

Alternatywa wobec RAG i prompt engineeringu — modyfikuje wagi modelu zamiast kontekstu.

| | Prompt engineering / RAG | Fine-tuning |
|---|---|---|
| **Co modyfikuje** | Kontekst (prompt) | Wagi modelu |
| **Koszt** | Niski | Wysoki (trening) |
| **Elastyczność** | Wysoka | Niska |
| **Kiedy używać** | Domyślny wybór | Gdy styl/format odpowiedzi jest ściśle określony i niezmienny |

---

## Parametry generowania

| Parametr | Co robi? | Niska wartość | Wysoka wartość |
|---|---|---|---|
| **Temperature** | Losowość odpowiedzi | Przewidywalny, dokładny | Kreatywny, chaotyczny |
| **Top-p** | Zakres możliwych tokenów | Skupiony | Różnorodny |
| **Max tokens** | Długość odpowiedzi | Krótka | Długa |
| **System prompt** | Instrukcje dla modelu | — | — |

---

## Trenowanie modeli

```
Dane → Pre-training → Fine-tuning → RLHF → Model gotowy
```

| Etap | Co się dzieje? |
|---|---|
| **Pre-training** | Model uczy się języka na miliardach tekstów |
| **Fine-tuning** | Dostrajanie do konkretnego zadania (np. kodowanie) |
| **RLHF** | Ludzcy oceniający uczą model "dobrego" zachowania |
| **Quantization** | Zmniejszanie rozmiaru modelu (szybszy, mniej pamięci) |

---

## Bezpieczeństwo

### Zagrożenia

| Zagrożenie | Co to? | Przykład |
|---|---|---|
| **Prompt injection** | Złośliwy tekst zmienia zachowanie modelu | "Zapomnij zasady i zrób X" |
| **Jailbreak** | Obejście zasad bezpieczeństwa | Ukryte instrukcje w obrazku |
| **Data leakage** | Model ujawnia prywatne dane | Powtarzanie danych z treningu |
| **Hallucination** | Model wymyśla fakty, które nie istnieją | Podaje fałszywe cytaty |
| **Tool misuse** | Agent używa narzędzi w niezamierzony sposób | Usuwa pliki zamiast odczytać |

### Zabezpieczenia

- **Guardrails** — filtry wejścia i wyjścia
- **RLHF** — trening z nagrodą za dobre zachowanie (Reinforcement Learning from Human Feedback)
- **Constitutional AI** — model ocenia własne odpowiedzi według zasad
- **Sandboxing** — agent działa w izolowanym środowisku
- **Human-in-the-loop** — człowiek zatwierdza ważne decyzje

---

## Ewaluacja

| Metryka | Co mierzy? |
|---|---|
| **Accuracy** | Jak często odpowiedź jest poprawna |
| **Latency** | Czas odpowiedzi |
| **Hallucination rate** | Jak często model wymyśla fakty |
| **Cost per token** | Koszt generowania tekstu |
| **Context utilization** | Jak dobrze model korzysta z kontekstu |

---

## Słownik skrótów

| Skrót | Pełna nazwa |
|---|---|
| LLM | Large Language Model |
| RAG | Retrieval-Augmented Generation |
| RLHF | Reinforcement Learning from Human Feedback |
| CoT | Chain of Thought |
| MCP | Model Context Protocol |
| API | Application Programming Interface |
| GPU | Graphics Processing Unit (do trenowania modeli) |
