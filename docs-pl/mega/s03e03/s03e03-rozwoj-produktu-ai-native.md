# S03E03 · Rozwój produktu AI-native

## Spis treści

1. [Film](#1-film)
2. [Główna myśl](#2-główna-myśl)
3. [Eksploracja](#3-eksploracja)
4. [Planowanie](#4-planowanie)
5. [Wykonanie](#5-wykonanie)
6. [Informacja zwrotna (feedback)](#6-informacja-zwrotna-feedback)
7. [Wnioski](#7-wnioski)

> **W skrócie:** produkt AI-native to taki, który sam się **naprawia**, **podnosi po błędach** i **staje się lepszy z czasem**. Nie mówimy agentom, co mają robić — budujemy system, w którym **wiedzą, co robić** i **potrafią to zrobić**.

---

## 1. Film

Temat filmu: **PR (Pull Request) w świecie agentów AI**.

### Wyłapywanie błędów

- Na etapie PR agenci AI też łapią błędy.
- Uruchamiają kod (np. w **sandboxie**) i sprawdzają, czy działa.

### Screenshoty w PR

- Poproś agentów, by dodawali **screenshoty** do PR.

| Korzyść | Dla kogo |
|---|---|
| Agent **musi** naprawdę uruchomić kod | agent |
| Łatwa weryfikacja zmian | człowiek |

**Analogia:** zdjęcie „przed i po” u fryzjera — od razu widać, co się zmieniło.

### Środowisko Preview

- Zewnętrzne systemy → **mockowane**.
- Kod → **aktualny kod produkcyjny** + nasze zmiany.
- Świetne do sprawdzania PR.

### CLI dla Preview

- Preview powinno mieć **CLI**.
- Dzięki temu agent sam wypełni je **danymi testowymi**.

**Analogia:** makieta sklepu — półki prawdziwe, towar na niby, ale można wszystko przetestować.

### PR a Primitives

- W **szablonie PR** wskaż dokumentację z **Primitives** (gotowymi klockami).
- Agent zauważy, że zamiast budować od nowa, może **użyć istniejącego** klocka.

**Analogia:** zanim kupisz nowy śrubokręt — zajrzyj do skrzynki z narzędziami.

### PR a diagramy

- W PR dodaj **wizualizację przepływu** zmiany.
- Jeden obraz > 1000 słów → łatwiej zrozumieć zmianę.
- Szczególnie przydatne, gdy dane płyną **między Primitives**.

### Reviewerzy AI

| Gotowe narzędzia | Własny reviewer |
|---|---|
| **Bugbot**, **CodeRabbit**, **Devin** | musi **różnić się** od agenta, który implementował |

**Analogia:** nie sprawdzaj własnego wypracowania — daj je koledze.

### Testy deterministyczne

Oprócz agentów — klasyczne, przewidywalne narzędzia:

| Przykład | Co robi |
|---|---|
| **Knip** | znajduje i usuwa nieużywany kod |
| Limity dokumentacji | wykrywa za długą dokumentację |
| Limity komentarzy | wykrywa za dużo komentarzy |

### PR to proces

- Podziel PR na **kroki** i śledź postęp każdego z nich.
- Każdy krok ma **własny, mały kontekst** → nie puchnie jeden wielki kontekst → mniej błędów.

**Analogia:** linia produkcyjna — każde stanowisko robi jedną rzecz, zamiast jednej osoby składającej cały samochód.

---

## 2. Główna myśl

- Agenci radzą sobie z projektami:
  - **greenfield** — nowy projekt od zera,
  - **brownfield** — istniejący, „zarośnięty” kod.
- Szybko + jakościowo + zgodnie z biznesem = wymaga dodatkowej pracy.
- Z czasem system się **zapycha**: stare narzędzia i dokumenty stają się szumem.

> **„Brak dokumentu jest lepszy niż zły dokument.”**

**Meta-workflowy** = procesy, które dbają o sam system:

| Problem | Rozwiązanie |
|---|---|
| Agent wpada w ten sam problem kolejny raz | Agent zapisuje wnioski i poprawia swoje skille |
| Brakuje narzędzia | Agent sam je tworzy |
| Stare dokumenty mylą | Agent je porządkuje / archiwizuje |

**Analogia:** to jak ogród — trzeba nie tylko sadzić, ale też regularnie pielić.

💡 Zacznij od małych kroków — nie da się zbudować wszystkiego od razu.

---

## 3. Eksploracja

### Problem

- Agent przy każdym zadaniu bada projekt **od nowa**, jakby był tu pierwszy raz.
- Nie zostawia notatek → powtarza te same błędy.
- Dotyczy to też systemów zewnętrznych: repozytoriów, trackerów zadań, kanałów komunikacji, infrastruktury.

**Analogia:** nowy pracownik z amnezją — co rano uczy się biura od zera.

### Rozwiązanie: Feature Map (mapa funkcji)

- Zestaw **małych dokumentów** — po jednym na funkcję (np. `checkout.md`, `search.md`).
- **Nie** opisuje kodu (to agent sam znajdzie), tylko to, czego **z kodu nie widać**.

| Sekcja dokumentu | Co zawiera |
|---|---|
| Role | po co jest ta funkcja |
| How to get there | jak do niej dotrzeć w aplikacji |
| How to verify | jak sprawdzić, że działa |
| Keep in mind | ⚠️ na co uważać (najważniejsze!) |

| Znajdzie czytając kod | Musi być zapisane w mapie |
|---|---|
| ścieżki, komponenty, foldery | jak dotrzeć, jak sprawdzić, na co uważać |

- Pomysł: **Lauren Tan** — skille do [tworzenia](https://github.com/cursor/plugins/blob/main/pstack/skills/create-verification-skill/SKILL.md) i [utrzymania](https://github.com/cursor/plugins/blob/main/pstack/skills/maintain-verification-skill/SKILL.md) mapy, uruchamiane codziennie przez Cursor Cloud Agents.

### Co budujemy my?

| Rola człowieka | Rola agenta |
|---|---|
| **Zasady** (principles) | cała reszta |
| **Zakres** (scope) | |
| **Harmonogram / wyzwalacz** (schedule / trigger) | |
| **Początkowy kształt mapy** | ulepszanie mapy |

Agent musi mieć dostęp do **historii swoich działań** → wtedy system naprawdę „się uczy”.

### Przykład: odtwarzacz muzyki

- Błąd: po edycji playlisty shuffle gra ten sam utwór dwa razy.
- Mapa mówi: *„Edycja playlisty przebudowuje kolejkę”* → agent sprawdza też `queue.md`.
- Agent dopisuje nową wiedzę: *„Kolejność shuffle jest cache'owana”*.

**Analogia:** mapa działa jak notatki doświadczonego mechanika — „jak ruszasz hamulce, sprawdź też ABS”.

### Utrzymanie mapy

- Harmonogramy mają **dodawać**, ale też **zmieniać i usuwać (archiwizować)**.
- Większość agentów w tle powinna głównie **sprzątać**.
- Agenci powinni **zawsze** raportować zmiany — najlepiej wizualnie, żeby szybko je przejrzeć.

---

## 4. Planowanie

- Z mapą funkcji + zasadami z **S03E02** nie musimy wszystkiego trzymać w głowie.
- Wystarczy krótko wspomnieć funkcję → agent sam łączy kropki.

**Analogia:** rozmowa z kolegą, który pracuje przy projekcie od lat i zna odpowiedzi na prawie wszystko.

### Przykład: crossfade

- Użytkownik: *„Dodajmy crossfade między utworami. Ma działać też z pobranymi.”*
- Agent: dotyczy `player`, `queue`, `offline` → zacznijmy od `queue`.

### Główny wątek + agenci w tle

| Główny wątek | Agenci w tle |
|---|---|
| skupiony, interaktywny | research, eksploracja, wizualizacje, grafy |
| ty podejmujesz decyzje | iterują plan (v1 → v2 → v3) przez wspólne notatki |

- Agenci w tle szukają **przypadków brzegowych** i najlepszych rozwiązań.
- **Ostatnie słowo należy do nas** — ale AI wzmacnia naszą wiedzę i osąd.

### Jaki ma być plan?

| ✅ Tak | ❌ Nie |
|---|---|
| **co** trzeba zrobić | **jak** to zrobić |
| **jak udowodnimy**, że działa | długi elaborat |
| krótki, może linkować do plików | |

- Pętle feedbacku jak najkrótsze — dopóki system nie jest gotowy na dłuższe zadania bez nadzoru.
- Ile oddajemy agentom, zależy od funkcji i **poziomu zaufania** do systemu.

---

## 5. Wykonanie

Pisanie kodu, czytanie go, a nawet review — coraz częściej robią to agenci. Agenci zarządzają innymi agentami. Ale dla nas wciąż zostaje dużo pracy:

### 5.1. Research

- Kiedyś: trzymaliśmy się tego, co znamy (JS → nie Rust, bez Three.js itp.).
- Teraz: bariery są dużo niższe → **research staje się częścią naszej pracy**.
- Nie musimy znać wszystkiego, ale musimy zejść **na wystarczający poziom** — i umieć go rozpoznać.

> **Zasada:** idź tak daleko, jak **potrafisz zweryfikować**, a nie tak daleko, jak sięga agent.

Pytania kontrolne:

- Czy umiem to wyjaśnić własnymi słowami?
- Czy umiem powiedzieć, jak to sprawdzić?
- Czy niezależne eksploracje dają ten sam wynik?
- Czy podpisałbym się pod tym?

**Analogia:** latarka — świecimy daleko, ale idziemy tylko tam, gdzie widzimy grunt pod nogami.

### 5.2. Struktura

- Architektura, dokumentacja, usługi, infrastruktura — zostają, ale **robią je agenci**.
- Nasza rola: organizacja **procesów**, **harmonogramów** i **wydajności** + obserwowalność, stabilność, ulepszanie.
- Praca na **meta-poziomie**.

| Kiedyś | Z AI (początkowo) | AI-native |
|---|---|---|
| Naprawiam sam | Mówię agentowi „napraw” | Agent **sam zauważa** problem i umie zareagować |

- Polecana lektura: *„the art of supervising someone smarter than you”* w [The Complete Guide to pstack](https://x.com/poteto/status/2097732320606507506).

**Analogia:** nie jesteśmy już kucharzem, tylko szefem kuchni, który dba, by każdy wiedział co robić i miał czym.

### 5.3. Ekosystem

- Kiedyś wybieraliśmy usługę, którą znamy (np. Axiom), a nie najlepszą (np. Datadog, Better Stack).
- Teraz agent w godzinę przygotuje raport porównawczy + mapę architektury + szacunek wysiłku.
- **Wybieraj najlepszą usługę do zadania**, a nie najbardziej znajomą.
- Nie buduj od zera tego, co można dostać gotowe — agenci zrobią świetne integracje.

Przykładowy stack MEGA:

| Część | Technologia / usługi |
|---|---|
| MEGA HQ (lekcje, wyzwania, MCP) | Cloudflare, Airtable, Resend |
| mega.dev (konta, oceny) | Vercel + Next.js, OpenRouter, Cloudinary, Stripe, Postmark, Sentry |
| Treść lekcji | GitHub + Astro |

### 5.4. Harmonogramy (schedules)

Wielu agentów naraz = brak zasobów (nawet 128 GB RAM to za mało 😅).

| Krok | Co zrobić |
|---|---|
| 1 | Poproś agentów o **audyt** wąskich gardeł |
| 2 | Wdroż szybkie poprawki |
| 3 | Ustaw cykliczne **sprzątanie** (stare procesy, pliki) |
| 4 | Dodaj **kolejki / throttling** dla ciężkich zadań (np. kompilacja) |
| 5 | Dopiero potem: **agenci w chmurze** ([Codex](https://learn.chatgpt.com/docs/cloud), [Claude](https://code.claude.com/docs/en/claude-code-on-the-web)) zamiast nowego sprzętu |

> **Zasada:** najpierw zaplanuj sprzątanie i ustaw szczyty w kolejce, potem kupuj sprzęt.

**Analogia:** zamiast kupować większą lodówkę — regularnie wyrzucaj przeterminowane jedzenie.

Rodzaje harmonogramów:

| Typ | Po co |
|---|---|
| Optymalizacja | sprzątanie zasobów |
| Monitoring | anomalie, zachowanie użytkowników, **bezpieczeństwo** |
| Praca nad produktem | bugi, issues, review, refaktoring (zwykle w chmurze) |

- ⚠️ Ataki to dziś nie głupie boty, tylko **sprytni agenci**. Warto: skill [security-audit](https://github.com/cloudflare/security-audit-skill) + [Sentry](https://sentry.io/) raportujący błędy wprost do agentów.
- Dobre harmonogramy = **przewaga konkurencyjna**.

---

## 6. Informacja zwrotna (feedback)

Agenci potrzebują jak najwięcej **danych z otoczenia** w czasie rzeczywistym — obecnych i historycznych.

| Środowisko | Agent może |
|---|---|
| **Sandbox (dev)** | klikać, pisać, logować się; robić screenshoty, czytać logi, nagrywać wideo; dołączać dowody (przed/po, testy) |
| **Produkcja (tylko odczyt)** | czytać logi i błędy, nagrania sesji, opinie użytkowników |

- Takie środowisko rzadko istnieje → trzeba:
  1. **zdecydować**, jakich informacji potrzeba,
  2. **przebudować / rozszerzyć** system — **dla agentów**, nie dla nas.
- To nie jest „prosty logger” — to musi być **priorytet**.
- Feedback = fundament **zaufania** i weryfikacji pracy agentów.
- Zacznij **małymi krokami**, potem dodaj harmonogramy, które ulepszają narzędzia na podstawie logów.

**Analogia:** chirurg bez monitorów pracuje po omacku — agent bez feedbacku też.

---

## 7. Wnioski

- Prawdziwie AI-native cykl rozwoju to **dużo pracy** — dla nas zostaje sporo decyzji i zrozumienia.
- To nie tylko „wyższy poziom abstrakcji” — trzeba patrzeć **poza kod**, na cały produkt.
- Produkty AI-native mogą być **szybsze i jakościowe jednocześnie**.
- Produkty robione „ręcznie z agentem” mogą **nie nadążyć**.
- Czasem opłaca się zbudować platformę **od zera**, by zyskać tę przewagę.

| Faza | Kluczowe narzędzie |
|---|---|
| Eksploracja | Feature Map |
| Planowanie | agenci w tle + krótki plan „co + jak udowodnić” |
| Wykonanie | research, struktura, ekosystem, harmonogramy |
| Feedback | sandbox + odczyt z produkcji |
