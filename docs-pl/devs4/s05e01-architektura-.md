# Architektura

## Film do lekcji

Architektura aplikacji w erze generatywnej to ewolucja, a nie całkowita rewolucja. Można to porównać do **budowy nowoczesnego domu z inteligentnym asystentem**: fundamenty i ściany (80% kodu) pozostają takie same, ale systemy sterowania i sposób, w jaki mieszkańcy wchodzą w interakcję z budynkiem, zmieniają się diametralnie.

### Porównanie: Klasyka vs. Era Generatywna

| Cecha | Klasyczna Aplikacja | Aplikacja Generatywna |
| :--- | :--- | :--- |
| **Logika biznesowa** | W całości pisana ręcznie przez programistę. | Duża część logiki realizowana bezpośrednio przez LLM. |
| **Struktura** | Przewidywalna i sztywna. | Uwzględnia AI na każdym poziomie: od UI po bazę danych. |
| **Zestaw narzędzi** | Standardowe biblioteki i frameworki. | Nowe, dodatkowe narzędzia i biblioteki dedykowane AI. |
| **Fundament** | 100% tradycyjny kod. | Około 80% to tradycyjny kod, reszta to komponenty AI. |

### Kluczowe zmiany w architekturze

Wyobraź sobie, że LLM to **"uniwersalny tłumacz i wykonawca"**, który siada w samym środku Twojej aplikacji. Jego obecność wymusza zmiany w następujących obszarach:

*   **Interfejs Użytkownika (UI):** Musi być gotowy na bardziej dynamiczną i mniej przewidywalną interakcję z użytkownikiem.
*   **API i Serwery:** Wymagają nowej konfiguracji, aby sprawnie komunikować się z modelem i obsługiwać jego specyficzne potrzeby.
*   **Bazy Danych:** Często muszą zostać dostosowane do nowych struktur danych, które są zrozumiałe dla AI.
*   **Uproszczenie kodu:** Zamiast pisać setki linii instrukcji "jeśli/to", możesz zlecić wykonanie tej logiki modelowi.

**Podsumowując:** Budując dzisiaj aplikację, nie wyrzucasz starych narzędzi, ale musisz zrobić w swoim "projekcie budowlanym" miejsce na potężny silnik AI, który przejmie część najtrudniejszej pracy.

### Cechy aplikacji wykorzystującej generatywne AI

Budowanie aplikacji z generatywną inteligencją przypomina **zarządzanie nowoczesną restauracją**. Nie chcesz, aby goście wchodzili bezpośrednio do kuchni – potrzebujesz sprawnego systemu przyjmowania zamówień i wydawania dań.

Oto kluczowe elementy architektury AI przedstawione w prosty sposób:

### Kluczowe komponenty systemu

| Komponent | Analoga | Funkcja w aplikacji |
| :--- | :--- | :--- |
| **Gateway** | **Recepcja** | Centralny punkt kontaktu z modelami AI. Pozwala na łatwą zmianę „dostawcy” (modelu) bez przebudowy całej restauracji. |
| **API** | **Karta Menu** | Klient wybiera konkretne „danie” (np. recenzja produktu), zamiast rozmawiać bezpośrednio z kucharzem (modelem) o wszystkim. |
| **System plików** | **Magazyn** | Określa, do których „półek” agent AI ma dostęp, aby nie usunął przypadkiem ważnych dokumentów. |
| **Baza danych** | **Dziennik zamówień** | Miejsce zapisu interakcji, wiedzy i zaplanowanych zadań agentów. |

### Fundamenty dobrej architektury

Wdrażając AI, warto trzymać się kilku „pewników”, które ułatwią rozwój aplikacji w przyszłości:

*   **Centralizacja:** Wszystkie zapytania do AI przechodzą przez jedno miejsce (Gateway), co ułatwia zarządzanie ustawieniami.
*   **Otwartość na dostawców:** Nie przywiązuj się do jednego modelu; bądź gotowy na przejście do lepszej konkurencji w każdej chwili.
*   **Strumieniowanie (Streaming):** Informuj użytkownika o postępach w czasie rzeczywistym, zamiast kazać mu czekać na gotowy wynik.
*   **Multimodalność:** Projektuj bazy danych tak, aby w przyszłości łatwo było dodać obsługę obrazu lub dźwięku, nawet jeśli teraz używasz tylko tekstu.
*   **Obsługa długich zadań:** System musi umieć dokończyć pracę, nawet jeśli użytkownik zamknie kartę przeglądarki.

### Integracja jak system płatności
Integrację AI najlepiej porównać do **systemu płatności**. Tak jak w przypadku bramek płatniczych (np. Stripe), musisz:
1.  Zorganizować dane tak, aby proces był płynny.
2.  Zapewnić możliwość łatwego przełączania się między operatorami.
3.  Zadbać o powiązanie z istniejącymi modułami (np. powiadomieniami).

Stosowanie tych zasad pozwala budować systemy odporne na zmiany i gotowe na szybki rozwój technologii AI.

### Fundamentalna cecha produktów w dobie AI

Projektowanie produktów w erze AI przypomina **budowanie z klocków LEGO zamiast odlewania gotowych rzeźb z betonu**. Dzięki zastosowaniu "prymitywów", Twój system staje się elastyczny i gotowy na szybkie zmiany.

### Kluczowa różnica w podejściu

Poniższa tabela porównuje tradycyjne myślenie o funkcjach z nowoczesnym podejściem opartym na prymitywach:

| Cecha | Tradycyjne Funkcjonalności | Prymitywy Architektoniczne |
| :--- | :--- | :--- |
| **Podejście** | Sztywne struktury (np. "Czat") | Elastyczne klocki (np. "Aktorzy i Zdarzenia") |
| **Zależności** | Duża liczba powiązań, trudna wymiana | Niezależne elementy, łatwe do łączenia |
| **Rozwój AI** | Nowy model może zniszczyć Twój produkt | Nowy model wzmacnia Twój system |
| **Iteracje** | Planowane na kwartały | Bardzo szybkie, niemal natychmiastowe |

### Fundamenty odpornego projektu

Aby Twój produkt przetrwał dynamiczne zmiany w świecie AI, warto trzymać się kilku zasad:

*   **Prymitywy zamiast funkcji:** Zamiast projektować osobne struktury dla obrazów czy plików, stwórz uniwersalne **artefakty** (metadane reprezentujące dowolną treść).
*   **Aktorzy i Zdarzenia:** Wyobraź sobie system jako rozmowę wielu osób (użytkowników, agentów, systemów), a nie tylko prostą wymianę pytań i odpowiedzi.
*   **Ostrożność z frameworkami:** Nie opieraj całej aplikacji na rozwiązaniach, które wciąż się zmieniają, aby nie zablokować sobie drogi rozwoju.
*   **Projektuj na wzrost:** Każda nowa wersja modelu AI powinna sprawiać, że Twoja aplikacja działa lepiej, a nie staje się zbędna.

### Przykład: Ewolucja Czatu

Analogia: Zamiast budować **jednotorową linię kolejową** (tylko użytkownik ↔ asystent), zbuduj **wielopoziomowe skrzyżowanie**.

| Element | Stary Model (Czat) | Nowy Model (Prymityw) |
| :--- | :--- | :--- |
| **Uczestnicy** | Użytkownik i Asystent | Wielu Aktorów (ludzie, agenty, systemy) |
| **Interakcja** | Wiadomości tekstowe | Zdarzenia (logika, narzędzia, reasoning) |
| **Dane** | Pliki tekstowe/obrazy | Artefakty z własnym stanem |

Pamiętaj, że nawet najprostszy chatbot z czasem może stać się złożonym systemem wieloagentowym, dlatego warto dbać o **elastyczną architekturę** już na starcie.

### Architektura dla czatbotów i agentów

Współczesne systemy AI ewoluują od prostych czatbotów w stronę **autonomicznych agentów**, które nie tylko rozmawiają, ale wykonują złożone zadania. Poniżej znajdziesz kluczowe elementy tej nowoczesnej architektury.

### 🏗️ Filary Architektury Agentowej

Wyobraź sobie **plac budowy**: Orchestrator to kierownik, Blackboard to tablica z projektami, a Scheduler to harmonogram prac.

| Komponent | Funkcja (Analogia) | Opis techniczny |
| :--- | :--- | :--- |
| **Orchestrator** | **Kierownik budowy** | Agent zarządzający, który tworzy aktorów i przydziela im konkretne zadania. |
| **Blackboard** | **Wspólna tablica ogłoszeń** | Warstwa współdzielonego stanu: sesje, zadania i artefakty dostępne dla wszystkich agentów. |
| **Scheduler** | **Logistyk / Harmonogram** | Deterministyczna logika, która pilnuje kolejności prac i rozwiązuje zależności między zadaniami. |
| **Grafy (DAG)** | **Plan etapów budowy** | Relacje między zadaniami, które określają, co musi się stać najpierw, aby ruszył kolejny krok. |

---

### 🔄 Dynamiczne Zarządzanie Zadaniami

W przeciwieństwie do sztywnych programów, plan działania jest tutaj **kształtowany dynamicznie** przez agenta zarządzającego, co zapewnia ogromną elastyczność.

**Jak działa Scheduler (Logistyk)?**
*   **Wybór:** Wybiera zadania, które nie mają blokad (zależności zostały spełnione).
*   **Realizacja:** Przekazuje je do odpowiednich aktorów (np. Researchera).
*   **Monitorowanie:** Zmienia statusy zadań w zależności od postępów:
    *   `in_progress` – praca trwa.
    *   `done` – zadanie zakończone sukcesem.
    *   `waiting` – czekanie na wyniki od subagentów.
    *   `blocked` – wystąpił problem lub brak zasobów.

---

### 📝 Przykład w praktyce: Pisanie posta na bloga

Oto jak system realizuje zadanie krok po kroku:

1.  **Start:** Orchestrator tworzy aktora **Researcher** i zleca mu zebranie materiałów.
2.  **Badania:** Researcher przeszukuje sieć i zapisuje notatki jako **artefakt** na Blackboardzie.
3.  **Pisanie:** Orchestrator widzi notatki, tworzy aktora **Writer** i zleca mu napisanie tekstu.
4.  **Finał:** Orchestrator sprawdza całość i dostarcza gotowy artykuł użytkownikowi.

---

### 🌟 Dlaczego to jest skuteczne?

*   **Balans:** Łączy nieprzewidywalną kreatywność modeli językowych z przewidywalną logiką kodu (Scheduler).
*   **Rozwojowość:** Architekturę można łatwo rozbudować o nowe narzędzia, pracę w tle czy nadzór człowieka.
*   **Obserwowalność:** Dzięki **zdarzeniom (SSE)** możemy śledzić każdą zmianę stanu agenta w czasie rzeczywistym.

### Integracje z różnymi providerami

Integracja wielu dostawców AI w jednej aplikacji to wyzwanie przypominające **budowę wieży Babel** – każdy model mówi w swoim języku, a Ty potrzebujesz sprawnego tłumacza, aby wszystko działało.

### Dlaczego integracja jest trudna?
Głównym problemem jest to, że API różnych firm różnią się szczegółami technicznymi. To jak próba podłączenia różnych urządzeń do gniazdek w różnych krajach bez odpowiednich przejściówek.

| Cecha | OpenAI | Anthropic | Gemini |
| :--- | :--- | :--- | :--- |
| **Wiadomość systemowa** | Wewnątrz listy wiadomości | Oddzielne pole `system` | Pole `system_instruction` |
| **Tryb rozumowania** | Parametr `reasoning_effort` | Parametr `budget_tokens` | Parametr `budget_tokens` |
| **Ograniczenia** | Duża elastyczność | Nie można wysłać wiadomości asystenta jako pierwszej | Wymaga "Thought Signatures" przy narzędziach |

### Trzy drogi rozwiązania problemu
Wybór podejścia zależy od Twoich potrzeb – to jak wybór między **gotowym daniem, zestawem pudełkowym a gotowaniem samemu**.

*   **OpenRouter (Gotowe danie):**
    *   Wygodny, ale obsługuje tylko podstawy.
    *   Może mieć rzadkie błędy w mapowaniu sygnatur.
    *   Dobra opcja, jeśli interesuje Cię tylko czysty tekst (LLM).
*   **Biblioteki/Frameworki (Zestaw pudełkowy - np. LiteLLM, AI SDK):**
    *   Szybszy start, ale mogą blokować dostęp do nowości.
    *   Bywają trudne w naprawie, gdy błąd dotyczy zaawansowanej logiki.
    *   Wymagają ostrożności przy dodawaniu własnych "adapterów".
*   **Własna logika (Gotowanie z AI):**
    *   Najwięcej kontroli i dopasowanie do własnych potrzeb.
    *   Dzięki **agentom do kodowania**, stworzenie jej nie jest już drogie ani czasochłonne.
    *   Pozwala na pełną niezależność od niestabilnych narzędzi zewnętrznych.

### Jak zbudować własną logikę (Zasada "Mniej znaczy lepiej")
Zamiast budować wszystko od zera, skup się na kluczowych elementach przy wsparciu AI:

*   **Ustal standard:** Przyjmij jeden domyślny format danych (najlepiej Responses API) dla całego systemu.
*   **Wybiórczość:** Mapuj tylko te ustawienia, których naprawdę potrzebujesz (np. tylko `reasoning_effort`).
*   **Automatyzacja:** Wykorzystaj oficjalne pliki SDK dostawców i poproś AI o przygotowanie mapowania między nimi.
*   **Elastyczność:** Bądź gotowy na szybkie zmiany, ponieważ API dostawców ewoluują (np. dodanie Web Search w Gemini).

W erze AI budowanie własnej, "szytej na miarę" logiki staje się najlepszą strategią, ponieważ pozwala uniknąć ograniczeń gotowych frameworków. Acknowledge: Stworzyłem ten raport na podstawie dostarczonych materiałów.