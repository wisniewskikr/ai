# S04E02 · Budowanie przenośnych warstw sterowania agentami (streszczenie)

## Spis treści

- [O co chodzi?](#o-co-chodzi)
- [Cztery filary lekcji](#cztery-filary-lekcji)
- [1. Film](#1-film)
- [2. Konfiguracja](#2-konfiguracja)
- [3. Przenośność](#3-przenośność)
- [4. Dostarczanie wiedzy](#4-dostarczanie-wiedzy)
- [5. Operacje](#5-operacje)
- [Wnioski](#wnioski)

---

## O co chodzi?

Narzędzia AI zmieniają się bardzo szybko. Dziś Claude, jutro Pi, pojutrze coś innego.
Dlatego **oddzielamy to, kim jest agent, od tego, gdzie działa**.

> 🎮 **Analogia:** zapis gry w chmurze. Zmieniasz konsolę, a Twoja postać, ekwipunek i postępy idą z Tobą.

**Warstwa sterowania (control plane)** = miejsce, które decyduje, **jak** agenci pracują. Jest **oddzielone od samych uruchomień**.

Przykład z kursu: **Kody** Kenta — serwer MCP, który daje dowolnemu narzędziu (harness) wszystkie integracje, pamięć i ustawienia Kenta.

## Cztery filary lekcji

| Filar | Proste wyjaśnienie |
|---|---|
| ⚙️ Konfiguracja | Gdzie trzymamy ustawienia agentów |
| 🧳 Przenośność | Jak uruchomić to samo wszędzie |
| 📚 Dostarczanie wiedzy | Jak agent dostaje aktualne informacje |
| 🛠️ Operacje | Jak unikać konfliktów i cofać błędy |

---

## 1. Film

🎬 John pokazuje w filmie widgety, czyli małe okienka obok rozmowy z agentem.

| Widget | Co robi | Analogia |
|---|---|---|
| **Widget** (ogólnie) | Pokazuje najważniejsze informacje w jednym miejscu | 🚗 Deska rozdzielcza w aucie |
| **To-dos** | Pokazuje, co agent robi teraz | 📋 Tablica „w trakcie” |
| **Memories** | Zapisuje wskazane informacje do plików | 📓 Notatnik, do którego wpisujesz ważne rzeczy |

👉 Krok po kroku opisuje to [Build guide](https://hq.mega.dev/lessons/s04e02/build-guide/).

---

## 2. Konfiguracja

### Cztery strategie

| Strategia | Co to jest | Przykład | Analogia |
|---|---|---|---|
| **Osoba** | Moje integracje, pamięć i ustawienia w jednym miejscu, dla każdego narzędzia | Kody | Plecak, który zawsze nosisz |
| **Projekt** | Zadanie, zasady i testy agenta w folderze | Role Johna | Instrukcja przyklejona do maszyny |
| **Usługa** | Jeden agent działa non stop na serwerze; nic się nie przenosi | Specter (S04E01) | Recepcjonista, który zawsze siedzi przy biurku |
| **Paczka** | Skille instalowane przez `npx skills`, z aktualizacjami | `npx skills` | Aplikacja ze sklepu |

👉 Strategie można **łączyć** (np. agent z folderu projektu używa zainstalowanych skilli i naszych serwerów MCP).

### Przykładowy układ inżyniera

- **Osobiste:** kalendarz, poczta, notatki, repozytoria, własne skille.
- **Klient A / Klient B:** własne repozytoria, sekrety, serwery, zatwierdzeni dostawcy AI.
- 🧱 **Twarde ściany** między klientami — nic nie może przeciekać.

> 🏠 **Analogia:** osobne szafki z kluczykami. Klucz do szafki A nie otwiera szafki B.

### Co warto ustawić

| Element | Po co |
|---|---|
| **Profile** | Modele, uprawnienia, MCP, skille, wtyczki |
| **Kontekst globalny** | Mapa całego systemu, stale aktualizowana |
| **Obserwowalność** | Np. Langfuse — widać, jak pracujemy z agentami |
| **Zdalny system plików** | Konfiguracja w osobnym repo → szybki start na nowej maszynie |
| **Sandbox** | sbx / boat — dobre domyślnie, ale **nie** blokują wysyłania danych |
| **Sekrety** | Agent nie może ich dotykać; `.env` to za mało |

🎯 Cel: móc łatwo **tworzyć nowych agentów**.

**U Johna:** każdy widget to folder (np. `widgets/issues/`), zasady w `rules.md`. Widget Memories proponuje regułę → „Keep” → linia w `MEMORIES.md`.

---

## 3. Przenośność

> 🍪 **Zasada:** dobry przepis zrobiony raz = ciastka wszędzie i zawsze. Trudne jest tylko „dobrze”.

- Każdy ręczny krok człowieka = tarcie.
- Test: skonfiguruj system na zdalnym urządzeniu → poproś, by **sklonował się** gdzie indziej → ten sam wynik bez ręcznej pracy.

### „Wszystko jest folderem” 📁

| Synchronizuje się (chmura) | Zostaje lokalnie |
|---|---|
| Agenci, skille, dokumenty | Bieżąca praca |
| Historia rozmów, załączniki | Uprawnienia tej maszyny |
| Preferencje, harmonogramy | Indeksy (odbudowywane z folderu) |
| Klucze (zaszyfrowane, poza folderem) | |

- Chmura porządkuje zmiany; konflikt = **zachowaj obie wersje**.
- **Runtime** wszędzie robi to samo: czyta folder → uruchamia agentów → sprawdza każdą akcję.

### Wersja dla zespołu 👥

| Warstwa | Co zawiera | Kto widzi |
|---|---|---|
| Zespołowa | Agenci, skille, wiedza, limity | Wszyscy (zmiany przez review) |
| Osobista | Własne skille i preferencje | Ja |
| Prywatna | Rozmowy, pamięć, sekrety | **Tylko ja** |

Zespół ustala **sufit** limitów, każdy może dodać swoje zachowania.

### Co da się przenieść

- **Agenci w tle** — w pełni (najlepiej z bezpiecznymi zadaniami: research, raporty, testy).
- **Wewnętrzny MCP / CLI** — jeden serwer zamiast wielu kont.
- **Agenci przez MCP** — kontrolowany dostęp do akcji i wiedzy.
- **Konfiguracje osobiste** — nadal w rękach członków zespołu.

**U Johna:** narzędzia opisane przez **potrzebną zdolność**, nie produkt (powierzchnia, źródło, wywołanie modelu, akcja). Brak chmury i klonowania.

---

## 4. Dostarczanie wiedzy

> 🧠 Zmień agentowi kontekst i narzędzia, a zmienisz jego zachowanie — bez ruszania kodu.

### MCP jako warstwa zdolności

- Jeden serwer MCP stworzony **dla agentów**.
- Tylko **2 narzędzia**: `search` (znajdź) i `run` (użyj w kodzie) → mały kontekst.
- Za nimi: skrypty, integracje, pamięć, harmonogramy, inne serwery MCP.
- Nowa zdolność = od razu dostępna dla **wszystkich** agentów.

> 🔌 **Analogia:** listwa zasilająca. Podłączasz jedną wtyczkę, a masz prąd do wszystkiego.

| Zaleta | Uwaga |
|---|---|
| Lepszy harness / model = lepszy cały system, za darmo | Agenci muszą **wiedzieć** o zmianach lub zawsze sprawdzać aktualną wiedzę |

Podobnie robi Uber (gateway MCP). Przed budową własnego — sprawdź **Executor**.

**U Johna:** mały model planuje „zbieraczy” → równolegle czytają kod, testy, historię, issue, rozmowy → główna rozmowa dostaje zadanie + brief ze źródłami + zasady. Wiedza jest **wpychana** (push), a nie szukana.

---

## 5. Operacje

Wielu agentów = ryzyko nadpisań i konfliktów.

### Co zapisywać

| Przy każdym uruchomieniu | Przy każdej zmianie |
|---|---|
| Wersja konfiguracji + **hash** | Kto zmienił |
| Model i narzędzia | Dlaczego |
| Kto uruchomił | Kiedy |
| Wynik | Hash przed i po |

⚠️ Agent **nie może sam poszerzać uprawnień** — potrzebna zgoda człowieka.

### Kod decyduje vs agent decyduje

| Kod (deterministycznie) | Agent |
|---|---|
| **Claim z lease** — jeden agent naraz na zasób | **Sędzia (judge)** rozwiązuje konflikty |
| Agent padł? Lease wygasa, zasób wolny | Korzysta z pełnego śladu i skilli |
| Zmiany odwracalne (np. Git) | Rozwiązanie też bierze claim |
| Akcje nieodwracalne (e-mail) — **tylko raz** (klucz) | |

> 🚻 **Analogia:** zamek w łazience. Zamykasz, korzystasz, otwierasz. Jak ktoś zasłabnie, po czasie drzwi same się otwierają.

### AgentFS 💾

- Piaskownica plików dla agenta: każda sesja = **jeden plik SQLite**.
- Prawdziwy projekt tylko do odczytu; zmiany w osobnej warstwie.
- Możesz: **przejrzeć, cofnąć, rozwidlić, zastosować** wybrane zmiany.
- Wady: nie rozwiązuje konfliktów ani izolacji sieci. Beta — traktuj jako inspirację.

> ✏️ **Analogia:** kalka na rysunku. Rysujesz na kalce, a oryginał zostaje czysty.

**U Johna:** pętla „hill-climbing” — zmień jedną rzecz w instrukcji widgetu → sprawdź na próbce → zostaw, jeśli mniej błędów.

---

## Wnioski

- Chodzi o **logikę, która dobrze się skaluje**.
- Implementację zrobią agenci; my wybieramy **architekturę i mechanikę**.
- 🎯 **Zadanie:** zbuduj coś małego (np. „sprytny cron” albo prosty serwer MCP) i użyj tego w **więcej niż jednym środowisku**. Problemy wyjdą same.
