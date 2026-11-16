# S04E01 · Mechanika systemów autonomicznych — streszczenie

> Lekcja ma dwie części: tę (zasady) i [Build guide](https://hq.mega.dev/lessons/s04e01/build-guide/) (krok po kroku, co buduje John).

## Spis treści

- [O co chodzi?](#o-co-chodzi)
- [Plan lekcji](#plan-lekcji)
- [1. Film](#1-film)
- [2. Autonomia](#2-autonomia)
- [3. Runtime (środowisko uruchomieniowe)](#3-runtime-środowisko-uruchomieniowe)
- [4. Stan](#4-stan)
- [5. Kontrola](#5-kontrola)
- [6. Obserwacja i naprawa](#6-obserwacja-i-naprawa)
- [Najważniejsze wnioski](#najważniejsze-wnioski)

## O co chodzi?

System autonomiczny to zwykły program + **jeden nowy klocek: „inteligencja”** (model językowy lub model decyzyjny).

**Analogia:** zwykły program to pociąg na torach 🚂. Agent autonomiczny to kierowca w samochodzie 🚗 — sam wybiera drogę, ale jedzie po drogach, które mu zbudowaliśmy.

| Dawniej | Teraz |
|---|---|
| Budujemy funkcje | Budujemy system, który sam buduje funkcje |
| Przewidujemy każdy scenariusz | Nie da się przewidzieć wszystkiego |
| Logika deterministyczna | Rdzeń jest niedeterministyczny |

💡 Najlepsza nauka: **zbuduj autonomiczny system dla siebie** i używaj go codziennie.

## Plan lekcji

| Temat | Co obejmuje |
|---|---|
| Autonomia | poziomy nadzoru, ograniczona niezależność, proaktywność, zaufanie |
| Runtime | zdarzenia, wyzwalacze, kolejki, harmonogramy, heartbeaty, pętle |
| Stan | sesje, checkpointy, ciągłość między uruchomieniami |
| Kontrola | uprawnienia, budżety, zatwierdzenia, eskalacja |
| Obserwacja i naprawa | ślady, koszty, błędy, ponowienia, wycofania |

---

## 1. Film

John buduje w filmie **fabrykę oprogramowania** 🏭.

### Fabryka oprogramowania

- **Jeden główny wątek** (`main`) + **kilka wątków pomocniczych**, które pomagają w zadaniu (np. krytyk, notatnik).

**Analogia:** szef kuchni 👨‍🍳 gotuje danie, a obok stoją pomocnicy — jeden kosztuje i mówi „za słone”, drugi zapisuje przepis.

### Pięć filarów

| # | Filar | Po ludzku |
|---|---|---|
| 1 | Składany | klocki LEGO — łączysz, jak chcesz |
| 2 | Intuicyjny | wiesz, jak użyć, bez instrukcji |
| 3 | Udowodniony | działa, bo zostało sprawdzone |
| 4 | Łatwy do odczytania | każdy zrozumie, co się dzieje |
| 5 | Własnej produkcji | budujesz sam, dla siebie |

### Narzędzia i pojęcia

| Pojęcie | Przykład / opis |
|---|---|
| Workspace | np. **Herdr** |
| Uprząż (harness) | np. **Pi** |
| Hosting | **here.now** — błyskawiczny hosting dla rozwiązań agentów AI |
| `/split` | otwiera nowy wątek obok `main` |
| `/agent` | agent pomocniczy, zwraca tekst do `main`; wystarczy mały model, np. **Haiku** |
| `/lab` | osobny agent sprawdzający (szczegóły niżej) |

### Dobre praktyki

- ✅ **Samodokumentujący się kod** — kod sam mówi, co robi.
- ✅ **Flaga `--help`** dla każdego elementu — agent (i człowiek) szybko sprawdzi, jak go używać.
- ✅ **Wspólny słownik** — jak w Domain-Driven Design: najpierw ustal z agentem znaczenie słów, żeby potem nie było nieporozumień.

**Analogia:** zanim zagrasz z kolegą w grę, ustalacie zasady i nazwy 🎲 — inaczej każdy gra w coś innego.

### `/lab` — laboratorium

🔒 **Nie ufamy agentom pomocniczym, dopóki nie przejdą labu.**

| Cecha | Co znaczy |
|---|---|
| 1. Izolacja | działa w oddzielnej kopii, nic nie psuje |
| 2. Prowadzenie | używa aplikacji tak, jak zrobiłby to użytkownik |
| 3. Raportowanie i sprzątanie | zgłasza wyniki i po sobie sprząta |

**Analogia:** crash test samochodu 🚗💥 — zanim auto wyjedzie na drogę, rozbija się je na torze testowym.

### Plik `expectations.md`

Opisuje, czego oczekujemy od agenta. Ma trzy części:

| Część | Znaczenie | Przykład |
|---|---|---|
| **Do** | co zrobić | „wpisz prompt z błędem” |
| **Expect** | czego się spodziewamy | „Critic wskaże błąd” |
| **Never** | czego nigdy nie wolno | „nigdy nie pisze do `main` sam” |

---

## 2. Autonomia

**Cel:** dążyć do **pełnej autonomii** i **maksymalnej prostoty** (nawet „wykonywalny Markdown”). Nie po to, by zawsze tam dojść, ale żeby zmienić sposób myślenia.

➡️ Szukamy **ograniczonej niezależności** (*bounded independence*): agent działa sam, ale w wyznaczonych granicach.

**Analogia:** dziecko na placu zabaw 🛝 — bawi się samo, ale plac ma płot.

### Schody autonomii

Każdy stopień = jedna rzecz, którą przejmuje program zamiast człowieka:

| Stopień | Program przejmuje | Człowiek już nie musi… |
|---|---|---|
| 1. Limity | granice działania | pilnować każdej próby |
| 2. Dostarczanie | wyniki | gonić za rezultatami |
| 3. Stan | pamięć | tłumaczyć od nowa |
| 4. Decyzje | wybory | odpowiadać na drobne pytania |
| 5. Naprawa | błędy | debugować ręcznie |

Zasady:
- Agent działa **domyślnie bez człowieka**, ale **obie strony** muszą móc się nawzajem „zawołać”.
- **Proaktywność** przychodzi na końcu — gdy reszta już działa.

### Dwie drogi budowy

| Droga | Co to | Do czego |
|---|---|---|
| Agenci w chmurze | skille + gotowy agent (Cursor, Hermes, Grok Bot, Muse) | osobiste automatyzacje, procesy firmowe |
| Własni agenci | aplikacja pisana od zera | produkty dla wielu użytkowników |

### Przykład: agent Specter 👻

[Specter](https://github.com/MEGA-DOT-DEV/examples/tree/main/examples/specter) robi research i zarządza bazą wiedzy. **Głównie śpi.** Budzą go tylko:

| Budzik | Przykład | Czy sprawdzany? |
|---|---|---|
| Aktywność użytkownika | zapisanie linku, edycja notatki | ✅ mały model porównuje z `focus.md` |
| Alarm | „wyślij podsumowanie za godzinę” | ❌ ustawił go sam, więc nie trzeba |

**Analogia:** kot śpiący na kanapie 🐈 — budzi się tylko na szelest torebki z jedzeniem, a nie na każdy dźwięk.

Mechanizmy Specter:

| Mechanizm | Co robi |
|---|---|
| Percepcja | zdarzenia z zewnątrz, ale tylko istotne są obsługiwane |
| Decyzja | mały model porównuje zdarzenie z `focus.md` |
| Pętla | główny agent wykonuje zadania i zarządza sobą |
| Refleksja | alarmy pozwalają wracać do działań i robić „heartbeat” |
| Świadomość | każda akcja (także „nic nie rób”) zostawia ślad z powodem |

📚 Polecana lektura: DeepSeek Harness — „[Exploring Super-agent Design](https://x.com/DeepSeekHarness/status/2116857257245987236)”.

🔧 **U Johna:** *Critic* — mały, szybki model obok głównej rozmowy. Czyta wszystko, pisze uwagi w swoim panelu, ale **nic nie wysyła sam**.

---

## 3. Runtime (środowisko uruchomieniowe)

Systemy autonomiczne to w gruncie rzeczy **zwykłe aplikacje backendowe**.

### Durable Object w pigułce

| Cecha | Znaczenie |
|---|---|
| Stałe ID + własny SQLite | dane przetrwają do następnego użycia |
| Jedna instancja | dwa procesy nigdy nie zmieniają stanu naraz |
| Alarm | może sam się obudzić |

**Analogia:** skrytka pocztowa z budzikiem 📬⏰ — zawsze ta sama, tylko jeden klucz, i sama potrafi zadzwonić.

Specter działa na **[celld](https://github.com/denoland/celld)** (self-hosted Cloudflare Durable Objects) + **[pi-durable](https://github.com/earendil-works/pi/tree/main/packages/durable)** (zapis każdego kroku — po awarii wraca od ostatniego kroku).

### Elementy architektury Specter

| Element | Rola |
|---|---|
| Node | proces celld, trzyma dane, budzi obiekty |
| Router | przekazuje żądania, zero logiki |
| Log | lista tylko do dopisywania: zdarzenia, decyzje, kroki |
| Decision | mały model: „czy to ważne?” |
| Run | jedna rozmowa agenta na jedno obudzenie |
| Workspace | wersjonowane pliki — jedyna pamięć między uruchomieniami |
| Alarm | jeden timer na najbliższą rzecz do zrobienia |
| Checks | **kod** (nie prompt) pilnuje źródeł, ścieżek, limitów |
| Outbox | osobny obiekt — jeden e-mail na klucz, brak duplikatów |

➡️ Te klocki pomagają **przetrwać problemy** i **budują zaufanie** (agent nie powtarza nieodwracalnych akcji).

### Agent ogólny (projekt autora)

Jedna pętla dla wszystkich agentów:

```
Scheduler → Claim → Next step → Context → Model → Grants check → Dispatch
```

- **Claim** — blokuje wątek na czas jednego kawałka pracy.
- **Grants check** — czy akcja dozwolona (albo zapytaj użytkownika).
- Prymitywy: Files, Values, Secrets, Integrations, Code, Runs, Events, Grants.
- Agenci mogą uruchamiać agentów-dzieci w nowych wątkach.

🔧 **U Johna:** dwa zdarzenia budzą agenta pomocniczego: wysłany prompt i koniec odpowiedzi. Brak alarmów i kolejek.

---

## 4. Stan

Wywołania LLM są **bezstanowe** → stan trzymamy u siebie.

⚠️ Każdy wzorzec da się złamać (np. Grok Bot: jedna ciągła rozmowa, bez wątków).

### Specter: dwa rodzaje stanu

| Gdzie | Co | Jak długo |
|---|---|---|
| W trakcie runa | checkpointy (kroki) | do końca runa, potem wyrzucane |
| Między runami | log, pliki (focus, notatki, agenda), alarm | na stałe |

**Analogia:** Specter jest jak bohater filmu „Memento” 📝 — nic nie pamięta, ale czyta swoje notatki. Dzięki temu pamięć łatwo **przejrzeć, poprawić i cofnąć**.

### Agent ogólny: rodzaje stanu

| Element | Co przechowuje |
|---|---|
| Journal | każdy szczegół interakcji — **jedyne źródło prawdy** |
| Observations | kluczowe fakty z historii (z linkiem do źródła) |
| Catalog | lista wątków, wyszukiwanie — odbudowywalne z journali |
| Work rows | status wątku: czeka / działa / skończony |
| Schedules | praca zaplanowana lub cykliczna |
| Effect ledger | co zrobił jeden run w code mode |
| Agents i skills | pliki czytane przed każdym wywołaniem modelu |
| Grants | reguły: pozwól / zablokuj / zapytaj |
| Documents | notatki, załączniki (po hashu) |
| Values / Secrets | preferencje / hasła (agent dostaje tylko uchwyt) |
| Claims | kto teraz obsługuje wątek |
| Events | powiadomienia na żywo, nie zapisywane |

💡 **Inżynierowie mają już większość potrzebnej wiedzy.** Zacznij od „sprytnych cronów”.

🔧 **U Johna:** stan w plikach: `agents/critic/agent.md`, `expectations.md`, `reports/`.

---

## 5. Kontrola

Pytania na start: czy kontrola jest potrzebna? Jak agent nas złapie? Jak zrobić wygodne zatwierdzenia?

### Złota zasada

✅ **Zatwierdzenie musi być deterministyczne** — decyduje **kod**, nie model.

**Analogia:** bramka na lotnisku 🛂 — nieważne, co mówi pasażer, liczy się skan karty.

### Przebieg zatwierdzenia

| Krok | Co się dzieje |
|---|---|
| 1 | Agent chce wykonać akcję |
| 2 | Kod sprawdza reguły → **uruchom / odmów / zapytaj** |
| 3 | „Zapytaj” → pętla się zatrzymuje, prośba zapisana |
| 4 | Czekanie (minuty lub dni) — inna praca trwa dalej |
| 5 | Odpowiedź zapisana, kod sprawdza ponownie |
| 6 | Brak odpowiedzi **nigdy** nie oznacza „tak” |

### Uprawnienia (Grants)

- **Reguły przenośne** — synchronizowane w organizacji.
- **Reguły urządzenia** — tylko lokalnie, nigdy nie wychodzą z urządzenia.
- Reguły działają **wszędzie**, gdzie używany jest prymityw (np. integracja w czacie i w aplikacji).
- Niektóre akcje **zawsze** wymagają zgody (np. tworzenie integracji).

### Problem z zatwierdzeniami

| Problem | Rozwiązanie |
|---|---|
| Za dużo pytań → użytkownik przestaje czytać | zgody ograniczone czasem lub kontekstem |
| Code mode → skrypty trudne do zrozumienia | modele decyzyjne ([jev](https://openrouter.ai/docs/guides/community/jev), [Decisions API](https://developers.openai.com/api/docs/guides/decisions)) |

### Kaskada decyzji

| Wynik | Działanie |
|---|---|
| Reguła: nigdy | odmowa |
| Reguła: zawsze pytaj | pytanie do użytkownika |
| Brak reguły → model decyzyjny: bezpieczne | akcja, bez przerywania |
| Model: niepewne | pytanie z powodem w prostych słowach |
| Model: niebezpieczne | odmowa, agent widzi dlaczego |

Nowe modele mniej halucynują → też zmniejszają ryzyko (ale nie gwarantują).

🔧 **U Johna:** kontrola ręczna — Critic pokazuje numerowane uwagi, my wybieramy, którą wysłać. Automatyczne przerwanie tylko dla destrukcyjnych zmian i tylko po sprawdzeniu w labie.

---

## 6. Obserwacja i naprawa

Agentów jest za dużo, by pilnować ręcznie → **inne agenty obserwują i naprawiają**. Narzędzia jak Langfuse dają monitoring i ewaluacje online.

**Analogia:** system odpornościowy 🦠🛡️ — sam wykrywa problem i sam go zwalcza, a do lekarza idziemy tylko w poważnych przypadkach.

### Pętla samonaprawy

| Etap | Narzędzie | Po co |
|---|---|---|
| Przetrwaj | trwały stan + efekty z kluczem | brak powtórzeń po awarii |
| Zapisz | logi i journale | każde zachowanie da się prześledzić |
| Zauważ | harmonogramy i heartbeaty | wykrywanie problemów bez człowieka |
| Napraw | agenci w tle | zawsze od **odtworzonego** błędu |
| Sprawdź | ewaluacje | czy zmiana jest bezpieczna |
| Eskaluj | do człowieka | **raz**, z jedną konkretną akcją |
| Ulepsz | prymitywy | naprawa architektury, nie objawów |

Potem znów od początku 🔁.

🔧 **U Johna:** *Lab* — drugi agent testuje narzędzie z zewnątrz w odizolowanej kopii. Pisze jak człowiek, czyta tylko ekran, raportuje: „Próbowałem X, oczekiwałem Y, dostałem Z”. Gdy test nie przechodzi — poprawiamy agenta, **nigdy nie luzujemy oczekiwań**.

---

## Najważniejsze wnioski

- Buduj autonomiczne systemy **najpierw dla siebie** — to najlepsza szkoła.
- Dąż do pełnej autonomii i prostoty, potem dodawaj tylko potrzebne granice.
- Architektura = klasyczne klocki (kolejki, logi, alarmy) + inteligencja.
- Pamięć w plikach/journalach → łatwo sprawdzić i cofnąć.
- Zatwierdzenia decyduje **kod**, nie model.
- System powinien sam się obserwować, naprawiać i eskalować tylko to, czego nie umie.
- Nawet jeśli system działa bez nas, jego budowa wymaga **dużo pracy** w każdym obszarze inżynierii produktu.
