# Projektowanie agentów

## Projektowanie instrukcji i zakresu odpowiedzialności

Projektowanie agenta AI przypomina **zatrudnianie nowego pracownika**. Nie wystarczy mu powiedzieć „pracuj”, trzeba mu nadać rolę, biurko i jasne wytyczne.

Oto kluczowe elementy budowy instrukcji dla agenta:

### 1. Fundamenty Agenta (Ustawienia i Profil)
Wyobraź sobie to jako **identyfikator i osobowość** Twojego pracownika.

| Element | Opis (Analogia) | Co zawiera? |
| :--- | :--- | :--- |
| **Ustawienia** | **Wizytówka i narzędziownik** | Nazwa, opis (dla innych agentów), lista dostępnych narzędzi i uprawnień. |
| **Profil** | **Charakter i styl pracy** | Ton wypowiedzi, poziom złożoności i techniki rozwiązywania problemów. To "dusza" agenta, która realnie wpływa na jakość jego pracy. |

### 2. Funkcjonowanie (Zasady i Limity)
To **kodeks postępowania** i świadomość własnych ograniczeń.

*   **Zasady:** Ogólny protokół komunikacji i radzenia sobie z problemami. Zamiast mikrozarządzania, dajesz agentowi "kompas".
*   **Limity:** Agent musi wiedzieć, czego *nie* wie (np. "jaka jest teraz godzina?") oraz jak świeże są jego dane (np. lokalizacja użytkownika).
*   **Styl:** Agent to **kameleon**. Musi wiedzieć, czy mówi do mikrofonu (wtedy unika długich linków), czy pisze na czacie.

### 3. Kontekst (Sesja)
To **pamięć o kliencie**, z którym agent aktualnie rozmawia.

*   **Indywidualne podejście:** Agent musi wiedzieć, z kim rozmawia i jakie ta osoba ma preferencje.
*   **Dynamiczne dane:** Informacje o tym, co robią w tej chwili inni agenci w systemie.

### Jak podejść do budowy systemu?
Złożoność systemów agentowych rośnie błyskawicznie, dlatego warto stosować poniższe zasady:

*   **Zacznij od wsparcia:** Nie musisz od razu tworzyć autonomicznego działu firmy. Lepiej stworzyć agenta, który **wspiera konkretne czynności**, a potem stopniowo go rozwijać.
*   **Ludzie są ważni:** To całkowicie w porządku, jeśli część procesu nadal będą wykonywać ludzie.
*   **Rola w zespole:** Skup się nie tylko na tym, co agent robi sam, ale jak odnajduje się w grupie innych agentów.

Pamiętaj: **Mniej znaczy lepiej**. Skupienie modelu na konkretnej roli działa lepiej niż próba opisania mu całego świata naraz.

## Zasady projektowania instrukcji agenta

Projektowanie instrukcji dla agenta AI przypomina **pisanie scenariusza dla aktora** lub **podręcznika wdrożeniowego dla nowego pracownika**. Zamiast sztywnych komend, tworzymy przestrzeń, w której agent rozumie swoją rolę i potrafi nas pozytywnie zaskoczyć.

Oto kluczowe zasady tworzenia skutecznych instrukcji w uproszczonej formie:

### 1. Tożsamość (`<identity>`) – Dusza Agenta
Tożsamość to fundament. Nie opisuje detali technicznych, ale nadaje ogólny motyw przewodni.

*   **Co obejmuje:** Cechy charakteru, styl wypowiedzi, autonomię i relacje.
*   **Analogia:** To jak **"osobowość"** – decyduje, czy agent jest formalnym urzędnikiem, czy luźnym asystentem.
*   **Zasada:** Pokaż, nie tylko mów. Używaj specyficznego słownictwa (np. „instynkt”), aby model „poczuł” swój charakter.

### 2. Protokół – Zasady Gry
Protokół osadza agenta w konkretnych ramach działania i określa, jak ma korzystać z zasobów.

| Element protokołu | Opis działania |
| :--- | :--- |
| **Zarządzanie kontekstem** | Jak agent ma korzystać z pamięci i wspomnień. |
| **Rozwiązywanie problemów** | Co zrobić, gdy zadanie przekracza możliwości agenta. |
| **Struktura plików** | Gdzie szukać informacji (np. konkretne katalogi). |
| **Proszenie o pomoc** | Jasne wytyczne, kiedy i jak komunikować się z użytkownikiem. |

### 3. Ton i Komunikacja – Jak Cię słyszą
Modele LLM mają tendencję do wracania do swojego domyślnego, „robotycznego” tonu. Ta sekcja musi być wyrazista, by temu zapobiec.

*   **Przykłady (Few-shot):** Podaj konkretne wzorce wypowiedzi.
*   **Antywzorce:** Wskaż wyraźnie, jakich sformułowań agent ma unikać.
*   **Serie skojarzeń:** Pomóż modelowi utrzymać styl poprzez odpowiednie powiązania słowne.
*   **Analogia:** To jak **„etykieta biurowa”** – określa, jakich słów używamy przy ekspresie do kawy, a jakich na spotkaniu z zarządem.

### 4. Narzędzia i Dynamiczne Sekcje
Współczesne systemy są elastyczne. Instrukcje dotyczące narzędzi często generują się same, bo skład „zespołu” agentów może się zmieniać.

*   **Dynamiczny skład:** Opisy narzędzi i schematy mogą być dołączane automatycznie.
*   **CTA (Call to Action):** Zawsze kończ instrukcję jasnym sygnałem zakończenia (np. ostatnie zdanie), aby model wiedział, że czas na działanie.
*   **Sekcja Workspace:** Miejsce na bieżące obserwacje i refleksje z interakcji.

### Złote zasady projektanta:
*   **Iteracja to klucz:** Idealna instrukcja nie powstaje za pierwszym razem – wymaga kilkunastu prób we współpracy z AI.
*   **Brak gwarancji:** Pamiętaj, że obecność instrukcji w kontekście nie oznacza, że model zawsze jej posłucha.
*   **Balans:** Nie wiąż agenta zbyt mocno ze strukturą techniczną, by zachować elastyczność systemu.

## Przypisywanie zestawu narzędzi oraz ustawień

Tworzenie skutecznych agentów AI to balansowanie między ich swobodą a bezpieczeństwem. Oto kluczowe zasady projektowania nowoczesnych systemów agentowych w pigułce:

### 1. Liczba narzędzi: Jakość ponad ilość
Choć często mówi się o limicie 10–15 narzędzi, w rzeczywistości liczy się kontekst i specjalizacja.

| Podejście | Opis | Analoga |
| :--- | :--- | :--- |
| **Minimalizm** | Jedno potężne narzędzie (np. terminal/CLI) może wystarczyć do złożonych zadań. | **Scyzoryk szwajcarski:** Jedno narzędzie z wieloma funkcjami. |
| **Specjalizacja** | Różni agenci mają różne zestawy narzędzi; niektórzy mają ich nawet 27. | **Warsztat rzemieślniczy:** Każdy fachowiec ma swój własny pas z narzędziami. |
| **Współdzielenie** | Agenci mogą dzielić się narzędziami (np. wyszukiwarką), by rzadziej musieli ze sobą rozmawiać. | **Wspólna kuchnia:** Każdy kucharz korzysta z tej samej kuchenki, by nie tracić czasu na podawanie garnków. |

### 2. Dynamiczne odkrywanie (Sandbox)
Zamiast dawać agentowi wszystko na start, pozwól mu „znajdować” to, czego potrzebuje w bezpiecznym środowisku (piaskownicy).

*   **Początkowy minimalizm:** Agent zaczyna tylko z podstawowymi funkcjami (lista narzędzi, wykonanie kodu).
*   **Odkrywanie na żądanie:** Gdy pojawia się problem, agent sprawdza dostępne serwery i sam pisze kod, by go rozwiązać.
*   **Zaleta:** Ogromne ilości danych nie zapychają pamięci agenta, bo są przetwarzane jako zmienne wewnątrz kodu.

**Analoga:** To jak **książka kucharska zamiast gotowego obiadu**. Agent nie dostaje wszystkich dań naraz, ale ma przepis i składniki, by przyrządzić to, co akurat jest potrzebne.

### 3. Bezpieczeństwo i ryzyko
Większa swoboda to większa odpowiedzialność. System musi przewidywać błędy.

*   **Ryzyko połączeń:** Agent może przypadkiem przesłać tajne dane z zabezpieczonego pliku do publicznego systemu (np. Jira).
*   **Zalety Piaskownicy (Sandbox):** Pozwala na dużą swobodę działania przy jednoczesnym odcięciu agenta od wrażliwych części systemu zewnętrznego.
*   **Wyzwanie:** Sandbox zwiększa złożoność i koszty całej architektury.

### Złota zasada budowania agentów
Zadaj sobie jedno pytanie: **Czy mój system stanie się lepszy wraz z rozwojem modeli AI?**. Jeśli odpowiedź brzmi "nie", warto przemyśleć strategię. Buduj rozwiązania, które "rosną" razem z technologią.

## Przypisywanie wiedzy oraz kontekstu

Zarządzanie wiedzą w systemach agentów AI przypomina **organizację pracy w wielkim biurze**. Każdy agent potrzebuje odpowiednich informacji w odpowiednim czasie, aby dobrze wykonać swoje zadanie.

Oto prosty podział rodzajów pamięci i wiedzy, z których korzystają agenci:

### 🗂️ Rodzaje Wiedzy w Systemie AI

| Rodzaj | Co to jest? (Analogia) | Dostępność |
| :--- | :--- | :--- |
| **Dokumenty sesji** | Notatki na biurku podczas spotkania. | Tylko agenci w bieżącej rozmowie. |
| **Wiedza publiczna** | Książki w ogólnodostępnej bibliotece. | Wszyscy agenci i użytkownicy. |
| **Wiedza prywatna** | Twój osobisty dziennik lub archiwum. | Tylko Ty i Twoi agenci. |
| **Wiedza agentów** | Instrukcja obsługi pracownika i jego doświadczenie. | Indywidualna dla każdego agenta. |
| **Pamięć podręczna (Cache)** | Szybkie zapiski na "żółtych karteczkach". | Tymczasowe wyniki (np. z sieci). |
| **Runtime** | Fundamenty budynku (niewidoczne, ale niezbędne). | Warstwa techniczna, baza danych. |

---

### 🧠 Wyzwania: Dlaczego to jest trudne?

Organizowanie informacji nie jest proste, ponieważ granice między kategoriami często się zacierają:

*   **Płynność:** Ta sama informacja (np. o nowym projekcie) może być prywatna, publiczna lub dotyczyć tylko agenta.
*   **Dynamiczne decyzje:** Agent musi sam zdecydować, gdzie zapisać nową informację i jak połączyć ją z tym, co już wie.
*   **Trudność w automatyzacji:** Bez jasnych reguł systemowi trudno jest działać w pełni samodzielnie.

---

### ✨ Złota zasada: "Mniej znaczy lepiej"

Zamiast budować skomplikowane systemy "pamięci długoterminowej", warto zacząć od najprostszych rozwiązań:

*   **Prostota ponad wszystko:** Czasami zwykłe, łatwe w utrzymaniu dokumenty tekstowe działają lepiej niż zaawansowane bazy wiedzy.
*   **Fundament komunikacji:** Dokumenty mogą służyć jako łącznik – agenci mogą się nimi wymieniać lub odwoływać do nich bez wczytywania całej treści.
*   **Stopniowy rozwój:** Najlepiej obserwować, jakie podejście sprawdza się w codziennych zadaniach, i dopiero wtedy je rozbudowywać.