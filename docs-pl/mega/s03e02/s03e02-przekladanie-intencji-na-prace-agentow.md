# S03E02 · Przekładanie intencji na pracę agentów

## Spis treści

1. [Film](#1-film)
2. [Główna myśl](#2-główna-myśl)
3. [Opisywanie intencji](#3-opisywanie-intencji)
4. [Kontekst produktu](#4-kontekst-produktu)
5. [Wymagania i rozbijanie pracy](#5-wymagania-i-rozbijanie-pracy)
6. [Ocena (ewaluacja)](#6-ocena-ewaluacja)
7. [Wnioski](#7-wnioski)

> **W skrócie:** agent jest jak bardzo zdolny pracownik. Nie mówimy mu **jak** ma coś zrobić. Mówimy mu **co** chcemy, **jakimi zasadami** ma się kierować i **jak udowodni**, że się udało.

---

## 1. Film

### Zamiar → ADR

- Rozmawiaj z agentem AI o tym, co chcesz zrobić.
- Wnioski zapisuj jako **ADR** (Architecture Decision Record — zapis decyzji architektonicznej).
- Daj agentom dostęp do ADR-ów → na ich podstawie tworzą kolejne.

**Analogia:** ADR to pamiętnik zespołu — każdy nowy agent czyta go i wie, dlaczego coś jest tak, a nie inaczej.

**Szablon ADR (zrób go najpierw):**

| # | Część | Co zawiera |
|---|---|---|
| 1 | Metadane | data, status itd. |
| 2 | Kontekst | jaka była sytuacja |
| 3 | Decyzje | co postanowiliśmy |
| 4 | Konsekwencje | co z tego wynika |

Listę ADR-ów agent znajduje w pliku `AGENTS.md`.

### AGENTS.md

- To **mapa** do dokumentacji, a nie sama dokumentacja.
- Maksymalnie **20 linii**.
- Zawiera tylko **linki**.

**Analogia:** spis treści książki, a nie cała książka.

### Zasady

- **13 zasad**, każda długa na **jedną linię**.
- Pojawia się nowa zasada → starą usuwamy (liczba się nie zwiększa).
- Przykład — **„Sprzątanie”**: czegoś nie używamy → usuwamy to z kodu.

### Prymitywy

- Pogrupuj prymitywy (podstawowe klocki systemu) i wypisz je w jednym pliku, np. `primitives.yaml`.
- Każdy wpis ma link **do kodu** i **do dokumentacji**.

**Przykładowe grupy:**

| # | Grupa |
|---|---|
| 1 | Surfaces |
| 2 | Auth |
| 3 | Assistant |
| 4 | Runtime |
| 5 | Storage |

**Analogia:** katalog klocków LEGO — widać, jakie są klocki i gdzie leżą.

### Testowanie PR

- Przed wystawieniem PR **przetestuj system**.
- Daj agentom narzędzie: **CLI do aplikacji** z gotowymi scenariuszami testowymi.
- Powiedz agentowi jasno, **jakie są oczekiwania**.

### Szablon PR

| # | Sekcja | Co opisuje |
|---|---|---|
| 1 | Intent | co chcemy osiągnąć |
| 2 | Door | drzwi w jedną czy w dwie strony — czy łatwo to wycofać |
| 3 | Cleanup | usunięcie nieużywanego kodu |
| 4 | Why | dlaczego ta PR jest potrzebna |
| 5 | Summary | opis zmian |
| 6 | Referenced issues and PRs | powiązane zgłoszenia i PR-y |
| 7 | Testing | jak przetestowano |
| 8 | System changes | czy zmieniono prymitywy i jakie jest ryzyko |

---

## 2. Główna myśl

Modele potrafią wiele rzeczy lepiej od nas. Zamiast się tym martwić — wykorzystajmy to.

| Stary sposób | Nowy sposób |
|---|---|
| Mówię, **jak** to zrobić | Mówię, **co** chcę osiągnąć |
| Daję sztywne reguły | Daję zasady i powody |
| Sprawdzam każdą linijkę kodu | Agent sam dostarcza dowody |

**Analogia:** to jak różnica między instrukcją „skręć w lewo po 200 m” a „dojedź do szpitala, omijaj korki”. Drugi kierowca poradzi sobie nawet, gdy droga będzie zamknięta.

---

## 3. Opisywanie intencji

Statystyki autora z 2 miesięcy pracy:

| Co | Ile |
|---|---|
| Moje wiadomości | ~4,5 tys. |
| Odpowiedzi agentów do mnie | ~13,5 tys. |
| Wiadomości między agentami | ~27 tys. |
| Długość wpisanej wiadomości | ~7 słów |
| Długość podyktowanej wiadomości | ~150 słów |
| Czas pracy agentów bez nadzoru | od 3 do prawie 40 godzin |

Praca człowieka to głównie: **opisywanie intencji** + **dawanie informacji zwrotnej**.

### Reguła vs zasada

| Reguła (sztywna) | Zasada (elastyczna) |
|---|---|
| Odpowiedzi do 100 słów | Szanuj uwagę czytelnika — każde zdanie musi zasłużyć na miejsce |
| Nigdy nie usuwaj plików | Dopasuj ostrożność do kosztu pomyłki |
| Używaj punktów | Niech treść decyduje o formie |

**Analogia:** reguła to tory kolejowe — pociąg jedzie tylko tam, gdzie są szyny. Zasada to ogrodzony plac zabaw — dziecko biega, gdzie chce, ale nie wybiegnie na ulicę.

### Dodaj powód

Powód pokazuje agentowi „szerszy obraz”. Dzięki temu sam radzi sobie w nowych sytuacjach.

**Przykład — agent znający sprawy zespołu:**
- **Zasada:** dziel się informacją tylko z tymi, których dotyczy.
- **Powód:** ludzie mówią agentowi rzeczy tylko wtedy, gdy ufają, że trafią we właściwe miejsce.

| Gdzie pisze agent | Co mówi |
|---|---|
| Wiadomość prywatna | „Masz wizytę u lekarza o 14:00, przeniosłem przegląd na 16:00.” |
| Kanał zespołu | „Adam jest niedostępny 14–15. Przegląd przesunięty na 16:00.” |
| Kanał z gośćmi z zewnątrz | „Przegląd przesunięty na 16:00.” |

Przypadku z gośćmi nikt nie opisał — agent sam go wywnioskował z powodu.

---

## 4. Kontekst produktu

Z kodu agent wie tylko, **jak jest teraz**. Nie wie:
- dokąd zmierza produkt,
- nad czym pracuje zespół,
- jakie są decyzje biznesowe.

**Analogia:** to jak nowy pracownik, który dostał klucze do biura, ale nikt mu nie powiedział, po co firma istnieje.

### Podejścia z praktyki

| Kto | Podejście | Idea |
|---|---|---|
| **Kent** | Folder `decisions/` z ADR-ami | Każda decyzja: kontekst, decyzja, konsekwencje. Pliki pisze agent na podstawie rozmów z Kentem |
| **Matt Pocock** | ADR + skill `/grill-with-docs` | ADR-y chronią przed usuwaniem funkcji, których sensu nie widać w kodzie |
| **Lauren Tan** | Zasady zamiast archiwum decyzji | Przy 2500+ PR/mies. ADR-y rozpraszają. Zasady zamienia w trwałe wskazówki: skille, typy, środowisko, samoweryfikację |
| **Joel Hooks** | Effect Schemas + DDD (stos „CAFE”) | Sam kod opisuje kształt produktu |

**Wspólny cel:** więcej samodzielności agenta → mniej pytań, lepsze decyzje.

---

## 5. Wymagania i rozbijanie pracy

Odpowiedzialności nie da się przekazać AI — to nasza rola.

Zamiast długiej specyfikacji tworzymy **umowę**:

| Element umowy | Pytanie |
|---|---|
| Zakres | Co robimy? |
| Rezultat | Jak wygląda „gotowe”? |
| Granice | Czego nie ruszamy? |
| Dowód | Jak sprawdzimy, że działa? |

Najpierw zbieramy dużo materiałów — nie po to, by je czytać, ale żeby agent miał kontekst.

### Narzędzia do zrozumienia zmian

| Narzędzie | Co daje | Przykład |
|---|---|---|
| **Wizualizacje** | Obraz zamiast ściany tekstu | skille *Anatomy*, `/show-me` (HumanLayer) |
| **Porównania** | „Teraz” vs „Po zmianie” obok siebie | logika backendu, zrzuty ekranu, komponenty z design systemu |
| **Grafy i diagramy** | Przełączanie: ogół ↔ szczegół | warstwowe grafy w HTML, których stan agent może odczytać |
| **Laboratorium (lab)** | Możemy **poczuć** wynik i szybko iterować | plik HTML, osobna aplikacja lub moduł `/lab`, z wbudowanymi agentami i artefaktami |

**Analogia:** lab to piaskownica — budujesz zamek, burzysz, budujesz znowu, zanim postawisz prawdziwy dom.

**Cel narzędzi:** znaleźć ślepe punkty, przypadki brzegowe, skutki uboczne i ukryte szanse. To **myślenie systemowe** — patrzymy, jak zmiana łączy się z resztą produktu.

### Techniki sterowania agentem

| Technika | Jak działa |
|---|---|
| **Oczywiste pytania** | Pytaj o to, co już wiesz → ładujesz to do wątku. Potem lista modułów → subagenci idą w głąb |
| **Parafraza** | Podyktuj wszystko, co wiesz. Agent mówi to własnymi słowami + dodaje kontekst |
| **Rozdziel i połącz** | Szeroka eksploracja → scalenie → powtórz (rodzaj „drzewa myśli”) |
| **Modele myślowe** | Brzytwa Ockhama, myślenie od podstaw, skutki drugiego rzędu, inwersja |

Bądź ciekawy, baw się z agentem. Gdy proces działa — niech agenci grają sami ze sobą.

---

## 6. Ocena (ewaluacja)

Umowa nic nie znaczy, jeśli nie da się **udowodnić** wyniku — bez oszukiwania i bez czytania każdej zmiany.

| Co wziąć pod uwagę | Opis |
|---|---|
| **Mocne strony modeli** | Kod, narzędzia, wzorce; zbierają dowody: logi, pomiary, zrzuty, wideo |
| **Słabe strony modeli** | Detale, wiele zmiennych naraz, spójność, rzeczy spoza kontekstu |
| **Zasoby** | Czas, pieniądze, sprzęt → sprawdzaj tylko to, co naprawdę ważne |
| **Narzędzia, które mamy** | Lintery, type-checkery, kompilatory, testy, konta testowe |
| **Narzędzia, których brakuje** | Trzeba je zbudować (np. *agentcomputer*, *browserbase*) |
| **Metryki** | Muszą oddawać rzeczywistość — np. UI mierz w kodzie, nie „na oko” LLM-a |
| **Definicja sukcesu** | Bez niej agent robi za dużo (np. zbędne feature flagi, backfille) albo za mało |
| **Definicja porażki** | Kiedy nawet dobre dowody oznaczają „nie” |

**Analogia:** to jak egzamin — uczeń musi wiedzieć, jakie będą pytania i ile punktów daje zaliczenie.

**Złote zasady:**
- Wyciągaj z procesu **wielokrotnego użytku** narzędzia i skille.
- Co da się sprawdzić **deterministycznie** → sprawdzaj kodem.

---

## 7. Wnioski

- Nie mówimy agentowi dokładnie, co robić — **rozszerzamy jego narzędzia, wiedzę i środowisko**.
- Wykorzystujemy **wiedzę modelu** i jego naturalne zdolności agentowe.
- Trzeba zarządzać: tempem, jakością, skalą, postępem i **własną energią**.
- Programowanie, jakie znaliśmy, się skończyło — ale wiele „nowych” wyzwań inżynierowie znają od lat. I tam właśnie jest radość z pracy.
