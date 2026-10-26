# S01E01 · Mechanika stojąca za generatywną AI — streszczenie

> 🎯 **Cel lekcji:** zobaczyć ogólny obraz. Nie musisz rozumieć wszystkiego od razu.
>
> 🏔️ **Analogia:** wchodzisz na wzgórze i rozglądasz się. Widzisz wszystko dookoła, tylko jeszcze nie w szczegółach.

---

## 1. O co chodzi?

- AI pomaga pracować szybciej i lepiej.
- Ale agenci przejmują coraz więcej pracy → programiści martwią się o przyszłość.
- Kurs [MEGA.dev](http://mega.dev/) (4 tygodnie) uczy, jak zostać **MEGA Developerem**.

---

## 2. Co warto wiedzieć o LLM-ach

**LLM** (duży model językowy) = funkcja: dajesz **prompt** → dostajesz **odpowiedź**.

🦜 **Analogia:** bardzo oczytana papuga, która zgaduje, jakie słowo powinno paść jako następne.

| Pojęcie | Po ludzku | Analogia |
|---|---|---|
| **Tokenizacja** | Tekst zamieniany jest na liczby (tokeny) i z powrotem | Klocki LEGO — zdanie rozkładamy na ponumerowane klocki |
| **Przewidywanie tokenu** | Model pisze token po tokenie, aż trafi na „token końca”. Raz wybranego tokenu nie da się cofnąć | Pisanie długopisem — bez gumki. Jeden błąd ciągnie kolejne |
| **Niedeterminizm** | Ten sam prompt ≠ ta sama odpowiedź. Nawet `temperature = 0` nie daje gwarancji | Kucharz, który za każdym razem gotuje tę samą zupę trochę inaczej |
| **Konfabulacja (halucynacje)** | Model się myli, bo jego wiedza jest ograniczona i ma datę ważności (**knowledge cutoff**) | Uczeń, który nie zna odpowiedzi, ale pewnym głosem coś wymyśla |
| **Rozumowanie** | Model „myśli” na głos (tokeny myślenia) i po cichu (**J-space**). Więcej myślenia = lepiej, ale drożej i wolniej | Liczenie na kartce vs. w głowie |

💡 **Ciekawostka:** mniejsze modele potrafią się pomylić tylko dlatego, że informacje podano **w innej kolejności**.

---

## 3. Mechanika LLM-ów

| Element | Co to jest | Analogia |
|---|---|---|
| **Request** | Kontekst (lista wiadomości) + ustawienia (model, narzędzia, poziom rozumowania). Popularny format: Responses API | List do modelu z instrukcją obsługi |
| **Completion** | Czat to iluzja — dla modelu wiadomości to **zwykły tekst** z tokenami specjalnymi (format ChatML) | Scenariusz teatralny z oznaczeniem, kto mówi |
| **Okno kontekstu** | Limit ~250k–1M tokenów. Narzędzia robią **auto-kompaktowanie** → część informacji ginie | Plecak — ile się zmieści. Gdy pełny, coś trzeba wyrzucić |
| **Rozumienie kontekstu** | Model działa najlepiej, gdy używa **< 30–40%** limitu | Im więcej notatek na biurku, tym trudniej znaleźć tę ważną |
| **Multimodalność** | Obrazy, dźwięk, wideo też zamieniane są na liczby. Model słabo widzi detale (kolory, zegar, nakładające się elementy) | Opis obrazu przez telefon — szczegóły się gubią |
| **Structured Outputs** | Model zwraca JSON, który kod łatwo przetworzy. **Schemat kontroluje kształt, nie prawdę** | Formularz — można go wypełnić poprawnie, ale kłamstwem |
| **Function Calling** | Model w JSON-ie wskazuje **nazwę narzędzia** i dane. Kod je wykonuje i oddaje wynik | Szef mówi: „zadzwoń tam” — a dzwoni asystent |
| **Code Mode** | Zamiast 30 narzędzi model dostaje 2 (`find`, `execute`) i **pisze kod**. Oszczędza tokeny, ale wymaga sandboxa | Zamiast 30 pilotów — jeden programowalny |
| **Agent** | Pętla: model albo używa narzędzia i działa dalej, albo odpowiada tekstem i kończy | Pies aportujący, dopóki nie przyniesie właściwego patyka |
| **CLI / MCP** | Sposoby na dodanie agentowi narzędzi. CLI — lokalnie, **MCP** — w produkcji (np. Playwright MCP do przeglądarki) | Wtyczki do elektronarzędzia |

👉 Kluczowa zmiana: AI przechodzi **„od odpowiedzi do działań”**.

---

## 4. Platformy i harnessy

**Harness** = „opakowanie” wokół modelu (Cursor, Claude Code, Pi, T3 Code). Model ten sam — różni się sposób użycia.

🚗 **Analogia:** ten sam silnik, różne samochody.

Harnessy **ukrywają mechanikę**, żeby było prościej. Ale to ma swoją cenę:

| Funkcja | Obietnica | Rzeczywistość |
|---|---|---|
| **Auto Compaction** | Rozmowa bez końca | Agent widzi tylko część tego, co mówiłeś |
| **Plan Mode** | Lepsze planowanie | Za szeroki lub zbyt szczegółowy plan → model się gubi. Lepiej dzielić na małe zadania |
| **Skills** | Model sam wybierze umiejętność | Wybiera tylko po nazwie i opisie → czasem pudłuje |
| **Załączniki** | „Agent widzi pliki” | Często widzi je tylko częściowo albo wcale |
| **Środowisko** | Wysyłasz jedną wiadomość | Model dostaje dużo więcej: system prompt, narzędzia, `<system-reminder>` |

---

## 5. Dostawcy modeli

| Dostawca | Mocne strony | Główne produkty |
|---|---|---|
| **OpenAI** | Prawie pełna multimodalność, Responses API | ChatGPT, Codex |
| **Anthropic** | Tekst i rozumienie obrazów | Claude, Claude Code |
| **xAI** | Pełna multimodalność | Grok, Grok Bot |
| **DeepMind / Google** | Pełna multimodalność + rozumienie wideo, Interactions API | Gemini |
| **OpenRouter** (bonus) | Dostęp do wszystkich modeli w jednym miejscu | — |

**Rady:**
- ✅ Unikaj **vendor lock-in** — najlepszy model często się zmienia ([Artificial Analysis](https://artificialanalysis.ai/)).
- ✅ Domyślnie używaj **najlepszych modeli**.
- ✅ Przy automatyzacji na dużą skalę — sprawdź mniejszy model lub niższe rozumowanie.
- ✅ Wybieraj narzędzia niezależne od dostawcy: Pi, OpenCode, T3 Code, Superset.

---

## 6. Uogólnione sterowanie (Generalized Steering)

Nie wydajemy już modelowi precyzyjnych poleceń — **kierujemy go w stronę dobrych zachowań**.

🧭 **Analogia:** nie trzymasz kierownicy za kierowcę — dajesz mu dobrą mapę.

| Technika | Na czym polega | Analogia |
|---|---|---|
| **Różne perspektywy** | Pytaj kilka modeli albo deleguj części zadania **subagentom** | Burza mózgów z kilkoma ekspertami |
| **Self-querying** | Model najpierw zadaje sobie pytania pomocnicze, potem odpowiada | Rozgrzewka przed biegiem |
| **Pamięć** | Każda rozmowa startuje od zera → agent potrzebuje dostępu do potrzebnych informacji | Złota rybka z notesem |
| **Samozarządzanie** | Agenci sami konfigurują swoje ustawienia (Pi, OpenCode 2) | Pracownik, który sam ustawia sobie biurko |
| **Agenci w tle (ambient, durable)** | Działają zdalnie, wg harmonogramu lub na zdarzenia, w sandboxach | Robot sprzątający, który sam rusza, gdy jest brudno |

---

## 7. Najważniejsze wnioski

- 🧱 To **fundamenty** generatywnej AI — od 2022 roku prawie się nie zmieniły.
- 📈 Modele rosną głównie przez **skalowanie**, nie przez nową architekturę → ta wiedza się nie zestarzeje.
- 🔍 Znając mechanikę, myślisz od **pierwszych zasad** i łatwiej odróżniasz hype od realnej wartości.

| Zapamiętaj | Bo… |
|---|---|
| Model zgaduje następny token | Nie „wie”, tylko przewiduje |
| Wynik nie jest pewny | Pracujemy na **szansach**, nie gwarancjach |
| Kontekst jest ograniczony | Mniej = lepiej |
| Harness wiele ukrywa | Agent nie widzi wszystkiego, co myślisz, że widzi |
| Twoja wiadomość to nie wszystko | Model dostaje dużo więcej w tle |
