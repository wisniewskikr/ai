# Projektowanie własnej bazy wiedzy dla AI

## Film do lekcji

Wyobraź sobie AI jako genialnego kucharza – bez składników (kontekstu) nie przygotuje on Twojego ulubionego dania. W systemach agentowych to właśnie **kontekst** zamienia ogólne pytania w precyzyjne działania.

| Typ pracy | Gdzie AI szuka wiedzy? | Analogia |
| :--- | :--- | :--- |
| **Programowanie** | Kod źródłowy i pliki projektu. | Przeglądanie notatek poprzedniego mechanika przed naprawą. |
| **Zadania ogólne** | Instrukcje systemowe i bazy wiedzy. | Brief od klienta i dostęp do firmowego archiwum. |

### Jak wzmocnić skuteczność agenta?
Gdy sam kod lub prosta rozmowa to za mało, stosujemy specjalne narzędzia wspierające:
*   **Plany:** Mapy drogowe, które prowadzą AI przez złożone zadania.
*   **Specyfikacje:** Dokładne opisy tego, co chcemy osiągnąć.
*   **Umiejętności:** Powtarzalne schematy działań, które AI może wykorzystać wielokrotnie.

### Dlaczego to jest ważne?
W sytuacjach, gdzie nie mamy kodu źródłowego, użyteczność AI zależy wyłącznie od **zarządzania kontekstem**. Tworzenie baz wiedzy i sprawnych systemów plików to obecnie największa wartość, jaką możemy wydobyć z technologii agentowych. To dzięki nim AI rozumie nasze intencje, nawet gdy nie wyrażamy ich wprost.

## Rola budowania i generowania prywatnej bazy wiedzy

Budowanie bazy wiedzy dla AI przypomina **urządzanie wspólnego mieszkania z bardzo inteligentnym, ale nowym współlokatorem**. Musisz mu pokazać, gdzie leżą klucze i jakie masz zasady, aby mógł Ci skutecznie pomagać.

Oto prosty przewodnik, jak to zrobić:

### 1. Twoja "Mapa Mieszkania" (Struktura Bazy)

Zamiast wrzucać wszystko do jednego worka, podziel swoją wiedzę na strefy:

| Przestrzeń | Co zawiera? | Rola Agenta AI |
| :--- | :--- | :--- |
| **Profil** | Twoje wartości, nawyki, cele. | Pamięta, kim jesteś i co jest dla Ciebie ważne. |
| **Świat** | Informacje o ludziach, miejscach i narzędziach. | Pomaga Ci poruszać się w Twoim otoczeniu. |
| **Tworzenie** | Twoje projekty, teksty i eksperymenty. | Czerpie kontekst z Twoich prac, by pisać w Twoim stylu. |
| **Operacje** | Opisy procesów i wyniki researchu. | Wykonuje konkretne zadania i gromadzi dane. |
| **System** | Automatyczne statusy i metadane. | Samodzielnie aktualizuje informacje techniczne. |

### 2. Złote zasady budowania

*   **Zacznij od "kawałka podłogi":** Nie buduj wszystkiego naraz. Wybierz **jedną aktywność**, którą lubisz (np. hobby lub codzienny newsletter) i od niej zacznij.
*   **Notatki jak klocki LEGO:** Twórz "atomowe" (krótkie i konkretne) notatki. Dla AI są one jak pojedyncze klocki, z których łatwiej mu coś zbudować niż z wielkich bloków tekstu.
*   **Rozmowa zamiast planowania:** Nie trać tygodni na projektowanie idealnej bazy. Otwórz czat z AI i wspólnie wypracujcie pierwsze szablony.
*   **Działanie rodzi pomysły:** Najlepsze rozwiązania nie pojawią się w Twojej głowie przed pracą, ale w jej trakcie.

### 3. Jak zacząć (bez programowania)?

1.  **Zrób listę:** Spisz domeny, które regularnie odwiedzasz i powtarzalne czynności.
2.  **Wybierz obszar:** Zdecyduj, w czym AI ma Ci pomóc, a co chcesz robić wyłącznie sam.
3.  **Podłącz narzędzia:** Możesz zacząć od zwykłego folderu z notatkami i podłączyć go do agenta (np. Claude Code), by wspólnie tworzyć pierwsze procesy.

Pamiętaj: **Mniej znaczy lepiej**. Twoja baza ma być użyteczna dla Ciebie i czytelna dla Twojego cyfrowego asystenta.

## Zalety i ograniczenia formatu markdown

Markdown to format, który stał się **"językiem ojczystym" dla sztucznej inteligencji**. Dzięki swojej prostocie pozwala maszynom na błyskawiczne przeszukiwanie i tworzenie treści.

### Porównanie narzędzi: Markdown vs. Notion/Google Docs

Wybór narzędzia przypomina wybór między **scyzorykiem (Markdown)** a **biurem coworkingowym (Notion/Docs)**. Scyzoryk jest wszechstronny i zawsze pod ręką, ale w biurze łatwiej pracować w grupie.

| Cecha | Markdown (.md) | Notion / Google Docs |
| :--- | :--- | :--- |
| **Główna zaleta** | Pełna kontrola i elastyczność | Praca zespołowa w czasie rzeczywistym |
| **Współpraca** | Trudniejsza w dużym zespole | Zaawansowane uprawnienia i współdzielenie |
| **Relacja z AI** | Naturalne środowisko dla agentów | Ograniczone wsparcie formatu |
| **Transformacja** | Bardzo łatwa (zwykły tekst) | Trudna (utrata danych przy konwersji) |

### Najlepsze praktyki pracy z AI

Aby wycisnąć z Markdowna jak najwięcej, warto stosować poniższe zasady:

*   **Obrazy jako linki, nie pliki:** Lokalne zdjęcia są jak schowane w szufladzie – AI ich nie zobaczy. Używaj linków URL, aby agenci mogli je cytować i przetwarzać.
*   **Wzbogacanie treści:** Istnieją koncepcje (np. *with-md*), które dodają ukryte informacje dla agentów, czyniąc dokumenty jeszcze "inteligentniejszymi".
*   **Zarządzanie dostępem:** Otwarte linki dają wolność, ale wymagają jasnych zasad i kontroli wygasania, aby dane były bezpieczne.

**Wniosek:** Stosuj Markdown wszędzie tam, gdzie pracujesz z AI, ale wybieraj Google Docs lub Notion, gdy priorytetem jest jednoczesna praca wielu osób.

## Różnice pomiędzy bazą wiedzy a pamięcią długoterminową

Wyobraź sobie, że Twój agent AI jest jak **nowy pracownik z innej planety**. Choć zna język, nie zna Twoich znajomych, historii firmy ani domyślnych znaczeń, które dla Ciebie są oczywiste. Aby pracował skutecznie, musisz wypełnić „luki wiedzy” w swoich notatkach.

### Dlaczego AI Cię nie rozumie?

| To, co piszesz (Dla Ciebie jasne) | To, co widzi Agent (Druga planeta) | Problem dla Agenta |
| :--- | :--- | :--- |
| „Projekt Orion” | Dowolna nazwa własna | Nie wie, czego dotyczy projekt ani gdzie szukać danych. |
| „Ostatnia rozmowa” | Nieokreślony punkt w czasie | Nie potrafi powiązać tego z konkretną notatką. |
| bit.ly/3xyz | Ciąg znaków | Nie widzi treści ukrytej pod skróconym linkiem. |
| Nowa wersja dokumentu | Zupełnie nowy plik | Nie wie, który dokument jest aktualny i co się zmieniło. |

### Główne bariery w komunikacji z Agentem

*   **Skróty myślowe:** Pomijamy informacje, które wydają nam się oczywiste, co dla agenta jest „dziurą” w danych.
*   **„Ślepe” linki:** Skrócone ścieżki lub brak opisów linków uniemożliwiają agentowi dotarcie do celu.
*   **Brak powtarzalności:** Jeśli agent wczyta tylko fragment dokumentu bez powiązanych nazwisk czy projektów, zgubi wątek.
*   **Zacieranie śladów:** Nadpisywanie starych wersji dokumentów sprawia, że agent traci dostęp do historii zmian.

### Złota zasada: „Mniej domysłów, więcej faktów”

Najważniejsza zmiana to tworzenie notatek według zasady **Zero Kontekstu**. Pisz tak, jakby czytelnik nie wiedział o Tobie i Twojej pracy absolutnie nic.

**Analogia:** Budowanie bazy wiedzy dla AI jest jak **stawianie drogowskazów w gęstej mgle**. Jeśli drogowskaz mówi tylko „Tam”, nikt nie trafi do celu. Musi mówić: „Do biura (Projekt Orion), 500 metrów prosto”.

## Korzystanie z modeli przy edycji notatek

Twoja baza wiedzy jest jak **prywatna biblioteka**. Ty jesteś **autorem**, który pisze książki, a AI jest Twoim **asystentem**, który dba o to, by leżały na właściwych półkach i miały równe marginesy.

Oto prosty podział ról, który pozwoli Ci zachować kontrolę nad Twoją wiedzą:

### Fundament: Podział Obowiązków

| Twoja Rola (Autor) | Rola AI (Asystent) |
| :--- | :--- |
| Tworzenie treści i sensu, | Formułowanie i formatowanie treści |
| Ustalanie głównych zasad | Pilnowanie porządku i struktury |
| Podejmowanie decyzji | Sugerowanie zmian i linkowanie |

---

### Jak AI może Ci pomóc? (Zasada "Mniej znaczy lepiej")

Zamiast pozwalać AI pisać za Ciebie, użyj go jako **inteligentnego kleju**, który łączy Twoje myśli:

*   **Transformacja:** AI może przepisać Twoje luźne notatki głosowe lub zdjęcia na czysty tekst, zachowując Twój sens.
*   **Szablony:** Dba o to, by każda notatka miała taką samą strukturę, zdejmując z Ciebie ten nudny obowiązek.
*   **Linkowanie:** To jak budowanie mostów między wyspami wiedzy – AI sugeruje powiązania, których mogłeś nie zauważyć.
*   **Walidacja i Audyt:** AI działa jak strażnik – sprawdza, czy trzymasz się swoich zasad i pomaga usunąć "szum" (zbędne notatki).
*   **Indeksowanie (MoC):** Tworzy "mapy treści", czyli spisy treści dla Twoich pomysłów.

---

### Dlaczego to ważne?

Stosowanie AI do generowania treści bez czytania ich jest jak budowanie domu z prefabrykatów, których nie sprawdziłeś – szybko tracisz orientację, a gdy coś pęknie, nie wiesz, jak to naprawić. 

**Główna zasada:** AI nie powinno tworzyć treści Twoich notatek, ale może tworzyć przestrzeń na ich komentowanie i organizację,. W ten sposób budujesz bazę wiedzy, która jest naprawdę Twoja, a nie tylko zbiorem wygenerowanych algorytmicznie danych.

## Połączenie z agentami

Wyobraź sobie, że Twój system to **nowoczesna biblioteka**, w której zamiast chaosu panuje idealny porządek, a bibliotekarze (agenci AI) dokładnie wiedzą, gdzie odłożyć każdą nową informację.

### 1. Fundament: Cyfrowy Ogród
Twoja wiedza jest uporządkowana w folderach, które stanowią mapę całego systemu.

| Folder | Zawartość (Analogia) |
| :--- | :--- |
| **Me / World** | Twoje osobiste notatki i dane o otoczeniu. |
| **Craft / System** | Twoje umiejętności i techniczne "serce" systemu. |
| **Ops** | "Instrukcje obsługi" dla Twoich agentów. |
| **Templates** | "Foremki", dzięki którym każda notatka ma ten sam kształt. |

### 2. Jak działają Agenci? (Zasada Foremki)
Zamiast improwizować, agent zachowuje się jak piekarz używający gotowych form.

*   **Sprawdzenie mapy:** Agent najpierw "rozgląda się", by zrozumieć strukturę.
*   **Wybór szablonu:** Korzysta z gotowych wzorców dla osób, miejsc czy narzędzi.
*   **Decyzja:** Na tej podstawie tworzy nowy wpis lub aktualizuje już istniejący.
*   **Precyzja:** Jedna notatka to często kilkanaście zapytań do AI, co gwarantuje najwyższą jakość.

### 3. Współpraca: Zespół Redakcyjny
W katalogu `workspace/ops` opisujesz procesy, które agenci wykonują wspólnie, np. codzienne wiadomości (**daily-news**). To jak praca w gazecie:

1.  **Research:** Agent nr 1 przeszukuje internet,.
2.  **Assemble:** Agent nr 2 składa informacje w całość.
3.  **Deliver:** Agent nr 3 dostarcza gotowy raport.

### Dlaczego to jest ważne?
*   **Skalowalność:** Im większa baza wiedzy, tym bardziej zyskujesz na jej spójności.
*   **Autonomia:** Agent, który potrafi nawigować po Twoich notatkach, może działać samodzielnie w tle,.
*   **Powtarzalność:** Kilka prostych plików tekstowych zamienia się w stabilny, codzienny proces.