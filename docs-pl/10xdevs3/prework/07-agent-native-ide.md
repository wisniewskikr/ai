Agent-native IDE to nowa kategoria narzędzi programistycznych, w których tradycyjny edytor tekstu schodzi na dalszy plan, a sercem pracy staje się **sesja agenta AI**.

### 🛠️ Czym jest Agent-Native IDE? (Analogia)

Wyobraź sobie różnicę między tradycyjnym warsztatem a nowoczesnym centrum dowodzenia:

*   **Tradycyjne IDE jest jak stół warsztatowy:** Sam musisz sięgnąć po każdy młotek (kompilator), śrubokręt (debugger) i własnoręcznie szlifować każdy detal (pisać każdą linię kodu).
*   **Agent-Native IDE jest jak centrum dowodzenia robotami:** Nie trzymasz narzędzi w ręku. Stoisz przed ekranem z listą zadań, wydajesz polecenia głosowe lub tekstowe, a zespół robotów (agentów) wykonuje pracę za Ciebie. Twoim zadaniem jest nadzór, a nie ręczne rzemiosło.

---

### 📊 Porównanie: Klasyczne IDE vs. Agent-Native IDE

| Cecha | Klasyczne IDE | Agent-Native IDE |
| :--- | :--- | :--- |
| **Główny widok** | Plik z kodem źródłowym | Sesja agenta, lista zadań, statusy |
| **Sposób pracy** | Ręczne pisanie i edycja linii kodu | Wydawanie poleceń (promptowanie) |
| **Rola programisty** | Twórca (Rzemieślnik) | Nadzorca (Manager) |
| **Narzędzia** | Edytor, Terminal | Worktrees, sesje równoległe, ewaluacja, |

---

### 🛡️ Zasady bezpiecznej pracy (Złoty dekalog)

Praca z agentami wymaga **większej dyscypliny** niż tradycyjne kodowanie, aby uniknąć chaosu w projekcie. Oto kluczowe punkty, o których musisz pamiętać:

*   **Czysty stan repozytorium:** Zaczynaj pracę agenta tylko na uporządkowanym kodzie.
*   **Ograniczony zakres zmian:** Nie pozwalaj agentowi na "przepisanie wszystkiego" naraz; dawkuj zadania.
*   **Kontrola Diffów:** Zawsze sprawdzaj, co dokładnie zmienił agent, zanim zaakceptujesz kod.
*   **Testy i Review:** Agent to nie nieomylna wyrocznia – jego praca musi zostać przetestowana i sprawdzona przez człowieka.
*   **Zarządzanie sekretami:** Zachowaj ostrożność przy dawaniu agentowi dostępu do kluczy API i haseł.
*   **Świadomość kosztów:** Pamiętaj, że każda sesja agenta generuje koszty zużycia tokenów.

---

### 🚀 Nowe koncepcje w pracy z agentami

Przejście na model Agent-Native wprowadza narzędzia, które wcześniej były opcjonalne, a teraz stają się fundamentem:

*   **Git Worktrees:** Pozwalają na uruchamianie wielu sesji agentów (np. Claude Code) równolegle w różnych folderach, bez mieszania kodu.
*   **Background Agents:** Agenci pracujący w tle, którzy mogą analizować kod lub przygotowywać zmiany, gdy Ty zajmujesz się czymś innym.
*   **Ewaluacja wyników:** Proces sprawdzania, czy rozwiązanie dostarczone przez AI rzeczywiście spełnia postawione wymagania.


---

### Dodatkowe informacje
* Worktree: każdy agent pracuje na swoim drzewie, które potem łączysz
* Praca w chmurze: nie musisz mieć projektu na swoim komputerze, agenci mogą pracować w chmurze
* To tak, jakbyś był menedżerem zespołu. Nie patrzysz na szczegóły, tylko delegujesz zadania.