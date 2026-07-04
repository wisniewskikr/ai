# Od pomysłu do PRD: Metoda Sokratejska z Agentem

## Dlaczego Agent powinien pytać

Oto dlaczego Twój Agent AI musi najpierw zadawać pytania, zanim przejdzie do działania:

## Dlaczego warto pytać?

Wyobraź sobie, że idziesz do **krawca** i mówisz: „Poproszę garnitur”. Jeśli krawiec nie zapyta o wymiary, uszyje coś, co wygląda jak garnitur, ale prawdopodobnie nie będzie na Ciebie pasować.

| Co robi człowiek | Co robi model (bez pytań) |
| :--- | :--- |
| Pomija oczywistości | Sam uzupełnia braki |
| Miesza życzenia z decyzjami | Przyjmuje błędne założenia |
| Zakłada, że „wiadomo, o co chodzi” | Tworzy tekst, który tylko wygląda na kompletny |

### Główne ryzyko: „Efekt domina”
Jeśli pozwolisz Agentowi działać bez doprecyzowania:
*   **Zmyślone decyzje:** Model wstawi w luki najbardziej prawdopodobne, ale niekoniecznie Twoje wybory.
*   **Konsekwentny błąd:** Agent będzie bardzo skutecznie i uparcie realizował te błędne założenia w całym projekcie.

### Złota zasada współpracy
Zamiast prosić od razu o gotowy dokument, zastosuj prostą kolejność:

1.  **Najpierw pytania:** Agent wyjaśnia wszystkie niejasności i braki.
2.  **Potem dokument:** Tworzenie na podstawie faktów, a nie domysłów.

## PRD jako kontrakt dla kolejnych kroków

Dokument PRD (Product Requirements Document) to fundament, który sprawia, że praca z AI nie jest błądzeniem po omacku, lecz precyzyjną budową produktu.

### PRD vs. Prompt: Czym się różnią?

Wyobraź sobie, że budujesz dom. **Prompt** to instrukcja dla murarza, jak ułożyć konkretną cegłę. **PRD** to plan całego budynku.

| Cecha | Prompt (Zadaniowy) | PRD (Dokumentacja) |
| :--- | :--- | :--- |
| **Poziom** | Mikro (konkretna rzecz) | Makro (ramy projektu) |
| **Przekaz** | "Zrób to teraz" | "To jest kontekst i cel" |
| **Rola** | Wykonanie zadania | Zapobieganie "dryfowaniu" projektu |

Bez PRD Twoje działania przypominają zbieraninę przypadkowych zachcianek, a nie spójny produkt.

### Dlaczego PRD jest niezbędne dla Agenta?

PRD działa jak **GPS dla sztucznej inteligencji** – wyznacza trasę i pilnuje, by nie zjechać na manowce.

*   **Ogranicza fantazję:** Definicja użytkownika i problemu trzyma Agenta w ryzach.
*   **Hamuje "rozrost":** Zakres projektu pilnuje, by nie dodawać zbędnych funkcji.
*   **Chroni przed rozpraszaczami:** Sekcja *non-goals* ucina pomysły typu "przy okazji zróbmy jeszcze...".
*   **Ułatwia akceptację:** Kryteria sukcesu pozwalają sprawdzić, czy praca została wykonana dobrze.
*   **Wskazuje luki:** Otwarte pytania przypominają, gdzie brakuje jeszcze decyzji.

### Cykl pracy (Workflow)

Proces zamiany idei w gotowe pliki składa się z czterech kroków:

1.  **10x-shape:** Nadanie kształtu pomysłowi.
2.  **10x-prd:** Stworzenie głównego kontraktu (Twojej mapy).
3.  **Wybór stacku:** Dobór technologii pod konkretny problem, a nie pod modę.
4.  **Bootstrap:** Zamiana kontraktów w konkretne pliki projektu.

**Ważna przestroga:** Jeśli Twój PRD jest pusty lub błędny, technologia pozwoli Ci jedynie... **szybciej dowozić złe decyzje**. Szybciej nie zawsze znaczy lepiej – czasem to po prostu szybszy bieg w złym kierunku.

## Dwa skille, jeden cel

Workflow **10x Product Shaping** to prosty proces dzielący tworzenie produktu na dwa kluczowe etapy: **wydobywanie pomysłu** oraz **spisywanie kontraktu**.

### Porównanie narzędzi

| Cecha | **/10x-shape** (Architekt) | **/10x-prd** (Inżynier) |
| :--- | :--- | :--- |
| **Rola** | Prowadzi sesję sokratejską: pyta i drąży. | Przepisuje notatki na gotowy dokument PRD. |
| **Zadanie** | Wymusza jasne opisanie wizji i łapie luki. | Zachowuje wierność notatkom, nie domyśla się niczego. |
| **Wynik** | Plik `shape-notes.md`. | Plik `prd.md` (kontrakt dla Agenta). |
| **Braki** | Identyfikuje je podczas rozmowy. | Wpisuje je w sekcję **## Open Questions**. |

---

### Kluczowe Analogie

*   **/10x-shape to jak rzeźbiarz**, który uderza dłutem w kamień, aż wyłoni się z niego konkretny kształt. Nie tworzy za Ciebie, ale pomaga Ci odrzucić zbędne fragmenty pomysłu.
*   **/10x-prd to jak tłumacz przysięgły**, który przekłada Twoje luźne zapiski na język zrozumiały dla systemu (Agenta), nie zmieniając przy tym sensu ani jednego słowa.

---

### Dwa tryby pracy

Proces dostosowuje się do tego, czy budujesz na "surowym korzeniu", czy na istniejącym systemie:

*   **Tryb Greenfield (Nowy projekt):** Budowa od zera. Narzędzie pyta: "Co chcesz zbudować?".
*   **Tryb Brownfield (Remont):** Wykrywany automatycznie po obecności plików takich jak `package.json` czy `Cargo.toml`.
    *   **Analogia:** To jak renowacja starej kamienicy zamiast stawiania nowego bloku.
    *   Zamiast o całość, system pyta: **"Co chciałbyś dodać lub poprawić w systemie?"**.
	
## Sesja /10x-shape w praktyce

Metodologia **/10x-shape** to proces, który zmienia mglisty pomysł w konkretny plan gotowy do wdrożenia przez AI. Zamiast pisać ogólne instrukcje, przechodzisz przez ustrukturyzowaną sesję prowadzoną przez Agenta.

### 1. Sześć Filarów Metodologii
Wyobraź sobie, że budujesz dom. Nie zaczynasz od malowania ścian, tylko od fundamentów i planu instalacji.

| Faza | Opis (Analogia) | Kluczowe pytanie |
| :--- | :--- | :--- |
| **Vision & problem** | **Fundament:** Zdefiniowanie konkretnego problemu konkretnej osoby. | Co dokładnie chcesz rozwiązać i dlaczego? |
| **Persona & access control** | **Klucze do drzwi:** Kto wchodzi do środka i co może robić. | Kim jest użytkownik i jakie ma uprawnienia? |
| **MVP discipline** | **Bagaż podręczny:** Zabierasz tylko to, co niezbędne na 3-tygodniową podróż. | Czy dasz radę zbudować to w 3 tygodnie po godzinach? |
| **FRs & User stories** | **Instrukcja obsługi:** Dokładny opis tego, co użytkownik klika i co widzi. | Jaką drogę przechodzi użytkownik? |
| **Business logic & data** | **Silnik pod maską:** Co dzieje się "w środku", żeby system nie był tylko pustą bazą danych. | Jaka jedna reguła zamienia dane w realną wartość? |
| **Closing soft-gate** | **Przegląd techniczny:** Ostatnie sprawdzenie, czy o niczym nie zapomniałeś. | Czy masz odpowiedzi na 6 pytań kontrolnych? |

### 2. Mechanizmy Kontrolne (Test Jakości)
Agent nie jest tylko "sekretarzem" – działa jak **surowy trener**, który wyłapuje błędy w Twoim myśleniu:

*   **Wyzwanie sokratejskie:** Przy każdym wymaganiu Agent pyta: *"Co musiałoby być prawdą, żeby ten pomysł był błędny?"*. To jak test zderzeniowy dla Twojej decyzji.
*   **Wykrywanie "pustego CRUD-a":** Jeśli Twoja aplikacja ma tylko dodawać i wyświetlać dane (jak notatnik), Agent zmusi Cię do dodania realnej logiki.
    *   *Analogia:* Pusty CRUD to restauracja, która ma stoliki, ale nie ma kucharza. Agent pilnuje, żebyś "zatrudnił kucharza" (np. algorytm powtórek lub AI generujące treści).

### 3. Finałowy Test (Closing Soft-Gate)
Na koniec sesji musisz przejść przez bramkę 6 pytań:
1.  **Dostęp:** Czy wiesz, kto ma do czego uprawnienia?
2.  **Dane:** Czy wiesz, jakie informacje musisz zbierać?
3.  **Logika:** Czy umiesz opisać wartość aplikacji jednym zdaniem?
4.  **Artefakty:** Czy masz zdefiniowane efekty pracy?
5.  **Czas:** Czy zmieścisz się w 3 tygodnie?
6.  **Non-goals:** Czy wiesz, czego **na pewno nie** budujesz?

### 4. Twoje Zadanie w Sesji
Twoja rola jest prosta: **odpowiadaj konkretnie**.
*   Jeśli czegoś nie wiesz, powiedz po prostu: **"nie wiem"**. AI pomoże Ci uzupełnić luki w odpowiednim momencie.
*   Unikaj ogólników. Zamiast "użytkownik", powiedz np. "uczeń, który chce zamienić tekst w fiszki, którym ufa".

Możesz zobaczyć, jak taka sesja wygląda w praktyce na tym nagraniu: 🎥 [Obejrzyj wideo](https://player.vimeo.com/video/1192850360?title=0&byline=0&portrait=0&badge=0&autopause=0&player_id=0&app_id=58479).

## Po sesji planistycznej

Oto krótkie i proste podsumowanie korzyści płynących z planowania strategicznego:

### Analogia: Budowa domu
Wyobraź sobie, że budujesz dom. Możesz zacząć murować ściany od pierwszej minuty (pisanie kodu), ale bez **projektu** (planowania) szybko okaże się, że zapomniałeś o drzwiach lub rurach. Sesja planistyczna to tworzenie tego projektu – chwilę trwa, ale ratuje całą budowę.

### Porównanie podejść

| Cecha | Skok prosto w kod | Sesja planistyczna |
| :--- | :--- | :--- |
| **Pierwsza godzina** | Szybki start | Nieco wolniejsze tempo |
| **Dalsza praca** | Chaos i poprawianie błędów | Precyzyjne i sprawne działanie |
| **Efekt końcowy** | Niespójny produkt | Solidny "kontrakt" decyzyjny |

### Dlaczego warto stworzyć shape-notes.md?
*   **Decyzje, nie rozmowy:** Dokument zawiera konkretne ustalenia, a nie zapis luźnej dyskusji.
*   **Fundament dla narzędzi:** Stanowi gotowy materiał, z którym może pracować `/10x-prd`.
*   **Oszczędność czasu:** Unikasz kodowania rzeczy, których nie potrafisz jeszcze konkretnie opisać.

**Zasada jest prosta:** Godzina rzetelnego planowania teraz to dziesiątki godzin zaoszczędzonych na poprawkach później.

## Generacja PRD: /10x-prd

Oto proste zestawienie fundamentów frameworka **10x-PRD**, który służy do przekuwania luźnych notatek w konkretną strategię produktu.

### Czym jest 10x-PRD?
To polecenie (`/10x-prd`), które działa jak **architekt**, zamieniający Twoje szkice (`shape-notes.md`) w profesjonalny **projekt budowlany** (`prd.md`). 

| Cecha | Opis |
| :--- | :--- |
| **Główny cel** | Zapisanie decyzji biznesowych w stałej strukturze dla AI. |
| **Wejście** | Plik `context/foundation/shape-notes.md`. |
| **Wyjście** | Plik `context/foundation/prd.md`. |
| **Na czym się skupia** | **Biznes i Produkt** (nie technologia!). |

---

### Co znajdziesz w środku (Struktura)?
PRD to Twoje "źródło prawdy". Zawiera kluczowe elementy niezbędne do zrozumienia projektu:

*   **Wizja i Persona:** Kto i dlaczego będzie z tego korzystał?
*   **Kryteria sukcesu:** Po czym poznamy, że wygraliśmy?
*   **User Stories & Wymagania:** Co konkretnie użytkownik może zrobić?
*   **Reguły biznesowe & Model danych:** Logika działania i struktura informacji.
*   **Kontrola dostępu:** Kto ma do czego uprawnienia.
*   **Non-goals:** Czego celowo **nie robimy** (jasne granice).
*   **Otwarte pytania:** Co jeszcze musimy ustalić?

---

### Prosta Analogia
Wyobraź sobie, że budujesz restaurację:

*   **PRD** to Twoje menu, wystrój i opis grupy docelowej (np. „rodziny z dziećmi”).
*   **To, czego NIE MA w PRD**, to instrukcja obsługi konkretnego modelu pieca czy plan dyżurów zmywaka – tym zajmą się inne etapy pracy (tzw. "dalsze skille").

---

### Zasada "Mniej znaczy lepiej"
PRD nie służy do opisywania technologii. Dlatego celowo **pomija się** w nim:
*   Tech stack (wybór technologii),
*   Plany testów,
*   Strategie deploymentu.

Dzięki temu dokument pozostaje czytelny, skupiony na wartości dla klienta i łatwy do przetworzenia przez kolejne narzędzia AI.

## Ostrzeżenie przed PRD widmo

Oto prosty przewodnik, jak uniknąć „PRD widmo” i zapewnić sukces Twojemu projektowi:

### Szybkie porównanie: Solidny Plan vs. Widmo

| Cecha | Solidny PRD (Sukces) | PRD Widmo (Błąd) |
| :--- | :--- | :--- |
| **Źródło** | Sumienna sesja `/10x-shape` | Zbyt mało konkretów w notatkach |
| **Efekt** | Gotowa dokumentacja | Ostrzeżenie i stop |
| **Działanie** | Możesz budować dalej | Sugestia powrotu do planowania |

### 4 Sygnały Jakości (Czego szuka system?)
Aby Twój dokument nie był „duchem”, musi zawierać te cztery elementy:
*   **Checkpoint** – punkt kontrolny projektu.
*   **Wymagania FR-NNN** – konkretne wymagania w ustandaryzowanym formacie.
*   **User Stories** – historie użytkownika zapisane jako: *Biorąc pod uwagę (Given) / Kiedy (When) / Wtedy (Then)*.
*   **Reguła biznesowa** – jasne zasady działania logiki projektu.

### Analogia: Budowa Domu
Tworzenie PRD bez konkretnych notatek jest jak **budowanie domu bez fundamentów**. Możesz próbować stawiać ściany, ale system (Twój inspektor budowlany) szybko zauważy braki i każe Ci wrócić do deski kreślarskiej (`/10x-shape`), zanim całość się zawali.

**Zasada „Mniej znaczy lepiej”:**
Zamiast pisać dużo, pisz konkretnie. Jeśli zabraknie powyższych sygnałów, system wskaże Ci dokładnie, czego brakuje, abyś mógł szybko wrócić na właściwe tory.

## Kontrola po wygenerowaniu PRD

Wyobraź sobie, że Twój dokument PRD to **fundament domu**. Jeśli będzie krzywy, cała budowla runie, bez względu na to, jak ładne wybierzesz kafelki. 

Zanim przejdziesz dalej, sprawdź plik **prd.md** za pomocą tej prostej tabeli:

| Element | Analogia | Pytanie kontrolne |
| :--- | :--- | :--- |
| **Użytkownik** | Konkretny gość na kolacji (np. wegetarianin), a nie „ktokolwiek głodny”. | Czy widzisz jedną, konkretną osobę, a nie „developera ogółem”? |
| **Czas realizacji** | Sprint, a nie maraton. | Czy główny przepływ da się zamknąć w 3 tygodniach pracy po godzinach? |
| **Logika** | Precyzyjny przepis (np. „dodaj 2 jaja”), a nie „zrób omlet”. | Czy opisujesz konkretne reguły zamiast ogólników typu „user dodaje rekordy”? |
| **Granice** | Tabliczka „Teren prywatny – nie wchodzić”. | Czy masz jasno określone „non-goals” (czego projekt NIE robi)? |

**Zasady „Mniej znaczy lepiej” dla Twojego fundamentu:**

*   **Otwarte pytania:** Sekcja `## Open Questions` nie może być zapełniona „na siłę”. Ma zawierać tylko realne niewiadome.
*   **Decyzyjność:** Jeśli jakikolwiek punkt budzi Twój niepokój, nie ignoruj go. Edytuj dokument lub wróć do etapu projektowania kształtu (shape). 
*   **Solidność:** Lepiej poświęcić czas na dopracowanie planu teraz, niż zmieniać fundamenty w trakcie budowy.

## Nie tylko na start projektu

Wyobraź sobie, że budujesz dom z inteligentnym robotem-budowniczym. Nie wystarczy pokazać mu planu fundamentów pierwszego dnia, a potem pozwolić mu zgadywać, gdzie postawić ściany i dach. Każdy nowy etap wymaga krótkiego spojrzenia w mapę, aby robot nie zboczył z kursu.

Ten proces to nie jednorazowy rytuał, ale stały nawyk, który chroni projekt przed chaosem.

### Kluczowe zasady współpracy z Agentem AI

| Zasada | Opis |
| :--- | :--- |
| **Problem przed Kodem** | Agent musi wiedzieć, jaki konkretnie problem rozwiązujemy, zanim dotknie plików. |
| **Kryteria Sukcesu** | Musisz określić, po czym poznacie, że praca jest skończona. |
| **Stały Kontrakt** | Każda większa zmiana lub nowy moduł wymaga odświeżenia ustaleń z Agentem. |

### Jak utrzymać kontekst w trakcie projektu?

*   **Unikaj trybu "tylko kod":** Nie wracaj do starego stylu pracy zaraz po starcie projektu; Agent potrzebuje jasnych wytycznych przy każdej nowej inicjatywie.
*   **Stosuj mini-sesje:** Gdy dodajesz nowy moduł po kilku tygodniach, zrób krótką sesję planowania ("mini-shape") zamiast tworzyć ogromną dokumentację.
*   **Definiuj "Koniec":** Zawsze ustalaj jasny punkt końcowy, aby Agent wiedział, kiedy jego praca została wykonana poprawnie.

**Pamiętaj:** Praca bez jasnego kontraktu z Agentem przy nowych funkcjach to jak jazda samochodem z wyłączonym GPS-em po pierwszym zakręcie – łatwo się zgubić.

## Brownfield: sesja na istniejącym projekcie

Praca w trybie **Brownfield** to jak **remont pokoju w zamieszkałym domu** – nie budujesz od zera na pustej działce (Greenfield), ale zmieniasz coś, co już stoi i musi nadal działać.

### Jak zacząć?
Gdy uruchamiasz narzędzie `/10x-shape` w folderze projektu, system sam rozpozna, że to „remont”, szukając specyficznych plików:
*   **Markery techniczne:** `package.json`, `tsconfig.json`, `Cargo.toml`, `go.mod` itp..
*   **Działanie:** Narzędzie proponuje tryb Brownfield automatycznie lub pozwala na ręczne przełączenie.

### Porównanie: Greenfield vs. Brownfield
W trybie Brownfield Twoje podejście do projektowania zmienia się z „co stworzyć” na „co poprawić”:

| Faza projektu | Greenfield (Pusta działka) | Brownfield (Remont) |
| :--- | :--- | :--- |
| **Wizja i problem** | Kto ma problem z niczego? | Co boli dzisiaj i dlaczego teraz? |
| **Dostęp (Auth)** | Projektowanie od zera. | Jak działa obecne logowanie i role? |
| **Dyscyplina MVP** | Cały system w 3 tygodnie. | Najmniejsza zmiana (delta) i jej wpływ na resztę. |
| **Wymagania (FRs)** | Wszystko jest nowe. | Podział: nowe, zmienione lub zachowane. |
| **Logika biznesowa** | Nowe reguły. | Czy zmieniamy istniejącą zasadę, czy dodajemy nową? |
| **Rama produktu** | Pełna klasyfikacja. | Szybkie decyzje (bramki tak/nie). |

### Wynik końcowy (Plik shape-notes.md)
Po zakończeniu sesji otrzymasz notatki, które zawierają dwie unikalne dla tego trybu sekcje:
*   **## Current System** – opisuje to, co już istnieje w kodzie.
*   **## Constraints & Preserved Behavior** – lista rzeczy, których **nie wolno popsuć** podczas wprowadzania zmian.

## Brownfield PRD

Oto proste zestawienie koncepcji **Brownfield PRD**, oparte na zasadzie "Mniej znaczy lepiej".

### Czym jest Brownfield PRD?
Wyobraź sobie, że **Greenfield** to budowa domu na pustym polu – masz całkowitą swobodę. **Brownfield** to **remont starej kamienicy**. Nie budujesz wszystkiego od nowa, ale musisz wiedzieć, które ściany są nośne, a które wymagają odświeżenia.

### Kluczowe różnice

| Cecha | Greenfield PRD | Brownfield PRD |
| :--- | :--- | :--- |
| **Punkt wyjścia** | Pusta karta (od zera) | **Delta** (różnica względem stanu obecnego) |
| **Technologia** | Wybór nowego stosu | **Ocena istniejącego stosu** |
| **Pierwszy krok** | Bootstrap (stawianie projektu) | **Health-check** (sprawdzenie zdrowia projektu) |

### Co zawiera Brownfield PRD?
Zamiast opisywać cały świat, skupiasz się na trzech konkretnych punktach:

*   **Stan obecny:** Co mamy dzisiaj w kodzie i produkcie?
*   **Zmiana:** Co konkretnie modyfikujemy lub dodajemy?
*   **Fundament:** Co musi pozostać nienaruszone, aby system działał?

**Pamiętaj:** Brownfield PRD to Twój **kontrakt wejściowy**. Zamiast wybierać nowe narzędzia, oceniasz te, które już masz pod ręką, by zdecydować, jak najlepiej je wykorzystać.

## Jak korzystać z 10x-cli?

Narzędzie **10x-cli** to Twój **cyfrowy plecak z narzędziami**, który dostarcza skille i materiały prosto do Twojego projektu.

### 🛠️ Szybki start
Zamiast instalować narzędzie na stałe, „pożyczasz” je zawsze w najnowszej wersji za pomocą jednej komendy:

| Krok | Akcja | Co się dzieje? |
| :--- | :--- | :--- |
| **1. Uruchomienie** | `npx @przeprogramowani/10x-cli@latest` | Odpalasz narzędzie bez instalacji globalnej. |
| **2. Logowanie** | Komenda `auth` | Podajesz e-mail i klikasz **Magic Link** (jak jednorazowy bilet wstępu). |
| **3. Pobieranie** | Komenda `get [lekcja]` | Pobierasz paczkę skilli (np. `m1l1` to Moduł 1, Lekcja 1). |

### 📂 Gdzie trafiają Twoje materiały?
CLI działa jak **inteligentny kurier** – rozpoznaje Twój edytor i zostawia paczkę w odpowiednim miejscu:

*   **Claude Code:** `.claude/skills/`
*   **Cursor:** `.cursor/skills/`
*   **Copilot:** `.github/skills/`

### 🎓 Pomocnicy (Helper Skills)
To Twoi **osobiści instruktorzy**, którzy uczą agenta AI, jak korzystać z narzędzi:

*   **10x-cli-setup:** Twój **mechanik** – pomaga w instalacji, autentykacji i diagnozuje błędy, jeśli coś nie działa.
*   **10x-cli-guide:** Twoja **instrukcja obsługi** – uczy agenta pobierania paczek i przełączania profili na co dzień.

**Warto wiedzieć:**
*   **Bezpieczeństwo:** Ponowne pobranie tej samej lekcji (`get`) jest bezpieczne – CLI aktualizuje tylko to, co się zmieniło.
*   **Wygoda:** Skill `10x-cli-setup` możesz zainstalować globalnie przez `npx skills -g`, aby był dostępny w każdym projekcie.

## Zadania praktyczne

Oto prosty przewodnik po procesie inicjacji projektu, przygotowany zgodnie z Twoimi wytycznymi.

### 1. Fundamenty Twojego Projektu
Zanim zaczniesz budować, musisz przygotować plac budowy. W Twoim projekcie służy do tego folder `/context`.

**Analogia:** Wyobraź sobie, że folder `/context` to **teczka architekta**, w której przechowujesz wszystkie plany i szkice przed wbiciem pierwszej łopaty.

| Krok | Skill (Komenda) | Cel | Wynik (Plik) |
| :--- | :--- | :--- | :--- |
| **Inicjalizacja** | `/10x-init` | Przygotowanie struktury projektu. | Folder `/context` |
| **Kształtowanie** | `/10x-shape` | Zamiana ogólnego pomysłu w konkret. | `shape-notes.md` |
| **Definicja (PRD)** | `/10x-prd` | Stworzenie szczegółowych wytycznych. | `prd.md` |

---

### 2. Wybierz swoją ścieżkę
W zależności od tego, czy tworzysz coś od zera, czy zmieniasz istniejące rozwiązanie, wybierasz jeden z dwóch trybów pracy:

*   **Greenfield (Nowy projekt)** 
    *   **Analogia:** Czysta kartka papieru. 
    *   Przekształcasz mętny pomysł w konkretny plan podczas sesji z agentem.
*   **Brownfield (Istniejący projekt)** 
    *   **Analogia:** Remont starego domu. 
    *   Skupiasz się na "bólu" obecnego systemu i szukasz najmniejszej, wartościowej zmiany.

---

### 3. Co zawiera Twój "Projektowy Plan" (PRD)?
Po wywołaniu komendy `/10x-prd`, otrzymasz dokument, który musi zawierać kluczowe elementy:

*   **Użytkownik i Problem:** Kto i z czym ma wyzwanie?
*   **Pierwszy przepływ:** Jak wygląda droga od startu do celu?
*   **Logika biznesowa:** Zasady działania aplikacji.
*   **Granice MVP:** Co robimy na samym początku?
*   **Non-goals:** Czego wyraźnie **nie** robimy (oszczędność czasu!).
*   **Kryteria sukcesu:** Po czym poznamy, że się udało?

**Pamiętaj:** Po zakończeniu procesu, Twoje najważniejsze plany znajdziesz w lokalizacji `context/foundation/`.

## Jakie modele i narzędzia wybrać

Wybór odpowiedniego modelu AI można porównać do **budowy domu**: potrzebujesz **architekta**, który stworzy plan, oraz **ekipy budowlanej**, która ten plan zrealizuje.

### 1. Dwie ścieżki dostępu
Wybór zależy od tego, czy wolisz stały abonament, czy płatność „za zużycie” (jak za prąd).

| Cecha | **Subskrypcja (Prostota)** | **OpenRouter + API (Kontrola)** |
| :--- | :--- | :--- |
| **Dla kogo?** | Początkujący i ceniący spokój. | Eksperymentatorzy i programiści. |
| **Koszt** | Stały: **$20** lub **$100**/miesiąc. | Zależy od liczby użytych tokenów. |
| **Zaleta** | Brak martwienia się o limity i rachunki. | Dostęp do ponad 100 modeli w jednym miejscu. |

---

### 2. Architekci vs. Implementatorzy
Nie każdy model nadaje się do wszystkiego. Stosujemy tutaj podział na **„mózgi”** i **„ręce”**.

*   **Architekci (Myśliciele):** Planują, analizują kod i tworzą dokumentację (PRD). Są jak doświadczeni inżynierowie – drożsi, ale niezbędni do myślenia.
*   **Implementatorzy (Wykonawcy):** Piszą konkretne funkcje i testy. Są jak szybcy budowlańcy – tani i niesamowicie efektywni w powtarzalnej pracy.

| Rola | Rekomendowane modele | Kiedy używać? |
| :--- | :--- | :--- |
| **Architekt** | Claude Opus 4.6, GPT-5.5, Gemini 3.1 Pro | Sesje planowania, analiza architektury, przegląd kodu. |
| **Implementator** | DeepSeek V4 Flash, Qwen3 Coder | Pisanie kodu, tworzenie testów, frontend. |

---

### 3. Konkretne rekomendacje
Stosując zasadę „mniej znaczy lepiej”, oto najkrótsza droga do celu:

*   **Złoty standard (All-in-one):** **Claude Max ($100/mies.)** z modelem **Opus 4.6**. To narzędzie „do wszystkiego” z ogromnym oknem kontekstowym.
*   **Najlepszy stosunek jakości do ceny:** **Claude Sonnet 4.6 ($20/mies.)**. Solidny wybór do codziennej pracy i zadań analitycznych.
*   **Szokująca oszczędność:** **DeepSeek V4 Flash**. W benchmarkach kodowania pokonał model Opus, będąc od niego **180 razy tańszym** ($0.02 vs $8.69 za zadanie).

**Wskazówka:** W Module 1 skup się na **Architektach**, bo tam najważniejsze jest rozumowanie i planowanie. Implementację (pracę z „rękami”) zostaw na później.