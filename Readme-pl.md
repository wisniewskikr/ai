# Praca z modelami AI

## Architektury

| Architektura | Opis |
|---|---|
| **Single call** | Pojedyncze zapytanie, brak pętli |
| **Workflow** | Deterministyczny przepływ: chain, routing, map-reduce, parallelization |
| **Agent** | Model sam decyduje co dalej — pętla: *think → act → observe* |
| **Multi-agent** | Orkiestrator + subagenci lub agenci peer-to-peer |

> **Kluczowe pytanie:** Czy przepływ jest z góry znany? → Workflow. Czy model go odkrywa? → Agent.

---

## Wymiary ortogonalne

Każda architektura może być skonfigurowana wzdłuż tych osi niezależnie:

| Wymiar | Opcje |
|---|---|
| **Narzędzia** | Brak / Natywne / MCP (protokół transportu narzędzi) |
| **Pamięć** | W wagach (trening/fine-tuning) / Kontekstowa (okno kontekstu) / Cache (KV cache) / Zewnętrzna (vector DB, pliki, baza danych) |
| **Nadzór** | Pełny automat / Human-in-the-loop / Human-on-the-loop |
| **Ewaluacja** | Brak / LLM-as-judge / Testy automatyczne |

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

## Fundamentalna lista AI

Podstawowe koncepcje działania modeli językowych (LLM), na których opierają się wszystkie architektury.

| # | Koncepcja | Opis |
|---|---|---|
| 1 | **Model jako funkcja** | Model przyjmuje tekst na wejściu i zwraca tekst na wyjściu. Nie wiesz co jest w środku — traktuj go jak dowolną zewnętrzną funkcję. |
| 2 | **API & Chat Completion** | API to sposób komunikacji z modelem. Wysyłasz prompt przez HTTP POST, otrzymujesz odpowiedź (completion). |
| 3 | **Prompt = Instrukcja + Historia** | Model nie ma pamięci między wywołaniami. Każde zapytanie musi zawierać pełną historię rozmowy: system prompt → poprzednie wiadomości → nowe zapytanie. |
| 4 | **Narzędzia = Schematy JSON** | Narzędzia to nie kod uruchamiany przez model. To schematy JSON dołączane do promptu — model czyta je jak tekst i decyduje, jaki JSON zwrócić. |
| 5 | **Function Calling** | Model zwraca JSON opisujący co wywołać. Twój kod go odczytuje i uruchamia właściwą funkcję, a wynik odsyła z powrotem do modelu. |
| 6 | **Agent Loop** | Pętla wywołań API. W każdej iteracji model decyduje: zwróć JSON (wywołaj narzędzie → kontynuuj pętlę) lub zwróć tekst (odpowiedź końcowa → zatrzymaj się). |

---

## Fine-tuning

Alternatywa wobec RAG i prompt engineeringu — modyfikuje wagi modelu zamiast kontekstu.

| | Prompt engineering / RAG | Fine-tuning |
|---|---|---|
| **Co modyfikuje** | Kontekst (prompt) | Wagi modelu |
| **Koszt** | Niski | Wysoki (trening) |
| **Elastyczność** | Wysoka | Niska |
| **Kiedy używać** | Domyślny wybór | Gdy styl/format odpowiedzi jest ściśle określony i niezmienny |
