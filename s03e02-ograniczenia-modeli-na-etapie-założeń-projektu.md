# Ograniczenia modeli na etapie założeń projektu

## Definiowanie roli i zaangażowania systemu AI

Wdrażanie AI przypomina **zatrudnianie utalentowanego praktykanta**: ma ogromny potencjał, ale nie powinieneś dawać mu kluczy do sejfu ani pozwalać na samodzielne podpisywanie kontraktów bez nadzoru.

Oto kluczowe wnioski z analizy strategicznego wdrażania agentów AI:

### 1. Strategia: Gdzie AI pomaga, a gdzie szkodzi?

Zamiast dążyć do pełnej automatyzacji, lepiej skupić się na **wspieraniu istniejących procesów**.

| Scenariusz | Pułapka (Ryzyko) | Lepsza Droga (Wartość) |
| :--- | :--- | :--- |
| **Czatbot na stronie** | Próba budowania relacji przez bota. | Wsparcie pracowników "w tle". |
| **Marketing/E-mail** | Automatyczne wysyłanie wiadomości. | Szkicowanie, etykietowanie i analiza. |
| **Baza wiedzy (RAG)** | Tworzenie ogromnych systemów bez celu. | Prototypowanie dla konkretnych działów. |
| **System All-in-one** | Problemy z bezpieczeństwem (Prompt Injection). | Wyspecjalizowane, dedykowane narzędzia. |

### 2. Zasada "Mniej znaczy lepiej" w praktyce

Największą wartością w projektowaniu AI jest **umiejętność określenia, co w danej chwili nie ma znaczenia**.

*   **Zacznij od prototypu:** Zamiast planować wielki projekt, zweryfikuj tezy za pomocą MVP (Minimum Viable Product).
*   **Wybierz specjalizację:** Lepiej mieć agenta, który świetnie radzi sobie z jednym zadaniem (np. onboardingiem), niż system, który robi wszystko przeciętnie.
*   **Selekcja danych:** Nie każda baza wiedzy jest warta wdrożenia – czasem koszt zebrania danych przewyższa korzyści.

### 3. Bezpieczeństwo i Kontrola (Analogia Współpilota)

AI powinno działać jak **współpilot**, który przygotowuje parametry lotu, ale to **kapitan (człowiek)** decyduje o starcie i lądowaniu.

*   **Brak akcji krytycznych:** Agent nie powinien mieć możliwości samodzielnego wysyłania maili czy wykonywania nieodwracalnych działań.
*   **Izolacja danych:** System powinien mieć dostęp tylko do informacji niezbędnych w danej sesji (np. ograniczanie bazy wiedzy do konkretnego klienta).
*   **Deterministyczna logika:** Kod programu powinien kontrolować uprawnienia agenta, zamiast polegać tylko na "instrukcjach" dla modelu.

### 4. Przykład: Agent E-mail jako pomocnik

Zamiast zastępować pracownika, agent AI może stać się jego **filtrem i asystentem**:

*   **Etykietowanie:** Automatyczne przypisywanie kategorii (np. "Bug Report").
*   **Priorytetyzacja:** Wybieranie najważniejszych wątków do odpowiedzi.
*   **Szkicowanie:** Przygotowanie treści, którą człowiek jedynie zatwierdza lub poprawia.
*   **Wyzwalacz akcji:** Przypisanie etykiety przez agenta (lub człowieka) może automatycznie utworzyć zadanie w innym systemie.

Pamiętaj: To, co dziś wydaje się niemożliwe, jutro może być standardem, dlatego kluczowe jest **regularne aktualizowanie swoich przekonań** na temat technologii.

## Kontrolowanie poziomu trudności zakresu pracy modelu

Budowanie autonomicznych systemów AI przypomina **zarządzanie budową domu**. Nie wystarczy powiedzieć robotnikom „zbudujcie dom” – potrzebny jest precyzyjny plan, kierownik budowy i wspólny magazyn materiałów.

Oto jak skutecznie architektować takie procesy:

### 1. Trzy Filary Systemu
Zamiast polegać na „intuicji” modelu, opieramy system na trzech twardych fundamentach:

| Komponent | Czym jest? (Analogia) | Rola w systemie |
| :--- | :--- | :--- |
| **Kontrakty** | **Projekt budowlany** | Definiują strukturę planu, zadania i zależności między nimi. |
| **Heartbeat** | **Kierownik budowy** | Logika zarządcza, która przydziela zadania i aktualizuje ich stan po każdym cyklu. |
| **Pamięć** | **Wspólny magazyn** | System plików, gdzie agenci wymieniają się informacjami i notatkami. |

### 2. Struktura Planu (Zasada "Mniej znaczy lepiej")
Plan to nie tylko lista „do zrobienia”, ale inteligentna mapa drogowa:
*   **Zadania z paszportem:** Każde zadanie ma nazwę, opis, status i przypisane wymagane umiejętności.
*   **Zależności:** Niektóre kroki muszą czekać na inne (jak kładzenie dachu po postawieniu ścian), a inne mogą dziać się równolegle.
*   **Dynamiczna edycja:** Agenci mogą dodawać nowe zadania w trakcie pracy, jeśli uznają, że brakuje im danych.

### 3. Jak wygląda proces w praktyce?
System działa w powtarzalnych cyklach, przypominających **odprawy zespołu**:

1.  **Planowanie:** Na podstawie celu głównego tworzona jest struktura zadań.
2.  **Przeszukiwanie:** Agent zbiera dane z dostępnych źródeł.
3.  **Pogłębianie:** Uszczegóławianie informacji tam, gdzie są braki.
4.  **Notatki i szkic:** Tworzenie fundamentów pod finalny produkt.
5.  **Raport końcowy:** Finalizacja prac i sprawdzenie, czy wszystkie zadania z planu mają status „ukończone”.

### 4. Dlaczego to ważne?
W autonomicznych systemach, które działają „w tle”, nie ma miejsca na błędy.
*   **Programistyczne wsparcie:** Stan zadań jest zmieniany programistycznie, co zapewnia stabilność, której nie daje sam tekstowy opis.
*   **Kontrola trudności:** Dzięki strukturze możemy rozbić skomplikowane problemy na proste, zarządzalne kroki.
*   **Człowiek w pętli:** Jeśli system napotka sytuację bez wyjścia, plan może przewidywać moment na decyzję człowieka.

Stosując te zasady, zmieniamy nieprzewidywalnego "asystenta" w stabilny, **autonomiczny system produkcyjny**.

## Zmniejszanie ryzyka prompt injection

Oto najważniejsze zasady i metody zmniejszania ryzyka **prompt injection**, przedstawione w prosty sposób:

### **Złote Zasady Bezpieczeństwa**

*   **Prompt Systemowy to pocztówka:** Zakładaj, że każdy może go przeczytać, więc nie umieszczaj tam tajnych danych.
*   **Ograniczone zaufanie:** Nigdy w pełni nie ufaj agentom w kwestii udostępniania informacji czy pracy na zewnętrznych danych.
*   **Programistyczny rygor:** Dostęp do zasobów i akcji musi być kontrolowany przez kod (na sztywno), a nie tylko przez instrukcje czatbota.
*   **Nadzór nad światem zewnętrznym:** Wysoce ograniczaj i weryfikuj możliwość wysyłania przez AI maili, SMS-ów czy publikowania dokumentów.

### **Metody Ochrony**

| Metoda | Na czym polega? | Dlaczego warto? |
| :--- | :--- | :--- |
| **Filtrowanie treści** | Dodatkowy, oddzielny prompt ocenia zapytanie jako "bezpieczne" lub "niebezpieczne". | Atakujący ma trudności z obejściem zabezpieczenia, którego nie widzi. |
| **Weryfikacja źródeł** | Staranna kontrola treści generowanych na podstawie zewnętrznych danych. | Zapobiega wprowadzaniu szkodliwych danych z zewnątrz. |
| **Bariery prawne** | Jasne informowanie użytkownika o AI i zabezpieczenia w regulaminach. | Stanowi ostatnią linię obrony w przypadku pomyłek modelu. |

### **Analogie dla lepszego zrozumienia**

| Element | Analogia | Wyjaśnienie |
| :--- | :--- | :--- |
| **Prompt Systemowy** | **Pocztówka** | Jeśli napiszesz na niej swój PIN, każdy po drodze może go odczytać. |
| **Dostęp do akcji** | **Sejf i recepcjonista** | AI to recepcjonista, który może wskazać drogę, ale to program (klucz) musi fizycznie otworzyć sejf. |
| **Filtrowanie promptów** | **Bramkarz w klubie** | Zanim klient wejdzie do głównej sali (głównego modelu), bramkarz sprawdza, czy nie wnosi nic niebezpiecznego. |
| **Zasady prawne** | **Pasy bezpieczeństwa** | Nie zapobiegną każdemu wypadkowi, ale chronią przed najgorszymi skutkami błędów. |

Pamiętaj: jeśli sytuacja nie wymaga absolutnie użycia agentów z dostępem do wrażliwych danych, najlepiej **unikać takich rozwiązań**, gdyż obecnie nie ma 100% gwarancji bezpieczeństwa.

## Zarządzanie niską wydajnością modeli i halucynacjami

Poprawa wydajności agentów AI przypomina **przejście z liczenia wszystkiego w pamięci na używanie zaawansowanego kalkulatora**. Zamiast próbować zapamiętać tysiące danych, agent uczy się pisać programy, które wykonują brudną robotę za niego.

### 5 filarów szybkości agenta
Aby Twój agent działał szybciej i taniej, możesz optymalizować go w tych obszarach:

| Obszar optymalizacji | Dlaczego to ważne? |
| :--- | :--- |
| **Liczba tokenów wejściowych** | Krótszy prompt to szybsza reakcja. |
| **Wykorzystanie cache** | Oszczędza czas i pieniądze przy powtarzalnych pytaniach. |
| **Liczba tokenów wyjściowych** | Krótsze odpowiedzi i mniej kroków agenta skracają czas oczekiwania. |
| **Liczba zapytań** | Równoległe zapytania są kluczem; sekwencyjne spowalniają system. |
| **Rozmiar modelu** | Mniejsze modele są błyskawiczne, choć mniej inteligentne. |

### Jak działa "Agent Programista"?
Zamiast czytać 150 000 linii danych (co jest niemal niemożliwe), agent korzysta z **piaskownicy (sandbox)**. To bezpieczny plac zabaw, gdzie może uruchamiać kod bez narażania Twojego komputera.

**Analogie procesu:**
*   **Eksploracja:** Jak szybkie przejrzenie spisu treści w wielkiej encyklopedii.
*   **Nauka:** Przeczytanie instrukcji obsługi, aby wiedzieć, jak używać narzędzi.
*   **Agregacja:** Napisanie przepisu (kodu), który automatycznie zbierze składniki z wielu szafek.
*   **Prezentacja:** Upieczenie gotowego ciasta (raportu PDF) na podstawie przepisu.

### Dlaczego warto stosować kod i sandbox?
*   **Precyzja:** Kod nie myli się w obliczeniach matematycznych tak jak modele językowe.
*   **Oszczędność:** Złożone zadanie, które zajęłoby setki kroków, agent wykonuje w zaledwie 6–10 krokach.
*   **Skala:** Możliwość przetwarzania tysięcy plików jednocześnie, co jest nieosiągalne dla standardowych metod.
*   **Możliwości:** Agent zyskuje dostęp do systemu plików, co czyni go znacznie potężniejszym narzędziem.

Pamiętaj jednak, że taka architektura jest bardziej złożona (wymaga procesów głównych, MCP i sandboxa), co może być wyzwaniem przy tysiącach użytkowników. Mimo to, korzyści w postaci szybkości i braku halucynacji są ogromne.