# Organizowanie kontekstu dla wielu wątków

## Koncepcja wielowątkowej interakcji z modelem językowym

Współczesne systemy wieloagentowe (MAS) pozwalają na łączenie wielu modeli językowych w zaawansowane struktury, które współpracują ze sobą podobnie jak zespół ludzi.

### Kluczowe Architektury Agentowe

Poniższa tabela przedstawia najpopularniejsze sposoby organizacji pracy agentów:

| Architektura | Jak działa? | Analogia |
| :--- | :--- | :--- |
| **Pipeline** | Zadania przechodzą kolejno przez agentów bez możliwości powrotu. | **Linia montażowa** w fabryce. |
| **Blackboard** | Agenci pobierają i dodają dane do jednego wspólnego miejsca. | **Tablica ogłoszeń**, na której każdy dopisuje swoje wnioski. |
| **Orchestrator** | Główny agent zarządza zadaniami i komunikacją z ludźmi. | **Dyrygent** prowadzący orkiestrę. |
| **Tree** | Rozbudowana struktura z podziałem na managerów i wykonawców. | **Hierarchia korporacyjna** (prezes, dyrektorzy, pracownicy). |
| **Mesh / Swarm** | Rozproszona, bezpośrednia komunikacja między agentami (trudniejsza do kontroli). | **Rój pszczół** lub tłum ludzi na placu. |

### Narzędzia Komunikacji

Aby agenci mogli ze sobą współpracować, potrzebują dwóch podstawowych narzędzi:

*   **`delegate` (Delegowanie):** Agent przekazuje zadanie specjaliście. Otwiera to nowy wątek z nowymi instrukcjami. 
    *   *Analogia:* Przekazanie pałeczki w biegu sztafetowym.
*   **`message` (Wiadomość):** Służy do dopytywania o szczegóły lub zgłaszania braku danych. Może wstrzymać pracę agenta do czasu otrzymania odpowiedzi.
    *   *Analogia:* Krótkofalówka używana do dopytania szefa o kod do drzwi.

### Przykład: Obsługa klienta (System oparty na zdarzeniach)

W nowoczesnych systemach agenci reagują na konkretne zdarzenia:

1.  **Agent Intencji:** Odbiera wiadomość i klasyfikuje problem (np. „pytanie o status paczki”).
2.  **Serwisy Danych:** Pobierają informacje o przesyłce i sprawdzają ewentualne zniżki.
3.  **Agent Szkiców:** Przygotowuje odpowiedź. Jeśli czegoś nie wie (np. brakuje profilu klienta), wysyła prośbę o dane i czeka.
4.  **Człowiek:** Na końcu sprawdza i zatwierdza gotową wiadomość.

### Proste Zasady Projektowania

*   **Łącz architektury:** W jednym systemie możesz stosować kilka modeli naraz (np. Pipeline wewnątrz Orchestratora).
*   **Wizualizuj:** Używaj narzędzi takich jak Mermaid lub HTML, aby narysować schemat działania systemu – AI świetnie sobie z tym radzi.
*   **Kontroluj:** Modele LLM mają tendencję do komplikowania procesów, dlatego zawsze pilnuj głównej logiki projektu.

## Rola globalnego kontekstu i jego zawartość

Zarządzanie wspólnym kontekstem w systemach wielu agentów można porównać do **wspólnego redagowania jednego dokumentu w chmurze** przez zespół pracowników, którzy nie zawsze widzą nawzajem swoje kursory.

### Problem: Wyścig o zapis
Gdy dwóch agentów (nawet opartych na tym samym szablonie) pracuje jednocześnie, może dojść do utraty danych. Jeśli Agent B zapisze swoją wersję ułamek sekundy po Agencie A, praca tego pierwszego zostanie nadpisana i przepadnie,.

### Strategie radzenia sobie z konfliktami

| Metoda | Na czym polega? (Analogia) |
| :--- | :--- |
| **Wykrywanie** | Sprawdzanie sum kontrolnych przed zapisem (Czy ktoś tu pisał, gdy ja nie patrzyłem?). |
| **Unikanie** | Izolacja sesji i sztywne uprawnienia (To moja kartka, Ty masz tylko prawo do odczytu). |
| **Agent Zarządzający** | Jeden agent (np. Memory Manager) pilnuje dostępu do danych i historii. |
| **Historia zmian** | Przechowywanie wszystkich wersji (Jak funkcja "Historia zmian" w Google Docs). |
| **Zmiany manualne** | Wezwanie człowieka, gdy automat nie wie, co zrobić (Jak rozwiązywanie konfliktów w Git). |

### Kluczowe zasady projektowania
*   **Oddzielenie danych od logiki**: Zewnętrzny kontekst powinien informować agentów, *co* i *kiedy* robić, ale nie powinien być na sztywno zszyty z ich wewnętrznym kodem.
*   **Dostęp dla ludzi**: Dokumenty w pamięci agentów powinny być czytelne dla człowieka, aby umożliwić realną kolaborację i kontrolę nad procesem.
*   **Ścisłe uprawnienia**: Agenci powinni mieć dostęp tylko do tych fragmentów wiedzy, które są niezbędne dla danej sesji lub użytkownika.

## Współdzielenie kontekstu

Budowanie systemów wieloagentowych to balansowanie między wielkimi możliwościami AI a jej ograniczeniami. Aby Twój system działał sprawnie, warto spojrzeć na wyzwania przez pryzmat prostych analogii.

### Kluczowe wyzwania w organizacji kontekstu

| Wyzwanie | Analogia | Dlaczego to ważne? |
| :--- | :--- | :--- |
| **Sesja vs. Pamięć** | Żółta karteczka vs. Archiwum | Trzeba zdecydować, co jest tylko chwilową notatką, a co ma trafić do bazy na stałe. |
| **Degradacja danych** | Gra w "Głuchy telefon" | Przy przekazywaniu zadań między agentami informacje mogą zostać ucięte lub przekręcone. |
| **Interpretacja** | Przepis kulinarny | Nawet mając komplet danych, agent może zinterpretować je na swój własny sposób, zwłaszcza w otwartych zadaniach. |
| **Kontekst** | Klucz bez etykiety | Notatka o "Annie" jest bezużyteczna lub myląca, jeśli nie wiemy, o którą Annę chodziło w danej rozmowie. |
| **Duplikacja** | Dwie identyczne książki na półce | Ta sama wiedza może zapisać się w kilku miejscach, co tworzy bałagan, choć małe modele potrafią już to wykrywać. |
| **Metadane** | Etykieta na słoiku | Data, źródło czy miejsce (np. "rozmowa w drodze do Warszawy") pozwalają agentom lepiej rozumieć historię. |

### Zasady "Mniej znaczy lepiej"

*   **Zacznij od prostoty:** Najlepszy system to taki, który jest tak prosty, jak to tylko możliwe. Nie musi on od razu zarządzać całą firmą.
*   **Ogranicz wymianę informacji:** Agenci mogą działać w niezależnych obszarach z minimalną potrzebą komunikacji między sobą.
*   **Weryfikuj na poziomie kodu:** Zamiast ufać tylko instrukcjom słownym, stosuj twarde zasady dostępu, np. do konkretnych katalogów.
*   **Staranne delegowanie:** Instrukcje przekazywania zadań muszą być dopracowane, zakładając, że odbiorca może dostać tylko fragment informacji.

Pamiętaj, że Gen-AI potrafi więcej niż myślimy, ale jednocześnie mniej, niż nam się wydaje. Modele potrafią ignorować ważne dane lub popełniać proste błędy z powodu wieloznaczności języka. Projektowanie z myślą o tych ograniczeniach to klucz do sukcesu.

## Podział obowiązków i narzędzi pomiędzy agentami

Wyobraź sobie, że Twój system **Daily Ops** to nowoczesna redakcja gazety, która pracuje tylko dla Ciebie. Zamiast ręcznie przeglądać maile i kalendarze, wysyłasz zespół reporterów, którzy przygotowują spersonalizowane wydanie wiadomości z Twojego życia.

### Jak działa zespół Daily Ops?

| Rola | Zadanie w "Redakcji" | Odpowiednik w systemie |
| :--- | :--- | :--- |
| **Budzik (CRON)** | Wybija godzinę rozpoczęcia pracy. | Automatyczny wyzwalacz zadania raz dziennie. |
| **Redaktor Naczelny** | Czyta instrukcje i rozdziela zadania agentom. | **Agent koordynujący**, który zarządza przepływem pracy. |
| **Reporterzy** | Zbierają surowe fakty z różnych miejsc. | Agenci z dostępem do narzędzi (e-mail, kalendarz, notatki). |
| **Archiwista** | Sprawdza, co działo się wczoraj, by nie pisać o tym samym. | Moduł analizy historii i celów długoterminowych. |

---

### Proces tworzenia raportu w 5 krokach

1.  **Pobudka:** Zadanie CRON prosi o przygotowanie zestawienia.
2.  **Analiza planu:** Koordynator czyta plik z instrukcjami (np. `daily-ops.md`).
3.  **Zbiórka danych:** Agenci równolegle pobierają statusy z Twoich systemów.
4.  **Miksowanie:** System zestawia nowe dane z Twoją historią i priorytetami.
5.  **Dostawa:** Gotowy dokument ląduje na Twoim mailu lub telefonie.

---

### Agent czy tradycyjny kod? 

Wybór zależy od tego, jak bardzo "nieprzewidywalne" są Twoje dane.

| Wybierz Agentów (LLM), gdy... | Wybierz Kod (Algorytm), gdy... |
| :--- | :--- |
| Dane są **dynamiczne** i nieustrukturyzowane. | Liczy się **pełna przewidywalność** wyniku. |
| Potrzebujesz wysokiej **personalizacji**. | Musisz mieć **zerowe koszty** operacyjne. |
| Zadania są **otwarte** i wymagają reakcji na zmiany. | Zależy Ci na **szybkim czasie reakcji**. |

### Dlaczego to ma sens?
W przeciwieństwie do sztywnych programów z przeszłości, agenci oferują **elastyczność**. Jeśli Twoje cele się zmienią, nie musisz przepisywać kodu – wystarczy, że zaktualizujesz instrukcje w języku naturalnym, a agent dostosuje się do nowej rzeczywistości. 

**Zasada kciuka:** Jeśli proces wymaga "ludzkiego" zrozumienia tekstu i wyciągania wniosków z kontekstu, zatrudnij agenta. Jeśli to czysta matematyka i stałe reguły – zostań przy kodzie.

## Koordynacja pracy agentów przez managerów

Rola agenta zarządzającego w systemach wieloagentowych przypomina funkcję **dyrygenta orkiestry** lub **kierownika projektu**. Nie gra on na każdym instrumencie, ale dba o to, by całość brzmiała spójnie.

### Kluczowe kompetencje Managera Agentów

Poniższa tabela przedstawia główne obszary odpowiedzialności agenta pełniącego rolę koordynatora:

| Funkcja | Opis działania |
| :--- | :--- |
| **Architekt Planu** | Rozbija złożone zadania na mniejsze etapy i monitoruje ich realizację. |
| **Strażnik Wiedzy** | Posiada szeroki wgląd w pamięć systemu, dane użytkownika i role innych agentów. |
| **Łącznik (Interfejs)** | Odpowiada za bezpośredni kontakt z użytkownikiem i przekazywanie informacji między agentami. |
| **Sędzia i Recenzent** | Podejmuje decyzje w sytuacjach problematycznych oraz weryfikuje efekty pracy innych. |

### Przybornik Managera: "Mniej znaczy lepiej"

Zgodnie z zasadą minimalizmu, agent zarządzający posiada ograniczoną liczbę narzędzi, aby uniknąć przeciążenia (tzw. przeładowania kontekstu).

*   **Narzędzia komunikacji:** `delegate` (deleguj) oraz `message` (wyślij wiadomość).
*   **Narzędzia pamięci:** `recall` lub `search_memory` do przeszukiwania zasobów.
*   **Uprawnienia:** Szeroki dostęp do informacji "tylko do odczytu", by wiedzieć, co dzieje się w przestrzeni roboczej innych agentów.

### Systemy Agentowe a Ludzie: Analogia Kokpitu

Obecnie systemy te nie są w pełni autonomiczne. Projektowanie ich przypomina budowę **kokpitu nowoczesnego samolotu** – pilot (człowiek) nadal jest kluczowy, ale potrzebuje przejrzystych wskaźników.

**Elementy panelu zarządzania dla człowieka:**
*   **Statystyki:** Jak wydajnie pracuje system.
*   **Sesje w toku:** Co dzieje się "tu i teraz".
*   **Harmonogram:** Jakie zadania są w kolejce.
*   **Alert "Uwaga":** Obszary, gdzie system potrzebuje decyzji człowieka.

### Ryzyka i Wyzwania

Warto pamiętać, że systemy te nie są perfekcyjne:
*   **Ciche błędy:** Brak decyzji lub informacji może sprawić, że system pominie ważny etap zadania, zamiast się zatrzymać.
*   **Zarządzanie kontekstem:** Zbyt skomplikowana komunikacja utrudnia sprawne działanie modelu językowego.

To człowiek pozostaje obecnie **głównym koordynatorem**, a interfejsy ewoluują z prostego czatu w stronę rozbudowanych paneli kontrolnych.