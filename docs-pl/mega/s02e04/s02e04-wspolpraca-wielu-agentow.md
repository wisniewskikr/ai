# S02E04 · Współpraca wielu agentów — streszczenie

## Spis treści

- [Czego się nauczysz](#czego-się-nauczysz)
- [1. Film](#1-film)
- [2. Architektury wielu agentów](#2-architektury-wielu-agentów)
- [3. Agent2Agent (A2A)](#3-agent2agent-a2a)
- [4. Współpraca w praktyce](#4-współpraca-w-praktyce)
- [5. Orkiestracja](#5-orkiestracja)
- [Najważniejsze wnioski](#najważniejsze-wnioski)

> 🧸 **W skrócie:** jeden agent to jeden pracownik. Wielu agentów to cała firma. Firma może zrobić więcej, ale trzeba nią dobrze zarządzać.

## Czego się nauczysz

| Temat | O co chodzi |
|---|---|
| **Multi-agent** | Kto za co odpowiada, jak unikać konfliktów, wspólne zasoby, wzorce architektury |
| **Agent2Agent (A2A)** | Jak niezależni agenci się znajdują i rozmawiają |
| **Delegowanie** | Przekazanie zadania: kontekst, kontrakt, raport, błędy |
| **Orkiestracja** | Zależności, praca równoległa, praca w tle, człowiek w pętli |

---

## 1. Film

| Temat | O co chodzi | 🧸 Analogia |
|---|---|---|
| **Podagenci** | Nasi albo zewnętrzni agenci wystawieni w internecie. Działają jak serwisy i robią **jedną konkretną rzecz** | Fachowcy: hydraulik, elektryk — każdy od swojego |
| **A2A (Agent z Agentem)** | Protokół komunikacji między agentami. Agent wystawia na zewnątrz **endpoint**, opisany w Karcie Agenta | Wspólny język i numer telefonu |
| **Odkrywanie Karty Agenta** | Karta opisuje, co agent umie. Zalecane miejsce: `/.well-known/agent-card.json`. Korzystają z niej inni agenci i programy. To jak API, tylko prowadzi **do agenta, nie do kodu** | Wizytówka w drzwiach: „Pizzeria — dowóz, pizza, sałatki" |
| **Delegowanie zadań** | Nasz system przekazuje zadanie podagentowi, który zajmuje się jednym, konkretnym zadaniem | Zlecasz pranie pralni |
| **Dyrygowanie zadaniami** | Główny agent rozdaje zadania podagentom, np. jeden sprawdza dostępność towarów, drugi — czy wyniki pasują do wymagań klienta. Często pracują **równocześnie**, a główny tylko łączy odpowiedzi | Szef kuchni: jeden kucharz robi zupę, drugi deser, szef składa obiad |
| **MCP vs A2A** | **MCP:** nasz agent sam pilnuje każdego kroku. **A2A:** nasz agent oddaje całe zadanie, np. „znajdź paczkę zgubioną w transporcie" | MCP = sam dzwonisz do każdego magazynu. A2A = zgłaszasz reklamację i kurier sam szuka |
| **Weryfikacja wyników** | Zwykle nic nie wiemy o podagencie, więc **sprawdzamy jego wynik w kodzie**: czy to jest to, czego chcieliśmy? Można użyć kolejnego podagenta jako sprawdzającego, zwłaszcza przy niejasnych życzeniach (np. „eleganckie buty") | Sprawdzasz resztę w sklepie, zanim odejdziesz od kasy |
| **Testowanie rozwiązań** | Architekturę z podagentami i bez nich trzeba **przetestować** i wybrać tę, która nam pasuje, np. dłuższe czekanie, ale trafniejsza odpowiedź | Próbujesz dwóch dróg do pracy: krótszej z korkami i dłuższej bez nich |

---

## 2. Architektury wielu agentów

Pomysł nie jest nowy (lata 70./80. — *rozproszona sztuczna inteligencja*). Nowe jest to, że od połowy 2026 modele świetnie się ze sobą dogadują i przekazują sobie pracę.

Każdy agent ma swój **kontekst**. My musimy dodatkowo zarządzać **kontekstem całego procesu** oraz dla każdego agenta ustalić:

- **zakres** — czym się zajmuje,
- **możliwości** — co umie,
- **uprawnienia** — do czego ma dostęp.

### Wzorce

| Wzorzec | Jak działa | 🧸 Analogia |
|---|---|---|
| **Pojedynczy agent** | Kilka instancji tego samego agenta na tych samych zasobach. Ryzyko: jedna czyta pliki, zanim druga je zaktualizuje | Dwie zmiany tego samego kucharza — druga zaczyna, zanim pierwsza skończyła zupę |
| **Subagent** | Krótkie zlecenie dla osobnego agenta (*handoff*). Może zapytać o brakujące info i wrócić do pracy | Wysyłasz kolegę do sklepu; dzwoni „jakie mleko?" i kupuje |
| **Worker** | Subagent żyjący dłużej, wysyła zdarzenia do rodzica | Pracownik zdalny, który co jakiś czas raportuje |
| **Hierarchia** | Lider → koordynatorzy → pracownicy, budowana dynamicznie | Dyrektor, kierownicy działów, zespoły |
| **Zespół** | Role + **wspólna przestrzeń robocza**, każdy gada z każdym | Grupa przy jednej tablicy |
| **Rój (swarm)** | Agenci sami decydują, kto robi zadanie. Brak lidera. Rzadkie w produkcji | Mrówki — nikt nie rządzi, a mrowisko rośnie |

### Po co to wszystko?

- Obejście limitów modeli (okno kontekstu, trzymanie się instrukcji).
- **Równoległość** → szybciej i więcej pomysłów naraz.
- Środowisko, które **weryfikuje wyniki** → agent poprawia błąd i próbuje ponownie.
- Współpraca z **cudzymi agentami** → udostępniamy część możliwości, resztę chronimy.

> ⚠️ **Błędy się rozlewają.** Pomyłka jednego agenta psuje pracę wszystkich, którzy korzystają z jego wyniku. Potrzebna obsługa błędów, raportowanie i ścieżki naprawy.
> 🧸 Jak głuchy telefon — jedno złe słowo na początku, bzdura na końcu.

---

## 3. Agent2Agent (A2A)

**Problem:** agenci muszą współpracować, ale nie powinni zdradzać swoich wnętrz — zwłaszcza gdy drugi agent **nie jest nasz**.

**Przykład złej konfiguracji:** umawiamy spotkanie. Mój agent zdradza: „dentysta o 9:00, rozmowa o pracę w Acme o 14:00". Co gorsza — mógłby też posłusznie usunąć wpisy z kalendarza na prośbę obcego agenta.

🧸 To jak sekretarka, która na pytanie „czy szef ma czas?" czyta cały jego kalendarz na głos.

### MCP vs A2A

| | MCP | A2A |
|---|---|---|
| Do czego | Rozszerza **jednego** agenta o narzędzia | **Łączy** agentów ze sobą |
| Analogia | Skrzynka z narzędziami | Telefon między firmami |

Nie konkurują — uzupełniają się. Jeden agent jest **klientem**, drugi **serwerem** (może działać w obie strony).

### Karta agenta (Agent Card)

Wizytówka pod adresem `/.well-known/agent-card.json` (RFC 8615):

- nazwa, opis, wersja,
- umiejętności (*skills*),
- dane do połączenia,
- metadane (dostawca, flagi możliwości).

❌ **Nie zawiera:** wewnętrznych narzędzi, pamięci, szczegółów implementacji. Kartę można ukryć tylko dla uprawnionych.

### Wiadomości

- Agenci **nie dzielą wątków** → każda wiadomość musi mieć **cały potrzebny kontekst**.
- Kontekst to nie tylko tekst: też dane strukturalne i referencje do plików.
- Format: HTTP(S) + **JSON-RPC** (`jsonrpc`, `id`, `method`, `params`).
- Odbiór wyników: **polling**, **SSE** (server-sent events) lub **push notifications**.

### Przykładowa rozmowa

| Krok | Co się dzieje |
|---|---|
| 1 | Agent A czyta kartę Agenta B |
| 2 | A wysyła pytanie: „Czy w sobotę pada we Wrocławiu?" |
| 3 | B potrzebuje szczegółu → stan `INPUT_REQUIRED`: „Które godziny?" |
| 4 | A odpowiada z **tym samym `taskId`**: „14:00–18:00" |
| 5 | B kończy (`COMPLETED`) i zwraca wynik: „20% szans, deszczu nie będzie" |

### Pomysły A2A warte skopiowania (nawet bez A2A)

| Pomysł | Znaczenie |
|---|---|
| **Wielozadaniowość** | Wiele zadań naraz, każde z własnym ID i stanem |
| **Wiele strumieni** | Kilku klientów śledzi to samo zadanie; zamknięcie jednego nie psuje innych |
| **ID od serwera** | To serwer nadaje ID zadań → brak kolizji |

---

## 4. Współpraca w praktyce

Agenci pracują tak szybko, że zadania łatwo się nakładają. Gubią się ludzie — i sami agenci też.

| Zasada | Co robić | 🧸 Analogia |
|---|---|---|
| **Struktura** | Prosto i *agentic-first*. Uprawnienia pilnuje **kod**, nie agent. Ludzie i tak czytają przez agentów | Szafa z opisanymi szufladami i zamkiem |
| **Kontrakty** | Jednolity format wiadomości, folderów, dokumentów, raportów → deterministyczne wyszukiwanie i walidatory. Czasem baza grafowa | Wszyscy wypełniają ten sam formularz |
| **Zarządzanie** | Agenci nie sięgają po zasoby sami — proszą **menedżera** zasobów/narzędzi. Menedżerowie rozwiązują konflikty | Bibliotekarz wydaje książki, nikt nie grzebie w magazynie |
| **Samonaprawa** | System obserwuje siebie, czyta logi, czasem zmienia własną logikę. To nawet **40–60%** całej pracy | Organizm, który sam leczy rany |
| **Śledzenie aktywności** | Logi **kontekstowe** (trace'y łączące agentów), nie luźne zdarzenia. Np. Axiom, PostHog | Paragon z całą historią zakupów zamiast luźnych karteczek |
| **Heartbeat** | Okresowe sprawdzanie: pracuje / czeka / utknął? Reagujemy na „utknął" | Pielęgniarka sprawdzająca puls co godzinę |

> 💡 **Kluczowe pytanie:** *co się stanie z moim systemem, gdy modele i harnessy będą lepsze?* Nie buduj rozwiązań problemów, które wkrótce znikną.

---

## 5. Orkiestracja

### Przykład: publikacja filmu na YouTube

Dużo kroków: montaż, audio, napisy, tytuł, miniatury, prawa autorskie, playlisty, Shorts, social media, harmonogram, analiza po premierze…

Szansa, że agent zrobi wszystko dobrze **za każdym razem** — niska. Bo większość zależy od **naszej strategii, preferencji i procedur**.

### Cel: prymitywy, nie jeden system

Nie budujemy „systemu do YouTube", tylko **klocki** (prymitywy), z których da się złożyć różne procesy: YouTube, podcast, artykuł, newsletter.

| Etap | Przykład |
|---|---|
| produce | montaż |
| package | tytuł, miniatury |
| verify | prawa autorskie |
| distribute | social media |
| release | publikacja |
| learn | statystyki → **aktualizacja playbooka** |

🧸 Jak LEGO — z tych samych klocków budujesz zamek albo statek.

### Elastyczność vs kontrola

Z AI zyskujemy **elastyczność**, tracimy **kontrolę**.

1. **Gdy potrzebujesz 100% pewności — nie polegaj na LLM.**
2. **Nie każdy krok wymaga pewności** — szukaj balansu między agentem a kodem.

| Krok | Kto/co |
|---|---|
| Montaż | Agent + DaVinci MCP |
| Miniatury | Replicate / własne narzędzie AI |
| Tytuł, opis | Agent proponuje, **człowiek akceptuje** |
| Statystyki | Autonomicznie w tle, człowiek tylko gdy trzeba |
| Komentarz publiczny | **Fizycznie zablokowany** w kodzie dla agenta |

---

## Najważniejsze wnioski

| Wniosek | W jednym zdaniu |
|---|---|
| **Agenci** | Podział pracy = kontrola nad kontekstem, możliwościami, uprawnieniami, konfliktami |
| **Prymitywy** | Ogólne klocki → łatwe rozszerzanie systemu małą ilością kodu |
| **Code Mode** | Powtarzalne czynności agent zamienia w kod |
| **Kontekst** | Nowy agent dostaje kontekst od rodzica + instrukcje zależne od roli **lub stanu systemu** |
| **Zależności** | Co równolegle, co po kolei, co zablokowane do akceptacji — np. przez **DAG** |
| **Trwałość** | Długie procesy w tle muszą przetrwać awarię (np. pi-durable) |

> 🧸 **Morał:** wielu agentów to jak orkiestra — każdy gra swoją partię, ale bez dyrygenta, nut i zasad wyjdzie hałas.
