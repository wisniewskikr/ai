# Szablon promptu: movie interview

Prompt do tworzenia notatek "movie interview" z dowolnego pliku źródłowego (np. transkrypcji wykładu). Działa jak foremka do ciastek: za każdym razem daje ten sam kształt.

Razem z promptem podajemy dwie informacje:

| Parametr | Znaczenie | Przykład |
|---|---|---|
| `<PLIK_ZRODLOWY>` | ścieżka do pliku źródłowego (nazwa dowolna) | `s01e02/s01e02-transcript.md` |
| `<PLIK_DOCELOWY>` | nazwa pliku docelowego (nazwa dowolna), tworzonego w tym samym folderze co plik źródłowy | `s01e02-movie-interview.md` |

| Krok | Co zrobić |
|---|---|
| 1 | Skopiuj prompt poniżej |
| 2 | Zamień `<PLIK_ZRODLOWY>` i `<PLIK_DOCELOWY>` na właściwe nazwy |
| 3 | Wklej prompt do Claude Code |

Wzorzec: [s01e01-movie-interview.md](./s01e01/s01e01-movie-interview.md)

---

## Prompt

```
Plik źródłowy: <PLIK_ZRODLOWY>
Plik docelowy: <PLIK_DOCELOWY>

Na podstawie pliku źródłowego stwórzmy plik docelowy w języku polskim. Plik docelowy zapisujemy w tym samym folderze, w którym znajduje się plik źródłowy.

Zasady ogólne:
* Nie używajmy skila "/wisniewk-doc-rules"
* Plik ma zawierać tylko kluczowe elementy z pliku źródłowego warte zapamiętania. Szczegóły można potem doczytać w tekście źródłowym
* Zasada "mniej znaczy lepiej": pamięć człowieka jest ograniczona, więc zostawiamy tylko kluczowe pojęcia z krótkimi, ale jasnymi definicjami
* Dokument ma pomóc szybko przypomnieć sobie wiedzę przed interview albo przed implementacją własnego projektu z agentami AI
* Wzorcem formatu jest plik docs-pl/mega/s01e01/s01e01-movie-interview.md

Struktura dokumentu (w tej kolejności):
1. Tytuł: "# <identyfikator, jeśli wynika z nazwy pliku źródłowego, np. S01E02> – <temat materiału>"
2. "## Spis treści": lista odnośników do wszystkich sekcji (#opis, #1-nazwa, #2-nazwa, ...)
3. "## Opis":
   * jedna linia "**Cel wykładu:** ..." (jedno zdanie)
   * tabela | Sekcja | Co wyjaśnia | Powiązanie z celem |. Pokrewne sekcje można łączyć w jeden wiersz (np. "2–3")
4. Sekcje merytoryczne "## N. <Nazwa>":
   * numerowane, z krótkimi nazwami (1–3 słowa)
   * ułożone logicznie: od podstaw do złożenia całości, a każda sekcja ma wynikać z poprzedniej (np. ograniczenie → rozwiązanie)
5. "## N. Wnioski": lista najważniejszych myśli z całego materiału, z pogrubionymi kluczowymi słowami
6. "## N. Pytania": tabela | Pytanie | Krótka odpowiedź |, czyli typowe pytania z interview na temat materiału, z odpowiedziami w jednym zdaniu

Format każdej sekcji merytorycznej:
* Pierwsza linia to pogrubiona teza sekcji w jednym zdaniu (np. "**Agent = LLM + narzędzia w pętli.**")
* Definicje zapisujemy jako "- **Pojęcie** – krótka definicja"
* Porównania, warianty, role, ograniczenia (przyczyna → rozwiązanie) zapisujemy w tabelach
* Procesy krok po kroku zapisujemy jako listę numerowaną
* Formaty, komendy i przykłady zapisujemy w blokach kodu z krótkim podpisem (np. "**Przykład ...** (format X):")
* Najważniejszą myśl sekcji można wyróżnić cytatem "> ..."
* Konkretne przykłady i liczby z materiału zostawiamy, jeśli ułatwiają zapamiętanie (np. "say hi" ≈ 21 000 tokenów)
* Odwołania do innych sekcji zapisujemy jako "(sekcja N)", bez powtarzania treści
* Terminy techniczne zostawiamy w oryginale (np. harness, tool call), a nazwy kodu, ról i plików zapisujemy w `backtickach`

Separatory i styl:
* Sekcje oddzielamy linią "---"
* Bez wstępów i bez lania wody: tabele, punkty lub myślniki wszędzie tam, gdzie to możliwe
```
