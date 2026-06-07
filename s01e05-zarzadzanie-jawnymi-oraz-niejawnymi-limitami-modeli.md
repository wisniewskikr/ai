# Zarządzanie jawnymi oraz niejawnymi limitami modeli

## Podstawy generatywnych aplikacji w środowisku produkcyjnym

Tworzenie aplikacji AI, która działa na produkcji, przypomina **przejście z piaskownicy na plac budowy**. W piaskownicy (prototypie) wszystko wydaje się łatwe, ale na budowie (produkcji) musisz liczyć się z kosztami, bezpieczeństwem i stabilnością konstrukcji.

### Kluczowe wyzwania w środowisku produkcyjnym

| Wyzwanie | Opis w pigułce |
| :--- | :--- |
| **Kontekst** | Modele mają ograniczoną pamięć i "puchną" przy dużych plikach. |
| **Kontrola** | AI może zmyślać (halucynować) i działać nieprzewidywalnie. |
| **Wydajność** | Generowanie odpowiedzi jest znacznie wolniejsze niż tradycyjny kod. |
| **Koszty** | Płacisz za każdy przetworzony fragment tekstu (token). |
| **Bezpieczeństwo** | Ryzyko wycieku danych lub ataków typu *Prompt Injection*. |

---

### Strategia "Mniej znaczy lepiej" w praktyce

#### 1. Zarządzanie Kontekstem
**Analogia:** Czytanie książki przez dziurkę od klucza. Nie możesz zobaczyć wszystkiego naraz, więc musisz wybierać najważniejsze fragmenty.
*   **Przygotuj się na gigantów:** Użytkownicy będą wrzucać 500-stronicowe dokumenty PDF – musisz mieć system, który je sprawnie podzieli.
*   **Oszczędzaj tokeny:** Nie wrzucaj wszystkiego do modelu. Dobry "Context Engineering" to podstawa rentowności projektu.

#### 2. Kontrola nad modelem
**Analogia:** AI to jak bardzo zdolny, ale rozkojarzony stażysta. Może wykonać zadanie, ale przed wysłaniem ważnego maila musisz spojrzeć mu na ręce.
*   **Przyciski zamiast obietnic:** Decyzje o krytycznych akcjach (np. usunięcie danych) powinny być podejmowane przez człowieka za pomocą **fizycznych przycisków** w interfejsie, a nie przez samo AI.
*   **Lista zaufanych akcji:** Możesz pozwolić AI na automatyczne działanie tylko dla zweryfikowanych zadań (np. `resend__send`), ale usuwaj je z listy, gdy zmieni się ich struktura.

#### 3. Wydajność i UX
**Analogia:** Kelner w restauracji, który co kilka minut mówi: „Twoja pizza już jest w piecu” (tzw. heartbeat), zamiast znikać w kuchni na pół godziny.
*   **Informuj o postępach:** Pokazuj użytkownikowi, co aktualnie robi agent, aby czas oczekiwania wydawał się krótszy.
*   **Wielowątkowość:** Pozwól użytkownikowi otworzyć nowy wątek lub wysłać wiadomość do kolejki, gdy model jeszcze pracuje nad poprzednim zadaniem.
*   **Złota zasada:** Zawsze zadawaj sobie pytanie: **"Czy AI jest tu niezbędne?"**. Jeśli coś można zrobić zwykłym kodem – zrób to kodem.

---

### Architektura: Prosta i Elastyczna

Aby Twoja aplikacja przetrwała próbę czasu, stosuj te zasady:
*   **Unikaj ciężkich frameworków:** Na tym etapie rozwoju AI biblioteki takie jak *LangChain* mogą stać się obciążeniem przy szybkich zmianach API.
*   **Wspólny interfejs:** Używaj narzędzi (np. AI SDK), które pozwalają na łatwą zmianę dostawcy modelu (np. z OpenAI na Anthropic) bez przepisywania połowy aplikacji.
*   **Moderacja to mus:** Zawsze używaj **Moderation API**. Brak filtrowania nieodpowiednich treści może doprowadzić do zablokowania Twojego konta u dostawcy.
*   **Pamiętaj o prawie:** Twoja aplikacja musi mieć jasny Regulamin i Politykę Prywatności, szczególnie gdy przetwarza dane firmowe.

## Rodzaje limitów modeli generatywnego AI oraz API

Praca z modelami AI przypomina zarządzanie **restauracją**: masz ograniczoną liczbę stolików (okno kontekstowe), określoną prędkość wydawania dań (limity API) i musisz pilnować, aby goście nie zamawiali więcej, niż są w stanie zjeść (limity użytkowników).

### 1. Kluczowe ograniczenia techniczne
Modele nie generują treści w nieskończoność. Nawet jeśli model ma ogromne „okno kontekstowe”, jego wypowiedź jest ograniczona.

| Rodzaj limitu | Opis | Analoga |
| :--- | :--- | :--- |
| **Tokeny wyjściowe** | Maksymalna długość jednej odpowiedzi modelu (zwykle 2k – 128k). | Rozmiar talerza – nie nałożysz więcej jedzenia, niż on pomieści. |
| **Okno kontekstowe** | Łączna suma danych wejściowych i wyjściowych. | Wielkość stołu – jeśli położysz nową kartkę, stara musi spaść. |
| **Wiedza bazowa** | Informacje, na których model został wytrenowany. | Książki, które kucharz przeczytał przed otwarciem kuchni. |

### 2. Jak zarządzać zasobami (Zasada "Mniej znaczy lepiej")
W złożonych systemach musisz kontrolować zużycie tokenów, zanim system się „zapcha”.

*   **Szacowanie „na oko”:** Przyjmij, że **1 token ≈ 3-4 litery** (w j. angielskim).
*   **Margines bezpieczeństwa:** Zawsze zachowuj **20% bufora** wolnego miejsca w limicie modelu.
*   **Wczesne sprzątanie:** Akcje takie jak kompresja czy usuwanie zbędnych informacji uruchamiaj już przy **30% zużycia limitu**.
*   **Precyzja:** Po każdym zapytaniu sprawdzaj nagłówki API – tam znajdziesz dokładną informację o faktycznym zużyciu.

### 3. Limity API i kontrola użytkowników
Produkcyjne wdrożenie wymaga ochrony systemu przed przeciążeniem i nadmiernymi kosztami.

| Parametr | Co oznacza? | Jak zarządzać? |
| :--- | :--- | :--- |
| **RPM** | Zapytania na minutę. | Informuj użytkownika o konieczności czekania. |
| **TPM** | Tokeny na minutę. | Monitoruj nagłówki odpowiedzi z serwera. |
| **Limity użytkownika** | Indywidualny przydział dla klienta. | Nadawaj osobne klucze (np. przez OpenRouter), by kontrolować wydatki. |

**Pamiętaj:** Każda funkcja wykorzystująca AI, nawet otwarta dla anonimowych osób, musi mieć zabezpieczenie przed zbyt dużą liczbą zapytań. Analizuj nagłówki API, aby wiedzieć, kiedy zbliżasz się do „ściany” i móc odpowiednio zareagować.

## Niejawne ograniczenia oraz powszechne błędy modeli

To, że model generuje poprawnie wyglądający interfejs, nie oznacza, że zawarte w nim dane są prawdziwe. Oto zestawienie kluczowych pojęć:

### Struktura vs. Treść
To, że otrzymujemy poprawny technicznie format (np. JSON), nie gwarantuje poprawności danych.

| Cecha | Stan faktyczny | Ryzyko |
| :--- | :--- | :--- |
| **Gwarancja struktury** | System pilnuje, by dane "mieściły się w pudełku". | Nawet idealne "pudełko" może zawierać błędne dane. |
| **Gwarancja wartości** | Brak 100% pewności co do uzyskanych rezultatów. | Model może "zmyślić" liczby na wykresie, a system tego nie wykryje. |

**Analogia:** To jak wypełnienie urzędowego formularza – fakt, że wpisaliśmy datę w odpowiednią rubrykę, nie sprawia automatycznie, że ta data jest prawdziwa.

### Dlaczego modele halucynują?
Modele często starają się być pomocne "na siłę" zamiast przyznać się do błędu.

*   **Zgadywanie:** Zamiast poprosić o doprecyzowanie, model zakłada, że wie, o co chodzi (np. domyśla się adresu e-mail po nazwisku).
*   **Nadmierna pewność:** Niektóre modele (np. Gemini Flash) w pełni zmyślają treść stron www na podstawie samego adresu URL.
*   **Błędy techniczne:** Instrukcje mogą zostać źle wczytane przez aplikację, co dezorientuje model.

**Analogia:** Model zachowuje się jak uczeń, który nie zna odpowiedzi na pytanie, ale pisze cokolwiek, byle nie oddać pustej kartki.

### Jak zwiększyć bezpieczeństwo?
Choć halucynacji nie da się wyeliminować całkowicie, można znacząco obniżyć ich ryzyko.

*   **Jasne granice:** Informuj model, czy ma dostęp do internetu lub plików.
*   **Zasada dopytywania:** Daj instrukcję: "Jeśli nie wiesz – dopytaj lub przerwij zadanie".
*   **Dzielenie zadań:** Rozbijaj skomplikowane polecenia na mniejsze kroki.
*   **Mniej kontekstu:** Ogranicz zbędne informacje, które rozpraszają uwagę modelu.
*   **Monitoring:** Zapisuj i analizuj wszystkie zdarzenia, by wykryć pomyłki w systemach wieloagentowych.

**Analogia:** Monitorowanie modelu to jak "czarna skrzynka" w samolocie – pozwala zrozumieć, co poszło nie tak w trakcie lotu (interakcji).

## Limity narzędzi i ograniczenia środowiskowe

Wdrażanie AI w firmie przypomina budowę nowoczesnej kuchni w starym domu — nawet najlepszy sprzęt nie zadziała, jeśli instalacja elektryczna jest przestarzała, a woda nie jest podłączona.

Oto kluczowe bariery i sposoby na ich pokonanie:

### Dlaczego AI "stoi w miejscu"?
Często problemem nie jest sam model AI, ale jego otoczenie.

| Bariera | Analogia |
| :--- | :--- |
| **Rozproszona wiedza** | Próba upieczenia ciasta, gdy mąka jest w piwnicy, a jajka w garażu. |
| **Brak API w starych narzędziach** | Próba podłączenia nowoczesnego smartfona do starego telewizora kineskopowego. |
| **Procesy manualne (niepisane)** | Przepis na danie, który istnieje tylko w głowie babci i nie jest nigdzie spisany. |
| **Brak danych z terenu/magazynu** | Próba zarządzania sklepem bez wiedzy, co aktualnie znajduje się na półkach. |

### Jak przygotować grunt pod AI?
Aby technologia zadziałała, konieczna jest ścisła współpraca z biznesem i techniczna "transformacja cyfrowa",.

*   **Naprawa procesów:** Zamiast automatyzować bałagan, stwórz nowe lub zmodyfikuj istniejące zasady pracy.
*   **Wymiana narzędzi:** Przejdź na nowsze oprogramowanie, które potrafi "rozmawiać" z innymi systemami (przez API).
*   **Porządek w dokumentach:** Ujednolic formaty i stwórz jedno, pewne źródło wiedzy.

### Kluczowa lekcja: Optymalizacja, nie magia
Wdrażanie AI to nie zawsze pełna automatyzacja, ale często sprytna optymalizacja.

*   **Zasada roweru elektrycznego:** AI nie musi jechać za Ciebie. Jeśli sprawi, że praca będzie o **10-15% lżejsza lub szybsza**, to z biznesowego punktu widzenia jest to ogromny sukces.
*   **Technologia to fundament:** Projektowanie rozwiązań dla biznesu to w dużej mierze techniczna strona transformacji cyfrowej, którą warto planować krok po kroku.

## Przygotowanie produkcyjnego środowiska

Architektura systemu agentowego przypomina **budowę nowoczesnego biura** – każdy element musi mieć swoje miejsce, a komunikacja musi być sprawna i zabezpieczona.

### 🛠️ Główne Komponenty Systemu
Poniższa tabela przedstawia "fundamenty", na których opiera się produkcyjna aplikacja agentowa:

| Komponent | Funkcja | Analogia |
| :--- | :--- | :--- |
| **API (/api/chat)** | Punkt kontaktu z użytkownikiem. | Recepcja w biurowcu. |
| **Baza Danych (SQLite)** | Przechowywanie sesji i kluczy. | Segregator z dokumentami. |
| **Agent (Plik Markdown)** | Definicja roli, modelu i narzędzi. | Instrukcja stanowiskowa pracownika. |
| **Provider Layer** | Tłumaczenie zapytań dla OpenAI/Gemini. | Tłumacz symultaniczny. |
| **Monitoring** | Śledzenie logów i aktywności agenta. | Kamery monitoringu i czujniki. |

---

### 🔄 Pętla Agenta (Serce Systemu)
Logika agenta to proces, który przypomina **listę kontrolną pilota** przed i w trakcie lotu. Działa on w oparciu o zdarzenia (Events), do których możemy się "podpiąć":

*   **Start:** Rozpoczęcie interakcji i iteracji.
*   **Działanie:** Wybór i wywołanie narzędzi (np. dostęp do plików przez MCP).
*   **Kontrola:** Obsługa pauzy, błędów lub anulowania zadania.
*   **Koniec:** Zakończenie iteracji i zapisanie stanu.

---

### 🛡️ Bezpieczeństwo i Konfiguracja
W produkcji stosujemy zasadę **"ograniczonego zaufania"**:

*   **Klucze API:** Każdy użytkownik ma własny klucz (hash w bazie), który chroni dostęp do ścieżek.
*   **Zmienne `.env`:** Tajne dane (hasła, porty) trzymamy poza kodem źródłowym.
*   **Izolacja:** Agent "rozmawia" uniwersalnym językiem, a warstwa tłumaczeń dba o limity i specyfikę danego modelu.

---

### 🚀 Szybki Deployment (Wdrożenie)
Wdrożenie aplikacji to jak **przeprowadzka do nowego domu** – wymaga przygotowania terenu i mediów:

1.  **Serwer (Droplet):** Wynajęcie "mieszkania" (np. na DigitalOcean) z systemem Ubuntu.
2.  **Media (Nginx & TLS):** Podłączenie "prądu i wody" – konfiguracja domeny i bezpiecznego szyfrowania.
3.  **Automatyzacja (GitHub Actions):** "Ekipa remontowa", która automatycznie odświeża kod po każdej zmianie.
4.  **Monitoring:** Zainstalowanie "alarmu" (np. Langfuse), by widzieć, co robią agenci.

*Warto pamiętać: Cała architektura powinna być niezależna od konkretnych bibliotek AI, co pozwala na jej elastyczny rozwój w przyszłości.*