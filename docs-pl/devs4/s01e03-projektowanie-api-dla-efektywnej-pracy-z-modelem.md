# Projektowanie API dla efektywnej pracy z modelem

## Cechy API wpływające na kształtowanie narzędzi 

Oto uproszczone zestawienie kluczowych cech API, które decydują o tym, jak dobrze „dogada się” z nim sztuczna inteligencja:

### Jak przygotować API dla AI? (Strategia: Prosto i konkretnie)

*   **Kompletność działań:** Upewnij się, że AI może wykonać wszystko, czego potrzebuje (np. nie tylko czytać, ale i tworzyć dane).
*   **Jasne etykiety (ID vs Nazwa):** AI musi wiedzieć, że gdy użytkownik mówi „Priorytet”, ma użyć konkretnego numeru identyfikacyjnego.
    *   *Analogia:* To jak w restauracji – kelner (AI) musi wiedzieć, że „danie dnia” to w systemie „pozycja nr 42”.
*   **Jednoznaczność:** Używaj tych samych nazw dla tych samych rzeczy (nie mieszaj np. `body` i `content`).
    *   *Analogia:* Nie nazywaj tego samego psa raz „Azorkiem”, a raz „Pusią”, bo AI się pogubi.
*   **Pełne odpowiedzi:** Zamiast krótkiego „Zrobione” (201 Created), podaj szczegóły tego, co powstało.
    *   *Analogia:* Gdy pytasz mechanika o auto, wolisz usłyszeć „wymieniłem klocki”, a nie tylko „mhm”.
*   **Uproszczone procesy:** Unikaj sytuacji, gdzie jedno zadanie wymaga wielu kroków (np. osobne tworzenie promocji i przypisywanie jej do produktu).
    *   *Analogia:* Lepiej zamówić gotową pizzę, niż kupować osobno ciasto, ser i sos w trzech różnych sklepach.
*   **Obsługa czekania i limitów:** Problemy takie jak asynchroniczność (polling) czy limity zapytań najlepiej rozwiązać w kodzie, by AI nie musiało „pukać do drzwi” co sekundę.
*   **Dzielenie danych (Paginacja):** Pozwól AI pobierać dane w małych paczkach.
    *   *Analogia:* Lepiej czytać książkę strona po stronie, niż próbować połknąć całą bibliotekę naraz.

**Proskazówka:** Jeśli API ma oficjalne biblioteki (SDK), warto je pobrać i przeanalizować z pomocą AI, aby szybko wygenerować potrzebne skrypty i notatki.

## Planowanie struktury narzędzi oraz schematów właściwości

Oto uproszczone zestawienie zasad optymalizacji narzędzi dla agentów AI, oparte na Twoich materiałach:

### **Czym jest MCP?**
Wyobraź sobie **Model Context Protocol (MCP)** jako **„uniwersalną wtyczkę”** lub pudełko z narzędziami, które podłączasz do sztucznej inteligencji, aby mogła ona korzystać z plików i zewnętrznych systemów.

### **Problem: Przeładowanie (Zbyt duża skrzynka)**
Standardowo system oferuje aż **13 osobnych narzędzi** do obsługi plików (np. osobno do czytania tekstu, osobno do listowania folderów). 
*   **Analogia:** To tak, jakbyś kazał majstrowi nosić 13 różnych śrubokrętów zamiast jednego uniwersalnego z wymiennymi końcówkami. Zbyt duża liczba opcji rozprasza AI.

### **Rozwiązanie: 4 "Multitool-e"**
Zamiast rozpraszać model, lepiej pogrupować funkcje w **4 główne kategorie**:

| Nowe Narzędzie | Co robi? (Analogia) | Zastępuje m.in. |
| :--- | :--- | :--- |
| **fs_search** | **„Detektyw”**: Przeszukuje pliki i sprawdza strukturę katalogów. | search_files, directory_tree, get_file_info |
| **fs_read** | **„Czytelnik”**: Otwiera i czyta wszystko (tekst, media, wiele plików naraz). | read_text_file, read_media_file, read_multiple_files |
| **fs_write** | **„Pisarz”**: Tworzy nowe pliki i edytuje już istniejące. | write_file, edit_file |
| **fs_manage** | **„Organizator”**: Tworzy foldery, przenosi pliki i robi porządki. | create_directory, move_file, list_directory |

### **Zasada "Mniej znaczy lepiej"**
*   **Balans:** Celem nie jest tylko skrócenie listy, ale znalezienie równowagi między prostotą a skutecznością modelu.
*   **Współpraca z AI:** Najlepiej planować strukturę narzędzi razem z LLM, podając mu dane o dostępnym API.
*   **Efekt:** Mniejsza liczba schematów to **większa precyzja** działania agenta i niższa złożoność systemu.

## Optymalizacja interfejsu na potrzeby modeli językowych

Projektowanie narzędzi dla modeli językowych (LLM) przypomina **budowanie przejrzystego warsztatu**, w którym każde narzędzie jest jasno podpisane, a ryzyko skaleczenia się zminimalizowane.

Oto kluczowe zasady tworzenia interfejsu dla systemu plików:

### 🛠️ Fundamenty Projektowania
| Zasada | Opis | Analogia |
| :--- | :--- | :--- |
| **Prostota (KISS)** | Używaj prostych nazw i ogranicz ilość przesyłanych danych. | **Menu w restauracji**: wybierasz „Zupę dnia”, a nie czytasz całej listy składników dostawcy. |
| **Kontekst i Cele** | Dopasuj narzędzia do tego, co model faktycznie ma zrobić, by uniknąć halucynacji. | **Instrukcja mebli**: zawiera tylko te kroki, które są potrzebne do złożenia konkretnej szafki. |
| **Wsparcie modelu** | Podpowiadaj modelowi, co zrobić dalej, i automatycznie poprawiaj jego błędy (np. dopasuj ścieżkę pliku po samej nazwie). | **Autokorekta w telefonie**: wie, co chcesz napisać, nawet gdy zrobisz literówkę. |

### 📂 Przegląd Narzędzi

*   **fs_read (Odczyt)**: Służy do przeglądania plików i folderów. Najważniejszy jest tu **minimalizm** – model nie powinien dostać zbyt wielu informacji naraz, by nie przekroczyć swojej „pamięci” (kontekstu).
*   **fs_write (Zapis/Edycja)**: To narzędzie podwyższonego ryzyka. Stosuje się tu dwa bezpieczniki:
    *   **Checksum**: Sprawdza, czy plik nie zmienił się w międzyczasie (zapobiega nadpisaniu czyjejś pracy).
    *   **dryRun**: Pozwala modelowi zobaczyć „projekt” zmian przed ich wprowadzeniem (jak **przymierzalnia ubrań**).
*   **fs_search (Wyszukiwanie)**: Pozwala szukać po nazwach i treści, co daje modelowi elastyczność w działaniu.
*   **fs_manage (Zarządzanie i Usuwanie)**: Najbezpieczniej jest ograniczyć usuwanie tylko do pojedynczych plików lub pustych katalogów, by model nie „posprzątał” za dużo.

### ⚠️ Bezpieczeństwo przede wszystkim
Zamiast liczyć na to, że model się nie pomyli, lepiej **minimalizować ryzyko**:
- **Wzmacniaj zachowanie**: Po zapisaniu pliku, zwróć modelowi jego pełną ścieżkę, by wiedział, że operacja się udała.
- **Opcja "Cofnij"**: Przechowuj historię zmian, aby móc naprawić błędy modelu bez jego udziału.
- **Kosz**: Zamiast trwałego kasowania plików, używaj koncepcji archiwum, z którego łatwo odzyskać dane.

## Projektowanie dynamicznych odpowiedzi sukcesu oraz błędów

Oto skrócona instrukcja projektowania podpowiedzi dla agentów AI, wyjaśniona za pomocą analogii:

### **Podpowiedzi API: "Znaki drogowe" dla Twojego bota**
Zamiast zostawiać bota z samym błędem, dodawaj pola `hints` (podpowiedzi) lub `recoveryHints` (wskazówki naprawcze). To jak nawigacja GPS, która nie tylko mówi „skręć źle”, ale od razu wyznacza nową trasę.

| Sytuacja | Zasada komunikacji | Przykład "prostym językiem" |
| :--- | :--- | :--- |
| **Błąd** | Powiedz, co się stało i co zrobić dalej. | "Plik zaktualizowany. Przeczytaj go teraz." |
| **Blokada** | Ujawnij ukryte ograniczenia. | "Dokument jest tylko do odczytu." |
| **Sukces** | Zasugeruj logiczny następny krok. | "Znalazłem 3 pliki. Wczytaj je przed edycją." |
| **Zła wartość** | Podaj listę poprawnych opcji. | "Zła etykieta. Wybierz: A, B lub C." |
| **Korekta** | Poinformuj o automatycznej poprawce. | "Prosiłeś o 70 linii, mamy 59. Wczytano 59." |

### **Dlaczego warto to robić?**
*   **Inteligencja to nie wszystko:** Nawet najmądrzejszy model nie domyśli się specyficznych ograniczeń systemu (np. Twoich uprawnień lub liczby plików w folderze), jeśli mu o nich nie powiesz.
*   **Oszczędność czasu:** Dobre wskazówki zapobiegają błądzeniu agenta i wykonywaniu zbędnych operacji.
*   **Wsparcie AI w budowie:** Choć takie API jest trudniejsze do zaprogramowania, możesz użyć AI, aby pomogło Ci napisać kod i testy dla tych komunikatów.

**W skrócie:** Traktuj bota jak nowego pracownika – nie wystarczy powiedzieć mu, że „coś nie działa”, trzeba wskazać mu, gdzie leży instrukcja naprawy.

## Model Context Protocol vs własna implementacja

**Model Context Protocol (MCP)** to „uniwersalna wtyczka” dla sztucznej inteligencji, wprowadzona przez Anthropic w listopadzie 2024 roku.

### Dlaczego to jest ważne?
Zamiast budować osobne, skomplikowane połączenia dla każdej aplikacji (jak ChatGPT, Claude czy Cursor), używasz jednego standardu. 

*   **Problem:** Każdy program mówi innym „językiem” (różne formaty API).
*   **Rozwiązanie:** MCP wprowadza wspólny standard – piszesz kod raz, a działa on wszędzie.

### Jak to działa? (Analogia USB)
Wyobraź sobie MCP jako port USB w Twoim komputerze.

| Rola | Opis | Analogia |
| :--- | :--- | :--- |
| **Host** | Twoja główna aplikacja, która zarządza całością. | Komputer / Laptop |
| **Server** | Zewnętrzny program dostarczający nowe funkcje i dane. | Pendrive lub Drukarka |
| **Client** | Mechanizm, który fizycznie łączy oba te światy. | Kabel lub Gniazdo USB |

### Kluczowe fakty (Mniej znaczy lepiej)
*   **Współistnienie:** MCP nie wyrzuca starych rozwiązań. Może działać ramię w ramię z narzędziami wbudowanymi na stałe w Twoją aplikację.
*   **Jedna lista:** Dla Agenta AI nie ma znaczenia, skąd pochodzi narzędzie. Wszystkie opcje (własne i z MCP) widzi na jednej, spójnej liście.
*   **Łatwe podłączanie:** Dzięki MCP możesz błyskawicznie „wpiąć” gotowe serwery narzędzi do różnych programów, takich jak Claude Code czy ChatGPT.

## Główne komponenty MCP dla STDIO i Streamable HTTP

Oto uproszczone zestawienie kluczowych elementów Model Context Protocol (MCP), oparte na dostarczonych materiałach:

### Główne Komponenty MCP
MCP to nie tylko narzędzia, ale cały ekosystem wymiany informacji.

| Komponent | Czym jest? | Analogia |
| :--- | :--- | :--- |
| **Apps** | Interaktywne interfejsy i akcje wewnątrz aplikacji klienta. | **Pilot z wyświetlaczem**, który pozwala sterować urządzeniem bez wstawania z kanapy. |
| **Resources** | Dane do odczytu (pliki, obrazy, listy). | **Półka z książkami**, z której AI może wyciągnąć potrzebny tom. |
| **Prompts** | Gotowe szablony instrukcji do wyboru przez użytkownika. | **Menu w restauracji** – wybierasz gotowe danie zamiast wymyślać przepis. |
| **Sampling** | Serwer prosi model AI o wygenerowanie czegoś. | **Asystent pytający szefa** o opinię przed podjęciem decyzji. |
| **Elicitation** | Serwer prosi użytkownika o dane (np. formularz). | **Ankieta**, którą musisz wypełnić, aby przejść do kolejnego kroku. |

---

### Jak MCP się komunikuje?
Wybór zależy od tego, gdzie znajduje się serwer.

*   **STDIO (Standard Input/Output)**
    *   **Definicja:** Mechanizm komunikacji dla procesów uruchomionych **lokalnie** na tym samym komputerze.
    *   **Zastosowanie:** Praca z Twoimi plikami lub narzędziami (np. edycja wideo przez ffmpeg).
    *   **Analogia:** Rozmowa przez **interkom** z osobą w tym samym budynku.
*   **Streamable HTTP**
    *   **Definicja:** Metoda łączności dla serwerów **zdalnych** (chmura, VPS), obsługująca wielu użytkowników i bezpieczne logowanie (OAuth).
    *   **Zastosowanie:** Standard dla nowoczesnych serwerów działających w sieci.
    *   **Analogia:** Rozmowa przez **telefon satelitarny** z kimś na innym kontynencie.

**Warto wiedzieć:** Choć możliwości MCP są ogromne, obecnie większość serwerów skupia się głównie na podstawowych narzędziach, a pełne wsparcie w aplikacjach dopiero się rozwija.

Tak, narzędzia to najczęstsze zastosowanie, ale **Model Context Protocol (MCP)** to w rzeczywistości **uniwersalny most** między modelem AI a światem zewnętrznym. 

Poza narzędziami, MCP dostarcza:

*   **Dostęp do "Wiedzy" (Resources):** Pozwala AI bezpiecznie czytać Twoje pliki, obrazy czy bazy danych.
    *   **Analogia:** To jak **karta biblioteczna** dla AI – model może zajrzeć do konkretnej książki na Twojej półce, której wcześniej nie znał.
*   **Gotowe "Szablony" (Prompts):** Zestaw predefiniowanych instrukcji, które możesz wybrać z listy, zamiast wpisywać je ręcznie.
    *   **Analogia:** **Menu w restauracji** – zamiast tłumaczyć kucharzowi, jak zrobić pizzę, po prostu wybierasz numer z karty.
*   **Interaktywne Interfejsy (Apps):** Pozwala modelowi wyświetlać przyciski lub okna bezpośrednio w aplikacji, w której czatujesz.
    *   **Analogia:** **Wbudowany pilot**, który pojawia się w Twoim telefonie, byś mógł coś zatwierdzić jednym kliknięciem.
*   **Pytania zwrotne (Sampling & Elicitation):** Mechanizm, w którym to serwer prosi AI o opinię lub prosi Ciebie o wypełnienie formularza.
    *   **Analogia:** **System autoryzacji w banku** – zanim system wykona przelew (akcję), prosi Cię o potwierdzenie tożsamości.

Podsumowując: MCP daje sztucznej inteligencji **"ręce"** (narzędzia), **"oczy"** (zasoby/dane) oraz **"standard komunikacji"**, by mogła sprawnie współpracować z różnymi systemami (lokalnymi i zdalnymi) bez konieczności budowania osobnego połączenia dla każdej aplikacji.

## Projekt klienta oraz serwera MCP na back-endzie

Oto uproszczone zestawienie budowy agenta do tłumaczenia dokumentów, oparte na protokole MCP:

### Dwa podejścia do tłumaczenia
Można to porównać do różnicy między **sztywną instrukcją składania mebli** (Workflow) a **doświadczonym stolarzem** (Agent).

| Cecha | Workflow (Przepis) | Agent AI (Ekspert) |
| :--- | :--- | :--- |
| **Działanie** | Robi krok po kroku (dzielenie, tłumaczenie, łączenie). | Sam decyduje o kolejności działań i weryfikuje wyniki. |
| **Elastyczność** | Niska – nie umie wrócić i naprawić błędu w zapisanym fragmencie. | Wysoka – skanuje dokument, sprawdza błędy i wprowadza poprawki. |
| **Efekt** | Duża kontrola, ale sztywne ramy. | Większa dynamika i szansa na naturalniejszy przekład. |

### Jak to działa "pod maską"? (Architektura)
System działa na zapleczu (back-end), co oznacza, że jest jak **silnik w samochodzie** – nie musisz go widzieć (brak interfejsu graficznego), żeby wykonywał swoją pracę.

*   **Strażnik (Watcher):** Nieustannie pilnuje folderu z nowymi plikami. Gdy coś się tam pojawi, natychmiast "puka" do agenta.
*   **Łącznik (MCP Client):** To most łączący agenta z plikami. Pozwala mu bezpiecznie sięgać po dokumenty w wyznaczonym miejscu.
*   **Mózg (Pętla Agenta):** Model AI, który dostaje zestaw narzędzi i ogólne wytyczne. Sam wybiera, jak najlepiej wykonać tłumaczenie, korzystając z dostępnych mu funkcji.

### Cykl pracy w trzech krokach:
1.  **Wykrycie:** Wrzucasz plik do folderu `translate`.
2.  **Praca:** Agent pobiera narzędzia przez MCP, tłumaczy tekst, sprawdza go i ewentualnie poprawia.
3.  **Gotowe:** Przetłumaczony dokument ląduje w folderze `translated`.

## Budowanie serwerów MCP ze schematami „spec-driven”

Oto uproszczony przewodnik po budowaniu serwerów MCP, oparty na zasadzie „minimum słów, maksimum konkretu”:

### **Dlaczego warto używać szablonu?**
Budowanie serwera MCP od zera jest jak pieczenie chleba bez przepisu – zajmuje dużo czasu i łatwo o błąd. 
*   **Szablon (np. TypeScript)** to Twoja „gotowa mieszanka”: zapewnia solidną bazę, a Ty dodajesz tylko konkretne składniki.
*   **AI jako pomocnik:** Modele AI świetnie piszą kod, ale ich wiedza szybko się przedawnia. Traktuj AI jak zdolnego stażystę, któremu musisz podsunąć aktualną instrukcję (`README.md`, `manual.md`), by wiedział, co robić.

### **Proces tworzenia w 6 krokach**
Zamiast ręcznego pisania kodu, zarządzasz procesem jak dyrygent:

| Krok | Działanie | Cel |
| :--- | :--- | :--- |
| **1. Fundament** | Pobierz szablon i wklej dokumentację API narzędzia. | Przygotowanie „placu budowy”. |
| **2. Briefing** | Daj AI instrukcje (`README`, `manual`). | Upewnienie się, że AI zna zasady gry. |
| **3. Planowanie** | Poproś AI o listę narzędzi i wybierz tylko te niezbędne. | **Mniej znaczy lepiej** – unikaj chaosu. |
| **4. Projekt** | Ustal strukturę wejścia i wyjścia (input/output). | Precyzyjne określenie, co narzędzie ma robić. |
| **5. Budowa** | Poproś AI o implementację i usuń zbędne elementy szablonu. | Czysty, działający kod. |
| **6. Testy** | Sprawdź kod z AI i popraw błędy. | Finalne szlify. |

### **Przykład: Integracja z Uploadthing**
Dzięki temu procesowi Twój agent AI zyska „wirtualne dłonie”, którymi może brać pliki z Twojego komputera i zamieniać je w linki internetowe (dzięki usłudze uploadthing.com). Wynik działania (linki) zostanie zapisany np. w pliku `uploaded.md`, co ułatwia automatyzację pracy.

**Pamiętaj:** Nawet jeśli proces wymaga kilku poprawek (iteracji), schemat pozostaje zawsze tak samo prosty.

**Uploadthing.com** to usługa, która pozwala Twojemu agentowi AI zamieniać pliki w linki do udostępniania.

**Analogia:** Działa to jak **wirtualny paczkomat**. Zamiast zapraszać kogoś do domu, żeby odebrał dokument (Twój komputer), wkładasz kopię tego dokumentu do skrytki (chmura) i dajesz tej osobie kod odbioru (link).

### **Najważniejsze informacje**

*   **Cel:** Szybkie udostępnianie plików w formie linków internetowych.
*   **Twoja prywatność:** Inni użytkownicy **nie pobierają** plików bezpośrednio z Twojego komputera.
*   **Transfer do chmury:** Tak, pliki z Twojego wybranego folderu są **kopiowane na zewnętrzne serwery** (do chmury).
*   **Zastosowanie:** Bardzo przydatne w automatyzacjach, gdy musisz komuś (lub czemuś) szybko przesłać plik.

W skrócie: Pliki trafiają do chmury, aby inni mogli je bezpiecznie pobrać za pomocą linku, bez kontaktu z Twoim dyskiem twardym.

## Problemy dotyczące bezpieczeństwa oraz prywatności

Oto skrócony przewodnik po bezpiecznym wdrażaniu Model Context Protocol (MCP), wyjaśniony prostym językiem:

### **MCP to tylko „Kabel USB”**
MCP działa jak standard USB – pozwala łatwo połączyć sztuczną inteligencję z Twoimi danymi i narzędziami. Jednak samo „podłączenie” nie sprawia, że system staje się bezpieczny. Jeśli podepniesz zawirusowany pendrive do komputera, złącze USB Cię przed nim nie ochroni.

### **Gdzie jest bezpiecznie, a gdzie ryzykownie?**

| Cecha | Systemy wewnętrzne (Prywatne biuro) | Systemy publiczne (Otwarty park) |
| :--- | :--- | :--- |
| **Kontrola** | Pełna: znasz pracowników i zasady. | Brak: każdy może wejść i spróbować oszustwa. |
| **Dane** | Zostają wewnątrz firmy. | Mogą wyciec do osób trzecich. |
| **Zagrożenia** | Przewidywalne. | Nieprzewidywalne (np. złośliwe instrukcje w mailach). |

### **Zasady „Cyfrowej Higieny” (Programistyczne bezpieczniki)**
Zamiast ufać AI na słowo, musisz stosować twarde blokady w kodzie:

*   **Ograniczone zaufanie:** Nie dawaj AI „kluczy do wszystkiego”. Niektóre akcje powinny być zablokowane dla maszyn.
*   **Bramki kontrolne:** Każda prośba od AI musi przejść przez walidację (sprawdzenie, czy jest poprawna i bezpieczna).
*   **Anonimowość:** Ukrywaj wrażliwe dane, zanim trafią do modelu.
*   **Liczniki:** Nakładaj limity zapytań, aby system nie został przeciążony.

**Podsumowując:** MCP daje ogromne możliwości, ale to Ty musisz być „strażnikiem”, który pilnuje, co AI wolno robić z Twoimi zasobami.

## Autoryzacja serwerów MCP i kontrola uprawnień użytkowników

Autoryzacja w MCP to proces sprawdzania, czy masz uprawnienia do korzystania z serwera lub powiązanych z nim usług. Można to porównać do dwóch rodzajów dostępu do budynku:

### 1. Klucze API (Zwykły klucz do drzwi)
To najprostsza metoda dostępu.
*   **Jak to działa:** Host (np. Claude) przechowuje Twój klucz i używa go tylko wtedy, gdy wykonuje zadanie.
*   **Zaleta:** Prostota obsługi.
*   **Ryzyko:** Trzeba bardzo uważać, aby klucz nie wyciekł w niepowołane ręce.

### 2. OAuth (Cyfrowy paszport z weryfikacją)
To znacznie bardziej skomplikowany system, który przypomina wieloetapową odprawę na lotnisku.

| Etap procesu | Co się dzieje? (Prostym językiem) |
| :--- | :--- |
| **Odkrywanie** | Sprawdzenie, gdzie w ogóle znajduje się "urząd wydający przepustki". |
| **Walidacja** | Potwierdzenie tożsamości klienta i miejsca, do którego ma wrócić. |
| **Zabezpieczenie (PKCE)** | Dodatkowy "kod potwierdzający", aby nikt nie przejął połączenia. |
| **Wymiana tokenów** | Zamiana tymczasowego kodu na właściwą, bezpieczną przepustkę (token RS). |
| **Utrzymanie** | Przechowywanie przepustki w sejfie (szyfrowanie) i jej automatyczne odnawianie. |

### Podsumowanie:
*   **Rola Hosta:** Musi poprowadzić użytkownika za rękę przez cały proces OAuth i zadbać o wymagania serwera.
*   **Zarządzanie:** Gdy już masz klucze lub tokeny, zarządzanie nimi przypomina pracę w każdej innej aplikacji.
*   **Cel:** Na tym etapie najważniejsze jest zrozumienie ogólnego schematu działania, a nie technicznych detali.

## Obsługa dużej liczby narzędzi oraz konfliktów pomiędzy serwerami

Wyobraź sobie, że Twój system to **wielki warsztat**, w którym pracuje wielu specjalistów (serwerów). Jeśli każdy z nich przyniesie własny „śrubokręt”, bez wyraźnych oznaczeń nikt nie będzie wiedział, którego użyć.

### Jak unikać konfliktów w „warsztacie”?

| Problem | Rozwiązanie | Przykład |
| :--- | :--- | :--- |
| **Identyczne nazwy** | Stosuj prefiksy (nazwa serwera + narzędzie) | `gmail__search` zamiast samo `search` |
| **Niejasne polecenia** | Unikaj ogólników, stawiaj na konkret | Zamiast `get`, użyj `search` lub `send` |
| **Przeładowanie AI** | Nałóż twardy limit aktywnych narzędzi | AI nie może trzymać 50 kluczy w jednej dłoni |

### Zasady sprawnego zarządzania:
*   **Pudełka z narzędziami (Profile):** Nie dawaj asystentowi wszystkiego naraz. Przypisuj konkretne narzędzia do wybranych zadań.
*   **Prosty panel sterowania:** Host musi mieć przejrzysty interfejs, abyś mógł jednym kliknięciem „odłączyć” niepotrzebny serwer.
*   **Unikalne etykiety:** Jako twórca dbaj, by opisy Twoich narzędzi były niepowtarzalne – to eliminuje pomyłki modelu.
*   **Wspólna odpowiedzialność:** Porządek zależy zarówno od projektanta serwera (unikalne nazwy), jak i gospodarza systemu (zarządzanie kolizjami).

## Serwery MCP w połączeniu z lokalnymi modelami open-source

**Lokalne modele + MCP: Twoja prywatna fabryka automatyzacji**

Wyobraź sobie, że **MCP to zestaw specjalistycznych narzędzi**, a **model AI to Twój pracownik**. Podłączenie lokalnego modelu do MCP jest jak wyposażenie własnego robota w dodatkowe ramiona – od teraz może on sam obsługiwać Twoje programy, nie wysyłając danych do zewnętrznych firm.

### Dlaczego warto wybrać model lokalny?
*   **Darmowa praca:** Nie płacisz za każde wygenerowane słowo (token). Twoim jedynym kosztem jest rachunek za prąd.
*   **Test jakości:** Jeśli mały, darmowy model (np. Qwen) poprawnie obsługuje Twoje narzędzia MCP, to dowód, że Twoje narzędzia są świetnie zaprojektowane.
*   **Niezależność:** Wszystko działa na Twoim komputerze dzięki programom takim jak **LM Studio**, **llama.cpp** czy **vLLM**.

### Co jest potrzebne?
Aby to zadziałało, model musi obsługiwać funkcję **Function Calling** – to tak, jakby pracownik musiał najpierw przejść kurs obsługi narzędzi, zanim wpuścisz go do warsztatu.

### Polecane modele
Jeśli Twój sprzęt na to pozwala, sprawdź te propozycje:

| Model | Charakterystyka |
| :--- | :--- |
| **Nemotron 3 Nano** | Bardzo lekki, idealny na start. |
| **Qwen 3 Coder 30B** | Świetny do zadań technicznych i kodowania. |
| **GLM 4.7 Flash 30B** | Szybki i wydajny. |
| **GPT-OSS (20B / 120B)** | Dla posiadaczy bardzo mocnych komputerów. |

**Wskazówka:** Jeśli Twój komputer jest za słaby, możesz skorzystać z serwisu **OpenRouter**. Działa to tak samo, ale obliczenia odbywają się w chmurze zamiast u Ciebie.

## Publikacja zdalnego serwera MCP oraz MCPB dla serwerów lokalnych

Oto uproszczone zestawienie sposobów publikacji serwerów MCP oraz wyjaśnienie formatu MCPB.

### MCP vs. MCPB: Czym się różnią?

*   **MCP (Model Context Protocol):** To standard komunikacji. Wyobraź go sobie jak **wtyczkę do kontaktu**, która pozwala Twojej sztucznej inteligencji (np. Claude) korzystać z zewnętrznych narzędzi.
*   **MCPB (MCP Bundle):** To **„gotowy zestaw do montażu”** (jeden plik `.mcpb`). Zawiera on cały kod i instrukcję konfiguracji w jednym miejscu.

| Cecha | MCP (Standardowy) | MCPB (Bundle) |
| :--- | :--- | :--- |
| **Format** | Rozproszone pliki/kod | Jeden plik `.mcpb` |
| **Instalacja** | Może być trudna dla laików | Automatyczna i uproszczona |
| **Zastosowanie** | Serwery lokalne i zdalne | Głównie ułatwienie konfiguracji (np. w aplikacji Claude) |

---

### Jak udostępnić serwer MCP?

Możesz to zrobić na trzy główne sposoby, zależnie od tego, gdzie ma działać:

**1. Lokalnie (STDIO) – „Twój prywatny garaż”**
*   **Zastosowanie:** Tylko na Twoim komputerze (np. dla aplikacji Claude Desktop lub Claude Code).
*   **Wada:** Trudniejsza instalacja dla osób nietechnicznych.

**2. Własny serwer (VPS + nginx) – „Własny lokal usługowy”**
*   **Działanie:** Uruchamiasz serwer na porcie `localhost` i udostępniasz go światu przez narzędzie **nginx**.
*   **Kluczowy punkt:** Zwykle wystarczy udostępnić jeden adres: `/mcp`.
*   **Dla kogo:** Dla osób, które wiedzą, jak zarządzać serwerami.

**3. Cloudflare Workers – „Wynajęta chmura”**
*   **Zaleta:** Szybkie wdrożenie bez własnego serwera.
*   **Proces w skrócie:**
    *   Stwórz miejsce na dane (KV).
    *   Ustaw parametry w pliku `wrangler.toml`.
    *   Wpisz tajne klucze API.
    *   Uruchom komendę `wrangler deploy`.
*   **Uwaga:** Pilnuj limitów zapytań, aby uniknąć kosztów.