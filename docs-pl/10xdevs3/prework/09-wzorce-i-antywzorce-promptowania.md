Oto prosty przewodnik po skutecznym promptowaniu agentów AI, oparty na zasadzie **"mniej znaczy lepiej"**.

### Czym różni się Chatbot od Agenta?

Wyobraź sobie, że **Chatbot** to doradca, którego pytasz o przepis na ciasto – on Ci go podaje i na tym kończy się jego rola. **Agent** to natomiast kucharz, któremu dajesz klucze do kuchni; on nie tylko zna przepis, ale sam wyjmuje składniki, piecze i sprząta, a Ty oceniasz gotowy wypiek.

| Cecha | Chatbot (np. ChatGPT) | Agent (np. Claude Code) |
| :--- | :--- | :--- |
| **Czas trwania** | Krótka, jednorazowa tura | Długie, autonomiczne pętle |
| **Ryzyko** | Niskie (tylko tekst) | Wysokie (edytuje pliki, kod) |
| **Charakter** | Jednorazowa porada | Długoterminowy kontrakt |

---

### Anatomia Agenta: Warstwy Instrukcji

Dobry prompt dla agenta jest krótki, ponieważ opiera się na fundamencie wcześniej ustalonych zasad. Można to porównać do **budowy wieżowca** – nie musisz co rano tłumaczyć robotnikom, jak kłaść fundamenty, jeśli są one już gotowe.

*   **Fundament (System):** Wbudowane zasady bezpieczeństwa (tworzone przez producenta).
*   **Piętra (Reguły projektu):** Stałe zasady Twojego projektu, np. plik `CLAUDE.md`. Tu określasz technologie (np. "używamy Vitest").
*   **Narzędzia (Skille):** Gotowe szablony zadań, np. `/commit`.
*   **Mieszkaniec (Twój prompt):** Konkretny cel "na teraz", np. "napraw błąd w koszyku".

---

### Złote zasady pracy z modelami rozumującymi

Współczesne modele AI działają najlepiej, gdy dasz im **cel**, a nie **instrukcję krok po kroku**. To jak zlecenie doświadczonemu kierowcy dojazdu do celu – jeśli będziesz mu mówił, kiedy dokładnie ma zmieniać biegi, dojedziecie później i w gorszym humorze.

*   **Podawaj cel, nie ścieżkę:** Zamiast opisywać każdy krok analizy, określ, co ma być efektem końcowym (np. "testy muszą przechodzić").
*   **Określaj granice, nie technikę:** Zamiast kazać użyć konkretnego wzorca, określ ograniczenia (np. "nie zmieniaj publicznego API").
*   **Mierz wyniki:** System potrzebuje obiektywnych kryteriów, takich jak udany build lub brak błędów lintera, a nie Twojego "upewnij się, że działa".

---

### Czego unikać? (Antywzorce)

*   **Brak granic:** Agent bez "płotu" może zacząć przemeblowywać całe repozytorium przy naprawie jednego przecinka.
*   **Przeładowanie kontekstu:** Wrzucanie całego kodu naraz to jak próba przeczytania całej encyklopedii przed udzieleniem prostej odpowiedzi – model się zgubi.
*   **Wiara w składnię:** To, że kod się kompiluje, nie oznacza, że robi to, co powinien.

**Pamiętaj:** W dobrze skonfigurowanym środowisku Twój prompt powinien być **celny i krótki**. Cała reszta wiedzy "jak pracować" powinna już czekać na agenta w regułach projektu.