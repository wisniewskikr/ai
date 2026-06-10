# Obserwowanie i ewaluacja

## Film do lekcji

Monitorowanie i ewaluacja agentów AI to nie aptekarstwo, a raczej **sędziowanie w sporcie**. Nie szukamy matematycznej precyzji, ale sprawdzamy, czy "gra" mieści się w wyznaczonych zasadach.

### Dlaczego klasyczne testy to za mało?

W tradycyjnym programowaniu wynik jest przewidywalny (2+2 zawsze równa się 4). W AI nawet drobna zmiana w instrukcji może całkowicie zmienić wynik.

| Cecha | Tradycyjne Testy (Unit/E2E) | Ewaluacja AI (Evals) |
| :--- | :--- | :--- |
| **Natura** | Deterministyczna (0 lub 1) | Probabilistyczna (stopień dopasowania) |
| **Cel** | Sprawdzenie logiki kodu | Ocena zachowania modelu |
| **Wynik** | Zaliczone / Niezaliczone | Wskaźnik jakości (np. %) |

**Analogia:** Tradycyjne testy są jak **przepis na ciasto** (musisz dodać dokładnie 2 jajka). Ewaluacja AI jest jak **krytyk kulinarny** (ocenia, czy danie jest smaczne, mimo że każdy kucharz doprawi je nieco inaczej).

### Jak oceniamy agentów?

Ponieważ język naturalny jest płynny (zdania „Mam na imię Adam” i „Jestem Adam” znaczą to samo, ale różnią się formą), stosujemy trzy metody oceny:

*   **Programistyczna:** Szybkie sprawdzenie konkretnych parametrów (np. czy odpowiedź zawiera wymagany kod pocztowy).
*   **Przez LLM (Model ocenia Model):** Inna sztuczna inteligencja sprawdza, czy odpowiedź jest zgodna z założeniami.
*   **Ludzka:** Ekspert ocenia niuanse, których maszyna może nie wyłapać.

### Kluczowe elementy systemu

1.  **Evals (Ewaluacje):** Pozwalają przewidzieć problemy, zanim trafią do użytkownika.
2.  **Guardrails (Barierki):** Mechanizmy blokujące niepożądane treści i filtrujące zapytania (działają jak "ochroniarz" systemu).
3.  **Obserwowalność:** Śledzenie dynamicznych danych i kontekstu, co przy wielu agentach staje się wyzwaniem.

**Mniej znaczy lepiej:** Nie szukaj 100% zgodności. Szukaj poziomu, który zadowoli Twoich użytkowników i zapewni bezpieczeństwo aplikacji.

## Użyteczność obserwacji w praktyce

Zrozumienie działania i kosztów systemów opartych na LLM (dużych modelach językowych) jest kluczowe dla sukcesu projektu. Poniżej przedstawiam najważniejsze wnioski w prostej formie.

### 1. Obserwowalność: Dlaczego musimy „podglądać” Agenta?

**Analogia:** Obserwowalność jest jak **czarna skrzynka w samolocie**. Bez niej wiemy tylko, że samolot nie dotarł do celu, ale nie wiemy, czy zawiodły silniki, czy nawigacja.

| Problem | Diagnoza w kodzie | Diagnoza przez obserwację |
| :--- | :--- | :--- |
| **Błędna logika** | Bardzo trudna do wykrycia. | Łatwo dostrzec błędne kroki agenta. |
| **Zły kontekst** | Kod wydaje się poprawny. | Widać, że treść rozmowy zmyliła model. |
| **Mylne opisy** | Trudne do znalezienia „na sucho”. | Widać, że agent przeszukał zły obszar. |

**Kluczowe korzyści:**
*   Szybsze wyłapywanie błędów, których nie widać w samym kodzie.
*   Zrozumienie, jak instrukcje łączą się ze sobą w praktyce.
*   Możliwość sprawdzenia aktywności użytkownika, gdy zgłasza problem (wsparcie klienta).

---

### 2. Zarządzanie kosztami: Portfel pod kontrolą

**Analogia:** Koszty LLM są jak **licznik w taksówce**. Nie płacisz tylko za samą jazdę, ale też za stanie w korkach, objazdy i bagaż. Czasem trasa, która wydaje się krótka, okazuje się najdroższa.

**Dlaczego estymacja jest trudna?**
*   **Zmienność:** Każda interakcja z użytkownikiem jest inna.
*   **Ukryte opłaty:** Płacimy za instrukcje systemowe, definicje narzędzi i całą historię rozmowy.
*   **Błędy:** Czasem to nie użytkownik „nabija” licznik, ale błąd w naszym systemie.

**Jak przeżyć na rynku?**
*   **Twarde limity:** Są krytyczne, aby uniknąć bankructwa przez błędy lub nadużycia.
*   **Statystyki:** Nawet w małej skali pozwalają na precyzyjne przewidywanie wydatków.
*   **Szybkie reagowanie:** Monitorowanie kosztów pozwala wykryć awarie aktualizacji lub ataki osób trzecich.

---

### Podsumowanie: Zasada "Mniej znaczy lepiej"

*   **Mniej zgadywania, więcej danych:** Statystyki to być albo nie być dla produktu.
*   **Mniej zaufania, więcej kontroli:** Zawsze stosuj twarde limity kosztowe.
*   **Mniej patrzenia w kod, więcej w raporty:** Zachowanie agenta najlepiej analizować na żywych przykładach.

## Zasady monitorowania zachowań modelu

Monitorowanie systemów LLM (Large Language Models) przypomina **czarną skrzynkę w samolocie**. Nie interesuje nas tylko to, czy samolot doleciał, ale każda drobna zmiana kursu, komunikat radiowy i praca silników w trakcie lotu.

### Kluczowe Elementy Monitoringu
Aby zrozumieć, co dzieje się wewnątrz Twojej aplikacji, musisz zbierać dane w ustrukturyzowany sposób.

| Element | Analoga | Opis |
| :--- | :--- | :--- |
| **Session** | Cała podróż | Pełny wątek rozmowy lub zadanie agenta. |
| **Trace** | Jeden przystanek | Pojedyncza interakcja (np. jedno pytanie użytkownika). |
| **Span** | Czas trwania | Jak długo zajęła konkretna czynność (np. szukanie w bazie). |
| **Generation** | Słowa pilota | Faktyczna odpowiedź modelu wraz z jego ustawieniami. |
| **Tool / Agent** | Praca mechanika | Wywołanie zewnętrznego narzędzia i działania agenta. |

### Zasady Architektoniczne
*   **Centralizacja:** Wszystkie interakcje z API i narzędziami powinny przechodzić przez jeden punkt ("lejek"), co ułatwia ich rejestrowanie.
*   **Pełny Kontekst:** Nie zapisuj tylko "tu i teraz". Pamiętaj o identyfikatorach użytkownika, sesji i agentów, aby wiedzieć, **kto i dlaczego** wywołał daną akcję.
*   **Grupowanie i Zagnieżdżanie:** Zdarzenia nie istnieją w próżni – jedno wynika z drugiego. Powinny tworzyć strukturę drzewa.
*   **Automatyzacja przez SDK:** Zamiast budować monitoring od zera, korzystaj z gotowych bibliotek (np. Langfuse), które automatycznie "podpinają się" pod Twoje działania.

### Prywatność i Bezpieczeństwo
Monitorowanie LLM to praca na żywym organizmie danych użytkownika. **Pamiętaj o filtrach:**

*   **Anonimizacja:** Usuwaj imiona, nazwiska, adresy i dane kontaktowe przed zapisem w logach.
*   **Własne hostowanie:** Jeśli dane są wrażliwe, rozważ narzędzia open-source na własnej infrastrukturze.

**Wskazówka:** Przygotuj dla swojego zespołu krótką instrukcję (notatkę) na temat interfejsu monitoringu – ułatwi to dodawanie nowych funkcji w przyszłości.

## Odtwarzanie stanu interakcji i debugowanie

Debugowanie agentów AI przypomina bardziej **pracę reżysera z aktorem** niż mechanika z silnikiem. Zamiast wymieniać części, korygujesz instrukcje i sprawdzasz, jak zmienia się "gra" modelu.

### 🛠️ Niezbędnik Debugowania (Co musisz zapisać?)

Aby skutecznie naprawić interakcję, musisz mieć komplet danych. Wyobraź sobie to jako **zapis stanu gry**, do którego możesz wrócić w dowolnym momencie.

| Element | Dlaczego jest ważny? |
| :--- | :--- |
| **Instrukcja systemowa** | To "osobowość" i zasady działania agenta. |
| **Historia wiadomości** | Kontekst, który pozwala zrozumieć, jak doszło do błędu. |
| **Lista narzędzi** | Zestaw "mocy", którymi dysponuje agent. |

### 🚀 Korzystanie z "Placu Zabaw" (Playground)

Narzędzia takie jak Playground (np. w Confident AI) to Twoje laboratorium.

*   **Edytuj i testuj:** Możesz dowolnie zmieniać parametry i sprawdzać efekty "na żywo".
*   **Porównuj:** Sprawdź, czy inny model poradziłby sobie lepiej w tej samej sytuacji.
*   **Weryfikuj założenia:** To szybki sposób na sprawdzenie, czy Twoje poprawki w ogóle działają.

### 💡 Sprytne techniki naprawcze

1.  **Zapytaj o powód:** Czasem warto zapytać model: *"Dlaczego wybrałeś to narzędzie?"*. Odpowiedź często wskazuje, gdzie leży problem.
2.  **Szukaj wzorców, nie pojedynczych błędów:** Naprawienie jednego konkretnego polecenia to za mało. Skup się na **generalizowaniu zasad**, aby agent wiedział, jak zachować się w podobnych sytuacjach w przyszłości.
3.  **Sprawdzaj rykoszet:** Poprawka w jednym miejscu może zepsuć coś innego. Zawsze patrz na system jako całość.

**Zasada "Mniej znaczy lepiej":** Zamiast pisać dziesiątki szczegółowych komend, twórz **jasne wzorce i zasady**. To one sprawiają, że agent jest inteligentny, a nie tylko posłuszny.

## Wersjonowanie instrukcji systemowych

Systematyczna obserwacja i wersjonowanie instrukcji dla agentów AI to klucz do przewidywalnego działania aplikacji. Samo przechowywanie kodu w Gicie nie wystarczy, aby w pełni zrozumieć, jak radzi sobie nasz system.

### Wersjonowanie: Git vs. Platformy Obserwacyjne

Wyobraź sobie, że **Git to album ze zdjęciami**, który pokazuje, jak zmieniał się Twój agent. **Platforma taka jak Langfuse to z kolei kartoteka medyczna**, która rejestruje nie tylko wygląd, ale też "tętno" (wydajność) i "wyniki badań" (skalę sukcesu).

| Cecha | Git | Platformy (np. Langfuse) |
| :--- | :--- | :--- |
| **Treść instrukcji** | Tak | Tak |
| **Historia zmian** | Tak | Tak |
| **Statystyki (koszty, czas)** | Nie | **Tak** |
| **Ocena skuteczności** | Nie | **Tak** |

### Co monitorujemy? (Kontekst i Metadane)

Integracja z platformami obserwacyjnymi wymaga przekazania dwóch rodzajów informacji, które pozwalają "debugować" działanie systemu:

*   **Kontekst (Specyfika projektu):**
    *   Rodzaj licencji (np. trial).
    *   Uprawnienia (np. manager).
    *   Preferencje użytkownika.
*   **Metadane (Otoczenie techniczne):**
    *   Wersja aplikacji.
    *   Lokalizacja i parametry połączenia.

### Elastyczność obserwacji

Budowanie monitoringu przypomina **montowanie czujników w inteligentnym domu**. Możesz zacząć od podstaw, a z czasem dodawać kolejne elementy:

*   **Spany:** Służą do mierzenia czasu trwania konkretnych zadań.
*   **Eventy:** Rejestrują specyficzne zdarzenia zależne od Twoich potrzeb.
*   **Synchronizacja:** Jeśli nie możesz trzymać instrukcji na platformie, stosujesz synchronizację jednostronną, aby zachować kompletne statystyki.

**Zasada "Mniej znaczy lepiej":** Zacznij od **minimalnej integracji**. Szybko zobaczysz, których logów Ci brakuje, a które są zbędnym szumem. Dzięki temu Twój system będzie przejrzysty i łatwiejszy w optymalizacji.

## Narzędzia do ewaluacji skuteczności systemu

Wyobraź sobie, że budowanie systemu AI to jak szkolenie nowego pracownika. **Ewaluacja (Eval)** to po prostu regularny „egzamin”, który sprawdza, czy Twój pracownik radzi sobie z powierzonymi zadaniami, czy może potrzebuje dodatkowych instrukcji.

Oto prosty przewodnik po tym, jak skutecznie oceniać systemy LLM:

### 1. Z czego składa się "Egzamin" (Eval)?

Każdy test opiera się na trzech filarach:

| Element | Opis | Przykład (Analogia) |
| :--- | :--- | :--- |
| **Zadanie** | To, co system ma zrobić (input + output). | Pytanie na egzaminie i oczekiwana odpowiedź. |
| **Dane** | Zestaw przykładów (syntetycznych lub z produkcji). | Podręcznik i zbiór zadań do przećwiczenia. |
| **Ocena** | Wynik od 0 do 100% (kod lub inny model AI). | Nauczyciel sprawdzający arkusz wg klucza. |

### 2. Jak przygotować dobre pytania? (Zasady Datasetu)

Dobry test musi być sprawiedliwy i przekrojowy. Pamiętaj o trzech zasadach:

*   **Pokrycie:** Sprawdzaj nie tylko „szczęśliwe ścieżki”, ale też trudne i błędne przypadki.
*   **Różnorodność:** Zadawaj pytania z różnych obszarów działania Twojego agenta.
*   **Balans:** Nie skupiaj się tylko na jednej funkcji; poświęć tyle samo uwagi każdemu narzędziu AI.

### 3. Gdzie i jak testować?

Proces ten przypomina sprawdzanie samochodu – robimy to w warsztacie, zanim wyjedziemy na autostradę.

*   **Offline:** Testy w środowisku deweloperskim (np. w procesie CI/CD), zanim aplikacja trafi do ludzi.
*   **Online:** Obserwacja zachowania systemu „na żywo” u użytkowników.
*   **Iteracja:** To proces ciągły. Czasem to nie AI robi błąd, ale sam test jest źle sformułowany i wymaga poprawki.

### 4. Polecane narzędzia

Nie musisz budować wszystkiego od zera. Możesz skorzystać z gotowych „laboratoriów”:

*   **Langfuse** – świetne do startu, pozwala na testy przez interfejs i API.
*   **Promptfoo** – bardzo polecane do sprawdzania skuteczności promptów.
*   **Braintrust** – zwraca uwagę na detale, np. odpowiedzi narzędzi wewnątrz promptu.
*   **Confident AI** oraz **Grafana**.

**Zasada "Mniej znaczy lepiej":** Zacznij od prostych, wewnętrznych skryptów. Jeśli Twój projekt urośnie, dopiero wtedy przenieś się na rozbudowane platformy.

## Wartość i wyzwania związane z ewaluacją

Ewaluacja modeli AI to temat, który dzieli ekspertów. Można ją porównać do **testów bezpieczeństwa w samochodach**: niektórzy nie wyobrażają sobie bez nich jazdy, inni wolą pędzić przed siebie, licząc na intuicję.

Oto zwięzłe podsumowanie dylematu ewaluacji:

### 1. Czy warto inwestować w ewaluacje?

| Cecha | Z ewaluacją | Bez ewaluacji |
| :--- | :--- | :--- |
| **Gwarancja** | Brak (aplikacja wciąż może zaskoczyć) | Brak |
| **Koszty** | Wyższe (opracowanie i zasoby) | Niższe na starcie |
| **Tempo** | Wolniejsze (czas na datasety) | Bardzo szybkie (model "leci" na produkcję) |
| **Stabilność** | Wysoka (priorytet) | Niska (nieprzewidywalność) |

### 2. Głosy z rynku: "Pas bezpieczeństwa" czy "Kula u nogi"?

Eksperci mają skrajne opinie na temat tego, czy testowanie zachowań modeli jest kluczowe:

*   **Zwolennicy (Garry Tan, Mike Krieger):** Ewaluacje to "prawdziwa fosa" (przewaga rynkowa) dla startupów AI i najważniejsza rzecz w procesie budowania.
*   **Praktycy produktu (Kevin Veil):** Pisanie ewaluacji stanie się podstawową umiejętnością managerów produktu.
*   **Sceptycy (Twórca Claude Code):** Wybierają podejście "no evals", stawiając na szybkość dostarczania kodu.

### 3. Analogia: Testy E2E w programowaniu

Wybór ewaluacji przypomina decyzję o stosowaniu **testów End-to-End (E2E)** w kodzie:
*   Dla jednych programistów są **krytyczne** (fundament stabilności).
*   Dla innych są **opcjonalne** (zbędny balast przy szybkich zmianach).

### 4. Kiedy wybrać ewaluację?

Stosuj zasadę dopasowania do celu:

*   **Wybierz Ewaluację,** jeśli Twoim priorytetem jest **stabilność i efektywność kosztowa** produktu.
*   **Omiń Ewaluację,** jeśli budujesz rozwiązanie, które zmienia się zbyt szybko, a Twoim głównym celem jest **maksymalne tempo wdrożenia**.

Pamiętaj: Decyzja należy do Ciebie i powinna wynikać z zasobów, którymi dysponujesz.

## Wybór wskaźników sukcesu oraz zasad oceny

Ewaluacja modelu LLM przypomina **szkolenie nowego pracownika**: musisz sprawdzić zarówno konkretne wyniki jego pracy (czy wypełnił formularz?), jak i ogólną jakość komunikacji (czy był uprzejmy?).

### 1. Rodzaje kryteriów oceny
Możemy oceniać odpowiedzi modelu na dwa sposoby: sztywnymi regułami lub poprzez "opinię" innego modelu.

| Typ kryterium | Analogia | Przykłady |
| :--- | :--- | :--- |
| **Deterministyczne** | **Linijka:** Sprawdzasz konkretny wymiar. | `contains`, `is-json`, `equals`, Regex |
| **Programistyczne** | **Tester:** Piszesz kod, by sprawdzić logikę. | Skrypty JavaScript / Python, zapytania HTTP |
| **Oparte o Model (AI)** | **Krytyk:** Prosisz eksperta o subiektywną ocenę. | `llm-rubric`, `conversation-relevance` |

### 2. Główne obszary sukcesu
Zamiast mierzyć wszystko, skup się na kluczowych "stacjach kontrolnych":

*   **Skuteczność promptów:** Czy instrukcje są zrozumiałe dla modelu?
*   **Wybór i obsługa narzędzi:** Czy model wie, kiedy użyć kalkulatora i czy robi to bezbłędnie?
*   **Satysfakcja użytkownika:** Co mówią "łapki w górę" i "łapki w dół"?
*   **Context Recall:** Jak dobrze model odnajduje igłę w stogu siana (informacje w dokumentacji)?

### 3. Rola AI w procesie
Tworzenie testów to żmudna praca, w której **AI może być Twoim asystentem**:

*   **Generowanie scenariuszy:** Model może wymyślić dziesiątki przypadków testowych na podstawie Twoich wytycznych.
*   **Analiza logów:** AI świetnie radzi sobie z wyciąganiem wniosków z długich raportów aktywności (np. z plików JSON w Langfuse).
*   **Weryfikacja danych:** Pomaga sprawdzić, czy zestawy testowe są poprawne i kompletne.

**Zasada "Mniej znaczy lepiej":** Nie twórz nieskończonej liczby testów. Wybierz te, które najlepiej oddają realne zachowanie użytkownika w Twojej aplikacji.

## Skuteczność agenta AI i wykrywanie naruszeń

Budowanie agenta AI bez monitoringu jest jak **prowadzenie samochodu z zasłoniętą deską rozdzielczą** – nie widzisz prędkości ani poziomu paliwa. **Monitorowanie to fundament**, który otwiera drogę do wprowadzania testów i zapewnia bezpieczeństwo systemu.

### Kluczowe obszary ewaluacji

| Obszar | Co weryfikujemy? | Analoga |
| :--- | :--- | :--- |
| **Wybór narzędzi** | Czy agent poprawnie dobiera i obsługuje dostępne funkcje? | Wybór odpowiedniego śrubokręta do konkretnej śruby. |
| **Wykrywanie naruszeń** | Czy dane wejściowe i odpowiedzi modelu są bezpieczne i poprawne? | Ochroniarz sprawdzający bagaż na wejściu i wyjściu z lotniska. |
| **Wydajność i koszty** | Jak szybko model reaguje i ile to kosztuje? | Licznik prądu, który pozwala kontrolować domowe wydatki. |

### Dlaczego warto wdrażać ewaluację?
*   **Oszczędność pieniędzy:** Możesz sprawdzić, czy **mniejsze i tańsze modele** poradzą sobie z konkretnymi zadaniami.
*   **Szybka reakcja:** Dowiesz się o błędach lub anomaliach, nawet jeśli informacja dotrze z niewielkim opóźnieniem.
*   **Elastyczność:** Testy mogą być **tymczasowe** – tworzysz je tylko po to, by sprawdzić konkretny obszar działania systemu.

### Jak zacząć?
Nie musisz od razu budować skomplikowanych mechanizmów. Najlepiej wprowadzać testy **stopniowo**, zaczynając od miejsc, w których system najbardziej tego wymaga. Projektowanie ewaluacji to kluczowa umiejętność, którą warto rozwijać małymi krokami.