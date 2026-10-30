# S01E05 · Budowanie przepływów pracy, nie stosów narzędzi

## 📑 Spis treści

1. [Film](#-1-film)
2. [Dlaczego jest trudno?](#-2-dlaczego-jest-trudno)
3. [Wykonywalny Markdown vs kod](#-3-wykonywalny-markdown-vs-kod)
4. [Jakość](#-4-jakość)
5. [Agenci zdalni](#-5-agenci-zdalni)
6. [Przepływy w tle: przykłady](#-6-przepływy-w-tle-przykłady)
7. [Bezpieczeństwo](#-7-bezpieczeństwo)
8. [Wartość biznesowa](#-8-wartość-biznesowa)
9. [Najważniejsze w skrócie](#-najważniejsze-w-skrócie)

---

> **W jednym zdaniu:** AI pozwala budować szybko, ale bałagan rośnie równie szybko. Żeby nadążyć, trzeba użyć AI do pilnowania AI, czyli zbudować **system**, a nie kolekcję narzędzi.

---

## 🎬 1. Film

| Temat | O co chodzi |
|---|---|
| **Workflow** | Całość, która prowadzi do celu. Składa się z **kodu**, **promptów** i **skilli** |
| **Jakość** | Myśl o przycisku **„Merge”**. **Przed nim:** zrób wszystko, żeby kod był jak najlepszy. **Po nim:** zadbaj, żeby błąd dało się łatwo wycofać lub naprawić |
| **Odbiór przez użytkownika** | Prowadzący stworzył skill `sol-loop`. Agent AI **Sol** świetnie robi review kodu, więc Claude Code wywołuje Sola do review, a człowiek tylko obserwuje wyniki i w razie potrzeby poprawia skill |
| **Miejsce skilli** | Skill używany w **więcej niż jednym projekcie** → raczej **globalny**. Reszta → **lokalne** |

**Analogie:**
- **Workflow** to przepis na ciasto: składniki (kod, prompty, skille) razem dają gotowy wypiek.
- **Merge** to drzwi wyjściowe z kuchni: przed nimi sprawdzasz, czy ciasto jest dobre, a za nimi masz plan, co zrobić, gdy komuś nie posmakuje.
- **Skill globalny** to nóż w kuchni, którego używasz do wszystkiego; **lokalny** to foremka tylko do jednego ciasta.

---

## 🧩 2. Dlaczego jest trudno?

**Analogia:** budujemy klocki LEGO turbo-szybko, ale sprzątanie pokoju idzie w starym tempie.

| Problem | Co się dzieje |
|---|---|
| Szybsze budowanie | Szybciej rośnie też dług techniczny |
| Więcej części | Więcej do zmieniania, opisywania i testowania |
| Ludzie i firmy | Nie nadążają sprawdzić, jak zmiany działają na użytkowników |
| Agenci | Ciągle o coś pytają, psują się, zabierają nam uwagę |

👉 Wniosek: **trzeba użyć AI, żeby nadążyć za AI.**

---

## 📄 3. Wykonywalny Markdown vs kod

**Skill** = plik `.md` z instrukcjami, które agent wykonuje. Czasem cały produkt to jeden plik `.md`.

**Analogia:** przepis kucharski, który sam gotuje obiad.

Przykłady, co agent zrobi z jednego pliku:
- spersonalizowany newsletter na co dzień
- poranny skrót czytany głosem (text-to-speech)
- raport PDF na wybrany temat
- segregowanie maili i szkice odpowiedzi

### ❌ Wady samego agenta

| Wada | Na czym polega |
|---|---|
| Niezawodność | Każde uruchomienie daje inny wynik |
| Koszt | Agent robi wszystko od zera za każdym razem |
| Szybkość | LLM jest wolny, API może nie odpowiedzieć |
| Debugowanie | Trudno sprawdzić, co poszło nie tak |
| Utrzymanie | Trudno sprawdzić, czy zmiana coś poprawiła |

### ✅ Jak to ulepszyć

| Sposób | O co chodzi |
|---|---|
| **Elastyczność** | Małe skille z jednym zadaniem łatwo łączyć jak klocki |
| **Code Mode** | Agent pisze skrypt raz i **używa go wielokrotnie** |
| **Uogólnione narzędzia** | Zamiast „twórz reklamy na Facebooka” mamy `generate_creation`, które można dopasować do dowolnej reklamy |
| **Ewaluacja** | AI generuje sztuczne scenariusze testowe, a narzędzia typu [Promptfoo](https://www.promptfoo.dev/) pokazują, w którą stronę zmienia się zachowanie |

👉 Cel: nie budować każdego narzędzia ręcznie, tylko zbudować **system, w którym agenci sami tworzą i utrzymują narzędzia**.

Elementy systemu:
- **Baza wiedzy**: nasze notatki i fakty
- **Globalny kontekst**: cele, zasady, preferencje
- **Prymitywy**: klocki wielokrotnego użytku
- **Ramy pracy**: pilnują, żeby agenci się nie zgubili

---

## 🔍 4. Jakość

**Główna zasada:** *agent sam sprawdza swoją pracę.*

**Analogia:** uczeń, który sam sprawdza swoje zadanie z kalkulatorem, zanim odda je nauczycielowi.

| Poziom sprawdzania | Przykład |
|---|---|
| Maszynowy | Testy jednostkowe, testy E2E (agent może je „oszukać”) |
| Ludzki | Używa aplikacji jak człowiek |
| Kontekstowy | Wie, czego oczekują użytkownicy |

Agent potrzebuje do tego **własnego komputera** (tak robią Devin, Cursor, Grok Bot).

### Fundamenty systemu

| Element | Znaczenie |
|---|---|
| **Zasady** | Granice i kierunek: wszystko, co sprawia, że agent zachowuje się jak chcemy |
| **Środowisko** | Przestrzeń, w której agent swobodnie działa |
| **Prymitywy** | Małe klocki (np. Search, Read, Transform, Write), jak w filozofii UNIX |

Składniki, które już znamy:
- **Kontekst globalny i lokalny**: na naszym komputerze i zdalnie, do dzielenia się z zespołem
- **Skille i generatory**: rozwijane dzięki nawykom i rutynom, które przeglądają historię i podpowiadają nowe skille
- **Baza wiedzy**: zdalna, dostępna dla wszystkich agentów
- **Śledzenie zadań**: specyfikacje, issues, ADR-y (co budujemy, co zbudowaliśmy, co dalej)
- **Własne narzędzia**: system sam buduje swoje MCP / CLI

👉 Brakujący element: **zdalna maszyna** (VPS, PC/Mac, GitHub Actions albo rutyny Claude/Devin).

---

## 🌐 5. Agenci zdalni

> ⚠️ Ta część jest **opcjonalna**. Cursor i Devin dają zdalnych agentów od razu. Ważne, żeby agenci mogli działać **według harmonogramu** albo **na zdarzenie**.

**Analogia:** pomocnik, który pracuje w nocy w innym domu, a ty możesz do niego zadzwonić z telefonu.

Przewodnik: [Limen – agent-setup](https://github.com/overment/limen/blob/main/docs/seat/agent-setup.md)

### Czego potrzebujesz

| Gdzie | Co |
|---|---|
| Komputer | Agenci, [Tailscale](https://tailscale.com/), [Pi](https://pi.dev/), [Herdr](https://herdr.dev/) |
| Telefon | [Grok Bot](https://x.ai/bot) lub [Moshi](https://getmoshi.app/) |
| VPS | Ubuntu LTS, ≥8 GB RAM, ≥150 GB dysku, ≥2 vCPU, publiczny IPv4 ([DigitalOcean](https://digitalocean.com/), [Hetzner](https://www.hetzner.com/)) |

### Kroki w skrócie

| Kto | Co robi |
|---|---|
| Ty | Instalujesz Tailscale, Herdr, Limen; tworzysz 3 klucze SSH (admin, break-glass, worker) |
| Ty | Instalujesz Moshi/ntfy na telefonie, zakładasz VPS |
| AI | Zabezpiecza SSH i firewall, instaluje pakiety, instaluje Pi jako zwykły użytkownik |
| Ty | Zatwierdzasz Tailscale, logujesz się do `gh` i Pi z laptopa |
| AI | Klonuje projekt i uruchamia `limen init` |
| Ty + AI | Testowe zadanie przez Herdr, parowanie Moshi Hooks |
| AI | Włącza codzienne `limen prune` (czyści dysk) |
| Ty + AI | Tworzycie GitHub App i testujecie `@limen` w PR |

> 💡 Nawet jeśli to wygląda jak czarna magia, **agenci przeprowadzą cię przez każdy krok**. Zajmuje to 1–2 godziny.

> ⚠️ Przewodnik może nie spełniać wymagań twojej firmy. Do użytku prywatnego wystarczy.

Efekt: prywatna sieć (Tailnet) z komputerem, telefonem i VPS-em. Na zewnątrz wychodzi tylko jedno: agenci Pi biorą zadania z GitHuba i otwierają PR-y.

**Sekrety:** [1Password CLI](https://www.1password.dev/environments/mcp-server) lub [Bitwarden](https://bitwarden.com/blog/introducing-agent-access-sdk/), żeby agenci używali kluczy **bez wrzucania ich do kontekstu**.

---

## 🌙 6. Przepływy w tle: przykłady

| Przepływ | Kiedy | Co robi |
|---|---|---|
| Poranny skrót | Rano | Pokazuje, co wymaga uwagi i co agenci zrobili w nocy |
| Nocny przegląd | W nocy | Testuje, łapie błędy, sprząta |
| Samodoskonalenie | Na bieżąco | Analizuje rozmowy i proponuje ulepszenia |
| Synchronizacja dokumentacji | Po każdym merge | Aktualizuje dokumentację i bazę wiedzy |
| PR pulse | Nowy PR | Recenzja przed człowiekiem |
| Monitor wdrożeń | Deploy | Pilnuje i naprawia pipeline |
| Heartbeat | Ciągle | Śledzi logi, użytkowników, bazę danych |
| Testy UX | Regularnie | Uruchamia scenariusze i ocenia je według KPI |
| Audyt wydajności | Regularnie | Szuka wąskich gardeł |
| Przegląd zależności | Zmiana lockfile | Sprawdza nowe paczki i podatności |
| Wnioski produktowe | Co tydzień | Analizuje dane, tłumaczy anomalie |
| Triage zgłoszeń | Na bieżąco | Grupuje feedback i tworzy issues |
| Raport badawczy | Na żądanie | Raport ze źródłami |
| Release notes | Nowy tag | Notatki dla użytkowników i changelog |
| Obserwacja konkurencji | Co tydzień | Raportuje tylko zmiany |
| Notatki ze spotkań | Po transkrypcji | Podsumowanie, decyzje, zadania |
| Łowca niestabilnych testów | W nocy | Oddziela niestabilne testy od prawdziwych błędów |

👉 Zacznij **prosto**, potem ulepszaj. Także przez **upraszczanie** i usuwanie zbędnych kroków.

---

## 🔒 7. Bezpieczeństwo

**Analogia:** im więcej kluczy dajesz pomocnikowi (mail, kalendarz, karta), tym więcej może ukraść złodziej, który go oszuka.

| Atak | Cel | Prosto mówiąc |
|---|---|---|
| **Prompt injection** | **Którym instrukcjom** system ufa | Ktoś podrzuca fałszywe polecenia w mailu lub na stronie |
| **Jailbreak** | **Co model może** robić | Ktoś namawia model do złamania zasad |

Jeden atak może być jednym i drugim naraz.

📚 Źródło wiedzy: [L1B3RT4S](https://github.com/elder-plinius/L1B3RT4S) od Pliny’ego (⚠️ używanie go może zablokować konto!).

### Obrona Matthew Bermana ([artykuł](https://x.com/MatthewBerman/status/2030423565355676100))

| Warstwa | Co robi |
|---|---|
| Sanitizer | Czyści dziwny Unicode, dekoduje base64/hex, wykrywa wzorce jailbreaków |
| Skaner | Najmocniejszy LLM ocenia ryzyko 0–100 (od 35 przegląd, od 70 blokada) |
| Bramka wyjściowa | Sprawdza, czy nie wyciekają sekrety, ścieżki, kwoty |
| Redakcja | Ukrywa sekrety, maile, telefony, kwoty |
| Kontrola dostępu | Blokuje wrażliwe pliki i adresy prywatne, tylko http/https |

👉 **Gdzie jest LLM, tam jest dziura.** Zastanów się dwa razy, zanim dasz agentowi dostęp do rzeczy, których **nie da się cofnąć**.

---

## 💼 8. Wartość biznesowa

Ryzyko: agenci produkują pracę, której **nikt nie czyta**.

| Kierunek | O co chodzi |
|---|---|
| **Kod + AI w równowadze** | Stałe harmonogramy i skrypty; LLM tylko tam, gdzie trzeba |
| **Człowiek wyznacza kierunek** | Agenci dbają o jakość, a ludzie podejmują ważne decyzje |
| **Wycinaj zbędne** | Usuwanie jest ważniejsze niż dodawanie |
| **Zaufanie się zdobywa** | Ufamy agentom tylko wtedy, gdy sami sprawdzają swoją pracę |

**Analogia:** agent to stażysta. Dostaje więcej obowiązków dopiero wtedy, gdy pokaże, że sam sprawdza swoją robotę.

---

## ✅ Najważniejsze w skrócie

- Budujemy **system**, a nie stos narzędzi
- Skille: **małe, z jednym zadaniem**, wspierane zapisanymi skryptami
- Agent **sam weryfikuje** swoją pracę
- Zdalni agenci pracują **w tle**, według harmonogramu lub na zdarzenie
- **Bezpieczeństwo:** każdy LLM to potencjalna dziura
- **Upraszczaj** częściej niż dodajesz
