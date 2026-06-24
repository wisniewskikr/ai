Praca z AI w programowaniu to nie "magia", ale inżynieria. Aby wycisnąć z modeli to, co najlepsze, musisz zrozumieć ich mechanikę i ograniczenia.

### 1. Jak działa LLM? (Statystyka zamiast rozumu)

Wyobraź sobie, że model to **super-zaawansowana funkcja autouzupełniania**. On nie "rozumie" Twojej aplikacji, ale przewiduje, co statystycznie powinno wystąpić po Twoim zapytaniu.

| Cecha | Opis | Analogia |
| :--- | :--- | :--- |
| **Predykcja tokenów** | Model wybiera fragment tekstu, który matematycznie najlepiej pasuje do kontekstu. | Jak papuga, która zna gramatykę, ale nie zna sensu życia. |
| **Brak "obrazu" kodu** | Model nie czuje dysonansu, gdy łamie zasady SOLID; chce tylko zminimalizować błąd predykcji. | Jak genialny copywriter, który pisze o medycynie, choć nigdy nie był w szpitalu. |
| **Złudzenie poprawności** | Kod może wyglądać znajomo i poprawnie (składniowo), ale nie działać (semantycznie). | "Atrapa" – z daleka wygląda jak prawdziwy budynek, ale w środku nie ma instalacji. |

### 2. Modele rozumujące (Reasoners)

Nie każde zadanie wymaga "myśliciela". Branża wprowadziła podział na poziom wysiłku (effort), za który płacisz dodatkowymi "tokenami myślowymi".

**Analogia:** Wybór modelu to jak zatrudnienie pracownika – nie potrzebujesz profesora architektury do pomalowania ściany.

*   **Niski wysiłek (Low):** Do szybkich, mechanicznych zmian.
*   **Wysoki wysiłek (High/XHigh):** Do projektowania migracji czy szukania trudnych błędów.

### 3. Pułapka "Przeładowanego Plecaka" (Kontekst)

Wrzucanie całego repozytorium do czatu to błąd. Istnieje bariera **MECW (Maximum Effective Context Window)**, po przekroczeniu której model głupieje.

*   **Efekt "środka":** Model najlepiej pamięta początek i koniec Twojej prośby, gubiąc logikę ukrytą w środku.
*   **Szum informacyjny:** Nieistotne logi i dokumentacja obniżają zdolności analityczne AI.

**Analogia:** Twoje biurko. Jeśli zasypiesz je tysiącem papierów, nie znajdziesz tego jednego ważnego kontraktu, nawet jeśli "jest na biurku".

### 4. Złote zasady 10xDev

*   **Weryfikuj, nie ufaj:** Zawsze sprawdzaj diffy, uruchamiaj testy i buduj projekt. AI może zaproponować coś, co ignoruje realne ograniczenia środowiska.
*   **Budżetuj tokeny:** Pamiętaj, że miejsce w "oknie" zajmują nie tylko Twoje pytania, ale też instrukcje systemowe i definicje narzędzi.
*   **Mniej znaczy lepiej:** Przed wysłaniem promptu usuń z niego zbędne treści. Model, który widzi tylko "sygnał" (ważne dane), pracuje lepiej niż ten zasypany "szumem".

**Akcja na dziś:** Zanim wyślesz zapytanie, spójrz na nie oczami modelu – czy to, co widzi, to konkretna instrukcja, czy ściana tekstu pełna zbędnych trików stylistycznych?