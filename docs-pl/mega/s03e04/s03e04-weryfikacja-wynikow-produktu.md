# S03E04 · Weryfikacja wyników produktu — streszczenie

## 📑 Spis treści

- [O co chodzi?](#o-co-chodzi)
- [Plan lekcji](#plan-lekcji)
- [1. Film](#film)
- [2. Akceptacja](#akceptacja)
- [3. Weryfikacja — „laboratorium agenta”](#weryfikacja)
- [4. System Diff](#system-diff)
- [5. Przegląd (Review)](#przeglad)
- [6. Bramki jakości (Quality Gates)](#bramki-jakosci)
- [Wnioski](#wnioski)

---

<a id="o-co-chodzi"></a>
## 🎯 O co chodzi?

**Agenci chętnie i szybko zbudują złe rzeczy.** Mogą odbiec od wymagań, skończyć za wcześnie albo za późno.

> 🧒 **Analogia:** Agent to jak dziecko, które sprząta pokój. Powie „gotowe!”, ale zabawki mogą leżeć pod łóżkiem. Trzeba zajrzeć.

Dlatego najpierw budujemy **zaufanie**, a dopiero potem skalujemy pracę agentów i dajemy im więcej swobody.

| Ważna myśl | Co znaczy |
|---|---|
| Weryfikację też robią agenci | Ale my musimy **rozumieć i widzieć** wyniki |
| Dobra weryfikacja = odwaga | Agenci mogą ruszać nawet krytyczne części systemu i robić trudne refaktory |
| Narzędzia tylko dla agentów | Notatki, dowody, skrypty, a nawet całe moduły mogą powstać **wyłącznie dla agentów** |

---

<a id="plan-lekcji"></a>
## 🗺️ Plan lekcji

| Etap | Pytanie |
|---|---|
| 🎬 Film | Jak bezpiecznie wypuścić zmianę? |
| ✅ Akceptacja | Czy praca jest naprawdę skończona? |
| 🔬 Weryfikacja | Jak agent to sprawdza? |
| 🔀 System Diff | Co się zmieniło w systemie? |
| 👀 Przegląd (Review) | Czy kod i reszta są dobrej jakości? |
| 🚧 Bramki jakości | Co musi przejść, zanim wejdzie na produkcję? |

---

<a id="film"></a>
## 🎬 1. Film

Trzy sposoby, żeby wdrożenie było bezpieczne:

| Sposób | Co robi | Analogia |
|---|---|---|
| 🚩 **Flaga funkcji** (feature flag) | Dodajemy funkcję, ale jest **wyłączona**, dopóki nie przełączymy flagi | Nowa lampa podłączona do prądu, ale włącznik jeszcze w pozycji „off” |
| 📋 **Raporty** | Po deploymencie agent **sprawdza i potwierdza**, że wszystko zostało dobrze dostarczone | Kurier robi zdjęcie paczki pod drzwiami |
| 💾 **Backupy** | Trzymamy kopie z **historycznymi danymi**, żeby w razie czego do nich wrócić | Zapis gry przed walką z bossem |

⚠️ Backup, którego nie da się odtworzyć, nic nie daje. **Regularnie sprawdzaj, czy przywracanie z backupu działa.**

---

<a id="akceptacja"></a>
## ✅ 2. Akceptacja

Bazą jest **umowa** zawarta **przed pracą** (z lekcji S03E02).

⚠️ Problem: agent może powiedzieć „zrobione”, a nie zrobić. Może też **oszukać** — **wygenerować** dowód zamiast go **zebrać**.

> 🧒 **Analogia:** Uczeń, który sam sobie wpisuje „5” do dzienniczka, zamiast pokazać sprawdzian.

### Dopasuj dowody do ryzyka

Im większe ryzyko zmiany, tym więcej dowodów. Ale od pewnego momentu więcej wysiłku daje już mało korzyści.

| Rodzaj zmiany | Przykład | Potrzebne dowody |
|---|---|---|
| 🟢 **Składa** (mała poprawka, używa tego, co jest) | Literówka na stronie | Testy automatyczne + przed/po |
| 🟡 **Rozszerza** (zmienia działanie) | Naprawa webhooka | Testy automatyczne, testy, prawdziwe żądania, osobny recenzent |
| 🟡 **Rozszerza** | Nowe menu mobilne | Testy automatyczne, pomiary, przed/po, nagrania, osobny recenzent |
| 🔴 **Drzwi w jedną stronę** (nowy element, dane, pieniądze) | Migracja danych płatności | Testy automatyczne, testy, prawdziwe żądania, rekordy danych, recenzent, **zgoda człowieka** |

💡 To samo ryzyko ≠ te same dowody. Liczy się też **rodzaj** zmiany.
💡 Zasada: **dowód zbieramy z prawdziwego buildu**, a nie „z głowy” agenta.

### Elastyczność

Zakres może się zmienić w trakcie pracy. Braki (np. brak narzędzia) wykrywamy na dwa sposoby:
- 🗣️ **agent sam zgłasza**,
- 📅 **wychodzi to w regularnych kontrolach**.

W PR agent może dodać tabelkę: które kryteria mają dowód ✅, którym brakuje narzędzia ❌, co dodano, a co usunięto w trakcie.

---

<a id="weryfikacja"></a>
## 🔬 3. Weryfikacja — „laboratorium agenta”

Agent potrzebuje miejsca, gdzie **używa aplikacji jak użytkownik**.

> 🧒 **Analogia:** Jak tor testowy dla samochodów — auto jeździ naprawdę, ale nie po ulicy z ludźmi.

**Przykład autora:** aplikacja desktop + web, wspólny runtime (lokalnie lub w chmurze).

```
Agent → Narzędzia labu (start, sterowanie, ocena) → Interfejs aplikacji → Runtime
                    ↓
            Zapisy (screeny, logi, wyniki) → dowody wracają do agenta
```

Lab to głównie skrypty CLI: klikanie, pisanie, dodawanie plików, screenshoty, krótkie filmy.

### Diabeł tkwi w szczegółach

| Zasada | Po co |
|---|---|
| Limit otwartych instancji | CPU i RAM się kończą |
| Każda instancja = własne konto i workspace | Agenci sobie nie przeszkadzają |
| Wspólny system logów | Można mierzyć dane, UI, wydajność |
| Desktop w maszynie wirtualnej (VMPal) | Nie kradnie okien autorowi |
| Udawane wywołania LLM | Testy UI nie kosztują pieniędzy (jest też tryb „live” z limitami) |
| Agenci piszą własne skrypty | Automatyzują powtarzalne sprawdzenia — ale trzeba je czasem sprzątać |
| Recenzent zna różnice platform | Nie zgłasza fałszywych błędów |
| Twarde granice | Agenci nie dotykają środowiska autora |
| Blokada nieodwracalnych akcji | Np. wysyłania maili |

💡 Lab musi być **podłączony bezpośrednio do modułów** aplikacji i **ciągle rozwijany**.

### Rutyny w tle

| Kiedy | Co robi |
|---|---|
| 🔁 **Po każdym zadaniu** | Czy warto zajrzeć? → czyta historię → zgłasza problemy labu (niejasne zadanie, brak narzędzia, trudne w użyciu) |
| 📅 **Raz w tygodniu** | Agent w chmurze czyta wszystko → łączy podobne narzędzia, usuwa nieużywane, skryptuje ręczne kroki, przyspiesza → PR do akceptacji |

Narzędzia: Grok Bot, Cursor, Devin, Claude Code (cloud routines).

⚠️ Każ agentom **zapisywać, które rutyny są aktywne i gdzie**.
⚠️ Każ agentom **porządnie przechowywać dowody** — inaczej rozsypią się po wszystkich kątach.

---

<a id="system-diff"></a>
## 🔀 4. System Diff

Agenci piszą więcej kodu, niż jesteśmy w stanie przeczytać. Potrzebujemy **mapy zmian**.

> 🧒 **Analogia:** Nie czytasz całej książki od nowa — czytasz streszczenie „co nowego w tym rozdziale”.

Pamiętaj: **zwiększamy szansę** na dobry wynik, a nie go **gwarantujemy**.

### Zaprojektuj swój System Diff

| Element | Opcje |
|---|---|
| **Cel** | Przegląd architektury, kluczowa logika w kodzie, interaktywny dashboard |
| **Forma** | Tabele, wykresy, grafy, screeny, wideo, audio (zwykle HTML lub Markdown) |
| **Treść** | Najlepszy **stosunek sygnału do szumu** + widok szeroki i wąski |

### Budowa strony (od ogółu do szczegółu)

1. **Odpowiedź** — co się stało
2. **Decyzje** — opcja zalecana ⭐ i alternatywy
3. **Mapa** — które części systemu ruszone
4. **Przed / po**
5. **Pliki i linie** — rozwijane po kliknięciu

Czytasz **tylko tak głęboko, jak trzeba**.

### Jak zacząć
- Poproś agentów, by przejrzeli ostatnie PR-y i historię pracy → niech zrobią **pierwszą wersję skilla** do System Diff.
- Pomogą **mapy funkcji** (feature maps) z S03E03.
- Autor używa skilla [/system-diff](https://github.com/overment/skills/tree/main/skills/system-diff). Agent otwiera diff w przeglądarce, autor nagrywa **notatkę głosową** (np. „Idź w 1b, 2a OK, czemu lista skacze na telefonie?”) → transkrypcja wraca do agenta.
- Dobry PR (przykład Matta): **podsumowanie** + **dowody przed/po** + **sekcja „niebezpieczeństwa merge”**.

💡 System Diff przydaje się też **agentom** — porównają go z wizją produktu i historiami użytkowników.

---

<a id="przeglad"></a>
## 👀 5. Przegląd (Review)

Nawet jeśli nie czytamy kodu, **dalej nam na nim zależy**: porządek, spójność, wzorce, wydajność, bezpieczeństwo. Robią to agenci (np. Bugbot, CodeRabbit, Devin albo własna aplikacja).

### Problemy recenzentów-agentów

| Problem | Rozwiązanie |
|---|---|
| Naciskają za mocno albo za słabo | **Zasady** (np. „najpierw użytkownicy i dane”) |
| Jeden agent nadpisuje zmiany drugiego | **Źródła** (wiedza, kto co edytuje) |
| Brak wyczucia, kiedy stop | **Granice** (np. macierz wykonalności z S03E01, „drzwi w jedną stronę” → człowiek) |

> 🧒 **Analogia:** Kilku nauczycieli poprawia jedną pracę. Bez zasad jeden skreśla to, co drugi poprawił.

### Review to coś więcej niż kod

| Działanie | Przykład |
|---|---|
| 🔄 **Synchronizacja** | Aktualizacja dokumentacji, strony produktu, bazy wiedzy |
| 📚 **Wnioski** | Agenci zapisują lekcje na przyszłość |
| 📣 **Komunikacja** | Info dla marketingu/sprzedaży; powiadomienie klientów, którzy prosili o funkcję (mniej odejść, więcej upsellu) |
| 📈 **Sprawdzenie efektu** | Harmonogram monitorowania funkcji na produkcji |
| 💡 **Ulepszenia** | Research: rynek, alternatywy, biblioteki |

💡 Klucz: **dźwignia** z agentów pracujących w tle.

---

<a id="bramki-jakosci"></a>
## 🚧 6. Bramki jakości (Quality Gates)

Tu stawiamy na **reguły**, nie zasady. Większość bramek powinna być **deterministyczna** (zawsze ten sam wynik).

> 🧒 **Analogia:** Bramka na lotnisku — piszczy albo nie. Nie negocjuje.

### Przykład: workflow `validate` Kenta (~30 sprawdzeń)

| Grupa | Narzędzia |
|---|---|
| Formatowanie i lint | oxfmt, oxlint |
| Typy | TypeScript |
| Cloudflare | Wrangler dry run, testy workerów |
| Zależności | npm audit |
| Testy | Vitest, Playwright (e2e), `tsx --test` (CLI) |
| Własne skrypty | Sprawdzanie prymitywów, map funkcji, rozjazdu dokumentacji |

**Zasada działania:** wszystkie grupy działają równolegle → końcowy check czeka na wszystkie → ✅ merge albo ❌ blokada.

### Jak bramka zostaje użyteczna
- 🔁 Komentarz, który recenzent powtórzył **dwa razy**, staje się **nową regułą**.
- 🌙 Co noc agent **usuwa słabe testy**, żeby wszystko było szybkie.

💡 Ćwiczenie: pobierz repo Kenta, pogadaj z agentem o [narzędziach](https://github.com/kody-hq/kody/tree/main/tools), potem poproś o propozycję bramek dla **swojego** projektu.

---

<a id="wnioski"></a>
## 🏁 Wnioski

| Wniosek | |
|---|---|
| 📈 | Dobra weryfikacja podnosi jakość całego produktu — i pomaga biznesowi oraz użytkownikom |
| 🎯 | Proces trzeba dopasować do **swojego** oprogramowania i sposobu pracy |
| 🐢 | **Nie buduj wszystkiego naraz.** Kilka dobrze zrobionych elementów to świetny start |
| 🧠 | To nie tylko technika — to **branie odpowiedzialności za wynik**, czyli myślenie **Product Engineera** |
