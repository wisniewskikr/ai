Wybór języka w pracy z AI to nie kwestia preferencji, ale inżynierii i zarządzania budżetem. Oto jak optymalnie komunikować się z agentem:

### 1. Ekonomia tokenów: Dlaczego język ma znaczenie?

Wyobraź sobie, że **tokeny to waluta**, a okno kontekstowe to Twój portfel. Pisząc po polsku, wydajesz tę walutę dwa razy szybciej na ten sam cel.

| Cecha | Język angielski | Język polski |
| :--- | :--- | :--- |
| **Wydajność** | Wysoka (krótszy zapis) | Niższa (więcej tokenów przez odmianę) |
| **Precyzja kodu** | Naturalna dla IT | Wymaga mapowania pojęć |
| **Koszt** | Niższy (oszczędność okna) | Wyższy (szybsze zapchanie kontekstu) |

**Analogia:** Pisanie po polsku do AI jest jak pakowanie bagażu do za małej walizki – niby wszystko się mieści, ale zamek (uwaga modelu) szybciej pęka.

---

### 2. Kiedy wybrać dany język?

Stosuj zasadę przypisywania języka do konkretnego zadania, a nie do całego projektu.

| Sytuacja | Zalecany język | Dlaczego? |
| :--- | :--- | :--- |
| **Zasady repozytorium** (np. `CLAUDE.md`) | **Angielski** | Stabilny kontrakt i lepsze wyszukiwanie w kodzie. |
| **Polecenia techniczne** (Refactor, Fix) | **Angielski** | Krótszy zapis i brak "szumu" przy tłumaczeniu nazw funkcji. |
| **Planowanie i "myślenie na głos"** | **Polski** | Szybsze pokonanie własnych barier poznawczych. |
| **Treści dla użytkownika** (UI, maile) | **Język produktu** | AI powinno pisać tak, jak mówi Twoja aplikacja. |

---

### 3. Złote zasady "Mniej znaczy lepiej"

*   **Traktuj angielski jak język operacyjny** – tak samo jak nazwy zmiennych czy commity w Gicie.
*   **Polski jako "Debug Mode"** – używaj go, gdy musisz szybko wyjaśnić skomplikowany problem biznesowy koledze-agentowi.
*   **Unikaj akademickich esejów** – model rozumuje ponadjęzykowo; liczy się konkret, a nie kwiecisty styl.
*   **Kontroluj artefakty** – zamiast prosić o "przemyślenie", proś o listę plików do zmiany lub konkretny plan.

**Analogia:** Angielski to sterylny skalpel chirurga (precyzja i oszczędność), a polski to tablica w pokoju spotkań (burza mózgów i jasność myślenia).