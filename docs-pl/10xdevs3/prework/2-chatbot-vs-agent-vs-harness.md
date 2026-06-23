Oto kluczowe pojęcia nowoczesnej architektury AI, przedstawione w prosty i przejrzysty sposób:

### Trzy warstwy ekosystemu

Wyobraź sobie, że budujesz nowoczesny samochód wyścigowy:

| Element | Analogia | Funkcja w AI |
| :--- | :--- | :--- |
| **Model** | **Silnik** | Generuje kolejne słowa (tokeny), „myśli” i wyciąga wnioski. |
| **Agent** | **Kierowca** | Wykonuje zadania, używa narzędzi i podejmuje decyzje, by dotrzeć do celu. |
| **Harness** | **Nadwozie i systemy bezpieczeństwa** | Daje dostęp do narzędzi, nakłada ograniczenia i zarządza pamięcią (kontekstem). |

---

### Chatbot vs Agent

Największa zmiana w 2026 roku to przejście od rozmowy do sprawczego działania.

*   **Chatbot (Pętla statyczna):**
    *   Działa w trybie: pytanie -> odpowiedź.
    *   Cały ciężar wdrożenia kodu i sprawdzenia wyników leży na Tobie.
    *   To AI „pracuje Tobą”, każąc Ci ręcznie klikać i kopiować.
*   **Agent (Autonomia):**
    *   Zgłasza zamiar użycia narzędzia (np. „chcę przeczytać plik”) i czeka na wynik.
    *   Samodzielnie iteruje: sprawdza błąd, poprawia plan i próbuje ponownie.
    *   Zamiast pisać tekst, wykonuje realne zmiany w Twoim repozytorium.

---

### Co składa się na końcowy wynik?

Sukces nie zależy tylko od tego, jak „mądry” jest model. Wpływają na niego cztery elementy:

1.  **Model:** Silnik rozumowania.
2.  **Harness:** Twoja warstwa kontroli – pilnuje, by agent nie wpadł w pętlę i pyta o uprawnienia.
3.  **Środowisko lokalne:** Twoje pliki, testy, biblioteki i narzędzia (np. Git).
4.  **Polityka użytkownika:** To Ty ustalasz, czy agent może sam instalować paczki, czy tylko czytać kod.

---

### Jak rozmawiać z Agentem? (Zasada „Mniej znaczy lepiej”)

Zamiast mikrozarządzać każdym krokiem, przejdź na model **deklaratywny** – opisuj cel, a nie drogę.

*   **Zamiast:** „Otwórz plik X, zmień linię 10, zapisz, uruchom testy...”.
*   **Powiedz:** „Zoptymalizuj wszystkie ikony SVG w folderze assets i wygeneruj dla nich wspólny eksport”.

---

### Szybka lista kontrolna Twojego Harnessu
Zanim zaufasz narzędziu (np. Cursor czy Claude Code), sprawdź czy:
*   [ ] Potrafi przeszukiwać pliki zamiast zgadywać ich treść?
*   [ ] Pokazuje czytelny **diff** (różnicę w kodzie) przed zmianą?
*   [ ] Potrafi obsługiwać błędy z terminala?
*   [ ] Zarządza pamięcią roboczą w długich sesjach?

Twoja nowa rola to nie tylko pisanie promptów, ale **projektowanie środowiska pracy** i zatwierdzanie decyzji wysokiego poziomu. Wykonanie „brudnej roboty” zostawiasz systemowi.