# Praca z modelami AI

## Architektury

| Architektura | Opis |
|---|---|
| **Single call** | Pojedyncze zapytanie, brak pętli |
| **RAG** | Pobieranie kontekstu przed odpowiedzią (vector DB, wyszukiwanie) |
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
| **Pamięć** | Brak / Kontekstowa / Zewnętrzna (vector DB, pliki, baza danych) |
| **Nadzór** | Pełny automat / Human-in-the-loop / Human-on-the-loop |
| **Ewaluacja** | Brak / LLM-as-judge / Testy automatyczne |

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

## Uwagi

- **MCP** to protokół, nie osobna architektura — standaryzuje dostęp do narzędzi
- **RAG** to odrębny wzorzec od workflow — retrieval ma inną logikę niż wykonywanie akcji
- **Pamięć** i **narzędzia** są niezależne — agent może mieć pamięć długoterminową bez MCP
