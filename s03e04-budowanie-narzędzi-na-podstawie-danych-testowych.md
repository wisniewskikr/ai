#Budowanie narzędzi na podstawie danych testowych

## Koncepcja stosowania LLM przy tworzeniu narzędzi

Projektowanie narzędzi dla agentów AI przypomina **budowanie spersonalizowanego zestawu kluczy** zamiast przekazywania włamywaczowi wytrycha, który pasuje do wszystkiego. Oto jak tworzyć wysokiej jakości integracje, korzystając z pomocy LLM.

### Porównanie podejść do integracji

| Cecha | Gotowy serwer MCP / CLI | Narzędzie "Szyte na miarę" |
| :--- | :--- | :--- |
| **Dostęp** | Pełny (często zbyt szeroki) | Precyzyjnie zawężony (np. tylko support) |
| **Dopasowanie** | Ogólne | Idealne pod konkretne potrzeby |
| **Ryzyko** | Wysokie (agent widzi za dużo) | Niskie (bezpieczne granice) |
| **Analoga** | Scyzoryk szwajcarski | Laserowy skalpel |

### Jak zaprojektować skuteczne narzędzie (Krok po kroku)

Zamiast zdawać się na domyślne ustawienia, przejdź przez ten proces wspólnie z modelem:

*   **Zbierz materiały:** Pobierz dokumentację API (jako Markdown) i kod źródłowy SDK.
*   **Zdefiniuj granice:** Wybierz tylko te akcje, które są niezbędne (np. wysyłanie, ale nie usuwanie wiadomości).
*   **Iteruj schemat:** Pierwsza propozycja modelu będzie prawdopodobnie "iluzją poprawności" – poprawiaj ją, aż będzie doskonała.
*   **Dodaj opisy:** Agent musi wiedzieć, do czego służy każde pole (tzw. wskazówki dla agenta).

### Pułapki i rozwiązania

| Błąd | Dlaczego to problem? | Rozwiązanie |
| :--- | :--- | :--- |
| **Brak stronicowania** | Agent utonie w danych. | Dodaj parametry limitu i przesunięcia. |
| **Załączniki base64** | "Zabijają" kontekst modelu ogromem danych. | Przesyłaj linki lub metadane. |
| **Zbyt krótkie snippety** | Agent nie wie, o czym jest treść. | Zapewnij czytelny dostęp do treści. |
| **Brak metadanych** | Agent działa na oślep. | Dodaj statusy (przeczytane, etykiety). |

### Kluczowe analogie dla lepszego zrozumienia

1.  **Ograniczanie uprawnień:** Przekazanie agentowi narzędzia `gmail__search_support` zamiast ogólnego `gmail__search` jest jak **zatrudnienie recepcjonisty**, który ma klucz tylko do poczekalni, a nie do sejfu prezesa.
2.  **Struktura danych:** Dobrze zaprojektowany schemat wejścia/wyjścia to **instrukcja składania mebli**. Jeśli brakuje w niej rysunków (opisów pól), agent złoży szafkę do góry nogami.
3.  **Dane base64:** Przesyłanie agentowi plików w formacie base64 to jak **próba czytania książki, gdy ktoś sypie Ci piach w oczy** – technicznie tekst tam jest, ale nic nie widzisz.

**Pamiętaj:** Najlepsze narzędzia to takie, które mają wspólną strukturę odpowiedzi, jasne wskazówki i są dopracowane w kilku iteracjach z modelem.

## Gromadzenie i generowanie zestawów danych testowych

Tworzenie systemów opartych na AI przypomina przygotowania do lotu w kosmos – zanim wystartujesz, musisz przeprowadzić tysiące symulacji.

### 1. Generowanie Danych: Twój „Sparring Partner”
Syntetyczne dane to bezpieczny poligon doświadczalny. Zamiast czekać na prawdziwych użytkowników, prosisz model, by ich udawał.

| Etap | Działanie | Dlaczego to ważne? |
| :--- | :--- | :--- |
| **Start** | Podaj kod źródłowy lub strukturę narzędzi. | AI musi znać zasady Twojego świata. |
| **Rozruch** | Wygeneruj kilka przykładów i wybierz najlepsze. | Tworzysz bazę do dalszej rozbudowy. |
| **Szlifowanie** | Zadbaj o **różnorodność** i **sens**. | AI samo z siebie tworzy proste i powtarzalne testy. |

**Analogia:** To jak trening bokserski z cieniem – pozwala wypracować techniku, zanim staniesz w ringu z prawdziwym przeciwnikiem.

### 2. Strategia Testowania: Co sprawdzać?
Nie testuj wszystkiego naraz. Podziel pracę na mniejsze kroki:

*   **Pojedyncze narzędzia:** Czy model potrafi poprawnie użyć młotka?
*   **Scenariusze (wieloetapowe):** Czy model potrafi zbudować dom, używając wielu narzędzi po kolei?
*   **Obsługa błędów:** Jak model zareaguje, gdy „młotek” się zepsuje?
*   **Brak instrukcji:** Sprawdź, jak radzi sobie sam opis narzędzi (bez długich instrukcji systemowych).

### 3. Narzędziownik: Gdzie testować?
Wybór narzędzia zależy od tego, czy „budujesz”, czy „obserwujesz”.

| Narzędzie | Rola | Analogia |
| :--- | :--- | :--- |
| **Promptfoo** | Ewaluacja „offline” podczas tworzenia aplikacji. | **Symulator lotu:** Testujesz silnik, zanim oderwiesz się od ziemi. |
| **Langfuse** | Obserwacja i ewaluacja „online” działającego systemu. | **Czarna skrzynka:** Rejestruje parametry lotu w czasie rzeczywistym. |

### 4. Wybór Modela: Porównanie „Pilotów”
Przetestowanie kilku modeli pozwala znaleźć złoty środek między ceną a jakością.

*   **GPT-5.2:** Perfekcyjny i techniczny, ale powolny (Najlepszy do trudnych zadań).
*   **GPT-4.1:** Profesjonalny i szybki, ale czasem „skraca drogę” (Ryzyko niepełnych odpowiedzi).
*   **GPT-5-mini:** Solidny średniak (Dobry balans).

**Zasada „Mniej znaczy lepiej”:** Nie szukaj ideału w każdym teście na początku. Zacznij od kilku podstawowych interakcji, sprawdź konfigurację i stopniowo rozbudowuj kategorie. To Ty jesteś reżyserem – AI dostarcza aktorów i scenografię, ale to Ty musisz wyłapać błędy logiczne.

## Wybór zestawu modeli w celu zwiększania efektywności

Wybór odpowiedniego modelu AI przypomina **dobieranie pojazdu do zadania**: nie potrzebujesz 40-tonowej ciężarówki (duży model), aby przewieźć list do skrzynki sąsiada, ale rower (mały model) nie sprawdzi się przy przeprowadzce całego domu,.

Oto zestawienie strategii wyboru modeli na podstawie Twoich materiałów:

### Porównanie dostępnych opcji

| Model | Rekomendacja | Dlaczego? |
| :--- | :--- | :--- |
| **GPT-5.2** | **Główny wybór** | Najwyższa stabilność i obsługa złożonego kontekstu. |
| **GPT-5-mini** | **Dla prostych zadań** | Szybki i tani; idealny do konkretnych, wąskich akcji,. |
| **Qwen 3.5 / Lokalne** | **Opcja oszczędna** | Warto rozważyć przy własnych serwerach dla prostych integracji. |
| **GPT-4.1** | **Odrzucony** | Mimo efektywności, wykazuje problemy ze stabilnością na produkcji. |

---

### Kluczowe zasady optymalizacji

*   **Kontekst decyduje o rozmiarze:** Jeśli agent musi analizować ogromne ilości danych (np. setki e-maili), małe modele tracą sens.
*   **Ewaluacja to podstawa:** Posiadanie gotowych testów pozwala błyskawicznie sprawdzić, czy tańszy model (np. z platformy OpenRouter) „daje radę”.
*   **Zasada „Treningu Juniora”:** Optymalizuj instrukcje tak, by zrozumiały je najmniejsze modele. Dzięki temu największe modele będą działać jeszcze skuteczniej.

---

### Analogia: Warsztat Majsterkowicza

Wyobraź sobie, że budujesz system:
1.  **Narzędzia (Interfejsy):** Jeśli zaprojektujesz narzędzia tak prosto, by poradził sobie z nimi uczeń (mały model), to mistrz (duży model) wykona nimi pracę perfekcyjnie i bezbłędnie.
2.  **Wybór ekipy:** Do segregowania poczty (Gmail) zatrudniasz asystenta (mini model), ale do planowania całej strategii firmy potrzebujesz eksperta (duży model).

**Mniej znaczy lepiej:** Zamiast używać najpotężniejszego modelu do wszystkiego, dopasuj narzędzie do trudności zadania, korzystając z wyników ewaluacji,.

## Automatyczna optymalizacja schematu oraz odpowiedzi

Optymalizacja schematów i narzędzi AI to proces, który można porównać do **budowy nowoczesnego domu z inteligentnym asystentem**. Zamiast samodzielnie sprawdzać każdą śrubkę, masz robota, który czyta instrukcje i pilnuje standardów.

Oto jak wygląda różnica między podejściem ręcznym a zautomatyzowanym:

### Porównanie metod pracy

| Cecha | Podejście tradycyjne | Automatyczna optymalizacja |
| :--- | :--- | :--- |
| **Planowanie** | Żmudna i wymagająca praca | Wsparcie agentów do kodowania |
| **Kontrola jakości** | Ręczne sprawdzanie testów | Analiza plików i terminala przez AI |
| **Wybór modeli** | Sztywne trzymanie się jednego rozwiązania | Elastyczne przełączanie (np. na modele Open Source) |

---

### Kluczowe korzyści automatyzacji

*   **Inteligentni Asystenci**: Agenci AI mogą samodzielnie czytać Twoje pliki, przeprowadzać testy i sugerować ulepszenia na podstawie gotowych checklist.
*   **Optymalizacja kosztów**: Gdy system jest stabilny, możesz przełączyć się na **słabsze, ale tańsze modele** (np. Qwen, GLM), które często oferują lepszy styl wypowiedzi.
*   **Ciągłe doskonalenie**: Proces staje się samonapędzającą się maszyną, która weryfikuje najnowsze modele dostępne na rynku.

---

### Analogia: AI jako "Szef Kuchni"
Wyobraź sobie, że tworzenie narzędzi AI to **prowadzenie restauracji**:
1.  **Przepis (Schemat)**: AI pomaga Ci go dopracować, by danie zawsze smakowało tak samo.
2.  **Degustacja (Ewaluacja)**: Zamiast próbować każdej potrawy, masz system, który automatycznie sprawdza skład i smak na podstawie „listy dobrych praktyk”.
3.  **Dostawcy (Modele)**: Gdy Twoja kuchnia działa sprawnie, możesz zacząć kupować tańsze składniki od lokalnych dostawców (modele Open Source), zachowując tę samą, a nawet lepszą jakość.

**Pamiętaj:** Automatyzacja to nie brak kontroli, ale **skalowanie Twoich możliwości** przy mniejszym wysiłku fizycznym.