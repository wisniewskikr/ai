# Szablon promptu: interview

Prompt do tworzenia notatki "interview" z jednej lekcji kursu. Każda lekcja ma dwa pliki źródłowe: transkrypcję filmu i tekst lekcji. Prompt łączy oba pliki w jedną krótką bazę wiedzy przed interview. Działa jak foremka do ciastek: za każdym razem daje ten sam kształt.

Razem z promptem podajemy trzy informacje:

| Parametr | Znaczenie | Przykład |
|---|---|---|
| `<PLIK_FILM>` | ścieżka do transkrypcji filmu | `s01e02/s01e02-transcript.md` |
| `<PLIK_TEKST>` | ścieżka do tekstu lekcji | `s01e02/s01e02-<tytul-lekcji>.md` |
| `<PLIK_DOCELOWY>` | nazwa pliku docelowego, tworzonego w tym samym folderze co pliki źródłowe | `s01e02-interview.md` |

| Krok | Co zrobić |
|---|---|
| 1 | Skopiuj prompt poniżej |
| 2 | Zamień `<PLIK_FILM>`, `<PLIK_TEKST>` i `<PLIK_DOCELOWY>` na właściwe nazwy |
| 3 | Wklej prompt do Claude Code |

Przykład dla lekcji S01E01:

| Rola | Plik |
|---|---|
| Film (input) | [s01e01-transcript.md](./s01e01/s01e01-transcript.md) |
| Tekst (input) | [s01e01-mechanics-behind-generative-ai.md](./s01e01/s01e01-mechanics-behind-generative-ai.md) |
| Wzorzec (output) | [s01e01-interview.md](./s01e01/s01e01-interview.md) |

---

## Prompt

```
Plik film: <PLIK_FILM>
Plik tekst: <PLIK_TEKST>
Plik docelowy: <PLIK_DOCELOWY>

Na podstawie obu plików źródłowych stwórzmy plik docelowy w języku polskim. Plik docelowy zapisujemy w tym samym folderze, w którym leżą pliki źródłowe.

Zasady ogólne:
* Nie używajmy skila "/wisniewk-doc-rules"
* Przeczytajmy oba pliki w całości przed pisaniem. Wzorcem formatu, stylu i poziomu szczegółowości jest plik docs-pl/mega/s01e01/s01e01-interview.md – przeczytajmy go przed pisaniem
* Łączymy oba źródła w jedną spójną całość, uporządkowaną tematami, a nie źródłami. Nie piszemy, z którego pliku pochodzi informacja
* Film zwykle pokazuje mechanikę na demo (np. ChatML, pętla agenta), a tekst daje szerszy przegląd (np. ograniczenia, dostawcy, harness). Bierzemy z obu to, co kluczowe
* Gdy źródła podają różne liczby, wybieramy wartość bardziej ogólną lub podajemy zakres
* Zostawiamy tylko kluczowe elementy warte zapamiętania. Szczegóły można doczytać w plikach źródłowych
* Zasada "mniej znaczy lepiej": tylko kluczowe pojęcia z krótkimi, ale jasnymi definicjami
* Dokument ma pomóc szybko przypomnieć sobie wiedzę przed interview albo przed implementacją własnego projektu z agentami AI
* Można dodać pojęcia spoza źródeł, jeśli są ściśle związane z tematem, często padają na interview i domykają obraz (np. prompt injection przy ograniczeniach modelu). Dodajemy je oszczędnie i tylko pewną wiedzę
* Bez linków do zewnętrznych materiałów, figur i przykładów z repozytorium kursu

Logika dokumentu (NAJWAŻNIEJSZA ZASADA):
* Sensowne ułożenie sekcji jest ważniejsze niż kompletność treści. Dokument ma być jedną historią, a nie listą tematów
* Dlaczego historia: człowiek łatwiej zapamiętuje historię niż suche fakty. Gdy sekcje tworzą logiczny ciąg, przed interview wystarczy przypomnieć sobie ten ciąg, a szczegóły same wracają
* Najpierw ogólny obraz, potem szczegóły: sekcje wcześniejsze dają podstawy, a sekcje późniejsze z nich korzystają
* Każda sekcja wynika z poprzedniej: odpowiada na pytanie albo problem, który zostawiła poprzednia sekcja. Typowe przejścia:
  * pojęcie → jego elementy (np. Model → Wejście, Wyjście)
  * ograniczenie → rozwiązanie (np. Ograniczenia → Rozwiązania ograniczeń)
  * część → całość, która ją obudowuje (np. Model → Harness → Agent)
  * przegląd → warianty (np. Strategie narzędzi → Function calling, Dispatcher, Tool search, Code mode)
* Przed pisaniem zaplanujmy szkielet (tylko w myślach, nie zapisujemy go w pliku docelowym):
  1. Wypiszmy kandydatów na sekcje
  2. Dla każdej sekcji odpowiedzmy: dlaczego ta sekcja jest w dokumencie? Jak pomaga zrealizować cel wykładu i czy padnie o nią pytanie na interview? Sekcję bez dobrej odpowiedzi usuwamy albo łączymy z inną
  3. Dla każdej sekcji odpowiedzmy: dlaczego stoi właśnie w tym miejscu? Co z poprzedniej sekcji jest potrzebne, żeby ją zrozumieć, i do czego prowadzi następna?
  4. Rozważmy co najmniej dwie inne kolejności sekcji (np. od problemu do rozwiązania, od części do całości, w kolejności przepływu danych). Porównajmy je i wybierzmy tę, w której najmniej sekcji odwołuje się do pojęć wyjaśnionych dopiero później
  5. Dopiero potem piszemy treść
* Szkielet opisujemy jedną analogią z kilku ogniw, która pokazuje drogę przez cały dokument. Wzorzec: **silnik** (model) → **samochód** (harness) → **kierowca w trasie** (agent z narzędziami). Analogia trafia do sekcji "Opis"
* Powiązania między sekcjami są widoczne w tekście:
  * sekcja przeglądowa wymienia swoje podsekcje z odwołaniami "(sekcja N)"
  * tabela ograniczeń kończy się rozwiązaniem, które wskazuje kolejną sekcję
  * późniejsze sekcje odwołują się do wcześniejszych zamiast powtarzać treść
* Kolejność sekcji nie musi odpowiadać kolejności w plikach źródłowych. Możemy ją zmienić, ale nie musimy: zostawiamy kolejność ze źródeł, jeśli już tworzy logiczny ciąg, a zmieniamy ją, jeśli inna kolejność daje spójniejszą historię

Struktura dokumentu (w tej kolejności):
1. Tytuł: "# <identyfikator z nazwy pliku, np. S01E02> – <temat lekcji po polsku>"
2. "## Spis treści": lista odnośników do wszystkich sekcji (#opis, #1-nazwa, #2-nazwa---podsekcja, ...)
3. "## Opis":
   * jedna linia "**Cel wykładu:** ..." (jedno zdanie)
   * cytat "> ..." z analogią szkieletu (patrz "Logika dokumentu"), która pokazuje drogę przez sekcje (np. "Najpierw **silnik** (model, sekcje 1–5), potem **samochód** (harness, sekcja 6), na końcu **kierowca w trasie** (agent z narzędziami, sekcje 7–17).")
   * "**Jak łączą się sekcje:**" i lista punktowana przejść, która pokazuje, jak każda sekcja wynika z poprzedniej. Jedna linia na przejście (albo na grupę sekcji szczegółowych), w formie "- **N. Nazwa → N+1. Nazwa** – jakie pytanie lub problem zostawia sekcja N i jak odpowiada na nie sekcja N+1" (np. "- **5. Model - Rozwiązania ograniczeń → 6. Harness** – większość rozwiązań musi wykonać ktoś poza modelem, czyli harness"). Czytając samą tę listę, dostajemy całą historię dokumentu w skrócie
4. Sekcje merytoryczne "## N. <Nazwa>":
   * numerowane, z krótkimi nazwami (1–3 słowa)
   * ułożone zgodnie z zasadą "Logika dokumentu": od ogólnego obrazu do szczegółów, każda sekcja wynika z poprzedniej
   * duży temat dzielimy na sekcję przeglądową "## N. <Temat>" i sekcje szczegółowe "## N+1. <Temat> - <Wariant>" (np. "## 8. Strategie narzędzi", "## 9. Strategie narzędzi - Function calling")
   * gdy warianty jednego tematu dzielą się na grupy, nazwę grupy dodajemy w nawiasie: "## N+1. <Temat> (<Grupa>) - <Wariant>" (np. "## 5. Personalizacja (Wiedza) - AGENTS.md", "## 7. Personalizacja (Działanie) - Narzędzia")
   * sekcja przeglądowa zawiera tabelę porównawczą wszystkich wariantów z odwołaniami "(sekcja N)". Tabela wymienia też powiązane elementy opisane w sekcjach bez jej prefiksu (np. narzędzia i subagenty w tabeli personalizacji)
   * temat i grupę nadajemy według roli w historii, a nie według cech technicznych (np. skill i subagent to podobne pliki, ale skill daje wiedzę, a subagent działa, więc trafiają do różnych grup). Sekcja przeglądowa krótko podaje kryterium podziału na grupy
   * w sekcji można użyć podsekcji "### <Nazwa>", każda z własną pogrubioną tezą
5. "## N. Wnioski": tabela | Sekcja | Wniosek |, gdzie wniosek to jedno zdanie z pogrubionymi kluczowymi słowami; kolumna "Sekcja" ma postać "N. Nazwa", zakres "8–12. Nazwa" albo "Całość"
6. "## N. Pytania": tabela | Sekcja | Pytanie | Krótka odpowiedź |, czyli typowe pytania z interview, z odpowiedziami w jednym zdaniu; po kilka pytań do każdej sekcji merytorycznej, w kolejności sekcji

Format każdej sekcji merytorycznej:
* Pierwsza linia to pogrubiona teza sekcji w jednym zdaniu (np. "**Agent = LLM + narzędzia w pętli.**")
* Definicje zapisujemy jako "- **Pojęcie** – krótka definicja"
* Porównania, warianty, role, ograniczenia zapisujemy w tabelach. Typowe tabele:
  * porównanie wariantów: | | Wariant A | Wariant B | z wierszami np. "W kontekście", "Koszt kontekstu", "Wdrożenie", "Ryzyko"
  * ograniczenia: | Ograniczenie | Przyczyna | Rozwiązanie |
  * rozwiązania: | Rozwiązanie | Jak działa | Na jakie ograniczenie (sekcja N) |
  * na końcu sekcji szczegółowej: | Ograniczenie | Rozwiązanie |, które prowadzi do kolejnej sekcji
* Procesy krok po kroku zapisujemy jako listę numerowaną
* Formaty, komendy i przykłady zapisujemy w blokach kodu z krótkim podpisem (np. "**Przykład: lista narzędzi, pytanie, tool call i odpowiedź** (format Qwen, ChatML):")
* Przykłady pokazujemy tak, jak widzi je model (np. ChatML), a w powiązanych sekcjach używamy tego samego przykładu (np. pytanie "Jaki jest mój e-mail?"), żeby łatwo porównać warianty
* Proste diagramy przepływu rysujemy w blokach kodu (np. "User ↔ Harness ↔ Serwer API ↔ Model")
* Najważniejszą myśl sekcji wyróżniamy cytatem "> ...". Krótka analogia z życia ułatwia zapamiętanie (np. "jak foremka do ciastek: pilnuje kształtu, nie smaku")
* Konkretne przykłady i liczby z materiału zostawiamy, jeśli ułatwiają zapamiętanie (np. "say hi" ≈ 21 000 tokenów)
* Odwołania do innych sekcji zapisujemy jako "(sekcja N)" lub "(sekcje N–M)", bez powtarzania treści
* Terminy techniczne zostawiamy w oryginale (np. harness, tool call), a nazwy kodu, ról, narzędzi i plików zapisujemy w `backtickach`

Separatory i styl:
* Sekcje oddzielamy linią "---" (także po spisie treści i po opisie)
* Bez wstępów i bez lania wody: tabele, punkty lub myślniki wszędzie tam, gdzie to możliwe

Na koniec sprawdźmy:
* czy czytając same nagłówki i tezy sekcji po kolei, dostajemy spójną historię, w której każda sekcja wynika z poprzedniej. Jeśli nie, zmieniamy kolejność lub podział sekcji
* czy każda sekcja ma powód, żeby być w dokumencie, i czy żadna sekcja nie korzysta z pojęcia wyjaśnionego dopiero w późniejszej sekcji
* czy analogia w "Opisie" pasuje do faktycznej kolejności sekcji
* czy lista "Jak łączą się sekcje" obejmuje wszystkie sekcje merytoryczne i czy każde przejście ma prawdziwy powód (pytanie albo problem), a nie tylko "następny temat"
* czy podział na grupy jest widoczny w nagłówkach "(<Grupa>)" i czy sekcja przeglądowa wymienia wszystkie warianty i podaje kryterium podziału
* czy odnośniki w spisie treści pasują do nagłówków
* czy każde odwołanie "(sekcja N)" wskazuje właściwą sekcję
* czy każda sekcja merytoryczna ma wiersz we wnioskach i co najmniej jedno pytanie
```
