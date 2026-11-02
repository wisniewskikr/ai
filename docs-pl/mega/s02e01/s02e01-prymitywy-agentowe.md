# S02E01 · Prymitywy agentowe — streszczenie

## 📑 Spis treści

1. [Film](#1-film)
2. [O co chodzi?](#2-o-co-chodzi)
3. [Pętla agenta](#3-pętla-agenta)
4. [Agent to nie tylko pętla — obowiązki harnessu](#4-agent-to-nie-tylko-pętla--obowiązki-harnessu)
5. [Co z tego wynika dla zwykłego użytkownika?](#5-co-z-tego-wynika-dla-zwykłego-użytkownika)
6. [Osobowość i świadomość otoczenia](#6-osobowość-i-świadomość-otoczenia)
7. [Kontekst i pamięć](#7-kontekst-i-pamięć)
8. [Narzędzia](#8-narzędzia)
9. [Wnioski](#9-wnioski)

---

> 🎯 **Cel lekcji:** zrozumieć, jak agent działa **od środka**, żeby umieć zbudować harness od zera albo dopasować istniejący na dowolnym poziomie.
>
> 🚗 **Analogia:** pętla agenta to **silnik**. Ale samochód to też hamulce, kierownica, bak i lusterka. Harness to **cały samochód**.

---

## 1. Film

| Temat | Po ludzku |
|---|---|
| **Mastra Studio** | narzędzie do **podglądania**, co agent robi krok po kroku |
| **Wybór modelu** | pierwsze pytanie developera: który model pasuje do zadania? Jaki jest **najtańszy**, który da radę? |
| **Pętla agenta** | agent woła narzędzia, a one mogą prowadzić do kolejnych narzędzi itd. Można ustawić **maksymalną liczbę obrotów pętli** — to nie to samo co liczba narzędzi, bo w jednym obrocie może wywołać **kilka naraz**. |
| **Okno kontekstu** | jest **ograniczone**. Mieści: informacje systemowe, historię rozmowy, narzędzia i ich odpowiedzi itd. |
| **Przepełnienie kontekstu** | rozwiązanie: **kompresja** starszych informacji — zajmują mniej miejsca, ale dalej są użyteczne |
| **Evals** | **testy dla agentów AI** — sprawdzają, czy wynik jest taki, jakiego oczekiwaliśmy |

🎒 **Analogia:** okno kontekstu to **plecak**. Gdy robi się ciasno, nie wyrzucasz starych notatek — tylko je **streszczasz** na jednej kartce.

📝 **Analogia:** evals to **sprawdzian w szkole** — zanim pochwalisz agenta, sprawdzasz, czy odpowiedzi są poprawne.

---

## 2. O co chodzi?

To jedna z najważniejszych lekcji MEGA — wszystko, co zbudujemy dalej, stoi na tej wiedzy.

| Temat | Co omawiamy |
|---|---|
| **Pętla agenta** | wywołania modelu, narzędzia, wyniki, stan, warunki stopu |
| **Instrukcje** | cel, odpowiedzialności, profile, granice |
| **Kontekst i pamięć** | wiadomości, metadane, załączniki, trwałość, wyszukiwanie, cache promptu |
| **Narzędzia** | function calling, Bash, przeglądarka, wykonywanie kodu, pliki, uprawnienia, sandbox |

Do czego przyda się ta wiedza:

| Harnessy | Narzędzia agentowe |
|---|---|
| zbudować od zera | dla siebie |
| dostosować na każdym poziomie | jako funkcje produktu |

💡 Nie trzeba budować wszystkich wzorców. Trzeba **wiedzieć, jakie są** i kiedy po nie sięgnąć. A potem — czasem łamać zasady.

📚 Gotowe pętle open source: [Pi](https://github.com/earendil-works/pi/blob/main/packages/agent/src/agent-loop.ts), [Goose](https://github.com/aaif-goose/goose).

---

## 3. Pętla agenta

Agent = **pętla**, która kręci się, dopóki model nie odpowie samym tekstem (bez narzędzi).

🔁 **Analogia:** dziecko pyta „a dlaczego?”, dostaje odpowiedź, znowu pyta… aż w końcu mówi „aha, rozumiem!” i kończy.

| Element | Co robi |
|---|---|
| **Stan** | trzyma wątek, kontekst, konfigurację i zmienne pętli |
| **Model** | rozmawia z API dostawcy (np. OpenAI) |
| **Narzędzia** | schematy dla modelu + funkcje uruchamiane, gdy model je wybierze |
| **Hooki** | funkcje między krokami: obserwacja, kompakcja, przetwarzanie plików |

Przebieg:

1. Stan → kontekst → **model**
2. Model zwraca **wywołania narzędzi** albo **końcowy tekst** (= stop)
3. Narzędzia zwracają wyniki → hooki aktualizują stan → kolejna runda

⚠️ Naiwna pętla jest krucha. Jeden błąd API i zadanie staje w połowie. Pułapki:

- pamięć
- długi kontekst
- akcje wymagające zgody
- błędy, timeouty

Claude Code czy Codex umieją się z wielu takich błędów [podnieść same](https://github.com/MEGA-DOT-DEV/examples/tree/main/examples/loop-error-recovery).

---

## 4. Agent to nie tylko pętla — obowiązki harnessu

| Obowiązek | Po ludzku | Analogia |
|---|---|---|
| **Połączenie** | adaptery do wielu dostawców LLM. Lepiej **oficjalne SDK** niż dodatkowe abstrakcje (np. [AI SDK](https://vercel.com/ai-sdk)). | 🔌 przejściówka do gniazdek w różnych krajach |
| **Wątki i sesje** | historia rozmów, często w plikach tekstowych. Może obejmować wiele sesji i **subagentów**. Nie każdy harness to wspiera. | 📓 zeszyt, do którego wracasz następnego dnia |
| **Trwałość** | załączniki, artefakty, skrypty, skille, uprawnienia, integracje… Agent musi umieć tym **zarządzać** (np. znaleźć wcześniej wygenerowany obrazek). | 🗄️ szafka z podpisanymi szufladami |
| **Konfiguracja** | agent sam zmienia ustawienia, a nawet **UI** w trakcie działania ([OpenCode](https://anoma.ly/notes/opencode-reloaded/), [DeepSeek Harness](https://arxiv.org/pdf/2608.25512)). | 🪑 krzesło, które samo dopasowuje wysokość |
| **Kontekst** | opis środowiska, **cache prefiksu**, ładowanie rzeczy na żądanie, **kompresja** historii. | 🎒 plecak — nie zabierasz wszystkiego naraz |
| **Narzędzia** | function calling albo **Code Mode** (kod łączy narzędzia w łańcuch). | 🧑‍🍳 przepis zamiast pytania kucharza o każdy krok |
| **Zgody** | przed nieodwracalną akcją pyta użytkownika. Czekanie może trwać **dni** — trzeba to [dobrze obsłużyć](https://github.com/MEGA-DOT-DEV/examples/tree/main/examples/resumable-run). | ✋ „Mamo, mogę?” |

### Dostęp poza jednym użytkownikiem

Na własnym komputerze agent hula po plikach. W zespole lub produkcji potrzebne są **sandboxy** i **uprawnienia**.

| Poziom | Co tu jest |
|---|---|
| Agent **czyta** | wątki, załączniki |
| Agent **tworzy i edytuje** | artefakty, skrypty, skille, własne narzędzia |
| Agent **prosi, user zatwierdza** | uprawnienia, połączenia, integracje |

### Cache promptu

- [Cache działa na prefiksie](https://developers.openai.com/api/docs/guides/prompt-caching) — tańszy i szybszy, ale **tylko gdy początek się nie zmienia** ([przykład](https://github.com/MEGA-DOT-DEV/examples/tree/main/examples/prompt-cache-prefix)).
- Stały prefiks: system prompt, AGENTS.md, profil, główne narzędzia.
- Niżej rośnie wątek → potem **kompakcja**: stare wiadomości = streszczenie, nowe zostają.

🧱 **Analogia:** fundament domu zostaje, przebudowujesz tylko górne piętra.

### Function Calling vs Code Mode

| | Function Calling | Code Mode |
|---|---|---|
| Jak | każde wywołanie osobno | jeden skrypt łączy wiele narzędzi |
| Wyniki | każdy trafia do wątku | trzymane w zmiennych, do wątku tylko wynik końcowy |
| Dobre do | prostych akcji | złożonych przepływów |

📄 Duży wynik (np. raport)? Zapisz do **pliku**, a modelowi daj tylko **ścieżkę**. Agent przeczyta fragment, pokaże userowi albo przekaże dalej.

---

## 5. Co z tego wynika dla zwykłego użytkownika?

Nawet jeśli nie budujesz agenta:

- ✂️ **AGENTS.md krótki** — długi model zignoruje, a koszt i opóźnienie rosną.
- 🔁 **Skille krótkie** — po kompakcji czasem trzeba je **aktywować ponownie**.
- 📏 **Wątek jak najkrótszy** albo agent **wyspecjalizowany**.
- 🧭 Ułatwiaj agentowi znalezienie informacji — może ją zgubić przez kompresję albo zignorować.

W praktyce dochodzą jeszcze: **rutyny, harmonogramy, zdarzenia, webhooki**.

---

## 6. Osobowość i świadomość otoczenia

Modele są coraz mądrzejsze. Claude Code [wyciął 80% system promptu](https://claude.dev/blog/the-new-rules-of-context-engineering-for-claude-5-generation-models/) dla najnowszych modeli. Czy instrukcje są więc zbędne?

| Sytuacja | Instrukcje |
|---|---|
| **Pracujesz z agentem na żywo** | wystarczą krótkie wiadomości — Ty go prowadzisz |
| **Agent pracuje bez Ciebie** (automatyzacje, tło, aplikacje) | **muszą** mówić, co jest dostępne, żeby sam znalazł drogę |

👶 **Analogia:** gdy jesteś obok dziecka, wystarczy „nie, tamto”. Gdy zostaje z opiekunką — zostawiasz kartkę: gdzie jedzenie, telefon, czego nie wolno.

### 5 bloków dobrego system promptu

| Blok | Co mówi agentowi |
|---|---|
| **Osobowość** | kim jest i z kim rozmawia |
| **Środowisko** | po co jest i gdzie działa (np. „nie ma człowieka pod ręką”) |
| **Kontekst** | mapa zasobów — inaczej powie „nie umiem”, choć umie |
| **Odkrywanie** | jak poznawać możliwości harnessu |
| **Granice** | czego nie wolno. To tylko **rekomendacja** — model może zignorować |

### Jak pisać prompt

1. **Zacznij prosto** — model sam przygotuje pierwszą wersję.
2. **Sprawdź** wyniki lub oceń je **evalami**.
3. **Popraw** z pomocą modelu i powtórz.

Cel: nie „działa”, tylko **dobrze** — czysto, ogólnie, bez zbędnych rzeczy ([przykład](https://github.com/MEGA-DOT-DEV/examples/tree/main/examples/prompt-eval-loop)).

🧠 **Najlepsza rada** ([Latent Space Activation](https://github.com/daveshap/latent_space_activation)): prompt ma sprawić, by model **przypomniał sobie** potrzebną wiedzę i metody **zanim** odpowie.

📚 Do podejrzenia: [system prompty harnessów](https://github.com/elder-plinius/CL4R1T4S/tree/main), [Prompting Opus 5.5](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5-5), [Rethinking skills and prompts for GPT-6](https://developers.openai.com/blog/rethinking-skills-and-prompts-for-gpt-6-astra), [system prompt Haiku 5.5](https://platform.claude.com/docs/en/release-notes/system-prompts/claude-haiku-5-5).

---

## 7. Kontekst i pamięć

📔 **Analogia:** pamięć agenta to **pamiętnik** — trzeba coś zapisać, ułożyć, a potem umieć szybko znaleźć właściwą stronę.

### 4 części pamięci

| Część | Co robi |
|---|---|
| **Ekstrakcja** | zapisuje nowe informacje z rozmów i systemów zewnętrznych |
| **Struktura** | tabela, drzewo lub graf dokumentów + metadane |
| **Wyszukiwanie** | LLM, wzorce, embeddingi, full-text, graf |
| **Kontekst** | jak pamięć trafia do agenta + narzędzia: czytaj, pisz, zmieniaj, usuwaj |

Brak standardów. Większość harnessów robi to **naiwnie** — tylko udaje, że pamięta.

### Zapamiętywanie

- przez **dodatkowe zapytanie LLM w tle** albo **jawne wywołanie narzędzia**
- jako aktualizacja **profilu klienta** albo osobne dokumenty połączone z innymi

### Problemy

| Problem | Przykład |
|---|---|
| **Sprzeczność** | było „krótkie odpowiedzi”, teraz „szczegółowe” — nowe musi nadpisać stare |
| **Duplikat** | „podsumowanie w piątek mailem” w profilu i w osobnej notatce |
| **Niejednoznaczność** | dwóch klientów o imieniu Adam — [o którego chodzi?](https://github.com/MEGA-DOT-DEV/examples/tree/main/examples/memory-extraction) |
| **Zmiany w czasie** | co i kiedy się zmieniło |

Pomaga: **poziom pewności** i tymczasowe notatki, aż sprawa się wyjaśni.

💡 Zapisać jest łatwo. Trudno trzymać **jedną, aktualną, przypisaną** wartość.

### Przypominanie

Musi być **szybkie**, **kontekstowe** i **wydajne**.

- Sama ostatnia wiadomość nie wystarcza („Przygotuj ofertę na spotkanie” — jaką? dla kogo?).
- Harness [patrzy na cały wątek](https://github.com/MEGA-DOT-DEV/examples/tree/main/examples/contextual-recall) + **profil klienta** jako globalny kontekst.
- Szybkie wyszukanie → re-ranking → do wątku trafiają top dokumenty.

### Gotowe projekty

| Projekt | Uwagi |
|---|---|
| [mem0](https://mem0.ai/) | open source |
| [supermemory](https://supermemory.ai/) | open source |
| [Hindsight](https://hindsight.vectorize.io/) | `retain()`, `recall()`, `reflect()`; worker łączy fakty w obserwacje |
| [lamarck](https://github.com/johnlindquist/lamarck) | inspiracja do własnego narzędzia |
| [Observation Pipeline](https://joelclaw.com/observation-pipeline-persistent-ai-memory) | wpis Joela Hooksa |

---

## 8. Narzędzia

Agent musi **znać swoje możliwości**, **łączyć je** i robić zadanie w jak najmniej krokach — bez zaśmiecania kontekstu.

| Wyzwanie | Po ludzku |
|---|---|
| **Świadomość** | system prompt = lista możliwości + jak doczytać szczegóły + kilka natywnych narzędzi od razu. Reszta [ładowana na żądanie](https://github.com/MEGA-DOT-DEV/examples/tree/main/examples/tool-search). |
| **Zarządzanie** | stałe narzędzia + nowe przez **MCP** + **własne integracje** pisane przez agenta, zapisane i używane ponownie. |
| **Odkrywanie** | katalog z **narzędziem wyszukiwania** (więcej kontroli) albo **pliki** przeglądane Bashem (więcej swobody). Przy dużej skali — **gateway**. |
| **Wielokrotne użycie** | agent tworzy **paczki**, które łączą integracje, magazyny wartości i inne paczki. |
| **Środowisko** | każdy użytkownik ma **osobny workspace**. Agent łatwo obejdzie granice i dotrze do cudzych danych! |

🧰 **Analogia:** narzędzia to **skrzynka z narzędziami**. Na wierzchu młotek i śrubokręt, reszta w szufladach z etykietami. A agent może dorobić sobie nowe narzędzie i odłożyć je na potem.

🏢 Przykłady gatewayów: [Uber — 8000+ narzędzi](https://www.uber.com/pl/en/blog/designing-mcp-gateway/), [Treg](https://github.com/superdesigndev/treg).

🎚️ Wszystko to możesz **ograniczyć** (kontrola) albo **poszerzyć** (agent sam się konfiguruje i uczy nowych rzeczy).

---

## 9. Wnioski

- Pod maską agenta dzieje się **dużo więcej**, niż widać.
- Teraz wiesz, **czego się po nim spodziewać** i **dlaczego zawodzi** (np. „nie mam tej informacji”, choć powinien ją pamiętać).
- 🛠️ Zbuduj choć **prostego agenta** — dzięki temu lepiej wykorzystasz Claude, Pi czy inny harness.
