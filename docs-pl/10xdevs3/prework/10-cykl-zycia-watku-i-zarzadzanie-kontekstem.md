Zrozumienie **Context Engineeringu** to przejście z roli „pisarza” (prompt engineering) do roli **„projektanta systemu”**. Zamiast tylko prosić o lepsze wyniki, zarządzasz tym, co agent widzi i pamięta.

### Czym jest Context Engineering?
Wyobraź sobie, że okno kontekstowe to **biurko**, na którym pracuje agent. Jeśli zasypiesz je tysiącami przypadkowych kartek, agent przestanie widzieć najważniejszy projekt.

| Pojęcie | Opis (Analogia) | Cel |
| :--- | :--- | :--- |
| **Prompt Engineering** | Pisanie jasnych instrukcji (pisanie listu). | Lepsza odpowiedź „tu i teraz”. |
| **Context Engineering** | Decydowanie, co leży na biurku (zarządzanie warsztatem). | Długofalowa skuteczność agenta. |

---

### 4 Strategie Zarządzania „Biurkiem”
Zamiast pozwalać, by kontekst rósł chaotycznie, stosuj mapę decyzji **W-S-C-I**:

*   **Write (Zapisz):** Notuj ważne fakty w plikach (np. markdown) poza czatem. To „pamięć trwała”, która przeżyje restart sesji.
*   **Select (Wybierz):** Dostarczaj tylko to, co potrzebne. Używaj wyszukiwania semantycznego lub oznaczeń `@`, zamiast wklejać cały kod.
*   **Compress (Kompresuj):** Streszczaj historię. Usuwaj zbędne logi, zostawiaj tylko kluczowe decyzje.
*   **Isolate (Izoluj):** Deleguj zadania subagentom. Oni brudzą swoje „biurka” szczegółami, a Tobie oddają tylko gotowy raport.

---

### Kiedy Twój Agent „ma dość”?
Gdy okno kontekstowe jest przeładowane, model zaczyna wykazywać **sygnały degradacji**:
*   **Deja Vu:** Odkrywa pliki, które już zna.
*   **Halucynacje:** Wymyśla nieistniejące ścieżki i komendy.
*   **Amnezja:** Zapomina o ustalonych ograniczeniach (np. „nie ruszaj API”).
*   **Błędne koło:** Naprawia ten sam błąd w kółko tą samą metodą.

---

### Mapa Ratunkowa (Co robić?)
Jeśli zauważysz powyższe sygnały, nie proś agenta, by „bardziej się skupił”. Wybierz konkretne narzędzie:

| Sytuacja | Rozwiązanie | Skutek |
| :--- | :--- | :--- |
| Długa sesja, dobry kierunek | **Compact** | Odchudzenie historii, zachowanie faktów. |
| Koniec zadania / Nowy temat | **Clear** | Czyste biurko, zachowanie reguł projektu. |
| Błąd w ostatnim kroku | **Undo** | Cofnięcie do momentu przed pomyłką. |
| Agent całkiem się pogubił | **Nowy wątek** | Start od zera z czystym umysłem. |

---

### Złota zasada: „Zapisz, zanim zresetujesz”
Zanim wyczyścisz wątek, wykonaj **zrzut pamięci (Write)** do pliku:
*   Aktualny cel i podjęte decyzje.
*   Zmienione pliki i status testów.
*   **Następny prompt**, od którego chcesz zacząć w nowym oknie.

**Pamiętaj:** Jeśli poprawiasz agenta więcej niż dwa razy w tej samej sprawie – zrób `/clear` i zacznij od nowa z lepszym promptem.