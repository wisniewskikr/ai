# S04E03 · Orkiestracja autonomicznych zespołów agentów — streszczenie

## Spis treści

- [Plan lekcji](#plan-lekcji)
- [1. Film](#1-film)
- [2. Organizacja](#2-organizacja)
- [3. Koordynacja](#3-koordynacja)
- [4. Routing i równoległość](#4-routing-i-równoległość)
- [5. Nadzór](#5-nadzór)
- [Najważniejsze wnioski](#najważniejsze-wnioski)

---

> 🎯 **W jednym zdaniu:** nie budujemy już samego oprogramowania, tylko **system, który buduje oprogramowanie**, czyli zespół agentów, który sam się organizuje i woła nas tylko wtedy, gdy trzeba.

🧸 **Analogia:** jesteś dyrektorem szkoły. Nie uczysz w każdej klasie. Rozmawiasz z jednym wicedyrektorem, a on sam zatrudnia nauczycieli na zastępstwo, kiedy są potrzebni.

---

## Plan lekcji

| Temat | O co chodzi |
|---|---|
| Organizacja | Role (planista, badacz, budowniczy, recenzent, walidator) z ograniczonym dostępem |
| Koordynacja | Wspólne cele, osobne konteksty, zależności, przekazywanie zadań w obie strony |
| Równoległość | Worktree, gałęzie, sesje, kolejki, punkty scalania |
| Routing | Dobór agenta, narzędzi i modelu do zadania (możliwości, ryzyko, koszt, szybkość) |
| Nadzór | Widoczność postępu, wykrywanie kolizji, eskalacja, ostatnie słowo człowieka |

💡 Żeby **zarządzać** agentami, trzeba umieć je **budować**, nawet jeśli nie piszemy ich od zera.

---

## 1. Film

🎬 Film pokazuje **Domain-driven development** z agentami w dużym projekcie.

🧸 **Analogia:** w dużej firmie każdy dział ma swojego „starego wyjadacza”, który pamięta, **dlaczego** coś zrobiono tak, a nie inaczej. Zanim ruszysz coś w jego dziale, on podchodzi i mówi: „uważaj, to jest tak z powodu X”.

### Najważniejsze pomysły

| Pomysł | Jak działa |
|---|---|
| **Agent domenowy** | Osobny agent, który **pamięta i odświeża** wiedzę o domenie, czyli dlaczego zrobiono coś tak, jak zrobiono |
| **Kilku agentów domenowych** | Każda domena ma swojego, np. od **cen**, od **towarów** itd. |
| **Uruchamianie** | Agent domenowy startuje, gdy agent **„main”** dotknie powiązanego z nim pliku. Wtedy patrzy, co robi main, i daje mu **rady** |
| **Poprawka w 2+ domenach** | Może dojść do **kolizji**. Main **nie zgaduje**, tylko prosi **dewelopera o decyzję projektową** |

### Widgety

| Widget | Do czego |
|---|---|
| **To-dos** | Pokazuje, **co jest teraz robione** |
| **Memories** | Zapisuje wskazane informacje **do plików** |

---

## 2. Organizacja

### Agenci krótkotrwali

Nie musimy mieć stałej kadry. Specjalistę tworzymy **w chwili, gdy jest potrzebny**, a po zadaniu znika.

🧸 Jak ekipa remontowa: hydraulik przychodzi, naprawia rurę i wychodzi.

Każdy agent ma 5 „szufladek”:

| Szufladka | Kto ustala | Przykład |
|---|---|---|
| **Rola** | stała, raz | badacz / budowniczy / recenzent |
| **Wiedza** | rodzic, przy tworzeniu | logi, kod checkoutu |
| **Zachowanie** | rodzic, przy tworzeniu | „tylko fakty”, „najmniejsza zmiana” |
| **Model** | rodzic, przy tworzeniu | szybki i tani / najmocniejszy |
| **Strategia** | rodzic, przy tworzeniu | 3 równolegle / jeden długi przebieg |

### Rozmawiamy z jednym agentem

- Człowiek nie ogarnie dziesiątek agentów naraz — i **nie musi**.
- Mówimy (najlepiej **głosem**) z jednym „Managerem”.
- Wyniki dostajemy jako **obrazki, animacje i krótki tekst**, nie ściany kodu.
- Do sesji pojedynczego agenta zaglądamy tylko w razie potrzeby (rzadko).

### Problemy sztywnych ról

| Problem | Dlaczego boli |
|---|---|
| Jeden manager ma limit | Za dużo szumu i aktualizacji |
| Role ustalone z góry | Manager nie może złożyć zespołu „na miarę” |
| Tylko 2 poziomy | Za płytko na duże zadania |

✅ **Rozwiązanie:** **struktury dynamiczne**. Wszyscy to **Workerzy** (osobne sesje), składani z **szablonów** i instrukcji dopisanych w locie. Drzewo może rosnąć w głąb, a gałęzie mogą współpracować na boki.

### Trzy mechanizmy

| Mechanizm | Co robi | Przykład |
|---|---|---|
| **Spawning** (tworzenie) | Nowy agent dostaje własną konfigurację, zmienianą w granicach uprawnień rodzica | badacz od obrazków; agent z własnym labem i budżetem |
| **Assembling** (składanie) | Uprawnienia, dostęp do danych, **bogate przekazanie zadania**, **osobiste hooki** | hook: „posprzątaj lab przed końcem”; event budzi agenta od dokumentacji |
| **Collaboration** (współpraca) | Agenci **sami wybierają architekturę** z naszych klocków | podagent, hierarchia, zespół, rój |

🧱 **Klocki (prymitywy):**

| Klocek | Znaczenie |
|---|---|
| Template | jak ustawić Workera |
| Issue | jednostka pracy |
| Channel | kto z kim rozmawia |
| Workspace | wspólne miejsce |
| Claim | kto wziął zadanie |
| Subscription | co kogo budzi |

🧸 Jak klocki LEGO: dajemy kostki, agenci sami decydują, czy zbudować dom, czy statek.

📦 Większość tych pomysłów jest w projekcie **limen** — to tylko kilka plików, resztę robi AI.

> **U Johna:** zbieracze (gatherers) są krótkotrwali. **Domain Agent** to folder, który posiada część ścieżek, trzyma ich pamięć i działa tylko do odczytu na małym, szybkim modelu. Doradza i recenzuje, a kod pisze główna rozmowa.

---

## 3. Koordynacja

Autor od 4 miesięcy pracuje **prawie bez komputera** — głosem, przez **Grok Bot**.

### Jak to działa

1. Grok Bot = **jeden ciągły czat** na projekt.
2. Każda funkcja ma **własny folder** (notatki, dowody).
3. Folder można podzielić; każdy kawałek **przejmuje jeden agent**.
4. Grok Bot zarządza Pi i Claude Code w **Herdr** i ma **webhook** na powiadomienia.
5. Instancja to **koordynator** (tworzy innych) albo **worker** (robi sam i raportuje).

🧸 Foldery to tablica korkowa w biurze: każdy przypina swoje notatki, inni mogą je przeczytać.

### Głos jako sztuczne ograniczenie

- Skoro nie patrzymy w kod, system **musi** dostarczać jakość sam.
- Jeśli to działa — system jest dobrze zaprojektowany.
- Nawet próba pracy głosem **ujawnia słabe punkty** procesu.

### Ważne

- Te same zasady działają w każdym systemie wieloagentowym, nie tylko z koderami.
- Agenci działają w **workspace’ach** i komunikują się przez nie.
- Każde zlecenie przechodzi przez **Grants** (uprawnienia).
- 🎯 Koordynacja ≠ pilnowanie wszystkiego. To **struktura, która sama sobą zarządza**.

> **U Johna:** koordynacja dzieje się **przed pierwszą edycją**. Przy funkcji na styku dwóch obszarów pyta się obu Domain Agentów naraz. Spór lub decyzja produktowa trafia do **nas**. Decyzja zapisuje się jako datowana reguła w pamięci agentów.

---

## 4. Routing i równoległość

### Agent musi wiedzieć, co się dzieje dookoła

Stany sesji: działa, czeka, utknęła, padła, skończona.

| Po co | Dlaczego |
|---|---|
| **Zrozumienie** | żeby dobrze współpracować |
| **Odzyskiwanie** | żeby wcześnie łapać problemy |

- Krótkie podsumowanie **wstrzykujemy** do wiadomości developerskiej (oszczędnie).
- Szczegóły agent **dopytuje** narzędziami.

### 4 rodzaje „świadomości”

| Rodzaj | Co zawiera | Jak dociera |
|---|---|---|
| **Dynamic** | co dzieje się teraz (sesje, stany) | 💉 wstrzykiwana |
| **Static** | co jest możliwe (chmura, lab, modele) | 🔧 narzędzia |
| **Project** | czym jest projekt i dokąd zmierza | 🔧 narzędzia |
| **Work** | co zrobiono i co zaplanowano | 🔧 narzędzia |

🧸 Jak w kuchni restauracji: kucharz słyszy na bieżąco zamówienia (dynamic), ale przepisy i stan spiżarni sprawdza sam, gdy potrzebuje.

- Agenci w grupie znają **szczegóły kolegów**, a o reszcie wiedzą **ogólnie**.
- Wiedzę porządkują **agenci**, nie ludzie.

### Czego technicznie potrzeba

- prosty **CLI lub serwer MCP** z dostępem do sesji,
- **foldery** (lub API),
- własny lub konfigurowalny harness (Pi, OpenCode, Claude Code…),
- agent **stworzony do konkretnego zadania**, który zarządza workerami.

### Hooki = podpowiedzi, nie kajdany

| Hook | Kiedy | Co robi |
|---|---|---|
| Context | przed turą | dodaje kontekst |
| Gate | przed wywołaniem narzędzia | blokuje zakazane |
| Reminder | po wyniku narzędzia | przypomina |
| Steering | w trakcie pracy | koordynator dosyła wiadomość |
| Finish check | gdy chce skończyć | „zamknij otwarte sprawy” |
| Status | cała sesja | tylko obserwuje |

### Mierz, gdzie ucieka czas

Przy setkach agentów drobiazgi się sumują. Warto **regularnie analizować wątki** całego zespołu.

Przykład z 7 dni pracy agentów autora:

| Na co poszedł czas | Udział |
|---|---|
| Myślenie i pisanie modelu | 51% |
| Buildy i testy Rust | 10% |
| Lab natywny | 8% |
| Testy JS | 7% |
| Czytanie i szukanie | 6% |
| Kolejka startowa, uśpienie, zawieszone narzędzia | po ~4% |
| Reszta | ~4% |

➡️ Problemy rozwiązuje się **eksperymentami**, a narzędzia typu Depot czy Browserbase dokłada tylko, gdy to uzasadnione.

> **U Johna:** routing **po ścieżce pliku** — hook budzi właściwego Domain Agenta i dodaje jego brief (kontekst, nie regułę). Równolegle agenci **tylko czytają i doradzają**, a pisze **jedna** rozmowa („Don’t Build Multi-Agents”). Lekcja **zarządza** kolizjami, John ich **unika**.

---

## 5. Nadzór

### Co musimy mieć

| Obszar | Agenci robią | My dodajemy |
|---|---|---|
| **Podgląd na żywo** | raportują każdy krok (np. Langfuse, Macroscope) | widzimy, ilu pracuje i nad czym |
| **Postęp** | zapisują go w plikach/bazie | ustalamy, kto może przejąć zadanie |
| **Raporty** | raportują, dowodzą, scalają | przeglądamy i decydujemy |
| **Dodatkowe sesje** | eksplorują w tymczasowym „labie” | wnosimy pomysły i pytania |

### Kluczowa zasada

❗ Postęp **nie może żyć tylko w głowie agenta** (w kontekście wątku). Musi być w plikach lub bazie, żeby **każdy agent mógł przejąć każde zadanie**.

🧸 Jak dziennik budowy: zmiana ekipy niczego nie psuje, bo wszystko jest zapisane.

### Raporty zbiorcze

Agent łączy raporty kilku workerów w jeden:
- co się zmieniło w produkcie,
- co udowodniono i jak,
- co wymaga decyzji.

Służy to nam do decyzji, a zespołowi do dzielenia się wiedzą.

💡 Nawet nadzór może prowadzić AI, ale tu nasz udział jest **największy**, bo mamy kontekst, którego agenci często nie widzą.

🔭 Warto obserwować platformy typu **Factory**.

> **U Johna:** kolizja dwóch obszarów = **pytanie produktowe** dla nas. Folder `agents/` to wspólny tekst — zmiany recenzują właściciele obszaru, a przy zmianie plików uruchamiają się testy scenariuszy. **Scenariusza nigdy nie usuwa się**, żeby test przeszedł.

---

## Najważniejsze wnioski

- ⬆️ **Wchodzimy poziom wyżej:** budujemy system, który buduje oprogramowanie.
- 🧩 **Struktury dynamiczne** zamiast sztywnych ról.
- 🧠 Używaj **najlepszych modeli**, bo od nich zależy cały system.
- ⚖️ **Odpowiedzialność za oprogramowanie dalej jest nasza.** Szukaj balansu między autonomią a nadzorem.
- 🚀 Ucz się przenosić coraz więcej pracy na AI. Nadal jest dużo do zrobienia, nawet jeśli możemy „poprosić o prawie wszystko”.
