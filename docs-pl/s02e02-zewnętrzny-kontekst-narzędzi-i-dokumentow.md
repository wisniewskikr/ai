# Zewnętrzny kontekst narzędzi i dokumentów

## Wpływ zewnętrznego kontekstu na zachowanie modelu

Praca z zewnętrznymi danymi w modelach językowych (LLM) przypomina zapraszanie nieznajomego do pomocy w biurze – może być bardzo pomocny, ale jeśli nie wyznaczymy mu jasnych granic, może namieszać w dokumentach lub uwierzyć w nieprawdziwe informacje,.

### Kluczowe wyzwania i ryzyka

Poniższa tabela przedstawia główne problemy, z jakimi mierzą się systemy wykorzystujące zewnętrzny kontekst:

| Wyzwanie | Na czym polega? | Analogia |
| :--- | :--- | :--- |
| **Nieprzewidywalność** | Model nie wykonuje instrukcji jak sztywny kod; dane z zewnątrz mogą zmienić jego zachowanie. | Kelner, który zamiast podać danie z karty, przygotowuje to, co podszeptał mu inny klient. |
| **Ataki typu Injection** | Złośliwe instrukcje ukryte w danych (np. w mailach) mogą przejąć kontrolę nad agentem. | „Koń trojański” ukryty w niewinnie wyglądającej przesyłce kurierskiej. |
| **„Zasypanie” informacjami** | Zbyt duża ilość danych sprawia, że model zapomina o głównych zadaniach. | Przeładowane biurko, na którym pod stertą papierów ginie najważniejsza instrukcja od szefa. |
| **Błędy odczytu** | Trudność w interpretacji tabel, wykresów czy skomplikowanych formatów (PDF, docx). | Próba odczytania mapy przez brudną szybę w ciemności. |

---

### Jak dbać o bezpieczeństwo i skuteczność?

Aby system działał sprawnie i bezpiecznie, warto stosować poniższe zasady:

*   **Ograniczone uprawnienia:** Nie dawaj agentowi narzędzi, których nie potrzebuje. Jeśli nie musi wysyłać maili, nie udostępniaj mu tej funkcji – to najlepsza obrona przed atakiem.
*   **Zasada „Mniej znaczy lepiej”:**
    *   Zawężaj źródła dokumentów tylko do sprawdzonych miejsc.
    *   Dziel duże teksty na mniejsze fragmenty (dekompozycja), aby nie przeciążyć „uwagi” modelu.
*   **Weryfikacja przez człowieka:** Wymagaj zgody użytkownika przed wykonaniem kluczowych akcji.
*   **Jasny interfejs:** Wyświetlaj użytkownikowi linki do oryginalnych fragmentów plików, aby mógł łatwo sprawdzić, czy model się nie pomylił.
*   **Wzmacnianie instrukcji:** Powtarzaj najważniejsze zasady w kontekście, aby model o nich nie zapomniał pod wpływem nowych danych.

## Zasady obsługi kontekstu z zewnętrznych źródeł

Wyobraź sobie, że Twoja baza wiedzy to **ogromna biblioteka bez katalogu**. Choć książki tam są, znalezienie konkretnego zdania zajęłoby wieki. **Indeksowanie** to proces tworzenia tego katalogu, aby agent AI błyskawicznie wiedział, na którą półkę sięgnąć.

### Jak przygotować dane (Indeksowanie)

| Krok | Na czym polega? | Analoga |
| :--- | :--- | :--- |
| **Chunking** | Dzielenie plików na małe fragmenty. | Krojenie pizzy na kawałki, które łatwiej zjeść. |
| **Metadane** | Przypisanie informacji o pochodzeniu fragmentu. | Przyklejenie karteczki „strona 5, rozdział 2” do wycinka. |
| **Synteza** | Tworzenie podsumowań i opisów obrazów/wideo. | Napisanie krótkiej recenzji na okładce książki. |
| **Mapowanie** | Tworzenie grafów powiązań między danymi. | Rysowanie mapy drogowej łączącej różne miasta. |

### Zasady bezpiecznej pracy z plikami

Aby system był sprawny i bezpieczny, trzymaj się tych punktów:

*   **Selekcja:** Sprawdzaj format, rozmiar i typ pliku (np. limit 50MB w OpenAI).
*   **Cenzura:** Poddawaj treści moderacji, by wyłapać szkodliwe dane.
*   **Klucz i kłódka:** Tylko uprawnieni użytkownicy i agenci mogą widzieć dokumenty.
*   **Tajemnicze linki:** Jeśli udostępniasz plik, używaj trudnych do odgadnięcia linków, które szybko wygasają.
*   **Solidny fundament:** Wszystkie zabezpieczenia muszą być zaprogramowane „na twardo” – agent AI ma jedynie dostawać informację o błędzie, a nie sam decydować o bezpieczeństwie.

**Pamiętaj:** Dobrze zaindeksowana wiedza to nie tylko pliki, to system, który żyje i synchronizuje się z nowymi danymi.

## Formaty prezentowania zewnętrznych treści w kontekście

Integracja wiedzy zewnętrznej z modelem AI przypomina **pracę badacza w ogromnej bibliotece**. Agent nie zna wszystkich książek na pamięć, ale wie, jak korzystać z katalogu i czytać wybrane fragmenty.

### 🛠 Podstawowe narzędzia nawigacji
Model korzysta z dwóch głównych metod, aby „poruszać się” po danych:

| Narzędzie | Funkcja | Analogia |
| :--- | :--- | :--- |
| **Search** (Szukaj) | Przeszukiwanie bazy wiedzy. | Przeglądanie katalogu bibliotecznego w poszukiwaniu tytułu. |
| **Read** (Czytaj) | Pobieranie treści dokumentu. | Wyjęcie książki z półki i czytanie konkretnego rozdziału. |



### 🖼 Tekst czy Obraz?
Nie zawsze tekst jest najlepszym wyborem. Czasem lepiej wysłać modelowi **obraz (zrzut ekranu)** dokumentu zamiast jego treści tekstowej:

*   **Lepsza kompresja:** Obraz pozwala zmieścić 9-10x więcej informacji w tym samym miejscu.
*   **Wysoka precyzja:** Zachowuje do 96% dokładności danych.
*   **Złożone treści:** Obrazy są niezbędne, gdy dokument zawiera wykresy lub schematy, których sam tekst nie odda.

### 💡 Kluczowe zasady integracji
Stosując zasadę "mniej znaczy lepiej", skupiamy się na jakości dostarczanego kontekstu:

*   **Dokładne adresowanie:** Zawsze informuj model, **z jakiego dokumentu** i **z którego miejsca** pochodzi dany fragment. To jak podanie numeru strony w przypisie.
*   **Wydobywanie grafik:** Jeśli w tekście (np. Markdown) są linki do zdjęć, należy je wyodrębnić, aby model mógł je faktycznie „zobaczyć”.
*   **Transparentność dla użytkownika:** Dodawanie odnośników i cytatów do odpowiedzi agenta ułatwia ludziom weryfikację informacji.

**Analogia końcowa:** Przekazywanie wiedzy do AI bez podania źródła jest jak wręczenie komuś wyrwanej kartki z książki – informacja jest przydatna, ale bez okładki nie wiemy, czy można jej ufać.

## Techniki indeksowania treści na potrzeby wyszukiwania

Wyobraź sobie, że Twoja wiedza to ogromna biblioteka. **Indeksowanie** to proces dzielenia grubych ksiąg na małe, poręczne fiszki, które robot (Agent RAG) może szybko przeszukać, aby znaleźć konkretną informację.

### Czym jest Chunking? (Analogia Pizzy)
Zamiast dawać modelowi językowemu całą pizzę (cały dokument), której nie jest w stanie ugryźć na raz, kroimy ją na kawałki (**chunki**). Każdy kawałek ma:
*   **Zawartość:** Smaczne wnętrze (tekst).
*   **Metadane:** Informację, czy to brzeg, czy środek (opis dokumentu).

### Jak dzielić tekst? (Strategie)

| Metoda | Na czym polega? | Kiedy stosować? |
| :--- | :--- | :--- |
| **Znaki** | Podział po konkretnej liczbie liter/znaków. | Teksty bez wyraźnej struktury. |
| **Separatory** | Podział według nagłówków, akapitów i zdań. | Dokumenty uporządkowane (np. artykuły). |
| **Kontekst** | LLM dopisuje do fragmentu info o tym, co było wcześniej/dalej. | Gdy fragment bez kontekstu traci sens. |
| **Tematyka** | Model tworzy nowe podsumowania fragmentów od zera. | Bardzo precyzyjne systemy wiedzy. |

### Metadane: Etykiety na pudełkach
Metadane pomagają agentowi zrozumieć, skąd pochodzi dany kawałek wiedzy. Ich rodzaj zależy od tego, jak dzielimy tekst:

*   **Metody proste (Znaki/Separatory):** Etykiety są techniczne – np. numer strony, nazwa pliku czy nagłówka.
*   **Metody zaawansowane (Kontekst/Temat):** Etykiety są inteligentne – np. listy słów kluczowych lub tagi wygenerowane przez AI.

### Dlaczego to ważne?
Dzięki mniejszym fragmentom (zwykle **200–500 słów**), zapytanie użytkownika można precyzyjnie dopasować do treści. To jak szukanie igły w stogu siana za pomocą magnesu (wyszukiwanie semantyczne) zamiast przeglądania każdego źdźbła po kolei.

## Silniki wyszukiwania, bazy wektorowe i pluginy

Wybór odpowiedniej architektury dla systemu RAG przypomina dobór środka transportu – nie potrzebujesz odrzutowca, aby skoczyć po bułki do sklepu obok. Kluczem jest dopasowanie narzędzi do realnych potrzeb Twojego projektu.

Oto zestawienie trzech podejść do budowy systemów wyszukiwania:

### 1. Poziom Podstawowy: "Cyfrowy Plecak"
To podejście opiera się na bezpośredniej pracy z plikami.

*   **Mechanizm:** Wykorzystanie prostych narzędzi CLI lub protokołów MCP do przeszukiwania dokumentów.
*   **Kiedy wybrać:** Gdy Twoja baza wiedzy to głównie pliki Markdown, a system działa w skali średniej organizacji.
*   **Analogia:** Przeszukiwanie własnego plecaka – wiesz, co tam jest i szybko to znajdujesz bez skomplikowanych katalogów.

### 2. Poziom Średni: "Zorganizowana Szuflada"
Wykorzystuje istniejące bazy danych, w których już trzymasz dane użytkowników.

*   **Mechanizm:** Rozszerzenia do baz takich jak SQLite czy PostgreSQL (np. FTS5 dla tekstu lub `sqlite-vec` dla wyszukiwania semantycznego).
*   **Zaleta:** Niższa złożoność – prawie wszystkie dane są w jednym miejscu, co ułatwia pracę.
*   **Analogia:** Dodanie przegródek do szuflady z narzędziami – nadal masz jeden mebel, ale łatwiej w nim coś znaleźć.

### 3. Poziom Zaawansowany: "Zautomatyzowany Magazyn"
Dedykowane silniki dla projektów o dużej skali.

*   **Mechanizm:** Pełnoprawne silniki wyszukiwania (Elasticsearch), bazy wektorowe (Qdrant) lub grafowe (Neo4j).
*   **Wyzwanie:** Konieczność zachowania synchronizacji między bazą danych a indeksem wyszukiwania.
*   **Analogia:** Profesjonalny magazyn wysokiego składowania z systemem zarządzania – potężny, ale kosztowny w utrzymaniu i wymagający precyzyjnej logistyki.

### Porównanie rozwiązań

| Cecha | System plików | Baza danych + Rozszerzenia | Dedykowany silnik |
| :--- | :--- | :--- | :--- |
| **Złożoność** | Bardzo niska | Niska/Średnia | Wysoka |
| **Wyszukiwanie** | Proste (leksykalne) | Hybrydowe (tekst + wektory) | Zaawansowane hybrydowe |
| **Główne zastosowanie** | Wewnętrzne procesy, pliki MD | Spójne dane w jednym miejscu | Skalowanie i duże wymagania |

**Zasada "Mniej znaczy lepiej":**
Zanim wdrożysz skomplikowany silnik wektorowy, sprawdź, czy Twój agent nie poradzi sobie, łącząc się bezpośrednio z systemem plików lub wykorzystując rozszerzenie w posiadanej już bazie danych. Często niższa złożoność architektury jest najlepszym uzasadnieniem biznesowym.

## Przeszukiwanie semantyczne i wybór modelu do embeddingu

Cześć! Wyszukiwanie semantyczne to sposób, w jaki komputery zaczynają rozumieć **sens** naszych słów, a nie tylko same litery.

Oto proste wyjaśnienie najważniejszych pojęć:

### 1. Czym jest Wyszukiwanie Semantyczne?

Wyobraź sobie, że szukasz czegoś w bibliotece.
*   **Wyszukiwanie tradycyjne:** Szukasz książki, która ma w tytule dokładnie słowo „pies”.
*   **Wyszukiwanie semantyczne:** Szukasz czegoś o „czworonożnym przyjacielu człowieka”. Bibliotekarz rozumie znaczenie i poda Ci książkę o psach, nawet jeśli to słowo w niej nie padło.

| Cecha | Wyszukiwanie Tradycyjne | Wyszukiwanie Semantyczne |
| :--- | :--- | :--- |
| **Na czym polega?** | Dopasowanie liter i słów. | Dopasowanie **znaczenia**. |
| **Zaleta** | Precyzyjne dla konkretnych nazw. | Rozumie kontekst i synonimy. |
| **Metoda** | Słowa kluczowe. | **Embeddingi** (wektory liczb). |

### 2. Czym jest Embedding?

To „cyfrowy odcisk palca” znaczenia tekstu. Każde zdanie zamieniane jest na długą listę liczb (wektor).

*   **Analogia:** Wyobraź sobie mapę. Słowa o podobnym znaczeniu leżą na niej blisko siebie. „Kobieta” będzie na tej mapie bliżej „Królowej” niż „Króla”, bo ich znaczenia są ze sobą silniej powiązane.
*   **Stałość:** Jeśli wpiszesz to samo zdanie dwa razy, otrzymasz ten sam zestaw liczb.

### 3. Jak wybrać model do tworzenia embeddingów?

Wybierając model (np. *Text Embedding 3 Small* od OpenAI), warto zwrócić uwagę na te 4 punkty:

*   **Wielkość modelu:** Wpływa na koszt i szybkość działania.
*   **Liczba wymiarów:** Jak bardzo szczegółowy jest „opis” znaczenia (np. 1536 liczb).
*   **Okno kontekstowe:** Ile tekstu model może przeczytać na raz.
*   **Wiedza (Knowledge cutoff):** Czy model był trenowany na danych, o które pytasz? Jeśli nie zna tematu, nie opisze go poprawnie.

### 4. Dwa etapy pracy systemu

Proces ten dzieli się na dwie części:
1.  **Indeksowanie (w tle):** Przygotowanie bazy wiedzy i zamiana dokumentów na liczby.
2.  **Wyszukiwanie (na żywo):** Zamiana Twojego pytania na liczby i porównanie go z bazą za pomocą matematyki (tzw. *Cosine Similarity*), by znaleźć najbardziej zbliżone treści.

Najlepsze efekty daje **wyszukiwanie hybrydowe**, które łączy tradycyjne słowa kluczowe z głębokim rozumieniem znaczenia.

## Techniki przeszukiwania oraz wczytywania kontekstu (retrieval)

Hybrydowy RAG to nowoczesny sposób na to, aby komputer nie tylko przeszukiwał dokumenty, ale też je „rozumiał”.

### 1. Dwa sposoby szukania (Analogia)
Wyobraź sobie, że szukasz książki w wielkiej bibliotece:
*   **Wyszukiwanie Pełnotekstowe (FTS):** To jak szukanie konkretnego słowa na okładce (np. „pies”). Jeśli słowa nie ma, nic nie znajdziesz.
*   **Wyszukiwanie Semantyczne (Embeddingi):** To jak rozmowa z mądrym bibliotekarzem. Nawet jeśli powiesz „szukam czegoś o czworonożnym przyjacielu człowieka”, on poda Ci książkę o psach, bo rozumie sens Twojej prośby.

### 2. Jak działa Hybrydowy RAG?
System łączy obie te metody, aby dać najlepszy wynik:

| Krok | Opis działania |
| :--- | :--- |
| **Zapytanie** | Agent tworzy dwa rodzaje pytań: listę słów kluczowych oraz pytanie w języku naturalnym. |
| **Szukanie** | System przeszukuje bazę danych dwoma metodami jednocześnie. |
| **Łączenie (RRF)** | Wyniki z obu metod są mieszane. Dokumenty ważne dla obu podejść trafiają na samą górę. |

### 3. Hybrydowy RAG vs Klasyczne Narzędzia (np. grep)

| Cecha | Hybrydowy RAG | Tradycyjne CLI (grep/ripgrep) |
| :--- | :--- | :--- |
| **Indeksowanie** | Wymagane (przygotowanie bazy) | **Niepotrzebne** (działa od razu) |
| **Rozumienie** | Szuka znaczenia i kontekstu | Szuka tylko dokładnych liter |
| **Multimedia** | Może przeszukiwać obrazy | Głównie tekst |
| **Język** | Świetnie radzi sobie z tłumaczeniami | Wymaga ręcznego tłumaczenia fraz |

### 4. Kluczowe zasady ("Mniej znaczy lepiej")
*   **Zasada wymiarów:** Liczba wymiarów w bazie (np. 1536) musi być identyczna z tą, którą generuje Twój model AI. Inaczej system nie zadziała.
*   **Rozumowanie > Dopasowanie:** Hybrydowy RAG potrzebuje „chwili namysłu” agenta, aby znaleźć to, co jest **istotne**, a nie tylko **podobne**.
*   **Wybór narzędzia:** Nie szukaj „najlepszej” metody. Wybierz tę, która najlepiej pasuje do Twojego konkretnego problemu.

## Główne wyzwania skuteczności RAG i zarządzania bazą wiedzy

System RAG (Retrieval-Augmented Generation) to proces, w którym sztuczna inteligencja korzysta z Twoich prywatnych dokumentów, aby udzielać precyzyjnych odpowiedzi. Można to porównać do **kucharza (modelu AI), który dostał Twoją osobistą książkę kucharską (baza wiedzy)**, zamiast polegać tylko na tym, czego nauczył się w szkole.

Oto główne wyzwania, które sprawiają, że ten proces bywa trudny:

### Wyzwania skutecznego systemu RAG

| Wyzwanie | Na czym polega? | Analogia |
| :--- | :--- | :--- |
| **Wiedza bazowa** | Model ufa swojej pamięci bardziej niż Twoim dokumentom. | Student, który upiera się przy swojej wersji, mimo że podręcznik mówi co innego. |
| **Zakres wiedzy** | Trudno wyciągnąć 100% informacji, co prowadzi do zmyślania (halucynacji). | Szukanie igły w stogu siana – gdy jej nie znajdziesz, udajesz, że wiesz, gdzie jest. |
| **Świadomość bazy** | Model nie wie dokładnie, co ma w zasobach. | Bibliotekarz, który ma tysiące książek, ale nie posiada ich spisu treści. |
| **Brak kontekstu** | Model nie wie, kim jesteś i o co dokładnie pytasz (np. co to są "moje projekty"). | Ktoś pyta Cię: „Gdzie to położyłem?”, nie mówiąc, kim jest ani o czym mówi. |
| **Format danych** | Trudno przeszukiwać zdjęcia, filmy czy nagrania audio. | Próba przeczytania książki napisanej hieroglifami bez znajomości alfabetu. |

### Klucz do sukcesu

Aby system RAG był naprawdę użyteczny, nie może być "uniwersalnym skryptem". Musi zostać **„uszyty na miarę”** – dopasowany konkretnie do rodzaju Twoich danych oraz formatów, w jakich je przechowujesz.

**Warto zapamiętać:**
*   Nawet najlepszy model potrzebuje jasnych instrukcji, gdzie szukać wiedzy.
*   Niepełne dane w wynikach wyszukiwania to najkrótsza droga do błędnych odpowiedzi AI.
*   Rozwiązania takie jak **Graph RAG** (bazy grafowe) pomagają lepiej łączyć fakty i rozumieć kontekst.