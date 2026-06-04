# Techniki łączenia modelu z narzędziami

## Zasady łączenia modelu językowego z narzędziami

Oto uproszczony przewodnik po tym, jak model językowy (LLM) korzysta z narzędzi (tzw. **Function Calling**).

### 1. Istota działania: Mózg w słoiku
Model językowy sam w sobie **nie potrafi nic zrobić** (nie wejdzie do Internetu, nie usunie pliku). Jest jak geniusz zamknięty w słoiku, który może tylko pisać instrukcje na kartkach (JSON).

### 2. Proces w 5 krokach: Analogia do Restauracji

| Krok | Co robi system? | Analogia (Restauracja) |
| :--- | :--- | :--- |
| **1. Zapytanie** | Użytkownik zadaje pytanie (np. o pogodę). | Składasz zamówienie u kelnera. |
| **2. Menu** | Model dostaje listę dostępnych narzędzi (ich opisy i nazwy). | Kelner pokazuje Ci menu z listą dań. |
| **3. Zamówienie** | Model wybiera narzędzie i wypisuje instrukcję (JSON). | Kucharz decyduje, jakich składników potrzebuje. |
| **4. Dostawa** | Kod aplikacji wykonuje funkcję i zwraca wynik do modelu. | Pomocnik przynosi składniki do kuchni. |
| **5. Serwowanie** | Model analizuje dane i daje finalną odpowiedź. | Dostajesz gotowe danie na stół. |

### 3. Kluczowe fakty ("Mniej znaczy lepiej")

*   **Dwa podejścia:** Uzyskanie odpowiedzi wymaga zazwyczaj **dwóch zapytań** do modelu (najpierw wybór narzędzia, potem analiza wyniku).
*   **Pamięć podręczna:** Definicje wszystkich narzędzi są wysyłane przy **każdym** pytaniu, co zużywa miejsce w pamięci (kontekst) i kosztuje.
*   **Precyzja ma znaczenie:** Nazwa i opis narzędzia muszą być jasne. Jeśli nazwiesz młotek "narzędziem do wszystkiego", model użyje go do wkręcania śrub.
*   **Obsługa błędów:** Jeśli narzędzie zawiedzie, model dostaje informację o błędzie i może spróbować innej drogi lub przeprosić użytkownika.
*   **Bezpieczeństwo:** Model operuje tylko tam, gdzie pozwoli mu kod aplikacji (np. w jednym konkretnym folderze).

## Function Calling oraz natywne oraz własne narzędzia

Oto uproszczone zestawienie narzędzi AI (tzw. Function Calling):

### Gotowce (Natywne) vs. Własne (DIY)

| Cecha | Narzędzia Natywne | Narzędzia Własne |
| :--- | :--- | :--- |
| **Co to?** | Funkcje wbudowane przez dostawcę (np. Google, PDF, kod). | Funkcje, które sam napiszesz od zera. |
| **Zaleta** | **Wygoda:** Włączasz i działa. | **Kontrola:** Działają dokładnie tak, jak chcesz. |
| **Wada** | Mało opcji konfiguracji. | Wymagają więcej pracy programistycznej. |

**Analogia:**
*   **Narzędzia natywne** są jak **klimatyzacja w nowym aucie** — po prostu jest i działa, ale nie zmienisz jej konstrukcji.
*   **Narzędzia własne** są jak **zbudowanie własnego systemu audio** — wymaga pracy, ale gra dokładnie taką muzykę, jaką lubisz.

### Kluczowe wnioski:
*   **Mix & Match:** Nie musisz wybierać. Możesz używać obu typów jednocześnie.
*   **Przykład współpracy:** Model najpierw sprawdza coś w internecie (narzędzie natywne), a potem zapisuje to w Twoim prywatnym systemie plików (narzędzie własne).
*   **Wybór należy do Ciebie:** To Ty decydujesz, ile kontroli chcesz oddać maszynie, a ile zachować dla siebie.

## Dobre praktyki opisywania schematów i ich właściwości

Projektowanie narzędzi dla modeli językowych (LLM) różni się od tworzenia standardowego API dla programistów. Głównym celem jest **uproszczenie komunikacji**, aby model działał skutecznie i bezpiecznie.

Oto kluczowe zasady w skróconej formie:

### API vs. Narzędzia dla AI
| Cecha | Tradycyjne API | Narzędzia dla LLM |
| :--- | :--- | :--- |
| **Odbiorca** | Programista z dokumentacją | Model AI działający intuicyjnie |
| **Zakres danych** | Wszystkie parametry (1:1) | Tylko niezbędne informacje |
| **Liczba kroków** | Wiele drobnych zapytań | Skonsolidowane akcje (jeden krok) |

### Kluczowe zasady ("Mniej, znaczy lepiej")

*   **Nie kopiuj API 1:1:** Programiści projektują API dla deterministycznego kodu, a model potrzebuje narzędzi zrozumiałych bez instrukcji.
    *   *Analogia:* To jak dawanie kierowcy instrukcji budowy silnika, zamiast kierownicy i pedałów.
*   **Usuń "szum" informacyjny:** Pomijaj rzadkie funkcje (np. usuwanie projektów) oraz techniczne detale (identyfikatory wewnętrzne, hashe), których model i tak nie użyje.
    *   *Analogia:* Menu w restauracji pokazuje nazwy dań, a nie ich kody magazynowe.
*   **Grupuj akcje (Kombajny zamiast części):** Zamiast zmuszać model do pobierania osobno statusów, etykiet i zespołów, stwórz jedno narzędzie, np. `workspace_metadata`.
    *   *Analogia:* Zamiast kupować każdą śrubkę osobno, kupujesz gotowy zestaw montażowy.
*   **Precyzyjne nazewnictwo:** Nazwa musi być unikatowa i jasna. Użyj `send_email` zamiast ogólnego `send`.
    *   *Analogia:* Przycisk na pilocie "Głośniej" jest lepszy niż przycisk "Zmień".
*   **Bezpieczeństwo przede wszystkim:** Model nie powinien mieć uprawnień do krytycznych zmian, jak zmiana własnego ID użytkownika. Takie rzeczy musi kontrolować kod aplikacji.
    *   *Analogia:* Gość hotelowy dostaje klucz do pokoju, ale nigdy do sejfu managera.
*   **Perfekcyjna obsługa błędów:** Komunikaty o błędach muszą być dla modelu czytelniejszą wskazówką niż dla człowieka, aby wiedział, jak poprawić swoje zapytanie.

**Pamiętaj:** Dobre narzędzie to takie, które model wybierze i obsłuży poprawnie w jak najmniejszej liczbie kroków.

## Ustalanie domyślnych wartości, walidacji oraz zabezpieczeń

Projektowanie narzędzi dla AI powinno opierać się na zasadzie: **maksimum efektu, minimum wysiłku**. Oto jak stworzyć narzędzia, które „wybaczają” błędy i prowadzą agenta za rękę:

### Zasady inteligentnego narzędzia

| Zasada | Co robić? | Analogia |
| :--- | :--- | :--- |
| **Domyślne wartości** | Ustawiaj znane dane (np. ID użytkownika, strefa czasowa) automatycznie. | Jak nawigacja, która sama ustawia „dom” jako cel, byś nie musiał wpisywać adresu. |
| **Elastyczne wejście** | Pozwól podać tę samą rzecz na różne sposoby (np. nazwa lub ID). | Jak pilot do TV, który ma i numerki, i przyciski „góra/dół”. |
| **Jasne błędy** | Zamiast „Błąd 400”, podaj instrukcję naprawy i konkretną wskazówkę. | Jak mapa, która mówi „skręć w lewo za 100m”, a nie tylko „jesteś poza trasą”. |
| **Podpowiadanie** | Jeśli AI zrobi literówkę, zasugeruj właściwą komendę. | Jak autokorekta w telefonie, która pyta „czy chodziło Ci o...?”. |

### Bezpieczeństwo i kontrola
Ponieważ AI może „halucynować” (zmyślać), przy ważnych zadaniach stosuj bezpieczniki:

*   **Potwierdzenie użytkownika:** Przy akcjach nieodwracalnych (np. wysłanie maila) zawsze pytaj o zgodę.
*   **Białe listy:** Ogranicz działanie tylko do zaufanych adresów lub kontaktów.
*   **Tryb „Dry-run” (na sucho):** Pozwól agentowi najpierw sprawdzić, co się stanie, zanim faktycznie zatwierdzi zmianę.
*   **Izolacja kontekstu:** W jednej sesji daj agentowi dostęp tylko do jednej grupy zasobów, by nie „namieszał” w całym systemie.

## Połączenie modelu z usługami przez API, proxy oraz CLI

Oto skrócone zestawienie sposobów łączenia modeli językowych (AI) z narzędziami, wyjaśnione za pomocą prostych analogii:

### Porównanie metod integracji

| Metoda | Jak to działa? | Analogia | Kluczowa cecha |
| :--- | :--- | :--- | :--- |
| **API** | Bezpośrednie połączenie z usługą. | **Kuchnia bez etykiet.** Kucharz (AI) musi czytać grubą książkę (dokumentację), by wiedzieć, co jest w którym słoiku. | Mała kontrola, duży chaos informacyjny. |
| **CLI** | Agent używa terminala i komend. | **Scyzoryk z instrukcją.** Narzędzie ma wbudowaną pomoc (`--help`), więc AI szybko wie, jak go użyć. | Elastyczne, ale trudne do stosowania na dużą skalę. |
| **MCP / Function Calling** | Gotowy zestaw "paczek" z narzędziami. | **Menu w restauracji.** AI wybiera tylko z listy przygotowanych dań. Nie musi zaglądać na zaplecze. | Największa kontrola i bezpieczeństwo. |

### Dlaczego "surowe" API to zły pomysł?
*   **Brak kontekstu:** Nawet człowiek ma problem z użyciem API bez instrukcji. Model AI gubi się w nim jeszcze łatwiej.
*   **Trudna automatyzacja:** Próby automatycznego tłumaczenia API na język zrozumiały dla AI często zawodzą i wymagają nadzoru człowieka.

### Rozwiązanie: Warstwa pośrednia (Proxy)
Jeśli nie możesz zmienić starego API, stwórz **Proxy** (np. serwer **MCP**). 
*   Działa to jak **tłumacz**, który stoi między AI a usługą.
*   Pozwala filtrować, łączyć lub blokować wybrane akcje, dbając o porządek.

**Podsumowując:** Zamiast rzucać AI na głęboką wodę bezpośrednich połączeń (API), lepiej dać mu "gotowe menu" (MCP) lub narzędzia, które same potrafią się wytłumaczyć (CLI).

## Personalizacja narzędzi dzięki Augmented Function Calling

**Augmented Function Calling** to sposób na „podpowiadanie” sztucznej inteligencji, jak ma korzystać z dostępnych narzędzi, aby wynik zawsze pasował do Twoich preferencji.

**Analogia:** To jak **przepis na ulubioną kawę** zapisany w kawiarni. Nie musisz za każdym razem mówić: „poproszę kawę, ma być czarna, w dużym kubku i z jedną kostką cukru”. Mówisz tylko „kawa”, a barman (AI) zagląda do Twoich notatek i robi ją dokładnie tak, jak lubisz.

### Jak to działa w praktyce?

| Metoda | Jak to działa? | Kto decyduje? |
| :--- | :--- | :--- |
| **Statyczna** | Wybierasz konkretną komendę lub klikasz przycisk. | **Ty** |
| **Dynamiczna** | Model sam decyduje, kiedy użyć danej umiejętności na podstawie opisu. | **AI** |
| **Hybrydowa** | Połączenie obu metod – zależnie od sytuacji. | **Ty i AI** |

### Najważniejsze korzyści:
*   **Mniej pisania:** Zamiast opisywać styl obrazu za każdym razem (np. „szkic robota”), AI automatycznie dodaje instrukcję o stylu do Twojego krótkiego hasła.
*   **Personalizacja:** Narzędzia (nazywane też *Skills* lub *Commands*) dostosowują się do Twojego sposobu pracy.
*   **Inteligentne zarządzanie:** Agent AI może nie tylko używać narzędzi, ale też sam je tworzyć, aktualizować lub wyłączać, gdy nie są potrzebne.

W skrócie: to **wzbogacanie Twoich poleceń** o dodatkowy kontekst, który sprawia, że AI staje się bardziej domyślne i skuteczne.

## Zasady projektowania workflow oraz logiki agentów

Oto skrócone zestawienie kluczowych pojęć dotyczących architektury AI, przygotowane w prosty sposób:

### 1. Workflow vs Agent AI – Czym się różnią?

| Cecha | **Workflow** (Przepływ) | **Agent AI** |
| :--- | :--- | :--- |
| **Analogia** | **Pociąg**: Jedzie po wyznaczonych torach, przystanek po przystanku. | **Taksówkarz**: Zna cel, ale sam wybiera najlepszą trasę i reaguje na korki. |
| **Logika** | Sztywny schemat i przewidywalność. | Ciągłe podejmowanie decyzji w pętli. |
| **Zaleta** | Wysoka stabilność procesu. | Ogromna elastyczność i radzenie sobie z nowymi problemami. |
| **Ryzyko** | Trudno go zmienić w trakcie. | Trudniej przewidzieć końcowy efekt. |

---

### 2. Z czego składa się system agentowy? (tzw. Agent Harness)
Budowa takiej aplikacji to w 80% klasyczne programowanie, a w 20% nowa logika AI. Kluczowe elementy to:

*   **Mózg**: Model językowy (LLM) sterujący całością.
*   **Ręce (Narzędzia)**: Możliwość korzystania z wyszukiwarki, plików czy e-maila.
*   **Pamięć**: Krótkotrwała (bieżąca rozmowa) i długofalowa (baza wiedzy).
*   **Instrukcje**: Zasady i umiejętności, które nadajemy modelowi.
*   **Warsztat (Harness)**: Bezpieczne środowisko (sandbox), w którym model wykonuje kod i zarządza danymi.

---

### 3. Szybka decyzja: Co wybrać?

*   **Wybierz Workflow**, jeśli proces jest stały, a pomyłka nie wchodzi w grę.
*   **Wybierz Agenta**, jeśli zadanie jest otwarte, a warunki często się zmieniają.
*   **Zrezygnuj z LLM**, jeśli potrzebujesz 100% skuteczności bez nadzoru człowieka – sztuczna inteligencja z natury bywa nieprzewidywalna.

## Refleksja oraz interpretacja zapytań w dynamicznym kontekście

Oto skrócona wersja tekstu, wyjaśniająca proces „myślenia” AI (reasoning) oraz sposoby zarządzania nim.

### Czym jest reasoning?
To proces, w którym AI **„myśli na głos”**, zanim udzieli odpowiedzi. Można to porównać do szefa kuchni, który najpierw czyta cały przepis i planuje pracę, zamiast od razu siekać warzywa.

*   **Zaleta:** Znacznie zwiększa skuteczność przy trudnych zadaniach.
*   **Wady:** AI może „przekombinować” przy prostych pytaniach, a nawet drobna zmiana kolejności informacji w zapytaniu potrafi je zdezorientować.
*   **Kontrola:** Możemy decydować, jak bardzo AI ma się wysilać (ustalając budżet „czasu na myślenie”).

---

### Strategie wspierające agentów AI
Samo myślenie modelu to za mało. Aby agenty były skuteczne, stosujemy dodatkowe metody:

| Metoda | Na czym polega? | Analogia |
| :--- | :--- | :--- |
| **Planowanie** | Tworzenie i aktualizowanie listy zadań. | **Lista zakupów** – przypomina, co jest do zrobienia, żeby o niczym nie zapomnieć. |
| **Odkrywanie** | Przeszukiwanie zewnętrznych plików i baz wiedzy. | **Szukanie w segregatorze** – AI sprawdza dane, których nie ma w swojej „głowie”. |
| **Przekierowanie** | Sterowanie uwagą modelu na konkretne zadanie. | **Klapki na oczach konia** – skupienie się wyłącznie na jednym narzędziu (np. przeglądarce). |
| **Uśrednianie** | Łączenie odpowiedzi z kilku różnych modeli. | **Konsylium lekarskie** – zapytanie kilku ekspertów, by uzyskać najtrafniejszą diagnozę. |

**Podsumowując:** „Myślenie” modelu jest ważne, ale kluczem do sukcesu jest inteligentne sterowanie jego zachowaniem bez narzucania mu zbyt sztywnych ram.

## Transformacja oraz wzbogacanie zapytań przez LLM

Oto skrócone i uproszczone wyjaśnienie transformacji zapytań przez agentów AI:

### **Agent AI jako Twój inteligentny bibliotekarz**

Aby agent skutecznie znajdował informacje w gąszczu dokumentów, stosuje trzy główne strategie:

*   **Tłumaczenie intencji (Transformacja)**
    *   **O co chodzi:** Użytkownik często pyta ogólnie. Agent zamienia to na konkretne synonimy i powiązane hasła, aby dopasować zapytanie do treści plików.
    *   **Analogia:** To jak proszenie o „coś na ochłodę” – inteligentny kelner wie, że może chodzić o lody lub zimną lemoniadę, nawet jeśli nie wymieniłeś ich z nazwy.

*   **Korzystanie z mapy (Indeksowanie)**
    *   **O co chodzi:** Zamiast kazać agentowi przeszukiwać wszystko po omacku, dajemy mu „spis treści” (np. plik `_index.md`). Lepiej trzymać mapę w osobnym pliku niż w skomplikowanej instrukcji głównej.
    *   **Analogia:** Zamiast uczyć się na pamięć układu wszystkich półek w wielkim magazynie, lepiej mieć w ręku prosty plan, który mówi, gdzie zacząć szukać.

*   **Pytanie o drogę (Doprecyzowanie)**
    *   **O co chodzi:** Jeśli agent ma do wyboru wiele narzędzi (np. Twoje pliki lub internet), powinien najpierw dopytać użytkownika o szczegóły, zamiast zgadywać.
    *   **Analogia:** To jak GPS, który pyta „Czy chcesz trasę najszybszą, czy bez autostrad?”, zanim wyznaczy drogę do celu.

### **Podsumowanie strategii**

| Co robimy? | Dlaczego? | Korzyść |
| :--- | :--- | :--- |
| **Używamy synonimów** | Słowa użytkownika rzadko pasują 1:1 do dokumentów. | Skuteczniejsze wyszukiwanie. |
| **Tworzymy pliki indeksu** | Agent musi znać kontekst Twoich prywatnych danych. | Szybsza nawigacja po bazie wiedzy. |
| **Skracamy instrukcje** | Przeładowany agent działa gorzej. | Lepsza wydajność i mniejszy chaos. |

## Techniki optymalizacji szybkości i skuteczności narzędzi

Oto skrócony przewodnik po optymalizacji agentów AI, wyjaśniony prostym językiem:

### Dlaczego szybkość ma znaczenie?
Każda akcja agenta to dodatkowe zapytanie do „mózgu” (LLM), co wydłuża czas oczekiwania. Jeśli narzędzia zewnętrzne (np. generator obrazów) działają wolno, użytkownik może czekać nawet kilka minut.

### Strategie optymalizacji

| Technika | Co to daje? | Analogia |
| :--- | :--- | :--- |
| **Prompt Cache** | Szybszy start i niższe koszty dzięki zapamiętywaniu stałych instrukcji. | Masz już zapisaną listę zakupów, zamiast pisać ją od zera za każdym razem. |
| **Łączenie akcji** | Wykonujesz kilka zadań jednym ruchem. | Idziesz do supermarketu, by kupić wszystko naraz, zamiast odwiedzać pięć różnych sklepów. |
| **Praca równoległa** | Agent robi kilka niezależnych rzeczy jednocześnie. | Kilku kucharzy przygotowuje różne dania w tym samym czasie, zamiast czekać na siebie nawzajem. |
| **Mniejsze modele** | Proste zadania zlecamy szybszym, tańszym modelom. | Po zakupy jedziesz rowerem, a nie wielką ciężarówką – jest szybciej i zwrotniej. |
| **Cięcie kontekstu** | Przesyłanie tylko tego, co niezbędne. | Mówisz tylko konkrety, zamiast opowiadać całą historię życia przy zamawianiu kawy. |
| **Sprytne przekazywanie danych** | Przesyłanie plików (np. raportów) zamiast ich „przepisywania” przez AI. | Wysyłasz komuś paczkę, zamiast opisywać mu przez telefon każdy przedmiot, który jest w środku. |

**Kluczowa zasada:** Im mniej zapytań do modelu i im krótsze odpowiedzi, tym sprawniej działa Twój agent.

## Podstawy zarządzania kontekstem w workflow i logice agentów

Oto skrócone zasady **Context Engineeringu** (zarządzania „pamięcią” AI) w logice aplikacji:

### Strategie zarządzania informacjami

| Co robimy? | Dlaczego? | Analogia |
| :--- | :--- | :--- |
| **Mrozimy instrukcje** | Zmienne dane w prompcie systemowym (np. data) niszczą wydajność (cache). | Nie drukuj nowego menu w restauracji za każdym razem, gdy klient pyta o godzinę. |
| **Stosujemy pliki** | Przechowywanie danych w plikach pozwala agentowi czytać tylko to, co ważne, oszczędzając miejsce. | Zamiast trzymać wszystkie papiery na biurku, schowaj je do segregatora i zaglądaj tam w razie potrzeby. |
| **Kompaktujemy wątek** | Gdy rozmowa jest za długa, AI tworzy podsumowanie, by nie stracić wątku. | Zrób krótką notatkę z 500-stronnicowej książki, aby pamiętać główne punkty. |

### Kluczowe zasady („Mniej znaczy lepiej”)

*   **Cache to priorytet:** Stałość instrukcji i historii rozmowy to klucz do szybkości i niższych kosztów.
*   **Nie ucinaj, lecz streszczaj:** Zamiast usuwać stare wiadomości, lepiej je podsumować lub zapisać w pliku.
*   **Inteligentne czytanie:** Narzędzia (np. wyszukiwarka) powinny dostarczać agentowi tylko istotne fragmenty danych, a nie całe strony tekstu.
*   **Logika, nie interfejs:** Skupiamy się na tym, jak aplikacja zarządza danymi „pod maską”, a nie na tym, jak użytkownik klika w konsoli.

## Dynamiczne listy narzędzi i zasobów wiedzy

Wyobraź sobie, że Twój agent AI to pracownik przy biurku. Jeśli zasypiesz go setkami narzędzi naraz, zabraknie mu miejsca na samą pracę i zacznie się gubić.

Oto jak zarządzać jego „przestrzenią roboczą” efektywniej:

### 1. Złota zasada: Mniej znaczy więcej
*   **Limit:** Staraj się, aby jeden agent miał dostęp do maksymalnie **10–15 narzędzi**.
*   **Problem:** Zbyt duża liczba instrukcji (schematów) niepotrzebnie zużywa pamięć (kontekst) i rozprasza model.

### 2. Dwie strategie porządkowania pracy

| Metoda | Na czym polega? | Analogia |
| :--- | :--- | :--- |
| **Sub-agenci** | Dzielisz zadanie na mniejszych specjalistów. Każdy ma swoje „okno” i zestaw umiejętności, a wynikami wymieniają się przez pliki. | Zamiast jednej osoby od wszystkiego, zatrudniasz kucharza, kierowcę i księgowego w osobnych pokojach. |
| **Progressive Disclosure** | Narzędzia są ukryte w katalogach. Agent widzi tylko podstawy, a resztę „odkrywa” i uruchamia za pomocą kodu (np. Daytona) tylko gdy są potrzebne. | Zamiast trzymać wszystkie przyprawy na blacie, chowasz je do szafki. Wyciągasz konkretny słoik dopiero, gdy czytasz przepis. |

### 3. Pamiętaj o „Instrukcji Obsługi”
Agent początkowo **„nie wie, o czym wie”**. Jeśli schowasz narzędzia zbyt głęboko, może uznać, że nie potrafi wykonać zadania.

*   **Rozwiązanie:** Zawsze dawaj agentowi podstawowe wskazówki lub „mapę” tego, jakie zasoby posiada i jak może je odkryć.

## Obsługa wymaganych danych wejściowych, uprawnień oraz zgody

Sztuczna inteligencja (AI) jest jak **utalentowany, ale roztargniony asystent** – może pomóc, ale czasem „zmyśla” (halucynuje) i robi błędy. Aby nad nią zapanować, musimy stosować sztywne ramy, czyli **interfejsy graficzne**.

Oto jak bezpiecznie współpracować z agentem AI:

| Wyzwanie | Rozwiązanie | Dlaczego? | Analogia |
| :--- | :--- | :--- | :--- |
| **Błędne dane** | **Formularz** zamiast rozmowy | AI może pomylić cyfry lub nazwiska wyciągane z tekstu. | **Menu w restauracji:** Zaznaczasz konkretne danie, zamiast liczyć, że kelner dobrze opisze kucharzowi Twój apetyt. |
| **Pochopne działanie** | **Przyciski "Zatwierdź"** | AI może zignorować Twoje "Cofnij!" napisane w czacie. | **Przycisk "Wyślij przelew":** Pieniądze wyjdą dopiero, gdy Ty klikniesz, a nie gdy bot uzna, że „już czas”. |
| **Dostęp do danych** | **Blokady w kodzie** | AI nie może samo decydować, czyje pliki widzi. | **Klucz do pokoju:** Dajesz asystentowi klucz tylko do jednego biura, zamiast prosić go, by nie zaglądał do innych. |

**Ważne:** Interfejs daje Ci pewność, że akcja zostanie wykonana dokładnie tak, jak widzisz to na ekranie. Uważaj jednak na interfejsy dynamiczne (generowane na bieżąco przez AI), bo tam model wciąż może dodać ukryte pola lub pomylić ich opisy.

## Rola problemu prompt injection oraz jailbreakingu

Oto skrócone i uproszczone zestawienie kluczowych zagrożeń związanych z agentami AI:

### Główne zagrożenia

| Zagrożenie | Co to oznacza? | Prosta analogia |
| :--- | :--- | :--- |
| **Prompt Injection** | Przejęcie kontroli nad modelem i zmuszenie go do zignorowania instrukcji właściciela. | Jak **„hipnoza”**, która sprawia, że asystent nagle zaczyna słuchać poleceń obcej osoby zamiast Twoich. |
| **Jailbreaking** | Omijanie wbudowanych zabezpieczeń stworzonych przez producenta. | Jak **włamywacz**, który znajduje tylne wejście do budynku w mniej niż 24 godziny. |

### Dlaczego to problem?
*   **Brak tarczy:** Obecnie nie istnieją skuteczne techniki obrony przed tymi atakami.
*   **Ryzyko kradzieży danych:** Agent z dostępem do e-maila i kalendarza może wysłać Twoje prywatne plany obcej osobie, jeśli ta o to „ładnie poprosi”.
*   **Naiwność AI:** To jak **sekretarka**, która oddaje klucze do sejfu każdemu, kto napisze przekonujący list.

### Jak bezpiecznie korzystać z AI?
*   **Zasada „bezpiecznego podwórka”:** Ograniczaj dostęp agentów do krytycznych systemów i danych.
*   **Wczesne planowanie:** Bezpieczeństwo musi być fundamentem projektu, a nie dodatkiem na koniec.
*   **Ostrożność:** Nie używaj AI w miejscach, gdzie pomyłka może doprowadzić do poważnego wycieku informacji.