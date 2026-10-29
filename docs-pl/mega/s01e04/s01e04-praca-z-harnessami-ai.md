# S01E04 · Praca z harnessami AI — streszczenie

## 📑 Spis treści

1. [Film](#1-film)
2. [O co chodzi?](#2-o-co-chodzi)
3. [Za dużo narzędzi — jak nie zwariować?](#3-za-dużo-narzędzi--jak-nie-zwariować)
4. [6 zasad wyboru harnessu](#4-6-zasad-wyboru-harnessu)
5. [Który harness wybrać?](#5-który-harness-wybrać)
6. [Pi + Herdr — agenci, którzy zarządzają sami sobą](#6-pi--herdr--agenci-którzy-zarządzają-sami-sobą)
7. [Czego jeszcze potrzebuje system wielu agentów?](#7-czego-jeszcze-potrzebuje-system-wielu-agentów)
8. [Projekt Limen — Koordynator i Workerzy](#8-projekt-limen--koordynator-i-workerzy)
9. [Ustawienia — model, wysiłek, koszt, prywatność](#9-ustawienia--model-wysiłek-koszt-prywatność)
10. [Praca w zespole](#10-praca-w-zespole)
11. [Automatyzacje w tle](#11-automatyzacje-w-tle)
12. [Wnioski](#12-wnioski)

---

> 🎯 **Cel lekcji:** zbudować **dobry system** pracy z agentami AI — prosty, przenośny i odporny na modę „co tydzień coś nowego”.
>
> 🧰 **Analogia:** harness to **skrzynka z narzędziami** dla AI. Nie musisz kupować każdego nowego młotka z reklamy. Wystarczy dobra skrzynka, do której łatwo włożysz nowe narzędzie, gdy naprawdę się przyda.

---

## 1. Film

Całość to trzy warstwy: **Interfejs + Harness + API**.

| Temat | Po ludzku |
|---|---|
| **Harness** | pozwala LLM działać na Twoim systemie. Nie przywiązuj się do niego — zmiana powinna być łatwa. |
| **Interfejs** | np. [T3 Code](https://github.com/pingdotgg/t3code). Widzisz zawsze **jeden** interfejs, a harness pod spodem łatwo podmienisz. |
| **Ustawienia** | porządkujesz je w interfejsie, np. folder `Skills` z ogólnymi skillami i podfolder `Claude` ze skillami tylko dla Claude Code. |
| **Workflowy** | zapisujesz je w interfejsie — **niezależnie** od harnessu. |
| **Praca zespołowa** | przez jeden harness możesz wywołać zupełnie inny. |
| **Przyszłość** | pewnie powstanie asystent **nad** warstwą harnessu — wtedy wymiana harnessu będzie banalna. |

🔌 **Analogia:** interfejs to **pilot do telewizora**, a harness to **telewizor**. Gdy kupisz nowy telewizor, pilot i ulubione kanały zostają te same.

---

## 2. O co chodzi?

Każdy pracuje z AI inaczej: jedni bez konfiguracji, inni z bardzo złożonym setupem. Warto czasem się zatrzymać i sprawdzić, co można zrobić lepiej.

| Temat | Co omawiamy |
|---|---|
| Harnessy | CLI i UI, wielu dostawców, funkcje kluczowe i przełomowe, przenośny setup |
| Samozarządzanie | agenci sami się konfigurują, rozszerzenia, uruchamianie workerów, sesje w tle |
| Wielu agentów | koordynator i workerzy, sterowanie, pliki jako wiadomości, worktree, wizja i styleguide |
| Ustawienia | wybór modelu, poziom rozumowania, koszt zadania, granice prywatności |
| Zespół | wspólne skille, baza wiedzy, narzędzia przyjazne AI |
| Automatyzacja | agenci w repo, przeglądy PR, drobne poprawki, aktualna dokumentacja |

**Sekret:** nie gonimy każdej błyszczącej nowinki. Potrzebujemy **dobrego systemu** i **dobrego nastawienia**.

---

## 3. Za dużo narzędzi — jak nie zwariować?

Do wyboru jest mnóstwo warstw — i każda zmienia się co kilka tygodni:

| Warstwa | Przykłady |
|---|---|
| Harness CLI | Codex, Claude Code, OpenCode, Pi, DeepSeek Harness, Grok Build |
| Harness UI | Cursor, Zed, Devin |
| Aplikacje / agenci | t3code, humanlayer, superset, Hermes Agent, Grok Bot, Dots |
| Terminal | iTerm, Warp, cmux |
| Modele | OpenAI, Anthropic, xAI, Gemini, DeepSeek |
| Dodatki | skille, CLI, serwery MCP, rozszerzenia |
| Konfiguracja | AGENTS.md, ustawienia harnessu |

🍕 **Analogia:** to jak menu z 300 pizzami. Nie musisz spróbować wszystkich — wystarczy wiedzieć, co lubisz i z czego jest ciasto.

---

## 4. 6 zasad wyboru harnessu

| # | Zasada | Po ludzku |
|---|---|---|
| 1 | **Źródła** | Obserwuj duże laboratoria i twórców narzędzi, nie „hype’owe” konta. Bycie trochę w tyle to zaleta — jeśli coś przetrwa miesiąc, warto zerknąć. |
| 2 | **Wielu dostawców** | Wybierz harness obsługujący wiele modeli. Różne modele = różni ludzie z różnym spojrzeniem. Minus: natywne harnessy są lepiej dopasowane do „swoich” modeli. |
| 3 | **Funkcje podstawowe** | MCP, skille, subagenci są wszędzie. Nowa popularna funkcja szybko trafia do wszystkich — nie zmieniaj narzędzia dla jednej funkcji. |
| 4 | **Funkcje przełomowe** | Czasem coś daje ogromny skok (np. **samozarządzanie**, **agenci w chmurze**). Wtedy warto zmienić harness — bądź na to gotowy. |
| 5 | **Przenośny setup** | Stawiaj na rzeczy, które łatwo przenieść: agenci, skille, CLI, MCP. Przykład: projekt [Kody](https://github.com/kentcdodds/kody). |
| 6 | **Natywne możliwości** | Modele szybko mądrzeją. Zbyt dużo „prowadzenia za rączkę” może je **spowalniać**. Badanie [Context Language Models](https://arxiv.org/abs/2609.37725): LLM-y lepiej zarządzają kontekstem niż nasze strategie. |

🚲 **Analogia do zasady 6:** boczne kółka pomagają dziecku jeździć na rowerze. Ale gdy już umie, te same kółka tylko przeszkadzają.

✅ **Efekt:** jesteśmy na bieżąco **bez pośpiechu**. Podstawy AI nie zmieniają się co tydzień.

---

## 5. Który harness wybrać?

| Chcesz… | Wybierz | Przykłady |
|---|---|---|
| Dostosować wszystko do najgłębszego poziomu | harness „do majsterkowania” | OpenCode, Pi, DeepSeek Agent |
| Mieć jak najwięcej gotowe (agenci w chmurze, orkiestracja) | harness „z pudełka” | Cursor, Devin, Dots |
| Zarządzać wieloma agentami (opcjonalnie) | panel sterowania lub ogólny harness | T3 Code, Superset / Grok Bot, Dots |

🧱 **Analogia:** LEGO Technic (składasz sam, jak chcesz) vs. gotowa zabawka ze sklepu (działa od razu).

---

## 6. Pi + Herdr — agenci, którzy zarządzają sami sobą

W lekcji wybieramy **Pi**, bo pokazuje, jak wszystko działa „pod maską”.

| Narzędzie | Rola | Analogia |
|---|---|---|
| **Pi** | agent kodujący w CLI **i** silnik własnego agenta w aplikacji; ma **rozszerzenia** (narzędzia, komendy, zdarzenia, zmiany promptów…) | mózg 🧠 |
| **Herdr** | zarządza instancjami Pi; agenci **żyją dalej po zamknięciu terminala** | dom, w którym mieszkają agenci 🏠 |

### Budowa Herdr

| Poziom | Co to jest |
|---|---|
| **Serwer** | właściciel procesów — działa bez otwartego okna |
| **Workspace** | jeden projekt |
| **Tab** | układ paneli (nie proces) |
| **Pane** | prawdziwy terminal z jednym agentem: *pracuje* / *zablokowany* / *skończył* |

### Co agent może zrobić sam?

- uruchomić innego agenta
- przekazać coś innemu agentowi
- poukładać workspace’y, taby i panele
- zmienić prawie każde ustawienie
- przejrzeć historię i zaproponować lepszy workflow

💡 **Samokonfiguracja:** zamiast czytać ustawienia samemu — **porozmawiaj z agentem**. Pi i Herdr mają dokumentację, którą agent przeczyta i zaproponuje setup.

### Ćwiczenie: „Hello World tab”

Uruchom Herdr → w nim Pi → poproś o nowy tab z wiadomością dla agenta. Agent:

1. Rozgląda się po środowisku
2. Otwiera nowy tab w Herdr
3. Uruchamia nową instancję Pi
4. Wysyła jej prompt
5. Czeka na wynik i go czyta

### Worker vs. subagent

| Cecha | Subagent | Worker (Herdr) |
|---|---|---|
| Interaktywny | ❌ | ✅ |
| Własne hooki i ustawienia | ograniczone | ✅ dowolne |
| Start w tle (np. po zdarzeniu) | ❌ | ✅ |
| Przeżywa zamknięcie terminala | ❌ | ✅ |

👷 **Analogia:** Koordynator to **brygadzista**, workerzy to **robotnicy** w osobnych pokojach. Brygadzista może zajrzeć do każdego pokoju, a robotnicy pracują dalej, nawet gdy on wyjdzie.

---

## 7. Czego jeszcze potrzebuje system wielu agentów?

Samo uruchamianie workerów to za mało. Potrzebne są też:

| Potrzeba | Dlaczego |
|---|---|
| Wymiana informacji | agenci muszą się „dogadać” |
| Powiadomienia | koordynator musi wiedzieć, kiedy worker skończył |
| Baza wiedzy | co zrobione, co zaplanowane |
| Wizja i zasady | wszyscy grają do jednej bramki |
| Udział człowieka | potrzebny, ale ograniczony |
| Piaskownice (sandbox) | żeby agent nie zrobił czegoś złego |
| VPS / urządzenie | czasem agent potrzebuje własnego komputera |
| Własne konta | do pracy z aplikacją |
| Hooki | wsparcie na różnych etapach |
| Zespół | każdy członek ma swoich agentów |
| Monitoring i ocena | żeby system sam się ulepszał |

📅 Większość z tego — w kolejnych lekcjach.

---

## 8. Projekt Limen — Koordynator i Workerzy

Gotowy projekt, którego używa już kilka zespołów: [overment/limen](https://github.com/overment/limen).

### Jak to działa?

| Etap | Ty | Koordynator | Worker | Supervisor |
|---|---|---|---|---|
| Zlecenie | prosisz o efekt | pisze ticket, startuje workera | — | — |
| Przekazanie | — | — | dostaje własną przestrzeń | startuje razem z workerem |
| Praca | — | rozmawia z Tobą | wykonuje zadanie | pilnuje |
| Koniec | — | dostaje „zadanie skończone” | commit + raport | zapisuje wynik (nawet po crashu) |
| Lądowanie | decydujesz, co wchodzi | merguje i zamyka | — | — |

🔑 **Najważniejsze:** agenci **nie rozmawiają ze sobą bezpośrednio**. Wszystko idzie przez **pliki**.

📬 **Analogia:** zamiast dzwonić do siebie, zostawiają **karteczki na lodówce**. Każdy może je przeczytać, nic nie ginie.

### Z czego to jest zbudowane?

Żadnej bazy danych, kolejek ani frameworków. Tylko:

| Element | Zadanie |
|---|---|
| **git worktrees** | każdy worker ma własną kopię kodu i gałąź — nie przeszkadzają sobie |
| **Herdr** | każdy worker ma swój tab; supervisor sprawdza, czy żyje |
| **Rozszerzenia Pi** | u koordynatora: powiadomienie o końcu zadania; u workera: poprawki od koordynatora między wywołaniami narzędzi + narzędzie do raportu |
| **Pliki tekstowe** | zasady globalne (wizja, styleguide, tablica) dodawane do każdego promptu + ticket z zadaniem |

> **Kod robi tylko to, czego tekst nie zrobi pewnie:** start zadania, pilnowanie, zapis wyniku, powiadomienie. Reszta to tekst dla agentów.

### Trzy „rejestry”

| Rejestr | Gdzie | Kto pisze |
|---|---|---|
| Spec (Planned → Active → Done) | Git | Koordynator (ticket), Worker czyta |
| Job record | lokalnie | Worker (postęp, raport), Supervisor (wynik) |
| Branch | Git | Worker commituje, Koordynator merguje |

### Jak zacząć?

1. `limen init`
2. Razem z agentem napisz `vision.md` i `styleguide.md`
3. Zainstaluj Pi i Herdr
4. Otwórz Pi i poproś o implementację czegoś

| Plik | Zawartość |
|---|---|
| `vision.md` | opis produktu, kierunek, mapa funkcji |
| `styleguide.md` | zasady pisania kodu — wstrzykiwane **częściej** niż AGENTS.md, więc muszą być **krótkie** |

⚠️ Działa na macOS i Linux; część funkcji (odzyskiwanie agentów) — tylko macOS.

---

## 9. Ustawienia — model, wysiłek, koszt, prywatność

Gdy jeden agent zarządza resztą, wystarczy dać **jemu** rekomendacje, jakich modeli używać.

### Model × wysiłek rozumowania

| | Wysoki wysiłek | Niski wysiłek |
|---|---|---|
| **Model SOTA** | 🏆 najlepszy | do łatwiejszych zadań |
| **Mniejszy model** | taniej | 💰 najtaniej |

- Nie ma sztywnej reguły — zależy od modelu, zadania i harnessu.
- Benchmarki = punkt startowy. **Sprawdź w praktyce** na swoich zadaniach.

### Koszt za zadanie > cena za token

| | Model A | Model B |
|---|---|---|
| Cena / 1M tokenów | $0.50 | $2.00 |
| Tokeny na zadanie | 220k | 40k |
| **Koszt zadania** | **$0.11** | **$0.08** ✅ |

⛽ **Analogia:** tańsze paliwo nie pomoże, jeśli auto pali trzy razy więcej. Liczy się koszt całej trasy. Metrykę **Cost Per Task** pokazuje [slopalytics](https://slopalytics.com).

⚠️ Workflow wieloagentowe działają dobrze mniej więcej od **Opus 4.8**. Starsze lub otwarte modele (np. Qwen) mogą sobie nie poradzić.

### Prywatność

| Podejście | Bezpieczne? |
|---|---|
| LLM sam wybiera model | ❌ może „obejść” zasady i użyć chmury |
| **Deterministyczne rozdzielenie** (prywatny projekt → tylko lokalny model) | ✅ |

🔒 **Analogia:** nie prosisz dziecka, żeby „samo pamiętało”, by nie wchodzić do ogrodu sąsiada — stawiasz **płot**.

---

## 10. Praca w zespole

Nie ma jeszcze jednej dobrej odpowiedzi. Budujemy workflow, który **rośnie razem z nami**.

| Obszar | Co zrobić |
|---|---|
| **Wspólne zasoby** | AGENTS.md + skille, dzielone przez repo git, [npx skills](https://github.com/vercel-labs/skills) lub [skille przez MCP](https://modelcontextprotocol.io/community/working-groups/skills-over-mcp). Muszą być **wspólne** i **aktualne**. |
| **Wewnętrzna baza wiedzy** | dokumenty na zdalnym serwerze, dostęp przez CLI/MCP; agent porządkuje skrzynkę wejściową według harmonogramu i zdarzeń; zespół ma zsynchronizowane kopie |
| **Narzędzia przyjazne AI** | narzędzia firmy **wyznaczają**, ile możemy zrobić z AI — nie tylko harness, ale też CRM, design, platformy |

### Stos narzędzi zespołu MEGA (inspiracja)

| Kategoria | Narzędzia |
|---|---|
| Obserwowalność | PostHog, Axiom |
| Build, storage, sieć | Vercel, Minio, Depot, Cloudflare + Alchemy, Tailscale, UploadThing |
| Agenci i harnessy | Pi, Herdr, Moshi, OpenRouter |
| Typowana aplikacja | XState, Effect, oxlint, mdsvex |
| Auth i backend | Clerk, Convex |
| Rzeczy, które agent może pisać | Linear, Stripe, Resend, Attio |
| Design | Paper, Figma |

---

## 11. Automatyzacje w tle

Agenci zintegrowani z GitHubem: Claude Code, Cursor, Devin, CodeRabbit. Wołasz ich w **komentarzach i PR-ach**, albo startują po zdarzeniu.

| Wyzwalacz | Agent (w granicach uprawnień) | Wynik |
|---|---|---|
| `@claude` w komentarzu | czyta kod, historię, zasady zespołu | odpowiedzi, zmiany w kodzie |
| nowy PR / push / issue | start → jedno zadanie → stop | PR z issue, komentarze z review |
| harmonogram (dzień/tydzień) | | aktualna dokumentacja, raporty |

**Do czego używać?**

- aktualizacja dokumentacji, bazy wiedzy, a nawet strony
- issue → PR z potrzebnym kontekstem
- automatyczny przegląd każdego nowego PR
- samodzielne poprawki drobnych bugów
- wykrywanie problemów w kodzie i zależnościach
- przypisanie PR do właściwej osoby
- zbieranie danych z zewnętrznych systemów lub od ludzi
- rutyna, np. sprzątanie martwego kodu

👤 **Zawsze na końcu jest człowiek:** przegląda, merguje albo prosi o zmiany.

🤖 AI potrafi też takie workflow **tworzyć, monitorować i ulepszać**. Setup Pi + Herdr można przenieść na VPS i podłączyć do GitHuba — w kolejnych lekcjach.

---

## 12. Wnioski

| ✅ Rób | ❌ Nie rób |
|---|---|
| Używaj AI do budowy i zarządzania setupem | Nie komplikuj — prosty setup = szybkie zmiany |
| Wybieraj to, co pasuje **do Ciebie** | Nie myśl, że Cursor czy Claude Code to zły wybór |
| Stawiaj na przenośne elementy | Nie zmieniaj narzędzia dla jednej funkcji |
| Bądź trochę w tyle za hype’em | Nie goń każdej nowinki |

> 🎁 **Jedna rzecz do zapamiętania:** pobaw się repozytorium [limen](https://github.com/overment/limen), porozmawiaj o nim z agentem i **wyciągnij pomysły** albo **dopasuj je do siebie**.
