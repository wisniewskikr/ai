# S01E02 · Sterowanie modelami przez kontekst — streszczenie

> 🎯 **Cel lekcji:** zrozumieć, jak działa kontekst, żeby agenci dawali lepsze wyniki, a my mniej się męczyli.
>
> 🎒 **Analogia:** agent to nowy kolega w pracy. Wie tyle, ile mu powiesz i ile zmieści w głowie. Za dużo naraz — zapomina.

---

## 1. O co chodzi?

Jakość odpowiedzi agenta zależy od kontekstu. Ale ważne jest też, **ile kontekstu musimy trzymać we własnej głowie**.

| Krok | Co się dzieje |
|---|---|
| 1 | Agent pracuje, więc odpalamy drugiego, trzeciego… |
| 2 | Ciągle przeskakujemy między agentami i podejmujemy masę decyzji |
| 3 | Brakuje nam energii → akceptujemy wszystko, co proponują |
| 4 | Agentom brakuje kontekstu → powstaje **slop** (bylejakość) |
| 5 | Naprawianie nie działa → frustracja → wracamy do starych nawyków |

🤹 **Analogia:** żonglowanie zbyt wieloma piłkami. W końcu wszystkie lecą na ziemię.

**Rozwiązanie:** zrozumieć kontekst → mniejsze obciążenie głowy → skupienie na tym, co ważne.

---

## 2. Personalizacja harnessu

**Harness** = narzędzie, w którym działa agent (np. Claude Code, OpenCode, Pi).

Na starcie sesji model nic o nas nie wie. Dlatego harness automatycznie dokłada mu „ściągę”.

📁 **Pliki tekstowe** to podstawowe klocki do zarządzania kontekstem. Agent może je edytować → **może zmieniać własne ustawienia**.

### Co widzi agent (np. Claude Code)?

- prompt systemowy
- szczegóły środowiska
- `MEMORY.md`
- narzędzia (załadowane i odroczone)
- skille i agenci
- dynamiczne przypomnienia w trakcie rozmowy

💡 To nie tajemnica — można po prostu **zapytać agenta**, jak widzi naszą rozmowę.

### Co możemy skonfigurować?

| Element | Po co | Analogia |
|---|---|---|
| **AGENTS.md** | Plik ładowany na start: opis projektu, konwencje, zasady. Prowadzi agenta, ale **nie gwarantuje** przestrzegania reguł | Instrukcja dla nowego pracownika |
| **Pamięć** | Wspomnienia dostępne między wątkami, zapisywane automatycznie lub na prośbę | Notes, do którego agent zagląda |
| **Konfiguracja** | Agent zna swoje ustawienia — można z nim o nich porozmawiać, a nawet pozwolić mu je zmieniać | Robot, który sam dokręca swoje śrubki |
| **Baza wiedzy** | Pliki o produkcie i procesach (można z nich zrobić stronę w Astro/Next) | Firmowa biblioteka |
| **Skille** | Folder z `SKILL.md` (+ skrypty) opisujący proces. Mogą wskazywać inne skille. Są też „skille do tworzenia skilli” | Karty z przepisami |
| **CLI / MCP** | Rozszerzają możliwości agenta o świat zewnętrzny | Dodatkowe narzędzia w skrzynce |

Do tego: **rozszerzenia** i **hooki** — własna logika podpięta pod niemal każdy etap rozmowy. AI może je zbudować za nas.

⚠️ Nie każdy harness umie konfigurować się sam. Jeśli możesz — wybierz taki, który umie (Pi, OpenCode, Claude Code).

### System, który sam się ulepsza

- 🗣️ Porozmawiaj z agentem, jak ulepszyć workflow.
- 📜 Poproś, by przejrzał historię rozmów i poznał Twój styl pracy.
- ⏰ Zautomatyzuj to — niech regularnie podsuwa usprawnienia.
- ✂️ Twoja rola: **pilnować prostoty**.

---

## 3. Jak działa kontekst?

❗ **Informacja w kontekście ≠ informacja użyta.** Agent może na początku słuchać instrukcji, a później o niej zapomnieć i wrócić do starych nawyków.

### Okno kontekstu

- Ma limit: liczy się **wszystko** — to, co wysyłamy, i to, co model generuje.
- Zajęte 95% + odpowiedź większa niż 5% = **błąd**.
- Harness oszczędza tokeny → czasem coś po cichu **znika** z kontekstu.

🎒 **Analogia:** plecak. Gdy jest pełny, harness wyjmuje rzeczy, żeby zmieścić nowe — a my myślimy, że wciąż tam są.

### Prompt to nie kod

Prompt **nie jest wykonywany linijka po linijce**. Model to nie kompilator. Jak dokładnie przetwarza kontekst — wciąż jest badane.

👉 Praca z AI to nie pewność, tylko **zwiększanie szans** na dobry wynik.

### Skąd biorą się problemy?

| Problem | Po ludzku |
|---|---|
| **Uwaga** | Model nie łapie powiązań między regułami, faktami, instrukcjami |
| **Słuchanie instrukcji** | Model nie stosuje się do poleceń systemu, dewelopera lub użytkownika |
| **Problemy z kontekstem** | Harness lub błąd techniczny ukrył część informacji |
| **Brak kontekstu** | Czegoś po prostu nigdy nie powiedzieliśmy |
| **Rozumienie ogólne** | Model inaczej rozumie pojęcia, nie widzi detali na obrazku, „cicho” nie wczytał strony |

Większość z tego jest poza naszą kontrolą — ale nie wszystko.

### Złota zasada

✂️ **Rozmowy jak najkrótsze.** Nowy wątek = świeża głowa agenta.

Minus: agent musi od nowa poznać projekt. Pomagają w tym **skille**.

---

## 4. Projektowanie i tworzenie skilli

Skill = plik Markdown (+ opcjonalne skrypty) ładowany do kontekstu. Przykłady: [skills.sh](https://skills.sh), porady: [agentskills.io](https://agentskills.io/home).

⚠️ **Sprawdzaj skille przed instalacją** — mogą ukrywać złośliwe instrukcje.

### Zasady

| Zasada | Co robić | Analogia |
|---|---|---|
| **Nazwa i opis** | Najważniejsze! Po nich agent wybiera skill. Zacznij prosto | Etykieta na słoiku |
| **Poprawki** | Skill się nie odpala lub odpala się źle? Poproś agenta o lepszy opis. Ustaw regularny przegląd historii | Przegląd samochodu |
| **Długość** | Krótkie i jasne > długie i skomplikowane | Krótka lista zakupów vs. encyklopedia |
| **Router skill** | Skill, który wskazuje inne skille (np. [ask-matt](https://www.skills.sh/mattpocock/skills/ask-matt)) | Drogowskaz |

### Dlaczego nie szczegółowe instrukcje?

- 🙈 skomplikowane są ignorowane lub źle rozumiane
- 🧱 za dużo prowadzenia = mniej elastyczności
- 🛠️ długie skille trudno utrzymać
- 🔄 więcej treści = więcej rzeczy do aktualizowania
- 😵 rozpraszają agenta

### Co zamiast?

- 🧭 **Zasady i sposób myślenia** zamiast kroków — agent sam się dopasuje.
- 🔗 **Wskaż, gdzie szukać** (np. dokumentacji), zamiast ją wklejać.
- ⚓ **Kotwice semantyczne** — słowa niosące wiele skojarzeń. Np. **„Noir”** = cienie, cynizm, moralna szarość.
- ❓ **Samosterowanie** — model zadaje sobie pytania i na nie odpowiada.

### Tworzenie skilli z AI

| LLM-y są dobre w | LLM-y mają kłopot z |
|---|---|
| formułowaniu zdań | kompresją |
| | uogólnianiem |
| | upraszczaniem |

👉 Potrzebne **iteracje z naszym udziałem**. Przykład meta-skilla: [skill-shaper](https://github.com/overment/skills/blob/main/skills/skill-shaper/SKILL.md).

### Podsumowanie

- Zapytaj swój harness, jak działają u niego skille i agenci.
- Skille/agenci mogą być **globalne** albo **lokalne** (per projekt).
- To kwestia nawyku. Nie komplikuj.

---

## 5. Narzędzia od kuchni

| Etap | Co się dzieje | Analogia |
|---|---|---|
| **Natywne i własne** | Harness ma wbudowane narzędzia + można dodać **MCP** lub **CLI** | Wbudowany scyzoryk + dokupione narzędzia |
| **Odkrywanie** | a) wszystkie schematy JSON od razu (szybko, ale zajmują kontekst) albo b) narzędzie do wyszukiwania narzędzi (oszczędnie, ale dodatkowe kroki) | Cała skrzynka na stole vs. katalog w szufladzie |
| **Żądanie** | Model wybiera narzędzie i tworzy dane wejściowe. Może wołać kilka naraz | Zamówienie w restauracji |
| **Odpowiedź** | Wynik trafia do kontekstu i wpływa na model. Za duży → zapis do pliku | Kelner przynosi danie |
| **Podpowiedzi** | Model sam decyduje, co wywołać → warto dodać w odpowiedzi **wskazówki, co dalej** | Kartka „smacznego, polecamy deser” |
| **Błędy** | Zamiast wyjątku — oddaj szczegóły błędu modelowi, by sam się poprawił lub poprosił o pomoc | Nawigacja: „zmieniam trasę” |

⚠️ **Prompt injection:** model można oszukać, by wyciągnął dane jednym narzędziem i wysłał drugim. Problem wciąż nierozwiązany.

### Podsumowanie

- Agent musi wiedzieć, jakie ma narzędzia (schematy z góry albo odkrywanie).
- Agenci coraz częściej **piszą kod**, by działać w środowisku.
- Model może zmyślić wartości → ryzyko wycieku danych.
- Odpowiedzi z podpowiedziami pomagają agentowi działać dalej.

---

## 6. Subagenci i workerzy

Cel: krótkie rozmowy, **skupione na jednym zadaniu**.

| | Subagent | Worker |
|---|---|---|
| **Co to** | Agent wywołany przez agenta | Subagent w osobnym procesie (jak druga karta Claude Code) |
| **Wątek** | **Fork** obecnego albo nowy | Osobny |
| **Uruchamianie** | Przez agenta | Przez agenta, harmonogram lub webhook |
| **Technicznie** | Zwykłe narzędzie — jego wynik trafia do kontekstu | Agent nadrzędny dostaje powiadomienie o końcu |
| **Analogia** | Pomocnik przy tym samym biurku | Podwykonawca w innym biurze |

Mogą mieć inne ustawienia (model, poziom rozumowania) i powstawać z **szablonów**.

### Skill czy agent?

Oba to pliki tekstowe (md/toml) z nazwą i opisem. Plik agenta ma dodatkowo narzędzia, uprawnienia, model.

| Skill | Agent |
|---|---|
| Zadanie w **tym samym wątku** (potrzebny obecny kontekst) | Zadanie w **osobnym wątku** |
| 📖 Przepis, który czytasz sam | 👷 Fachowiec, którego wysyłasz |

### Zapamiętaj

- subagenci to (specjalne) **narzędzia**
- mogą być **predefiniowani** lub **dynamiczni**
- chodzi głównie o **zarządzanie kontekstem**, skupienie i wydajność
- może nimi sterować człowiek, inny agent albo skrypt
- najprościej zacząć: poproś model, by **podzielił zadanie** na kroki i sam stworzył subagentów

---

## 7. Wnioski

- 🧠 Zarządzanie kontekstem to jedna z najważniejszych umiejętności.
- 📈 AI coraz lepiej radzi sobie z tym sama — pozwól jej, wspieraj przy długich zadaniach.
- ✂️ Trzymaj system **prosty**.
- 🔄 Bądź gotów zmienić strategię za kilka miesięcy.
- 🧪 **Buduj i eksperymentuj** — nawet z najbardziej szalonymi pomysłami.
