# S02E03 · Zdolności agentowe

> 🧭 **W skrócie:** nie mów agentowi *jak* ma coś zrobić. Daj mu dobre narzędzia, jasne zasady i miejsce na własny pomysł.

**Analogia:** agent to zdolny kucharz. Zamiast dyktować mu przepis krok po kroku, dajesz mu dobrą kuchnię (narzędzia), mówisz, co lubisz (preferencje) i ufasz, że sam wymyśli najlepsze danie.

---

## 📋 O czym jest lekcja

| Temat | Co w nim jest |
|---|---|
| **Personalizacja** | instrukcje globalne, zakres, konwencje |
| **Model Context Protocol (MCP)** | serwer, klient, narzędzia, zasoby, bezpieczeństwo |
| **Własny MCP** | planowanie, kształt narzędzi, wdrożenie |
| **Skille i narzędzia** | procedury, ładowanie na żądanie, łączenie skilli z narzędziami |

---

## 1. Personalizacja

Personalizacja = **zwiększanie szansy**, że agent zrobi to, czego chcemy. Ale bez zamykania go w klatce.

Robimy ją przez:
- instrukcje (np. `AGENTS.md`),
- skille,
- narzędzia,
- hooki, rozszerzenia, sandboxy.

### ❌ Sztywna reguła vs ✅ ogólna zasada

| ❌ Źle | ✅ Dobrze |
|---|---|
| „Zawsze uruchom `pnpm lint` i `pnpm test` przed commitem.” | „Weryfikuj zmiany proporcjonalnie do ich wpływu. Napisz, co uruchomiłeś.” |
| Agent może o tym zapomnieć | Agent sam dobiera testy do zmiany |
| Pełne testy trwają długo | Szybko i z głową |
| Hook (np. Husky) można wyłączyć | Hooki **wspierają**, a nie blokują |

**Analogia:** zamiast „myj ręce 3 razy po 30 sekund” mówisz „dbaj o czyste ręce, bo nie chcemy chorować”. Dziecko samo wie, kiedy to ważne.

### 🔁 To proces, nie jednorazowa akcja

Modele szybko się poprawiają, więc regularnie przeglądamy konfigurację:
- **ulepsz** → użyj nowych możliwości,
- **usuń** → wyrzuć ustawienia, których agent już nie potrzebuje.

### 🧱 Rdzeń vs profil użytkownika

| Rdzeń agenta | Profil użytkownika |
|---|---|
| Bardzo ogólny | Konkretne preferencje |
| Jest **rozszerzany** | Rozszerza rdzeń |
| Nie powinien być nadpisywany | Dodaje kontekst |

> ⚠️ Technicznie nie da się „nadpisać” instrukcji. System prompt teoretycznie jest ważniejszy, ale model nie zawsze tego pilnuje.

### ✍️ Jak pisać dobre instrukcje

| Zasada | Co to znaczy |
|---|---|
| **Zasady zamiast procedur** | Daj reguły, zaufaj inteligencji modelu |
| **Powód zasady** | Gdy agent zna „dlaczego”, lepiej się dopasuje — albo świadomie ją pominie |
| **Dynamiczne granice** | Inaczej przez aplikację mobilną, inaczej z harmonogramu (agent ambientowy) |
| **Domyślne zachowanie** | Zmiana nawyku modelu wymaga powtarzania instrukcji (np. hookami) |
| **Preferencje** | Model nie zna Twoich upodobań — powiedz mu, ale zostaw luz |
| **Rozszerzalność** | „Co się stanie, gdy skill doda nowe zachowanie?” |

---

## 2. Model Context Protocol (MCP)

MCP to **standard** łączenia agenta ze światem: aplikacjami, usługami, urządzeniami.

**Analogia:** MCP to jak gniazdko USB. Każde urządzenie z wtyczką USB zadziała z każdym komputerem.

### 🧩 Trzy elementy

| Element | Co to | Analogia |
|---|---|---|
| **Host** | Harness (Claude, Codex, własna aplikacja) | Komputer |
| **Klient** | Żyje w hoście, łączy się z **jednym** serwerem | Port USB |
| **Serwer** | Proces lokalny/zdalny z narzędziami i zasobami | Pendrive / drukarka |

### ⚙️ Jak to działa

1. Użytkownik pyta: „Ile to 2 + 3?”
2. Model widzi narzędzie `add` (schemat przyszedł z serwera MCP).
3. Model wybiera `add` i tworzy dane wejściowe.
4. Harness prosi serwer MCP o wykonanie.
5. Serwer zwraca wynik → harness wkłada go do kontekstu.

👉 Mechanika jak przy natywnych narzędziach. Różnica: **schemat i wykonanie są po stronie serwera**.

### 🚚 Typy połączeń

| Transport | Do czego |
|---|---|
| **Streamable HTTP** | Serwery zdalne |
| **STDIO** | Procesy lokalne na tym samym komputerze |

### 📈 Historia i dziś

- Kiedyś: hype → potem „gorsze od CLI”, bo wszystkie narzędzia ładowały się do kontekstu **od razu** (50–90 narzędzi = zapchany kontekst).
- Dziś: **code mode** pozwala obsłużyć nawet ~2500 narzędzi.
- MCP to nie tylko narzędzia: także **autoryzacja, zasoby (pliki), prompty, sampling** (serwer prosi hosta o wywołanie LLM). Wsparcie różni się między klientami.
- Kierunki rozwoju: **bezstanowe serwery**, **skille przez MCP**, **Events (szkic)**.

### 💡 Wskazówki przy budowie serwera

| Wskazówka | Dlaczego |
|---|---|
| **Unikalna nazwa serwera** | Narzędzia widać jako `spotify__play` |
| **Instrukcje serwera** | Często ignorowane/przycinane, ale warto je mieć |
| **Użycie wewnętrzne** | Łatwe dzielenie się integracjami między agentami |
| **Ewaluacje** | Testuj w popularnych harnessach, automatyzuj |
| **Warstwa zdolności** | MCP może „podróżować” z użytkownikiem: pamięć, integracje, logika |

Start: wybierz [SDK](https://modelcontextprotocol.io/docs/2026-07-28/sdk), poproś AI o wygenerowanie serwera, użyj [szablonu TypeScript](https://github.com/iceener/streamable-mcp-server-template). Hosting: VPS lub Cloudflare.

---

## 3. Projektowanie własnego MCP

Agent zbuduje cały serwer sam. Naszym zadaniem jest: ułatwić mu to, zwiększyć niezawodność i **dopasować do naszych potrzeb**.

### 🎵 Zacznij dla zabawy — np. Spotify

| Przypadek | Co daje |
|---|---|
| **Personalizacja** | Pamięć łączy muzykę z czasem, miejscem, ludźmi |
| **Zaawansowane wyszukiwanie** | „Ta muzyka z filmu o kosmosie…” — agent znajdzie |
| **Automatyzacja** | Muzyka dopasowana do kalendarza, lokalizacji, urządzeń |

### 🎓 Czego uczy taki projekt

| Problem | Przykład | Lekcja |
|---|---|---|
| **Połączenie** | Awarie | Informuj agenta o błędach |
| **API** | Losowe wyniki wyszukiwania bez błędu | Spodziewaj się cichych awarii |
| **Transkrypcja** | Sterowanie głosem w hałasie | Poznaj realne warunki użytkownika |
| **Nieoczywiste użycia** | Muzyka po włączeniu „nie przeszkadzać” | Myśl szerzej niż proste komendy |
| **Niespodzianki** | Zaskakujące playlisty | Kształtuj środowisko agenta |

### ✂️ Nie kopiuj całego API

**Analogia:** zamiast dawać dziecku 3 piloty, dajesz jeden z dużym przyciskiem „graj”.

| API Spotify (3 wywołania) | Jedno narzędzie MCP |
|---|---|
| `GET /v1/search` | `search({ query, limit })` |
| `GET /v1/me/tracks/contains` | zwraca od razu: utwory + flaga „zapisane” |
| `GET /v1/me/player/devices` | + aktywne urządzenie + kursor + **podpowiedzi** co dalej |

Najtrudniejsze: **filtrowanie, paginacja, wzbogacanie wyników**. Cel: **łatwiej dla agenta**.

### 🛠️ Proces krok po kroku

| # | Krok | Co zrobić |
|---|---|---|
| 1 | **Typ** | Proces lokalny? Wybierz CLI zamiast MCP |
| 2 | **Zakres** | Nie 100% API; AI wygeneruje przypadki użycia (HTML/MDX) |
| 3 | **Wersja startowa** | Jak najchudsza, szybkie iteracje; resztę AI dopisze wg wzorca |
| 4 | **Harness** | Rozważ przeniesienie agentów do chmury |
| 5 | **Iteracje** | Przy wielu serwerach: **globalna mapa/kontekst** |
| 6 | **Wdrożenie** | Cloudflare Workers lub VPS; agent musi znać dostęp, logi, monitoring |

---

## 4. Skille i narzędzia

- Skille **nie powinny** dyktować dokładnych kroków.
- **Wyjątek: procedury** — kroki specyficzne dla Twojego przypadku, których model sam nie zgadnie.

### 🔗 Łączenie skilli z narzędziami

Najlepiej przez [rozszerzenie skills dla MCP](https://modelcontextprotocol.io/seps/2640-skills-extension): serwer wystawia narzędzia **i** skille, a agent ładuje je **gdy potrzebuje**.

**Przykład: generowanie obrazów (Replicate)**

| Element | Co mówi |
|---|---|
| Narzędzie | „Możesz użyć mnie ze skillem stylu” |
| Skille stylu | concept art, pixel art, realistyczne zdjęcia, kreskówki — „działam z narzędziem do obrazów” |

👉 Odwołania w obie strony, ale **każde może działać samo**.

**Analogia:** narzędzie to pędzel, skill to instrukcja „jak malować w stylu Van Gogha”. Pędzel działa bez instrukcji, ale razem dają więcej.

### 🧭 Skille-routery

Prośba: *„Zrób trailer w pixel arcie z retro muzyką”*

```
Agent → Router skill → Pixel art (obraz) → Animacja (wideo) → Retro (audio)
```

- Skille mogą linkować do siebie → powstają **workflowy**.
- Agent może też **pominąć router** i iść prosto do narzędzia.

### ✅ Wniosek

Trzymaj **rdzeń agenta czysty i elastyczny**, specjalizuj go przez **narzędzia MCP i skille**. Dajesz zdolności, nie instrukcję obsługi.

---

## 🎯 Najważniejsze wnioski

| # | Wniosek |
|---|---|
| 1 | **Generalizacja** to kluczowa umiejętność — w promptach, narzędziach, skillach, MCP i CLI |
| 2 | Zostaw agentowi **miejsce na adaptację** |
| 3 | Dobry agent najczęściej żyje w **sandboxie**: system plików + wykonywanie kodu = lepsze zarządzanie kontekstem |
| 4 | Czasem wystarczy dostęp **tylko do odczytu** i ograniczone środowisko — Ty decydujesz |
| 5 | **Zbuduj własny serwer MCP**, choćby dla zabawy — poczujesz jego mocne i słabe strony |
