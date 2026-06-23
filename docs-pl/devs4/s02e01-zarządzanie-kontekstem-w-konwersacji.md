# Zarządzanie kontekstem w konwersacji

## Rola kontekstu w instrukcjach systemowych

Ewolucja instrukcji systemowych polega na przejściu od „wszystkowiedzących” opisów do **dynamicznych map**, które pomagają agentom nawigować w ich otoczeniu,.

### Instrukcja jako Mapa
Wyobraź sobie, że instrukcja systemowa to **uproszczona mapa terenu**, a nie zdjęcie satelitarne każdego centymetra kwadratowego. Agent nie musi widzieć wszystkiego naraz; musi jedynie wiedzieć, jak korzystać z dostępnych zasobów, aby dotrzeć do celu,.

### Kluczowe Elementy Instrukcji Systemowej

| Obszar | Co zawiera? | Cel |
| :--- | :--- | :--- |
| **Uniwersalność** | Rola pamięci, profil użytkownika, „osobowość” agenta. | Nadanie ogólnego kontekstu bez zbędnego szumu. |
| **Otoczenie** | System operacyjny, aktywne tryby (np. brak sieci), rodzaj interfejsu,. | Budowanie „świadomości” środowiska pracy,. |
| **Sesja** | Historia działań, skompresowane dane z poprzednich okien kontekstowych. | Zarządzanie limitami pamięci i zachowanie ciągłości. |
| **Zespół** | Zasady komunikacji z innymi agentami, współdzielone pliki. | Umożliwienie współpracy wielu systemów AI. |

### Zasady „Mniej znaczy lepiej”
*   **Unikaj szumu:** Nie dodawaj specyficznych instrukcji, które są rzadko używane; model potraktuje je jako zbędny hałas.
*   **Generalizuj:** Opisuj rolę narzędzi (np. pamięci) w prompcie systemowym, zamiast w samym narzędziu, aby agent mógł elastycznie dopasować się do kontekstu.
*   **Dbaj o chronologię:** Informacje o postępach w sesji dodawaj ostrożnie, aby nie były starsze niż faktyczna treść rozmowy.
*   **Stosuj placeholdery:** W systemach wieloagentowych używaj szablonów, które pozwalają na wygodne składanie wspólnych instrukcji.

Instrukcja systemowa ma odpowiedzieć na jedno kluczowe pytanie: **o czym agent musi wiedzieć, ZANIM zacznie działać**, aby najszybciej osiągnąć cel?

## Odróżnianie szumu od sygnału z pomocą modelu

W systemach opartych na agentach AI, Twoim celem jest uzyskanie jak najwyższej jakości „sygnału” przy jednoczesnym ograniczeniu „szumu”.

### 🟢 Sygnał vs 🔴 Szum: Czym są?

Wyobraź sobie, że **sygnał to czysty dźwięk Twojej ulubionej stacji radiowej**, a **szum to trzaski i zakłócenia**, które utrudniają zrozumienie muzyki.

| Cecha | Sygnał (To, czego chcemy) | Szum (To, co przeszkadza) |
| :--- | :--- | :--- |
| **Definicja** | Istotne informacje pomagające wykonać zadanie. | Rozpraszające dane, które nie wnoszą wartości. |
| **W praktyce** | Precyzyjne instrukcje, czyste dane z API. | Błędne komunikaty, nadmiar zbędnego kontekstu. |
| **Efekt** | Sprawne i logiczne działanie agenta. | Zagubienie modelu i błędy w realizacji zadań. |

---

### Jak zwiększyć poziom sygnału?

Nie da się przewidzieć każdego ruchu agenta, ale można **stworzyć mu idealne warunki do pracy**.

*   **Precyzyjny Kontekst:** Dostarczaj tylko to, co niezbędne. Błędne dane z narzędzi to „fałszywy sygnał”.
*   **Fundamenty z Kodu:** Kod aplikacji to **szyny, po których jedzie pociąg (AI)**. Jeśli szyny są krzywe, pociąg wypadnie z trasy, nieważne jak inteligentny jest maszynista.
*   **Modułowe Instrukcje:** Zamiast jednego gigantycznego opisu, twórz małe, elastyczne komponenty promptów, które aktywują się tylko wtedy, gdy są potrzebne.
*   **Mechanizmy Automatyczne:** Stosuj kompresję kontekstu i inteligentne planowanie. To jak automatyczne dostrajanie częstotliwości w radiu.
*   **Koło Ratunkowe:** Zostaw miejsce na interwencję człowieka. Czasem agent potrzebuje krótkiej podpowiedzi, by wrócić na właściwe tory.

---

### Nowa rola programisty

Rola kodu zmienia się – piszemy go mniej, ale musi być on **wyższej jakości**.

*   **Kiedyś:** Programista pisał każdą linijkę instrukcji (sztywny scenariusz).
*   **Dziś:** Programista projektuje środowisko, w którym AI samo podejmuje decyzje (reżyserowanie warunków).

**Zasada „Mniej znaczy lepiej”:** Im mniej zbędnego szumu w systemie, tym lepiej model radzi sobie z Twoimi instrukcjami.

## Kształtowanie kontekstu poprzez obserwację

Agentic RAG to sposób, w jaki inteligentny asystent (agent) samodzielnie zdobywa wiedzę, by lepiej wykonać Twoje zadanie. Zamiast tylko korzystać z tego, co już wie, agent zachowuje się jak **detektyw w wielkiej bibliotece** – przeszukuje regały, czyta spisy treści i łączy fakty, aby znaleźć rozwiązanie.

### Jak działa Agentic RAG?
Wyobraź sobie, że prosisz agenta o przygotowanie obiadu z konkretnych składników. Agent nie tylko sprawdza przepis, ale też zagląda do lodówki, by zobaczyć, co faktycznie ma pod ręką.

| Krok | Działanie Agenta | Cel |
| :--- | :--- | :--- |
| **1. Wyszukiwanie** | Wpisuje pierwsze hasła w wyszukiwarkę. | Znalezienie punktu zaczepienia. |
| **2. Korekta** | Zauważa, że np. dokumenty są w innym języku. | Dopasowanie strategii do realiów. |
| **3. Eksploracja** | Szuka synonimów i powiązanych tematów. | Pogłębienie wiedzy (pogoni za „tropem”). |
| **4. Weryfikacja** | Sprawdza, czy ma już wszystkie odpowiedzi. | Zapewnienie wysokiej jakości rozwiązania. |

### Dlaczego instrukcje są ważne?
Agent domyślnie „nie wie, o czym wie”. Instrukcja systemowa działa jak **mapa dla podróżnika** – pomaga mu nawigować, ale nie przewidzi każdego zakrętu. Zamiast sztywnych procedur, lepiej dać agentowi zestaw ogólnych zasad:

*   **Skanowanie:** Zanim zaczniesz, sprawdź strukturę plików i folderów.
*   **Pogłębianie:** Zadawaj sobie pytania o synonimy i skróty, by znaleźć więcej informacji.
*   **Szukanie powiązań:** Patrz na problemy szerzej (przyczyna/skutek, wada/zaleta).
*   **Sprawdzanie pokrycia:** Upewnij się, że znasz limity i definicje przed zakończeniem pracy.

### Kluczowe korzyści
*   **Dynamika:** Agent uczy się poprzez obserwację otoczenia i reakcje na to, co znajdzie.
*   **Skuteczność:** Potrafi dotrzeć do informacji, nawet jeśli w Twoim pytaniu nie padły dokładne słowa kluczowe.
*   **Samodzielność:** Agent sam decyduje, czy potrzebuje więcej danych, czy może już działać.

Pamiętaj: Agentic RAG to **gra prawdopodobieństwa, a nie pewności**. Agent nie zawsze znajdzie 100% informacji, ale dzięki inteligentnemu przeszukiwaniu jego skuteczność jest znacznie wyższa niż w przypadku zwykłych systemów.

## Generalizowanie zasad przetwarzania kontekstu

Projektowanie instrukcji dla agentów AI przypomina **budowanie z klocków LEGO zamiast odlewania gotowej formy z betonu**. Chodzi o to, aby instrukcje były elastyczne i pasowały do wielu sytuacji, a nie tylko do jednego, konkretnego zadania,.

Oto kluczowe zasady tworzenia generycznych (uniwersalnych) promptów, opracowane na podstawie źródeł:

### 1. Generalizacja vs. Konkrety
Zamiast pisać instrukcję pod jedno narzędzie, myśl o niej jak o **uniwersalnym uchwycie**, do którego można wpiąć różne końcówki,.

| Cecha | Podejście konkretne (słabe) | Podejście generyczne (lepsze) |
| :--- | :--- | :--- |
| **Zależność** | Ściśle powiązane z jednym dokumentem/narzędziem. | Niezależne od aktualnie przypisanych narzędzi. |
| **Elastyczność** | Sztywne schematy działania. | Elastyczne komponenty, jak w architekturze oprogramowania. |
| **Język** | Długie, zawiłe opisy błędów. | Zwięzłe frazy typu: „wybierz najbezpieczniejszą opcję”. |

### 2. Proces rzeźbienia instrukcji (Iteracja)
Tworzenie idealnego promptu to proces **iteracyjny**. Model AI może Ci w tym pomóc, działając jak **lustro**, w którym przeglądasz swoje błędy,.

*   **Analiza błędu:** Zapytaj model, dlaczego zachował się w dany sposób (np. dlaczego użył złego narzędzia).
*   **Szukanie wzorca:** Nie naprawiaj tylko tego jednego błędu. Szukaj **uniwersalnej przyczyny** problemu, która dotyczy całej kategorii sytuacji.
*   **Usuwanie zbędnych elementów:** Stosuj zasadę „Mniej znaczy lepiej”. Model najlepiej reaguje na klarowne i krótkie polecenia, takie jak „udzielaj zwięzłych odpowiedzi”.
*   **Wskazywanie kierunku:** Model często proponuje zbyt bezpośrednie zmiany. Twoją rolą jest ocena, co ma znaczenie, i poprowadzenie AI ku lepszej generalizacji,.

### 3. Złote zasady „Mniej znaczy lepiej”
W instrukcjach systemowych słowa są jak paliwo – nie chcesz ich marnować na niepotrzebne manewry.

*   **Unikaj „przesterowania”:** Nie zasypuj modelu zbyt wieloma przykładami, bo zacznie je kopiować bezmyślnie, zamiast rozumieć zasadę.
*   **Samodzielność narzędziowa:** Instrukcja systemowa powinna być oddzielona od opisu narzędzi. Agent powinien wiedzieć, co robić, nawet jeśli narzędzia się zmienią.
*   **Jasne granice:** Zamiast opisywać każdy błąd, użyj ogólnej zasady: „Jeśli nie masz dostępu do treści, po prostu o tym poinformuj”.

### Analogia: Architekt vs. Budowniczy
Projektowanie promptów dla agentów bardziej przypomina pracę **architekta** niż budowniczego. Budowniczy stawia jedną ścianę w konkretnym miejscu. Architekt projektuje system modułowy, który pozwoli postawić dom w różnych warunkach, zachowując jego funkcjonalność. Twoim celem jest stworzenie takiego „systemu modularnego” w języku naturalnym.

## Struktura dynamicznej instrukcji systemowej

Wyobraź sobie, że Twój agent to **szef kuchni**. Instrukcja systemowa to jego **główna książka kucharska**, a dynamiczne dane to **notatki o dzisiejszych zamówieniach**, które kładziesz mu na blacie.

Oto jak zbudować taki system, aby działał szybko i tanio:

### 1. Architektura Kontekstu (Hierarchia)

W oknie kontekstowym kolejność ma znaczenie dla **pamięci podręcznej (cache)**. Jeśli zmienisz coś na górze, model musi "uczyć się" wszystkiego pod spodem od nowa.

| Element | Opis | Wpływ na Cache |
| :--- | :--- | :--- |
| **Instrukcja systemowa** | Fundament: kim jest agent i jak ma działać. | Zmiana tutaj **kasuje cache** dla narzędzi i rozmowy. |
| **Definicje narzędzi** | "Przybory" agenta (np. dostęp do plików, API). | Jeśli instrukcja wyżej jest stała, narzędzia zostają w cache. |
| **Konwersacja** | Bieżąca wymiana zdań i dynamiczne dane. | Tu zachodzą najczęstsze zmiany. |

### 2. Sprytne zarządzanie danymi dynamicznymi

Zamiast edytować główną instrukcję (co jest drogie i wolne), dynamiczne informacje (np. dzisiejsza data, status projektu) wkładaj do **wiadomości użytkownika**.

*   **Etykiety XML**: Używaj tagów takich jak `<context>...</context>`, aby wyraźnie oddzielić dane od pytania użytkownika. Działa to jak **etykiety na słoikach** w spiżarni – model od razu wie, co jest czym.
*   **Zasada selekcji**: Przekazuj tylko to, co zmienia się najczęściej. Nie "przeładowuj" modelu zbędnymi szczegółami, bo straci on koncentrację.
*   **Odświeżanie przez narzędzia**: Zamiast ciągle wysyłać status systemu, daj agentowi **narzędzie**, którym sam sprawdzi informacje, gdy będą mu potrzebne.

### 3. Sterowanie uwagą modelu

Model jest jak maratończyk – z czasem może zapomnieć o instrukcjach z początku trasy.

*   **Powtarzanie zasad**: W trakcie długiej rozmowy warto przypominać najważniejsze instrukcje w krótkich fragmentach.
*   **Unikanie chaosu**: Zbyt duża ilość aktualizacji naraz może ogłupić agenta. Stosuj zasadę **"Mniej znaczy lepiej"** – dostarczaj tylko kluczowe fakty.

**Podsumowując:** Utrzymuj instrukcję systemową jako **sztywny fundament**, a dynamiczne zmiany wprowadzaj "miękko" w treści rozmowy, używając jasnych znaczników.

## Kontrola stanu interakcji poza oknem kontekstu

**Agent Harness** to coś więcej niż aplikacja – to cała „infrastruktura życia” dla agenta AI. 

Wyobraź sobie, że sam model językowy to **wybitny kucharz**, ale **Agent Harness to profesjonalna kuchnia**, w której pracuje. Bez odpowiedniego zaplecza, nawet najlepszy kucharz niewiele zdziała.

### Czym jest Agent Harness?

To system, który pozwala agentowi wyjść poza proste „pytanie-odpowiedź” i zacząć realnie działać w świecie.

| Element | Rola w systemie | Analoga |
| :--- | :--- | :--- |
| **Model (LLM)** | Przetwarzanie myśli i decyzji | Szef kuchni |
| **Agent Harness** | Całe otoczenie i narzędzia | Wyposażona kuchnia i spiżarnia |
| **Okno kontekstu** | To, o czym agent pamięta „tu i teraz” | Blat kuchenny (miejsce pracy) |

---

### Zarządzanie stanem (Poza „blatem roboczym”)

Nie wszystko musi znajdować się w oknie kontekstu naraz. System zarządza informacjami w tle, aby oszczędzać miejsce i pieniądze.

*   **Sesja (Hooks):** System monitoruje interakcję i może sam przygotować podsumowania lub pobrać dane z zewnątrz, zanim trafią one do agenta.
*   **Pamięć (Batch API):** Wspomnienia mogą być budowane raz na dobę w tle. Dzięki temu jest to znacznie tańsze (wykorzystanie Batch API).
*   **Pliki:** Służą jako magazyn danych, miejsce do współpracy między narzędziami, a nawet sposób na naukę nowych umiejętności przez agenta.
*   **Otoczenie:** Informacje ze świata zewnętrznego (poza urządzeniem użytkownika) są filtrowane i trafiają do agenta tylko wtedy, gdy są naprawdę potrzebne.
*   **Współpraca:** Agenci mogą dzielić się informacjami, nawet jeśli każdy z nich ma swoje własne „okno kontekstu”.

### Kluczowa lekcja
Zamiast myśleć o agencie jako o prostej aplikacji czy kodzie (SDK), patrz na niego jak na **część większego środowiska**, które pozwala mu sprawnie funkcjonować i współdziałać z innymi.

## Maskowanie elementów kontekstu

Technika maskowania kontekstu, stosowana m.in. przez zespół agenta Manus, to sposób na **„prowadzenie modelu za rękę”** poprzez narzucenie mu początku odpowiedzi.

### Czym jest maskowanie kontekstu?

Wyobraź sobie, że stoisz przed ogromnym bufetem (pełen kontekst AI), ale kucharz chce, abyś spróbował tylko deserów. Zamiast chować inne dania, **podaje Ci talerz, na którym leży już kawałek ciasta**. Skoro już zacząłeś jeść deser, naturalnie będziesz kontynuował posiłek w tej sekcji.

| Cecha | Opis |
| :--- | :--- |
| **Mechanizm** | Dopisywanie początku wypowiedzi za model (*pre-filling*). |
| **Działanie** | Wykorzystuje fakt, że AI nie może „cofnąć” raz napisanego słowa. |
| **Zastosowanie** | Skupienie uwagi agenta na konkretnych narzędziach (np. tylko przeglądarce). |
| **Status** | Eksperymentalne (oznaczone jako *deprecated* w API Anthropic). |

### Jak to działa w praktyce?

*   **Wymuszony start:** System dopisuje frazę taką jak `<tool_call>{"name": "browser_`.
*   **Ograniczenie wyboru:** Model „myśli”, że sam zaczął wywoływać narzędzie przeglądarki i musi dokończyć tę akcję.
*   **Tymczasowość:** Blokada jest zdejmowana, gdy sesja (np. przeglądanie stron) dobiegnie końca.

### Dlaczego to ważne?

Mimo że ta konkretna metoda staje się rzadziej dostępna, pokazuje ona, że w budowaniu AI **kreatywność jest kluczowa**. Nawet nietypowe podejścia, jak te z projektu Manus czy .txt, mogą skutecznie rozwiązywać złożone problemy logiczne. **Mniej swobody dla modelu często oznacza lepszą precyzję w wykonaniu zadania**.

## Planowanie i monitorowanie postępów

Zarządzanie uwagą agenta AI przypomina **pracę szefa kuchni w trakcie intensywnego serwisu**. Bez jasnej listy zamówień i planu działania, nawet najlepszy kucharz może pogubić się w składnikach.

Oto kluczowe techniki pomagające modelom utrzymać koncentrację:

### Metody kierowania uwagą

*   **Listy zadań (To-do lists):** Model zapisuje kroki do wykonania i „odhacza” je po kolei. Działa to jak **GPS dla myśli** – przypomina, gdzie agent jest i dokąd zmierza.
*   **Autostymulacja:** Gdy model sam generuje swoją listę zadań, silniej wpływa to na jego zachowanie niż instrukcje z zewnątrz. To jak **robienie notatek własnoręcznie** – lepiej zapamiętujemy to, co sami zapisaliśmy.
*   **Tryb planowania:** Specjalny stan pracy (często stosowany w narzędziach do kodowania), który narzuca konkretne zasady działania w danym momencie.

### Porównanie narzędzi uwagi

| Narzędzie | Jak działa? | Analogia |
| :--- | :--- | :--- |
| **Lista zadań** | Spisanie i aktualizacja kroków po każdej akcji. | **Lista zakupów** – zapobiega kupieniu zbędnych rzeczy i zapominaniu o mleku. |
| **Tryb planowania** | Dołączenie instrukcji o aktualnym trybie pracy do wiadomości. | **Tabliczka „Nie przeszkadzać”** – jasno określa, jakie zasady panują w tym momencie. |
| **Interfejs (UI)** | Wyświetlanie planu w oknie programu, nie tylko w kodzie. | **Tablica wyników** – pozwala i użytkownikowi, i modelowi widzieć postępy na bieżąco. |

### Dlaczego to jest ważne?
Modele AI, mimo swojej mocy, potrafią „zapomnieć” o celu w trakcie długich zadań. Systematyczne powtarzanie priorytetów poprzez listy zadań pełni rolę **kotwicy**, która utrzymuje uwagę modelu tam, gdzie jest ona najbardziej potrzebna.

## Współdzielenie informacji pomiędzy wątkami

Wyobraź sobie system agentów jako **biuro z wieloma pokojami**. Każdy "pokój" to oddzielna **sesja**, do której dostęp mają tylko wyznaczeni pracownicy (agenci). Dzięki temu informacje nie wyciekają do niepowołanych osób.

Oto jak zorganizowana jest ta przestrzeń pracy:

### 📂 Co znajduje się w przestrzeni agenta?

Agent nie tylko "rozmawia", ale też zarządza plikami i notatkami, aby utrzymać kontekst pracy.

| Rodzaj zawartości | Źródło / Przeznaczenie |
| :--- | :--- |
| **Załączniki** | Przesłane przez użytkownika. |
| **Notatki** | Kontekst i podsumowania sesji. |
| **Dokumenty publiczne** | Wyniki pracy generowane dla użytkownika. |
| **Dokumenty wewnętrzne** | Informacje wymieniane między agentami. |

### 🛠️ Zasady współpracy (Analogia Biurowa)

Wewnątrz jednej sesji może pracować wielu sub-agentów. Aby uniknąć chaosu, stosuje się ścisłe reguły:

*   **Prywatne biurko (`notes` i `outbox`):** Każdy agent ma swoje miejsce, w którym może swobodnie pisać i przygotowywać dokumenty.
*   **Skrzynka odbiorcza (`inbox`):** Tylko **Główny Agent (Root)** ma prawo tu "wkładać" listy. Pełni on rolę menedżera, który przekazuje zadania i dokumenty dalej.
*   **Archiwum:** Dobrą praktyką jest segregowanie wszystkich materiałów według **konkretnych dat**, co ułatwia późniejsze odnalezienie informacji.

### 💡 Kluczowe zasady

*   **Bezpieczeństwo:** Izolacja sesji uniemożliwia agentom dostęp do materiałów innych użytkowników.
*   **Elastyczność:** Struktura nie musi być skomplikowana – powinna być dopasowana do konkretnych potrzeb Twojego systemu.
*   **Współdzielenie:** Nawet jeśli system korzysta z zaawansowanych baz danych, agenci często używają prostych plików tekstowych do szybkiej nawigacji i przekazywania wiedzy.