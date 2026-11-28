# S01E02 – Sterowanie modelem przez kontekst

## Spis treści

- [Opis](#opis)
- [1. Kontekst](#1-kontekst)
- [2. Kontekst - Ograniczenia](#2-kontekst---ograniczenia)
- [3. Kontekst - Rozwiązania ograniczeń](#3-kontekst---rozwiązania-ograniczeń)
- [4. Personalizacja harnessu](#4-personalizacja-harnessu)
- [5. Personalizacja (Wiedza) - AGENTS.md](#5-personalizacja-wiedza---agentsmd)
- [6. Personalizacja (Wiedza) - Skills](#6-personalizacja-wiedza---skills)
- [7. Personalizacja (Działanie) - Narzędzia](#7-personalizacja-działanie---narzędzia)
- [8. Personalizacja (Działanie) - Subagenty](#8-personalizacja-działanie---subagenty)
- [9. Samodoskonalenie](#9-samodoskonalenie)
- [10. Wnioski](#10-wnioski)
- [11. Pytania](#11-pytania)

---

## Opis

**Cel wykładu:** zrozumieć, co agent widzi w kontekście i dlaczego nie zawsze z tego korzysta, żeby świadomie sterować jego zachowaniem (AGENTS.md, skills, narzędzia, subagenty) i przy okazji zmniejszyć własne obciążenie poznawcze.

> Model żyje jak bohater **Dnia Świstaka**: co rano **budzi się bez pamięci** (kontekst i jego ograniczenia, sekcje 1–3), czyta **karteczki zostawione na lodówce** (AGENTS.md, skills, sekcje 4–6), w ciągu dnia **sam szuka informacji i wysyła pomocników** (narzędzia, subagenty, sekcje 7–8), a wieczorem **poprawia karteczki na jutro** (samodoskonalenie, sekcja 9).

**Jak łączą się sekcje:**

- **1. Kontekst → 2. Kontekst - Ograniczenia** – model wie tylko to, co ma w kontekście, ale nawet to, co tam jest, nie zawsze zostanie użyte.
- **2. Kontekst - Ograniczenia → 3. Kontekst - Rozwiązania ograniczeń** – większość przyczyn jest poza naszą kontrolą, więc szukamy tego, na co mamy wpływ.
- **3. Kontekst - Rozwiązania ograniczeń → 4. Personalizacja harnessu** – krótkie wątki zmuszają agenta do odkrywania kontekstu od nowa, więc harness musi go dostarczać automatycznie na starcie.
- **4. Personalizacja harnessu → 5–6. Personalizacja (Wiedza)** – z wielu elementów personalizacji najpierw te, które dają agentowi wiedzę: plik ładowany zawsze i instrukcje ładowane na żądanie.
- **5. Personalizacja (Wiedza) - AGENTS.md → 6. Personalizacja (Wiedza) - Skills** – wszystko w AGENTS.md zajmuje kontekst w każdym wątku, więc rzadziej potrzebną wiedzę przenosimy do skilli.
- **6. Personalizacja (Wiedza) - Skills → 7. Personalizacja (Działanie) - Narzędzia** – przejście od wiedzy do działania: skill tylko mówi, jak działać; żeby agent sam zdobył brakujący kontekst i coś zrobił, potrzebuje narzędzi.
- **7. Personalizacja (Działanie) - Narzędzia → 8. Personalizacja (Działanie) - Subagenty** – każdy wynik narzędzia zapycha kontekst głównego wątku, więc część pracy oddajemy do osobnych kontekstów.
- **8. Personalizacja (Działanie) - Subagenty → 9. Samodoskonalenie** – mamy już wszystkie mechanizmy sterowania, więc zostaje pytanie, jak je z czasem poprawiać, nie komplikując systemu.

---

## 1. Kontekst

**Na starcie sesji model nie wie nic o nas, projekcie ani zadaniu – całe jego „rozumienie sytuacji” to kontekst, który złożył harness.**

- **Dzień Świstaka** – model budzi się w każdym wątku z wiedzą z treningu, ale bez wiedzy, gdzie jest, po co i co ma robić. Kontekst to karteczki, które mu zostawiamy.
- **Zachowanie agenta zależy od kontekstu** co najmniej tak samo jak od modelu – to nasze główne narzędzie sterowania.
- **Kontekst to nie tajemnica** – można zapytać agenta, co widzi, i dostać listę bloków od góry do dołu.

**Przykład: prompt, który pokazuje kontekst agenta:**

```
Nie uruchamiaj żadnych narzędzi. Wypisz bloki kontekstu, które teraz widzisz,
od góry do dołu: system prompt, narzędzia, skills itd.
```

### Co widzi agent

**Harness wkłada do kontekstu dużo więcej niż naszą wiadomość – także po niej.**

Kolejność bloków w Claude Code (uproszczona):

```
┌ definicje narzędzi (Agent, Bash, Edit, Read, Write…)
│ system prompt (tożsamość, zasady, styl, „potwierdź ryzykowne akcje”, zarządzanie kontekstem)
│ CLAUDE.md (globalny i projektowy), MEMORY.md
│ git status, zasady commitów i PR
│ ── wiadomość użytkownika ──
│ środowisko, output style
│ lista narzędzi odroczonych (deferred – sama nazwa, schemat na żądanie)
│ typy agentów, serwery MCP, lista skilli, auto mode
└ przypomnienia (system reminders), dzisiejsza data
```

| Harness | Cechy kontekstu |
|---|---|
| **Claude Code** | Rozbudowany: narzędzia, system prompt, CLAUDE.md, git status; dużo bloków dopiero po wiadomości użytkownika |
| **Codex** | Podobna struktura; wiadomość użytkownika bliżej końca |
| **Pi** | Minimalny: krótki system prompt, 4 narzędzia (`read`, `bash`, `edit`, `write`), skills, instrukcje projektu, kontekst projektu, wiadomość |

> Kolejność bloków różni się między harnessami, ale zasada jest ta sama: model zna tylko to, co dostał.

### Nie tylko tekst

**Obraz to dla modelu po prostu kolejny fragment kontekstu.**

- Zrzut ekranu ze strzałką i dopiskiem „Ugly. Get rid of it.” – bez żadnego tekstu w wiadomości – wystarczy, żeby agent znalazł ikonę w kodzie i ją usunął.
- Agent sam może dodać obraz do kontekstu: uruchamia zmianę, otwiera przeglądarkę, robi zrzut ekranu narzędziem i ocenia wynik.

### Dwie strony kontekstu

**Liczy się nie tylko kontekst modelu, ale też ten, który my trzymamy w głowie.**

- Wiele agentów naraz → ciągłe przełączanie i decyzje → zmęczenie → akceptujemy, co agent zaproponuje → **slop** (bylejakość).
- Zrozumienie kontekstu pozwala dać agentom lepszy start i skupić się na tym, co ważne.

---

## 2. Kontekst - Ograniczenia

**To, że informacja jest w kontekście, nie znaczy, że model jej użyje – prompt to nie program wykonywany linia po linii.**

- **Instruction drift** – instrukcja jest na początku przestrzegana, a później model ją ignoruje i wraca do domyślnego zachowania.
- **Model to nie kompilator** – reguły i warunki w prompcie zwiększają szansę, ale niczego nie gwarantują. Jak model przetwarza kontekst w środku, wciąż jest przedmiotem badań.
- **Context window** obejmuje **wejście i wyjście** – przy 95% zajętego okna wystarczy, że reasoning, tool call lub odpowiedź przekroczy pozostałe 5%, i dostajemy błąd.

| Ograniczenie | Przyczyna | Rozwiązanie |
|---|---|---|
| **Attention** – model nie łączy reguł, faktów i instrukcji | Słabe rozumienie relacji między pojęciami w długim kontekście | Krótkie wątki, mniej instrukcji (sekcja 3) |
| **Instruction following** – model nie wykonuje polecenia | Słabość modelu w trzymaniu się instrukcji systemu, dewelopera, użytkownika | Krótkie, jasne instrukcje; skills zamiast długich plików (sekcja 6) |
| **Context issues** (*silent context loss*) – myślimy, że model coś widzi, a nie widzi | Harness przycina lub kompresuje kontekst (auto-compaction), oszczędzając tokeny; błędy techniczne | Krótkie wątki; pytać agenta, co widzi (sekcja 1) |
| **Missing context** – informacja nigdy nie trafiła do modelu | Jak człowiek: bez danych nie zrozumie zadania; zgaduje albo halucynuje | AGENTS.md, handoff, wiedza w kodzie (sekcje 3–5) |
| **Rozumienie ogólnego kontekstu** – model inaczej interpretuje pojęcia | Różne znaczenia słów; problemy ze szczegółami w obrazie, audio; „ciche” błędy przy czytaniu strony lub dokumentu | Słownik pojęć w AGENTS.md (sekcja 5) |
| **Brak współdzielenia między wątkami** – poprawiony błąd wraca w innym wątku | Każdy wątek ma osobny kontekst; wątki nie wiedzą o sobie | Wiedza zapisana w kodzie i plikach (sekcja 3) |
| **Limit okna** – błąd przy przepełnieniu | Okno obejmuje wejście i wyjście | Krótkie wątki, subagenty (sekcja 8) |

> **Większość przyczyn jest poza naszą kontrolą – ale nie wszystkie.** Pracujemy na zwiększaniu szansy, a nie na pewności.

---

## 3. Kontekst - Rozwiązania ograniczeń

**Mamy wpływ na to, co i kiedy trafia do kontekstu – a najprostsza zasada to: trzymaj wątki jak najkrótsze.**

| Rozwiązanie | Jak działa | Na jakie ograniczenie (sekcja 2) |
|---|---|---|
| **Krótkie wątki** – wątek „jednorazowy”, zamykany zaraz po zadaniu | Mniej tekstu → lepsza uwaga, mniej kompresji, daleko od limitu okna | Attention, context issues, limit okna |
| **Handoff** – plik z opisem stanu pracy dla kolejnego wątku | Agent zapisuje, co zrobił i co zostało; nowy wątek czyta plik zamiast odkrywać wszystko od nowa | Brak współdzielenia między wątkami, missing context |
| **Wiedza w kodzie** – kod i pliki jako wspólna pamięć wątków | Najlepsze źródło dla modelu to sam kod; dobry układ plików ułatwia znalezienie | Brak współdzielenia między wątkami |
| **Kontekst na starcie** – AGENTS.md, skills (sekcje 4–6) | Harness sam wkłada wiedzę na start albo na żądanie | Missing context, rozumienie ogólnego kontekstu |
| **Pytanie agenta** – „co widzisz?”, „dlaczego tak zrobiłeś?” | Agent pokazuje swój kontekst i powód decyzji; poprawiamy źródło problemu (sekcja 9) | Context issues, missing context |
| **Subagenty** – osobne konteksty na części zadania (sekcja 8) | Główny wątek dostaje tylko krótki wynik | Attention, limit okna |

**Przykład: handoff między dwiema sesjami:**

```
# Sesja 1
User:  Dodajemy do koszyka kody rabatowe i paragon. Zrób tylko krok 1 i testy.
Agent: (zmienia cart.js, testy 8/8 OK, zapisuje handoff.md)           ≈ 5 000 tokenów

# handoff.md
# Cart: discount codes + receipt
Praca podzielona na 2 kroki.
Zrobione: krok 1 – kod SAVE10 (−10%), testy przechodzą.
Do zrobienia: krok 2 – funkcja receipt(), zwraca jeden string.

# Sesja 2 (nowy wątek, bez historii)
User:  Kontynuuj pracę opisaną w handoff.md.
Agent: cat handoff.md → implementuje krok 2                            ≈ 500 tokenów
```

> Nowy wątek wydaje się stratą, bo agent musi odkryć kontekst od nowa – dlatego kontekst trzeba mu **podać automatycznie** (sekcja 4).

---

## 4. Personalizacja harnessu

**Harness pozwala automatycznie dać agentowi kontekst o nas i projekcie – a system plików i pliki tekstowe są do tego podstawowym budulcem.**

- **Pliki tekstowe jako prymityw** – w plikach są sesje, ustawienia, instrukcje. Agent umie je edytować, więc **może zmieniać własne ustawienia**.
- Elementy można definiować **globalnie** (wszystkie projekty, tylko u nas) albo **lokalnie** (projekt, dla całego zespołu).

| Element | Co to jest | Kiedy trafia do kontekstu |
|---|---|---|
| **AGENTS.md** (sekcja 5) | Główny plik z ogólnym kontekstem projektu i zasadami (`CLAUDE.md` w Claude Code) | Zawsze, na początku wątku |
| **Skills** (sekcja 6) | Folder z `SKILL.md` i opcjonalnymi skryptami, opisujący jeden proces | Nazwa i opis zawsze; treść na żądanie |
| **Memory** | Wspomnienia dostępne między wątkami (np. `MEMORY.md`), zapisywane automatycznie lub na prośbę | Zależnie od harnessu: indeks na start, reszta na żądanie |
| **Konfiguracja** | Ustawienia harnessu dostępne dla agenta wraz z dokumentacją | Gdy agent jej potrzebuje – można „porozmawiać z agentem o nim samym” |
| **Baza wiedzy** | Pliki o produkcie i procesach, niezwiązane z jednym harnessem | Na żądanie (agent czyta pliki); może też być stroną dla ludzi |
| **CLI / MCP** (sekcja 7) | Rozszerzenia możliwości agenta o świat zewnętrzny | Jako narzędzia |
| **Subagenty** (sekcja 8) | Pliki z instrukcją i ustawieniami (model, narzędzia, uprawnienia) | Nazwa i opis zawsze; uruchamiane jak narzędzie |
| **Rozszerzenia, hooki** | Własna logika podpięta pod niemal każdy moment interakcji | Zależnie od hooka |

- **Wiedza vs działanie** – elementy dzielimy według roli, a nie budowy:
  - **Wiedza** (sekcje 5–6) – AGENTS.md i skills mówią agentowi, co wiedzieć i jak działać.
  - **Działanie** (sekcje 7–8) – narzędzia i subagenty pozwalają mu coś zrobić: zdobyć kontekst albo oddać pracę do osobnego wątku.

- **Self-configuration** – nie każdy harness umie skonfigurować sam siebie; warto wybrać taki, który umie (np. Pi, OpenCode, Claude Code).
- Rozszerzenia może zbudować sam agent – ale trzeba wiedzieć, **kiedy w ogóle potrzeba czegoś ponad domyślną konfigurację**.

> Nasza rola: trzymać system **tak prosty, jak to możliwe**.

---

## 5. Personalizacja (Wiedza) - AGENTS.md

**AGENTS.md służy do wiedzy, której nie da się łatwo zdobyć, i do sterowania zachowaniem – a nie do opisywania tego, co agent sam znajdzie jedną komendą.**

- **AGENTS.md / CLAUDE.md** – plik ładowany na początku każdego wątku; może wskazywać inne dokumenty (moduły, funkcje, których nie widać z kodu).
- **Kieruje, ale nie gwarantuje** – agent nie zawsze zastosuje każdą regułę (sekcja 2).

| Do AGENTS.md | Poza AGENTS.md |
|---|---|
| Krótki opis projektu – co to jest | Ścieżki do plików – model świetnie je znajduje |
| Wartości projektu, które model łamie (np. wydajność, praca zdalna) | Wszystko, co da się zdobyć jedną komendą |
| Sposób myślenia autora („measure twice, cut once”, YAGNI) | Rzadko potrzebne procedury → skills (sekcja 6) |
| **Słownik pojęć** zespołu | Szczegółowe instrukcje do jednego zadania |

- **Słownik pojęć** (*glossary*) – wspólna gramatyka: model nie nazywa jednej rzeczy na trzy sposoby w trzech wątkach. Daje więcej, niż się wydaje.
- Treść bywa „na wyczucie” (*vibes*) – chodzi o to, żeby skierować model w stronę naszego sposobu myślenia.
- **Jak poprawiać:** gdy agent zrobi coś nie tak (zły plik, złe narzędzie, push bez zgody, zbyt długa praca), zapytaj go, dlaczego – i popraw plik.

**Przykład: AGENTS.md w stylu T3 Code** (skrócony):

```markdown
# T3 Code
Minimalny interfejs webowy dla agentów kodujących.

## Co jest dla nas ważne
- Open at the core – otwarty rdzeń.
- Performance – nie wprowadzaj zmian, które spowalniają aplikację.
- Remote-ready – każda funkcja działa zdalnie tak samo jak lokalnie.
- Multi-surface – web, desktop i mobile.

## Jak pracujemy
- Measure twice, cut once.
- You ain't gonna need it.

## Słownik
- thread – jedna rozmowa z agentem
```

| Ograniczenie | Rozwiązanie |
|---|---|
| Wszystko w AGENTS.md zajmuje kontekst w każdym wątku, także gdy nie jest potrzebne (np. komendy Tailscale na lokalnej maszynie) | **Skills** (sekcja 6) – wiedza ładowana tylko wtedy, gdy jest potrzebna |

---

## 6. Personalizacja (Wiedza) - Skills

**Skill to instrukcja, którą model wczytuje sam, gdy uzna ją za potrzebną – w kontekście jest tylko jego nazwa i opis.**

- **Skill** – folder z plikiem `SKILL.md` (nazwa, opis, opcjonalne metadane, treść) i opcjonalnymi skryptami.
- **Ładowanie na żądanie** – model widzi tylko nazwę i opis; treść trafia do kontekstu, gdy model (albo użytkownik, np. slash command) ją wywoła.
- **Opis = trigger** – opis nie mówi, *co* skill robi, tylko **kiedy** go użyć. Od niego zależy, czy model go wybierze.
- **Prosta nazwa** – łatwo ją zapamiętać i łatwo ją wybrać modelowi; nazwy skilli łatwo się na siebie nakładają.

**Przykład: skill wywoływany tylko na hasło** (`SKILL.md`):

```markdown
---
name: full-stop
description: Use when Theo asks for "full stop" or explicitly invokes this skill. Not when he asks to stop working.
---
Theo is not watching. Own the work until the PR is ready to merge.
1. Fix, verify, review – loop until it works.
2. Open a PR and monitor it until it is ready.
3. Never merge. Stop and tell Theo it is ready.
```

| Opis | Kiedy model wczyta skill |
|---|---|
| Wąski („Use when Theo asks for full stop”) | Tylko na wyraźne hasło |
| Szeroki („Use whenever an agent drafts, posts or replies to PR comments”) | Sam, gdy pasuje do sytuacji – także w innych skillach |

### Jak pisać skills

**Krótki skill z jasnym celem działa lepiej niż długi i szczegółowy.**

| Zamiast | Lepiej |
|---|---|
| Długi skill z wieloma regułami (szansa, że model wykona wszystkie ≈ 0) | Krótki skill, prosty przepływ 1–2–3–4–5 |
| Jeden skill na wszystko | **Router skill** – krótki skill, który wskazuje inne skille |
| Szczegółowe instrukcje „co robić” | **Zasady** i sposób myślenia, które model dopasuje do sytuacji |
| Dokumentacja narzędzia wklejona do skilla | Informacja, **jak łatwo dotrzeć** do aktualnej dokumentacji |
| Długie opisy stylu | **Semantic anchors** – słowa z bogatymi skojarzeniami (np. „Noir”: cienie, cynizm, moralna niejednoznaczność) |
| Sztywny scenariusz | Skill, w którym model **steruje sobą**: zadaje sobie pytania i odpowiada na nie |

- **Dlaczego długie instrukcje szkodzą:** model je ignoruje lub źle rozumie, traci elastyczność, rozprasza się, a skill trudniej utrzymać i szybciej się dezaktualizuje.
- **Generowanie skilli** – LLM dobrze **formułuje**, ale słabo **kompresuje, uogólnia i upraszcza**. Pierwszą wersję może napisać agent, potem usuń ręcznie zbędny tekst.
- **Meta-skill** – „skill do tworzenia skilli”; agent iteracyjnie kształtuje nowe skille i w ten sposób „się uczy”.
- **Osobiste vs projektowe** – skills osobiste (np. „nie przeszkadzaj, dopóki PR nie jest gotowy”) działają tylko u nas i nie zmieniają pracy zespołu.
- **Bezpieczeństwo** – sprawdź skill przed instalacją: może ukrywać instrukcje przed recenzentem (prompt injection).

> Mniej tekstu, prostsze instrukcje – lepszy skill.

| Ograniczenie | Rozwiązanie |
|---|---|
| Skill tylko mówi, jak działać – sam nie zdobędzie danych ani niczego nie zrobi | **Narzędzia** (sekcja 7) |

---

## 7. Personalizacja (Działanie) - Narzędzia

**Narzędzia pozwalają agentowi samemu zdobyć brakujący kontekst – a wszystko, co zwrócą, staje się częścią kontekstu i wpływa na zachowanie modelu.**

- **Native vs custom** – harness ma kilka narzędzi wbudowanych; własne dodajemy przez **MCP** albo lokalne **CLI**.

1. **Discovery** – agent poznaje dostępne narzędzia.
2. **Request** – model wybiera narzędzie i generuje payload (także kilka narzędzi naraz, równolegle).
3. Harness wykonuje narzędzie.
4. **Response** – wynik wraca do kontekstu; model decyduje, co dalej.

- **Programmatic tool use** – agenci coraz częściej piszą kod, który korzysta z narzędzi lub wprost z API.

| | Wszystkie schematy z góry | Narzędzie do wyszukiwania narzędzi |
|---|---|---|
| W kontekście | Schematy wszystkich narzędzi | 1 narzędzie + krótka instrukcja, jak przeszukać katalog |
| Koszt kontekstu | Wysoki – także gdy narzędzie niepotrzebne | Niski |
| Użycie | Od razu | Dodatkowy krok przed wywołaniem |

### Request

**Schemat pilnuje kształtu wywołania, ale wartości model generuje z kontekstu i wiedzy z wag.**

- Model może się pomylić albo halucynować wartości argumentów.
- **Prompt injection** – model można nakłonić, żeby wyciągnął dane jednym narzędziem i wysłał je innym. Problem wciąż otwarty; wszystkie modele są podatne.

### Response

**Wynik narzędzia to dla modelu zwykły tekst w kontekście – projektuj go tak, jakbyś pisał prompt.**

- **Duży wynik** – harness zapisuje go do pliku, a agent czyta tylko fragment.
- **Hints** – odpowiedź może zawierać nie tylko dane, ale też **podpowiedź, co dalej**, bo to model decyduje, co i jak wywołać.
- **Błędy** – harness nie powinien rzucać wyjątku, tylko oddać szczegóły błędu modelowi; agent może się **naprawić** albo poprosić użytkownika o pomoc.
- **Obrazy** – zrzut ekranu z narzędzia trafia do kontekstu tak samo jak tekst (sekcja 1).

**Przykład: błąd z podpowiedzią w tool response** (format Qwen, ChatML):

```
<|im_start|>user
Dodaj kod rabatowy SAVE10 do koszyka.<|im_end|>
<|im_start|>assistant
<tool_call>
{"name": "read", "arguments": {"path": "cart.js"}}
</tool_call><|im_end|>
<|im_start|>user
<tool_response>
Error: file not found: cart.js
Hint: cart code lives in src/cart/. Use `ls src/cart` to list files.
</tool_response><|im_end|>
<|im_start|>assistant
<tool_call>
{"name": "bash", "arguments": {"command": "ls src/cart"}}
</tool_call><|im_end|>
```

| Ograniczenie | Rozwiązanie |
|---|---|
| Każdy wynik narzędzia zostaje w kontekście głównego wątku i go zapycha | **Subagenty** (sekcja 8) – praca w osobnym kontekście, do głównego wraca tylko wynik |

---

## 8. Personalizacja (Działanie) - Subagenty

**Subagent to z punktu widzenia modelu po prostu narzędzie – wywołuje się go, a jego odpowiedź trafia do kontekstu. Służy głównie do zarządzania kontekstem.**

- **Subagent** – agent uruchomiony przez innego agenta (dynamicznie albo z gotowego szablonu); może mieć inne ustawienia (model, poziom reasoning, narzędzia, uprawnienia).
- **Worker** – też subagent, ale w **osobnym procesie** (jak druga karta Claude Code); agent nadrzędny dostaje powiadomienie o końcu pracy. Może go też uruchomić zdarzenie: harmonogram, webhook.
- **Fork** – subagent startuje z kopią całego bieżącego wątku (historia, wyniki narzędzi) i zleceniem.
- **Fresh** – subagent startuje z nowym, pustym wątkiem; wie tylko to, co agent nadrzędny wpisze do zlecenia.
- **Orkiestracja** – subagentami może sterować człowiek, inny agent albo skrypt.

| | Fork | Fresh |
|---|---|---|
| Kontekst na start | Kopia bieżącego wątku | Nowy wątek, tylko zlecenie |
| Kiedy | Zadanie potrzebuje całej dotychczasowej wiedzy | Zadanie da się opisać krótko; czysty, skupiony kontekst |
| Ryzyko | Duży, zaśmiecony kontekst od startu – słabsza uwaga (sekcja 2) | Missing context, jeśli zlecenie pominie coś ważnego (sekcja 2) |

| | Subagent | Worker |
|---|---|---|
| Gdzie działa | W ramach wywołania narzędzia | W osobnym procesie |
| Kto uruchamia | Agent | Agent albo zdarzenie (harmonogram, webhook) |
| Wynik | Odpowiedź narzędzia w kontekście | Powiadomienie po zakończeniu |

### Skills vs subagenty

**Technicznie podobne – oba to pliki tekstowe (md, toml) pokazane modelowi jako lista nazw i opisów; różnią się wątkiem, w którym działają.**

**Przykład: skill i subagent** (Claude Code):

```markdown
# .claude/skills/commit/SKILL.md
---
name: commit
description: Use when the user asks to commit changes.
---
Write a short commit message in English. Never push.
```

```markdown
# .claude/agents/reviewer.md
---
name: reviewer
description: Use to review changed code before a commit.
tools: Read, Grep
model: haiku
---
Review the diff and list bugs only. Do not edit files.
```

| | Skill (sekcja 6) | Subagent |
|---|---|---|
| Wątek | Ten sam | Osobny |
| Kiedy | Zadanie potrzebuje bieżącego kontekstu | Zadanie można wydzielić; kontekst głównego wątku ma zostać czysty |
| Plik zawiera | Instrukcję | Instrukcję + ustawienia (narzędzia, uprawnienia, model) |

> Najprostszy start: poproś model, żeby sam podzielił zadanie na kroki i rozdał je subagentom.

---

## 9. Samodoskonalenie

**Agent ma dostęp do swoich ustawień i historii rozmów, więc może sam proponować, jak poprawić naszą pracę z nim – my pilnujemy prostoty.**

1. Zauważ niechciane zachowanie (złe narzędzie, zły plik, za długa praca, skill nie działa albo działa za często).
2. Zapytaj agenta: **dlaczego** tak zrobił i **co miał w kontekście**.
3. Popraw źródło: AGENTS.md (sekcja 5), opis lub treść skilla (sekcja 6), odpowiedź narzędzia (sekcja 7).
4. Zautomatyzuj: agent **według harmonogramu** przegląda historię rozmów i proponuje poprawki lub nowe skille.
5. Usuń to, co niepotrzebne – system ma zostać **jak najprostszy**.

- **Self-improving system** – z czasem przechodzi w autonomię: proste mechanizmy, które działają coraz lepiej wraz z lepszymi modelami.
- **AI coraz lepiej zarządza kontekstem** – pozwól agentom wybierać skuteczne sposoby i wspieraj je przy długich zadaniach.
- Strategie zarządzania kontekstem **starzeją się** – bądź gotów wymienić je po kilku miesiącach.

> Agent sam poprawia swoje karteczki – a my pilnujemy, żeby nie było ich za dużo.

---

## 10. Wnioski

| Sekcja | Wniosek |
|---|---|
| 1. Kontekst | Zachowanie agenta wynika z **kontekstu** co najmniej tak samo jak z modelu – a kontekst można po prostu **zobaczyć, pytając agenta**. |
| 2. Kontekst - Ograniczenia | **Informacja w kontekście ≠ informacja użyta** – prompt to nie kompilator. |
| 3. Kontekst - Rozwiązania ograniczeń | **Krótkie wątki** + wiedza zapisana w **kodzie i plikach** (handoff) zamiast długiej historii. |
| 4. Personalizacja harnessu | **Pliki tekstowe** to podstawa personalizacji – agent może je czytać i **sam zmieniać**. |
| 5. Personalizacja (Wiedza) - AGENTS.md | W AGENTS.md tylko to, czego **nie da się zdobyć jedną komendą**, plus **wartości** i **słownik pojęć**. |
| 6. Personalizacja (Wiedza) - Skills | **Opis skilla to trigger**, a **krótki** skill z zasadami działa lepiej niż długi z regułami. |
| 7. Personalizacja (Działanie) - Narzędzia | **Wynik narzędzia to kontekst** – dodawaj **podpowiedzi** i oddawaj **błędy** modelowi. |
| 8. Personalizacja (Działanie) - Subagenty | **Subagent to narzędzie** do zarządzania kontekstem: skill – **ten sam wątek**, subagent – **osobny**. |
| 8. Personalizacja (Działanie) - Subagenty | **Fork** daje subagentowi całą wiedzę wątku, ale i jego bałagan; **fresh** daje czysty kontekst, ale tylko tyle, ile zawiera **zlecenie**. |
| 9. Samodoskonalenie | Pytaj agenta **„dlaczego?”**, poprawiaj źródło i **trzymaj system prosty**. |
| Całość | Nie da się wymusić zachowania modelu – można **zwiększać szansę**, dając mu **właściwy kontekst we właściwym momencie**. |

---

## 11. Pytania

| Sekcja | Pytanie | Krótka odpowiedź |
|---|---|---|
| 1. Kontekst | Co wie model na starcie sesji? | Tylko to, co ma w wagach i w kontekście złożonym przez harness – nic o nas ani projekcie |
| 1. Kontekst | Co harness wkłada do kontekstu poza wiadomością? | Narzędzia, system prompt, AGENTS.md, memory, git status, listy skilli i agentów, przypomnienia, datę |
| 1. Kontekst | Jak sprawdzić, co widzi agent? | Zapytać go, żeby bez uruchamiania narzędzi wypisał bloki kontekstu od góry do dołu |
| 1. Kontekst | Czy obraz to inny rodzaj danych dla agenta? | Nie – to kolejny fragment kontekstu; wystarczy nawet bez tekstu |
| 2. Kontekst - Ograniczenia | Czy instrukcja w kontekście zostanie wykonana? | Nie ma gwarancji – model może ją pominąć albo z czasem zignorować (instruction drift) |
| 2. Kontekst - Ograniczenia | Czym jest silent context loss? | Harness po cichu przycina lub kompresuje kontekst, więc model nie widzi tego, co zakładamy |
| 2. Kontekst - Ograniczenia | Czy context window dotyczy tylko wejścia? | Nie – obejmuje też reasoning, tool calle i odpowiedź modelu |
| 2. Kontekst - Ograniczenia | Dlaczego poprawiony błąd wraca w innym wątku? | Wątki nie dzielą kontekstu; wiedza musi być zapisana w kodzie lub plikach |
| 3. Kontekst - Rozwiązania ograniczeń | Dlaczego krótkie wątki? | Mniej tekstu to lepsza uwaga, mniej kompresji i daleko od limitu okna |
| 3. Kontekst - Rozwiązania ograniczeń | Czym jest handoff? | Plik ze stanem pracy, który nowy wątek czyta zamiast odkrywać kontekst od nowa (≈ 5 000 → 500 tokenów) |
| 4. Personalizacja harnessu | Co można personalizować w harnessie? | AGENTS.md, skills, memory, konfigurację, bazę wiedzy, CLI/MCP, rozszerzenia i hooki |
| 4. Personalizacja harnessu | Czym różnią się skills od subagentów w personalizacji? | Oba konfigurujemy plikami, ale skill daje wiedzę w tym samym wątku, a subagent działa w osobnym |
| 4. Personalizacja harnessu | Co znaczy, że harness jest self-configurable? | Agent ma dostęp do ustawień i dokumentacji harnessu, więc może sam go konfigurować |
| 5. Personalizacja (Wiedza) - AGENTS.md | Co powinno być w AGENTS.md? | Wiedza trudna do zdobycia, wartości projektu, sposób myślenia, słownik pojęć |
| 5. Personalizacja (Wiedza) - AGENTS.md | Czego nie wkładać do AGENTS.md? | Ścieżek do plików i wszystkiego, co agent zdobędzie jedną komendą |
| 5. Personalizacja (Wiedza) - AGENTS.md | Po co słownik pojęć? | Daje wspólną gramatykę – model nie nazywa jednej rzeczy na różne sposoby w różnych wątkach |
| 6. Personalizacja (Wiedza) - Skills | Czym jest skill? | Folder z `SKILL.md` i skryptami; model widzi nazwę i opis, treść wczytuje na żądanie |
| 6. Personalizacja (Wiedza) - Skills | Do czego służy opis skilla? | Mówi modelowi, kiedy użyć skilla – to trigger, a nie opis działania |
| 6. Personalizacja (Wiedza) - Skills | Dlaczego skills powinny być krótkie? | Długie instrukcje są ignorowane, odbierają elastyczność i trudno je utrzymać |
| 6. Personalizacja (Wiedza) - Skills | Czym jest router skill? | Krótki skill, który wskazuje inne skille zamiast zawierać wszystko |
| 6. Personalizacja (Wiedza) - Skills | Czym są semantic anchors? | Słowa z bogatymi skojarzeniami (np. „Noir”), które zastępują długi opis |
| 6. Personalizacja (Wiedza) - Skills | Czy LLM dobrze pisze skills? | Dobrze formułuje, ale słabo kompresuje i upraszcza – wersję od agenta trzeba oczyścić |
| 7. Personalizacja (Działanie) - Narzędzia | Jak agent poznaje narzędzia? | Przez schematy podane z góry albo przez narzędzie do wyszukiwania w katalogu |
| 7. Personalizacja (Działanie) - Narzędzia | Czy schemat narzędzia chroni przed błędem? | Pilnuje kształtu, ale wartości model generuje sam i może je zmyślić |
| 7. Personalizacja (Działanie) - Narzędzia | Jak obsłużyć błąd narzędzia? | Oddać szczegóły błędu modelowi zamiast wyjątku, żeby agent mógł się naprawić |
| 7. Personalizacja (Działanie) - Narzędzia | Po co hinty w odpowiedzi narzędzia? | To model decyduje, co dalej – podpowiedź kieruje go do właściwego kroku |
| 8. Personalizacja (Działanie) - Subagenty | Czym jest subagent dla modelu? | Narzędziem – wywołuje go, a odpowiedź trafia do kontekstu |
| 8. Personalizacja (Działanie) - Subagenty | Czym różni się worker od subagenta? | Działa w osobnym procesie, powiadamia o końcu i może go uruchomić harmonogram lub webhook |
| 8. Personalizacja (Działanie) - Subagenty | Skill czy subagent? | Skill w tym samym wątku, gdy potrzebny jest bieżący kontekst; subagent w osobnym, gdy zadanie da się wydzielić |
| 8. Personalizacja (Działanie) - Subagenty | Czym różni się plik skilla od pliku subagenta? | Oba to pliki tekstowe z nazwą, opisem i instrukcją; plik subagenta zawiera też ustawienia (narzędzia, uprawnienia, model) |
| 8. Personalizacja (Działanie) - Subagenty | Fork czy fresh? | Fork kopiuje bieżący wątek; fresh startuje z samym zleceniem i czystym kontekstem |
| 8. Personalizacja (Działanie) - Subagenty | Jakie ryzyko niosą fork i fresh? | Fork – duży, zaśmiecony kontekst i słabsza uwaga; fresh – brakujący kontekst, jeśli zlecenie pominie coś ważnego |
| 9. Samodoskonalenie | Jak poprawiać pracę z agentem? | Pytać, dlaczego coś zrobił, poprawiać AGENTS.md lub skills i okresowo przeglądać historię |
| 9. Samodoskonalenie | Jaka jest rola człowieka w self-improving system? | Pilnować, żeby system był jak najprostszy |
