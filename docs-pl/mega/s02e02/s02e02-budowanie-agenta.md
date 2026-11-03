# S02E02 · Budowanie agenta — streszczenie

## 🤔 Po co budować własnego agenta?

Claude, Devin czy Grok są świetne. Ale to **narzędzia klienta**, nie nasze.

> 🏪 **Analogia:** Klient przychodzi do sklepu z własnym koszykiem (Claude + MCP). Ale jeśli sklep chce mu doradzić na podstawie wiedzy o *wszystkich* klientach, potrzebuje **własnego sprzedawcy**.

**Przykład:** platforma e-commerce chce dawać sprzedawcom porady do kampanii na bazie danych z całej platformy → trzeba zbudować **własnego agenta**.

📺 Warto obejrzeć: Lee Robinson, Stanford CS146S — [How always-on agents work](https://x.com/leerob/status/2108650243365736855?s=20)

---

## 🏗️ Architektura

### Z czego budować?

| Sposób | Plus | Minus |
|---|---|---|
| Od zera | Pełna kontrola | Więcej pracy (ale z coding agentami — da się) |
| Framework ([Mastra](https://mastra.ai/), [Agents SDK](https://developers.cloudflare.com/ai-search/agent-sdks/agents-sdk/)) | Gotowa mechanika | Mniej „niskopoziomowej” swobody |
| Open-source harness (Pi, Goose) | Dobra baza do rozbudowy | Zależność od cudzego kodu |

### Pytania przed startem

| Obszar | Pytanie |
|---|---|
| Autonomia | Ile swobody? Jaka rola człowieka? |
| UI | Pełne UI, [MCP Apps](https://modelcontextprotocol.io/extensions/apps/overview) czy generative UI? |
| Profile | Osobne przestrzenie dla userów czy jedna wspólna? |
| Możliwości | Własny komputer, przeglądarka, pliki, sandbox? |
| Integracje / łączność | Jak łączy się z zewnętrznymi systemami? |
| Pamięć | Jak zapisuje i odnajduje wiedzę? |
| Samorozwój | Czy i jak bardzo sam się konfiguruje? |
| Kontekst / środowisko | Co musi wiedzieć o świecie wokół? |
| **Cache** | Jak osiągnąć **99% cache hit rate**? ⚠️ Krytyczne! |
| Komunikacja | Jak prosi o zgodę i raportuje? |
| Bezpieczeństwo | Jak chronić dane i wykrywać nadużycia? |

🎯 **Wybrana ścieżka:** agent **samorozwijający się, oparty na prymitywach, trwały (durable)**.

---

## 🧱 Kluczowa idea: kształtujemy środowisko, nie funkcje

Zamiast budować sztywne funkcje → dajemy agentowi **klocki** i zasady.

> 🧸 **Analogia:** Nie kupujemy dziecku gotowego zamku. Dajemy LEGO, instrukcję „nie rzucaj klockami” i niech buduje, co chce.

| Stary sposób | Nowy sposób |
|---|---|
| Aplikacja ma 10 gotowych filtrów do zdjęć | Agent tworzy filtry pod każdego usera |
| My projektujemy funkcje | My projektujemy **interfejs, zasady i limity** |

⚠️ Nowe problemy: co z projektami, które używały filtra, który agent potem zmienił?

### Przykład: agent w tle do nauki

- 🔇 **Brak własnego UI** — działa w bazie wiedzy
- 📬 Kontaktuje się przez znane kanały (notatka, wiadomość, tygodniowy digest)
- ✅ Korzysta **tylko z zaufanych źródeł**
- 🪞 **Proaktywny przez refleksję**, nie sztywny harmonogram — w zajęte tygodnie cichnie, w luźne kopie głębiej
- ↩️ Każda zmiana **zapisana i odwracalna**

### Prymitywy (klocki)

| Prymityw | Co to? | Analogia |
|---|---|---|
| **Event** | Sygnał o aktywności | 🔔 Dzwonek do drzwi |
| **Schedule** | Pobudki ustawiane przez agenta | ⏰ Budzik |
| **Document** | Wszystko, co agent napisał | 📓 Zeszyt |
| **Skill** | Powtarzalna praca do ponownego użycia | 📖 Przepis kulinarny |
| **Journal** | Log działań — tylko dopisywanie | 🧾 Paragon — nie da się zmienić |
| **Channel** | Jedyna droga do usera | 📮 Skrzynka pocztowa |

**Jak się łączą:**
- Event → odpala Skill
- Schedule → powiązany z Dokumentami
- Każda akcja → wpis w Journal
- Refleksja: agent czyta Journal → decyduje o pobudce, nowym Skillu, wiadomości

💡 Kilka prostych klocków = zachowania, których nie musieliśmy projektować. A gdy coś się zepsuje — Journal mówi, co i dlaczego.

📁 Część prymitywów to **pliki** (agent potrzebuje sandboxa, żeby pisać kod). Część może żyć w **bazie danych**.

---

## 🔌 Dostawcy i konfiguracja

**Nie przywiązuj się do jednego dostawcy.**

> 🔌 **Analogia:** Gateway to przejściówka do gniazdek — dowolna wtyczka (model) pasuje do naszej aplikacji.

| Rozwiązanie | Kiedy |
|---|---|
| [OpenRouter](https://openrouter.com/) | Najprościej, wiele modeli (ale nie wszystkie natywne funkcje) |
| [Amazon Bedrock](https://aws.amazon.com/bedrock/model-choice/) / [Azure](https://azure.microsoft.com/en-us/products/ai-foundry/models) | Produkty B2B |

**Architektura:** gateway + adaptery → wszyscy dostawcy „mówią tym samym językiem”.

### Routing modeli

| Zadanie | Model |
|---|---|
| Łatwe (wyszukiwanie, sortowanie) | Secondary — mały, szybki, tani |
| Trudne (planowanie, pisanie) | Primary — mocny |
| Obrazy | Model graficzny (np. Gemini) |

- Start: prosty podział **primary / secondary**
- Zaawansowane: routery typu [Max od Arena AI](https://arena.ai/blog/introducing-max) (często przesada)
- ⚠️ Unikaj warstw utrudniających migrację (np. Chat Completions → [Responses API](https://developers.openai.com/api/docs/guides/migrate-to-responses))

---

## 🛠️ Projektowanie narzędzi

Narzędzie = **schema + callback**. Ale ważniejsze pytania:
1. Czy narzędzie jest **naprawdę potrzebne**?
2. Czy agent **będzie umiał go użyć**?

### Dlaczego nie samo API?

| Problem | Przykład |
|---|---|
| **Fałszywy sukces** | Serwis muzyczny zwraca **200**, choć odtwarzacz padł ([przykład](https://github.com/MEGA-DOT-DEV/examples/tree/main/examples/false-success-tool)) |
| **Wymagana sekwencja** | Stripe: nie zmienisz ceny — trzeba stworzyć nową i wyłączyć starą. Stripe agent zna, **wewnętrznego API — nie** |

> 🚦 **Analogia:** API mówiące „OK” mimo błędu to jak sygnalizacja, która zawsze świeci na zielono.

### Natywne narzędzia agenta

| Narzędzie | Do czego |
|---|---|
| `core.exec` | Kod w sandboxie |
| `web.search` | Szukanie — tylko zaufane źródła |
| `web.fetch` | Pobranie treści URL |
| `channel.send` | Wiadomość do usera |

Harness dodatkowo używa `journal.append` i `events.add` — agent je **widzi, ale nie może zmienić**.

### Workspace

| Odczyt i zapis ✏️ | Tylko odczyt 🔒 |
|---|---|
| `documents/` | `events/` (pisze harness) |
| `skills/` | `journal.jsonl` (harness + `journal.append`) |
| `schedule.yaml` | `config.yaml` (tylko user) |

📘 **Przewodnik startowy** = Documents + Skills → „wzmocnione narzędzia”, które agent może sam ulepszać.

🌙 Harmonogram **„śnienia”** — agent porządkuje swoje dokumenty i harmonogramy → **uczy się i rozwija**.

⚖️ Sztuka polega na **balansie logiki deterministycznej i niedeterministycznej**.

---

## 🧠 Zarządzanie kontekstem

Tu własny harness wygrywa: nie uczymy modelu, co robić — pokazujemy mu **co jest dostępne, dynamicznie**.

⚠️ **Cache hit rate** to kluczowa metryka. Zwykły `AGENTS.md` nie wystarczy — trzeba wstrzykiwać kontekst **w trakcie tury**.

> 📰 **Analogia:** Nie drukujemy gazety od nowa co minutę. Dajemy jedno wydanie (cache) + krótkie „breaking news” o tym, co się zmieniło.

| Element | Co zawiera | Cache? |
|---|---|---|
| **System Prompt** | Rola, możliwości, notatki (agent może je zmieniać) | ✅ |
| **Tools** | Tylko `exec`, `search`, `fetch` (code mode) | ✅ |
| **Initial Developer Message** | Aktualny stan systemu | ✅ |
| **User Message** | Często wiadomość z harmonogramu — agent **nie może pytać**, tylko `channel.send` | ✅ |
| **Mid-turn Developer Message** | Tylko **co się zmieniło** (Events, Schedules, działające instancje) | 🆕 |
| **Tool Hooks** | Ogólne, samosterujące podpowiedzi przed/po narzędziu | — |

💡 Zacznij prosto. Modele lubią komplikować — my szukamy **najprostszego rozwiązania**. (Evale — w kolejnych lekcjach.)

---

## 🔄 Workflowy i długie zadania

### Events jako sygnały

| Event | Reakcja agenta |
|---|---|
| `activity: busy` | Cichnie |
| `email: opened` | Wie, że digest działa |
| `message: read` | Dopasowuje częstotliwość |

### Pamięć między uruchomieniami

Schedule budzi agenta → skanuje aktywność (X, Raindrop) → zapisuje w **Journal** i **Documents** → podczas refleksji czyta je → ustawia kolejną pobudkę.

> 📔 **Analogia:** Jak pamiętnik — rano czytasz, co było wczoraj, i planujesz dzień.

### Typowe problemy i rozwiązania

| Problem | Rozwiązanie |
|---|---|
| Równoległe zapisy → utrata danych | Kolejki lub wersjonowanie |
| Awaria / długa pauza | Logika z [pi-durable](https://github.com/earendil-works/pi/tree/main/packages/durable) |
| Obserwatory i powtarzane pobudki | Koncepcje z [pi-until](https://github.com/joelhooks/pi-until) |

---

## 🎯 Wnioski

- Własny harness (lub rozszerzenia istniejących) = agent **wyspecjalizowany** i lepszy od ogólnych
- Nawet jeśli projekt umrze lub zastąpią go nowe modele — **doświadczenie zostaje** i przyda się przy kolejnych systemach
