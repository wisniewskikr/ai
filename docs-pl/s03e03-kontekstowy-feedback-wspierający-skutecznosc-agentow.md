# Kontekstowy feedback wspierający skuteczność agentów

## Film do lekcji

Wyobraź sobie, że autonomiczny agent jest jak **kameleon** – nie tylko zmienia kolor, by pasować do tła, ale robi to tak sprawnie, że niemal wydaje się rozumieć swoje otoczenie.

Oto kluczowe cechy zachowania takich agentów:

| Cecha | Opis | Analogia |
| :--- | :--- | :--- |
| **Personalizacja** | Dopasowanie nie tylko do gustu, ale i do sytuacji. | Jak **lokaj**, który wie, kiedy podać kawę, a kiedy pozwolić Ci odpocząć. |
| **Dynamika** | Reagowanie na zmiany w otoczeniu w czasie rzeczywistym. | Jak **żeglarz** korygujący kurs przy każdym podmuchu wiatru. |
| **Iluzja świadomości** | Zachowanie tak naturalne, że sprawia wrażenie samodzielnego myślenia. | Jak **sztuczka magiczna** – mechanizm jest prosty, ale efekt końcowy zdumiewa. |

**Najważniejsze zasady działania:**

*   **Prostota mechaniki:** Same zasady rządzące agentem są zazwyczaj proste.
*   **Wyzwanie informacyjne:** Trudność polega na szybkim dostępie do danych i ich naturalnym przekazaniu.
*   **Użyteczność ponad efektowność:** Głównym celem jest pomoc użytkownikowi, a nie tylko robienie "imponujących sztuczek".

**Dwa rodzaje aktywności agenta:**

*   **Interakcja:** Bezpośrednia rozmowa i współpraca z Tobą.
*   **Autonomia:** Działania podejmowane samodzielnie "w tle", bez Twojego udziału.

## Stan i informacje zwrotne z otoczenia

Wyobraź sobie różnicę między **kelnerem**, który podchodzi do stolika tylko wtedy, gdy go zawołasz (system reaktywny), a **osobistym asystentem**, który wie, że o 15:00 masz ważne spotkanie i już o 14:30 przygotowuje dla Ciebie niezbędne dokumenty (system proaktywny).

Oto jak działają nowoczesne, autonomiczne systemy agentowe:

### 1. Co "budzi" agenta do życia? (Wyzwalacze)

Agent nie musi czekać na Twoją wiadomość. Może zacząć działać pod wpływem różnych zdarzeń:

| Wyzwalacz | Jak to działa? (Analogia) | Przykład z życia |
| :--- | :--- | :--- |
| **Wiadomości** | List od kogoś znajomego. | Pytanie od Ciebie lub innego bota. |
| **Hooki / Webhooki** | Dzwonek do drzwi, gdy kurier zostawia paczkę. | Zmiana statusu zadania lub nowe wydarzenie w kalendarzu. |
| **Cron** | Budzik nastawiony na konkretną godzinę. | Codzienny raport generowany o 8:00 rano. |
| **Heartbeat** | Regularne sprawdzanie pulsu, by wiedzieć, czy wszystko gra. | Sprawdzenie co 15 minut, czy system wymaga Twojej uwagi. |

### 2. Jak agent zachowuje "pamięć"?

Zamiast za każdym razem zaczynać od zera, systemy te dążą do **"nieskończonej" sesji**.

*   **Pamięć jak wideo:** Dzięki kompresji kontekstu (np. *Observational Memory*), agent pamięta najważniejsze wątki, nie zapychając sobie głowy zbędnymi detalami.
*   **Pojedyncze wejście:** System ma jeden punkt styku, co pozwala mu elastycznie dopasować się do zadania, niezależnie od tego, skąd ono przyszło.
*   **Zasada higieny:** Nowe akcje to zazwyczaj nowe sesje, aby nie zaśmiecać głównego wątku niepotrzebnymi danymi.

### 3. Mechanizm Proaktywności: Plik `tasks.md`

To serce autonomii agenta. Działa to jak **lista zakupów na lodówce**, którą agent regularnie sprawdza.

1.  **Odczyt:** Co jakiś czas agent zagląda do pliku `tasks.md`.
2.  **Analiza:** Sprawdza kontekst – gdzie jesteś, która jest godzina, co masz otwarte na komputerze.
3.  **Decyzja:** Jeśli zadanie nie wymaga działania, agent "idzie dalej spać".
4.  **Akcja:** Jeśli sytuacja tego wymaga (np. zbliża się termin projektu), agent sam wznawia rozmowę z Tobą.

### 4. Przykłady proaktywnego działania

| Sytuacja | Dane (Metadane) | Reakcja Agenta |
| :--- | :--- | :--- |
| **Praca nad projektem** | Godzina + priorytety w systemie Linear. | Sugeruje zmianę planu dnia, by zdążyć z terminem. |
| **Spotkanie z klientem** | Lokalizacja GPS + wpis w kalendarzu. | Wczytuje profil klienta i przygotowuje notatki przed wejściem do biura. |

Dzięki dostępowi do Twoich aplikacji i metadanych, agent przestaje być tylko narzędziem, a staje się **aktywnym uczestnikiem** Twojego dnia.

## Przykłady interakcji z niewystarczającym kontekstem

Wyobraź sobie, że autonomiczny agent jest jak **super-asystent**, który nie tylko wykonuje Twoje polecenia, ale potrafi „czytać między wierszami”. Nawet gdy rzucisz mu tylko krótką uwagę, on przeszuka swoje zasoby, aby uzupełnić brakujące elementy układanki.

### 🛠 Warsztat Agenta: Narzędzia i Dane
Agent nie działa w próżni. Aby skutecznie pomagać, korzysta z zestawu narzędzi, które pozwalają mu zrozumieć szerszy obraz sytuacji.

| Narzędzie / Zasób | Co daje agentowi? |
| :--- | :--- |
| **Pamięć długoterminowa** | Wiedza o Twoich poprzednich decyzjach i preferencjach. |
| **Mapy i Lokalizacja** | Znajomość trasy i czasu potrzebnego na dotarcie na miejsce. |
| **Kalendarz** | Planowanie i unikanie konfliktów w grafiku. |
| **Internet i Pogoda** | Bieżące informacje, które mogą wpłynąć na Twoje plany. |

### 🧠 Logika Działania: Łączenie Kropek
Głównym zadaniem agenta jest **wzbogacanie kontekstu**. Jeśli Twoja wiadomość jest niepełna, on „łączy kropki”, aby dostarczyć realną wartość biznesową.

*   **Faza 1: Zbieranie i Wzbogacanie** – Agent bierze szczątkową informację (np. „spotkanie z Janem”) i dodaje do niej adres, dane kontaktowe oraz czas dojazdu.
*   **Faza 2: Reagowanie i Przewidywanie** – System działa w tle, wysyłając Ci powiadomienia i wskazówki dokładnie wtedy, gdy ich potrzebujesz.

### 🔄 Dwa tryby pracy agenta
Agent może działać jak **cień**, który podąża za Tobą i dba o porządek.

*   **Tryb Reaktywny:** Odpowiada na konkretne zdarzenie (np. zamienia e-mail od klienta w gotowy wpis w kalendarzu).
*   **Tryb Proaktywny:** Sam wychodzi z inicjatywą (np. ostrzega Cię, że musisz wyjść wcześniej, bo pogoda się pogorszyła).

### ⚠️ O czym warto pamiętać? (Bezpieczeństwo i Współpraca)
Nawet najmądrzejszy agent potrzebuje czasem wsparcia człowieka, aby uniknąć błędów.

*   **Ryzyko pomyłek:** Agent może błędnie przypisać adres lub kontakt, co grozi wyciekiem poufnych danych.
*   **Interfejs "ratunkowy":** W sytuacjach spornych lub przy braku danych, agent powinien mieć możliwość kontaktu z Tobą, np. poprzez **interfejs głosowy**.
*   **Podejście "Ofensywne":** Zamiast tylko łatać błędy, projektujmy systemy tak, by aktywnie szukały nowych sposobów na ułatwienie nam życia.

**Analogia:** Agent jest jak **doświadczony nawigator**. Nawet jeśli powiesz mu tylko „chcę jechać nad morze”, on sprawdzi stan paliwa, znajdzie najszybszą trasę, zarezerwuje hotel i ostrzeże Cię przed korkami, zanim jeszcze wsiądziesz do auta.

## Rola feedbacku w skuteczności działania agentów

Wyobraź sobie, że autonomiczny agent jest jak **nowy pracownik w wielkim biurowcu**, który nie ma mapy. Na początku błądzi, ale dzięki Twoim wskazówkom i własnym notatkom, z każdym dniem trafia do celu szybciej.

Oto jak działają mechanizmy feedbacku w nowoczesnych agentach przeglądarkowych:

### Rodzaje pomocników internetowych

| Typ | Kiedy wybrać? | Przykład |
| :--- | :--- | :--- |
| **Klasyczny Bot** | Powtarzalne zadania na dużą skalę, brak potrzeby "myślenia". | Prosty scraper danych. |
| **Agent AI** | Skomplikowane strony, brak API (np. Goodreads), wymagane logowanie. | Playwright, Puppeteer. |

### Jak agent uczy się na błędach?

Zamiast za każdym razem odkrywać stronę na nowo, agent korzysta z **pętli informacji zwrotnej**:

*   **Zapisywanie mapy:** Instrukcje o strukturze strony są przechowywane w specjalnych plikach, co zwiększa skuteczność przy kolejnych wizytach.
*   **Wyciąganie wniosków:** Po popełnieniu błędu agent otrzymuje sugestię wykonania zrzutu ekranu lub zapisania notatki, aby uniknąć tej samej pomyłki w przyszłości.
*   **Pamięć sesji:** Agent potrafi utrzymać logowanie (np. na Goodreads), co pozwala mu działać w naszym imieniu bez ciągłego proszenia o hasło.

### Kluczowe funkcje "inteligentnego" agenta

*   **Zarządzanie nadmiarem treści:** Jeśli strona jest zbyt długa, agent zapisuje ją w pliku lub prosi o pomoc "subagenta", aby nie przepełnić swojej pamięci podręcznej.
*   **Tworzenie własnych narzędzi:** Bardziej zaawansowane jednostki potrafią same pisać kod i tworzyć automatyzacje dla powtarzalnych czynności.
*   **Traktowanie "na równi":** Nowoczesne systemy (jak WebMCP) dążą do tego, by agenci byli traktowani przez strony tak samo jak ludzcy użytkownicy.

**Zasada działania jest prosta:** Agent nie potrzebuje ogromnej pamięci, a jedynie **sprytnych zasad i umiejętności wyciągania wniosków** z każdej sesji.

## Przestrzeń pomiędzy wywoływaniem narzędzi

Wyobraź sobie agenta AI jako **aktora na scenie**, a hooki (zaczepy) jako **suflera lub reżysera**, który podpowiada mu w kluczowych momentach, co ma zrobić poza samym graniem swojej roli,. Hooki pozwalają na dodanie logiki, która wpływa na przebieg pracy lub procesy zewnętrzne.

### Kluczowe momenty pracy agenta

Poniższa tabela przedstawia podstawowe hooki, które organizują pracę agenta krok po kroku:

| Hook | Co robi? (Analogia: Wyścig) | Cel działania |
| :--- | :--- | :--- |
| **onStart** | Start pistoletu | Agent rozpoczyna pracę. |
| **onStepStart** | Początek nowego okrążenia | Agent zaczyna konkretny krok. |
| **onToolCallStart** | Sięgnięcie po bidon z wodą | Agent zaczyna wywoływać narzędzie. |
| **onToolCallFinish** | Odłożenie bidonu | Agent kończy korzystać z narzędzia. |
| **onStepFinish** | Koniec okrążenia | Agent kończy dany krok. |
| **onFinish** | Przekroczenie linii mety | Agent kończy całe zadanie. |

### Zaawansowane funkcje hooków

Hooki to nie tylko proste sygnały startu i stopu. Można je wykorzystać do bardziej złożonych operacji:

*   **Budowanie kontekstu:** Przygotowanie informacji potrzebnych agentowi do rozmowy.
*   **Zarządzanie sesją:** Na przykład automatyczne nadawanie nazwy konwersacji na podstawie jej treści (jak w ChatGPT).
*   **Kompresja:** Zmniejszanie rozmiaru danych w sesji, aby oszczędzać pamięć.
*   **Strumieniowanie:** Zarządzanie przesyłaniem danych w czasie rzeczywistym.

### Przykład: Agent jako Nauczyciel Angielskiego

W przypadku agenta uczącego języka, hooki pełnią rolę **asystenta technicznego**, który dba o porządek w dokumentach ucznia,.

| Specyficzny Hook | Działanie w praktyce |
| :--- | :--- |
| **beforeToolCall** | Gdy agent chce "słuchać" nagrania, hook automatycznie zapisuje ścieżkę do pliku audio. |
| **afterToolResult** | Po analizie nagrania hook odznacza etapy: "wysłuchano", "opracowano feedback", "zapisano". |
| **beforeFinish** | Działa jak **strażnik** – sprawdza, czy agent na pewno wykonał wszystkie zadania (np. czy dał feedback) przed zakończeniem sesji. |

### Dlaczego warto stosować hooki?

*   **Podnoszą skuteczność:** Pilnują, aby proces przebiegał zgodnie z planem.
*   **Personalizacja:** Pozwalają zapisywać postępy użytkownika i dostosowywać do niego kolejne sesje.
*   **Automatyzacja tła:** Wykonują żmudne zadania (jak zapisywanie plików), o których agent nie musi pamiętać za każdym razem.
*   **Obsługa błędów:** Mogą zatrzymać proces, jeśli wystąpi problem z narzędziami lub limitem kroków.

W nowoczesnych systemach, takich jak Model Context Protocol (MCP), hooki mogą nawet pozwalać na **odwróconą komunikację**, gdzie serwer prosi klienta o wykonanie dodatkowych operacji.

## **Wsparcie ze strony człowieka**

Projektowanie systemów AI to nie budowa "czarodziejskiej różdżki", ale raczej **szkolenie sprawnego asystenta**. Choć dążymy do autonomii, rola człowieka pozostaje kluczowa dla skuteczności i bezpieczeństwa działań agenta.

### 🤝 Dlaczego AI potrzebuje człowieka?

Świat jest zbyt złożony, by maszyna przewidziała każdy scenariusz. AI działa najlepiej jako **kooperator**, a nie samotny gracz.

| Moment współpracy | Zadanie człowieka | Korzyść dla systemu |
| :--- | :--- | :--- |
| **Start (Hooki)** | Weryfikacja ryzykownych akcji i uzupełnianie danych. | Uniknięcie błędów w "niezaufanych" sytuacjach. |
| **W trakcie (Heartbeat)** | Reagowanie na sygnały o stanie prac systemu. | Ciągłość działania i szybka korekta kursu. |
| **Koniec (Feedback)** | Analiza wyników przed ich ostatecznym zatwierdzeniem. | Gwarancja najwyższej jakości efektu końcowego. |

---

### 💡 Kluczowe zasady sukcesu

*   **Zasada "Czystego Paliwa":** Nawet najlepszy silnik (model AI) nie ruszy na brudnym paliwie. Jeśli użytkownik dostarczy słabej jakości dane (np. niewyraźne nagranie), agent nie wygeneruje wartościowej odpowiedzi.
*   **Onboarding jako instrukcja obsługi:** Problemy z agentami często wynikają z błędów użytkowników. Musimy nauczyć ludzi, jak "rozmawiać" z AI, by wydobyć z niej to, co najlepsze.
*   **Proaktywność zamiast czekania:** System może sam poprosić o wsparcie, gdy napotka na zbyt dużą złożoność procesu.

---

### 🍎 Analogia: Agent AI jak profesjonalny kucharz

Wyobraź sobie agenta AI jako **szefa kuchni**, a siebie jako **właściciela restauracji**:

1.  **Składniki (Dane):** Jeśli dostarczysz kucharzowi nieświeże produkty, nawet jego mistrzowska technika nie uratuje smaku dania.
2.  **Menu (Wytyczne):** Kucharz potrzebuje Twojej decyzji, co dziś serwujemy (weryfikacja akcji), zanim zacznie kroić warzywa.
3.  **Degustacja (Kontrola):** Przed podaniem dania gościom, kucharz prosi Cię o spróbowanie sosu, by upewnić się, że jest idealny.

**Pamiętaj:** Skuteczność AI zależy od tego, jak dobrze zaplanujesz rolę człowieka w tym procesie.