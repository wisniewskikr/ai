# S01E03 · Budowanie systemów wiedzy — streszczenie

## 📑 Spis treści

1. [O co chodzi?](#1-o-co-chodzi)
2. [Pliki tekstowe vs. platformy w chmurze](#2-pliki-tekstowe-vs-platformy-w-chmurze)
3. [Więcej niż Markdown](#3-więcej-niż-markdown)
4. [Po co baza wiedzy agentowi?](#4-po-co-baza-wiedzy-agentowi)
5. [Jak agent szuka wiedzy?](#5-jak-agent-szuka-wiedzy)
6. [Jak pomóc agentowi dotrzeć do kontekstu?](#6-jak-pomóc-agentowi-dotrzeć-do-kontekstu)
7. [Niech agent sam zbuduje strukturę](#7-niech-agent-sam-zbuduje-strukturę)
8. [Samozarządzanie](#8-samozarządzanie)
9. [Szerszy kontekst — tablica zadań](#9-szerszy-kontekst--tablica-zadań)
10. [Przykład: osobisty „drugi mózg”](#10-przykład-osobisty-drugi-mózg)
11. [Wnioski](#11-wnioski)

---

> 🎯 **Cel lekcji:** zrozumieć, jak budować bazę wiedzy, której **głównym użytkownikiem i opiekunem jest agent**, a nie człowiek.
>
> 📚 **Analogia:** kiedyś biblioteka była dla ludzi — półki, katalogi, ładne okładki. Teraz głównym czytelnikiem jest robot-bibliotekarz. On czyta szybciej, ale potrzebuje innego układu półek.

---

## 1. O co chodzi?

Bazy wiedzy to nic nowego. Nowe jest to, że **agenci stają się ich głównymi użytkownikami** (i opiekunami).

| Temat | Co omawiamy |
|---|---|
| Formaty | Markdown, HTML, mdx, svx, komponenty, artefakty, skille |
| Bazy „agent-first” | agenci vs. ludzie, mosty do starych narzędzi, LLM buduje i utrzymuje |
| Wyszukiwanie | grep, wyszukiwanie semantyczne, podobieństwo vs. trafność, wyszukiwanie hybrydowe |
| Docieranie do kontekstu | kontekst globalny, projektowy, metadane |
| Samozarządzanie | jedna skrzynka wejściowa, harmonogramy, zdarzenia, tablice |

**Problem:** Google Drive czy Notion są świetne dla ludzi, ale agentowi trudno w nich **czytać** i **pisać**. Czasem nie zobaczy nawet obrazka.

---

## 2. Pliki tekstowe vs. platformy w chmurze

LLM-y „mówią” tekstem, więc **Markdown i HTML** stały się bardzo popularne.

| | Agenci 🤖 | Ludzie 🧑 |
|---|---|---|
| Dostęp i edycja plików | ✅ łatwo | ✅ |
| Wyszukiwanie i nawigacja | ✅ łatwo | 😐 |
| Zamiana Markdown → strona (Astro, Next) | ✅ łatwo | — |
| Czytanie HTML | ✅ | ❌ trudne |
| Współpraca na żywo | — | ❌ brak domyślnie |
| Udostępnianie i uprawnienia | — | ❌ brak domyślnie |

### Dlaczego baza „dla agentów”?

- Agentów używa coraz więcej osób, też nietechnicznych
- Wiedza trafia do ludzi **przez agenta**, nie bezpośrednio
- Dokumenty czytają i zarządzają nimi głównie agenci
- Agent przetworzy dużo dokumentów naraz
- Często nie potrzebujemy dokumentu — tylko **wyniku**

➡️ **Wniosek:** rdzeń = baza wiedzy dla agenta (Markdown/HTML). Google Drive i Notion = tylko **mosty** dla ludzi.

🏠 **Analogia:** kuchnia restauracji (rdzeń) jest urządzona dla kucharza. Sala dla gości (mosty) — dla ludzi.

### Lekcje z wiki Andreja Karpathy'ego

| # | Lekcja |
|---|---|
| 1 | **LLM buduje wiki**, nie człowiek |
| 2 | Surowa treść — dla AI. Ładna treść — dla Ciebie |
| 3 | Obsidian służy głównie do **czytania** |
| 4 | Mała baza (~100 artykułów) nie potrzebuje wyszukiwarki — wystarczą indeksy i streszczenia |
| 5 | 🔴 LLM **utrzymuje** bazę: naprawia niespójności, uzupełnia braki, proponuje nowe artykuły — to największa zmiana od czasów „przed AI” |

---

## 3. Więcej niż Markdown

**mdx** i **svx** = Markdown + komponenty. Źródło zostaje proste, a po wyrenderowaniu mamy np. działającą checklistę.

| Cecha | Zysk |
|---|---|
| Czytelny plik | agent łatwo go edytuje |
| Interaktywność | człowiek klika, rozwija szczegóły |
| Stan | np. „2 z 4 zrobione” |
| Komponenty wielokrotnego użytku | jeden komponent w wielu plikach |

🧱 **Analogia:** klocki LEGO — w pliku piszesz „tu wstaw checklistę”, a klocek sam się składa.

### Skille i artefakty jako część bazy

- Skill `explainer` to nie tylko prompt — ma też **szablony i logikę**, więc wizualizacje są **spójne**
- Działa najlepiej z najlepszymi (SOTA) modelami
- Inspiracja do innych skilli: wyjaśnianie issue, raporty aktywności, decyzje architektoniczne

| Część bazy | Rola |
|---|---|
| Struktura i treść (MD, HTML, svx) | daje modelowi **wiedzę** |
| Szablony i wskazówki (skille, artefakty) | **kierują** modelem, ale go nie ograniczają |

---

## 4. Po co baza wiedzy agentowi?

Kiedyś: organizacja dokumentów, onboarding, komunikacja. Ludzie znali szerszy kontekst.

Agent czyta szybciej, ale łatwo się myli. Przykład:

1. Pytanie: „Jak robimy deploy?”
2. Agent znajduje notatki, które **wyglądają na kompletne**
3. **Nigdy nie trafia** do notatki z szerszym kontekstem („Dlaczego tak deployujemy”, „Polityka rollbacku”)
4. Efekt: **halucynacja** albo źle zrobiona funkcja

🔦 **Analogia:** szukanie w ciemnym pokoju z latarką — widzisz tylko to, na co świecisz.

> 💡 Praca z LLM to nie pewność, tylko **zwiększanie szans** na dobry wynik.

---

## 5. Jak agent szuka wiedzy?

Agent szuka w pętli (**agentic logic**) — może próbować wiele razy.

| Metoda | Jak działa | ✅ Plusy | ❌ Minusy |
|---|---|---|---|
| **bash / grep / ripgrep** | dopasowuje słowa kluczowe, szuka dalej, aż uzna, że wystarczy | świetne dla tekstu i kodu | prawie bezużyteczne dla obrazów i PDF |
| **Wyszukiwanie semantyczne** | model embeddingów zamienia znaczenie tekstu na wektor liczb; porównujemy wektory | znajdzie to, czego regex nie złapie; obrazy (multimodal) | trzeba indeksować; limit długości (dzielenie na fragmenty); data odcięcia wiedzy |
| **Modele decyzyjne** (np. jevgrep) | szybki model wskazuje właściwe foldery/pliki/funkcje | mniej eksploracji = niższe koszty | dodatkowy element |
| **Hybrydowe** | wzorce + podobieństwo razem | często najlepsze wyniki | najbardziej złożone |

### ⚠️ Podobne ≠ trafne

Embeddingi szukają tego, co **podobne w znaczeniu**, a nie tego, co **potrzebne**.

| Dokument (pytanie: „Jak zrobić deploy na produkcję?”) | Podobny? | Trafny? |
|---|---|---|
| „Deployment: historia naszych narzędzi” | 🟢 bardzo | ❌ |
| Runbook deployu na produkcję | 🟢 | ✅ |
| Notatka o przeprojektowaniu dashboardu deployu | 🟢 | ❌ |
| „Serwery produkcyjne wymagają VPN” | 🔴 mało | ✅ |

🍎 **Analogia:** pytasz o jabłka do szarlotki, a dostajesz książkę o historii sadów — temat podobny, ale nie pomoże upiec ciasta.

---

## 6. Jak pomóc agentowi dotrzeć do kontekstu?

Trzy warstwy — od ogółu do szczegółu:

| Warstwa | Co zawiera |
|---|---|
| 🌍 **Kontekst globalny** | system, środowisko, istniejące projekty, zainstalowane narzędzia, ogólne zasady |
| 📁 **Kontekst projektu** | wizja, mapa funkcji, styleguide, aspekty biznesowe |
| 🏷️ **Metadane** | kategorie, tagi, źródła, linki między notatkami |

💡 Warto zerknąć na **Open Knowledge Format** — to nadal Markdown z YAML, ale mówi agentowi:
- **skąd** pochodzi notatka
- **na ile** można jej ufać
- czy jest **aktualna**

🗺️ **Analogia:** mapa świata → mapa miasta → wizytówka na drzwiach.

---

## 7. Niech agent sam zbuduje strukturę

Chcemy sami układać foldery i tagi, żeby „mieć kontrolę”. Ale to **agenci będą zarządzać dokumentami** — więc niech **sami** wymyślą strukturę. My tylko kierujemy.

- Możemy użyć nawet nieznanych narzędzi (np. **neo4j**) — AI nas wdroży
- Modele znają dziesiątki technik (Zettelkasten, PARA, Diátaxis, ADR, Docs-as-code, llms.txt…)
- Model „myśli, pisząc” → **wiedza musi pojawić się w rozmowie** (podajemy ją albo prosimy model, by ją przywołał)

> 🎯 Nie budujemy systemu sami — **kształtujemy środowisko**, w którym agent go zbuduje.

### Skill `knowledge` — 6 kroków

| # | Krok | Kto |
|---|---|---|
| 1 | **Określ cel** — kilka pytań o bazę | 🧑 z nami |
| 2 | **Zbuduj kontekst** — najlepsze metody i zasady | 🤖 |
| 3 | **Zainicjuj strukturę** — wypróbuj kilka podejść | 🤖 |
| 4 | **Zainicjuj szablony** — ogólne wskazówki, nie sztywne sekcje | 🤖 |
| 5 | **Napisz instrukcje** — skill do pracy z bazą | 🤖 |
| 6 | **Przetestuj** — subagenci / osobne sesje, poprawki | 🧑 z nami |

- Kroki 2–6 mogą iść **automatycznie**, aż model uzna, że jest gotowe
- Proces może **powtarzać się**, gdy baza rośnie
- Model musi wiedzieć, co znaczy **„wystarczająco dobrze”**

🌱 **Analogia:** ogrodnik nie projektuje każdego liścia — daje roślinie dobrą glebę i podcina, gdy trzeba.

---

## 8. Samozarządzanie

Podłączenie bazy do Claude Code to magia, ale jest **reaktywne** — musimy brać udział. Programiści mogą to zrobić **proaktywnym**.

### 📥 Jedno wejście

Wszystko (audio, tekst, zdarzenia…) trafia do **jednej skrzynki (inbox)**. Agent stamtąd bierze, porządkuje i łączy z istniejącą wiedzą.

📮 **Analogia:** jedna skrzynka pocztowa zamiast listów rzucanych przez okno.

### ⏰ Harmonogramy

| Rutyna | Kiedy (przykład) |
|---|---|
| Scalanie duplikatów | codziennie |
| Naprawa struktury | co tydzień |
| Uzupełnianie dokumentów | co tydzień |

Wyzwanie: rutyny mają być **w pełni autonomiczne**, ale **proste** — żeby nie psuć bazy i nie gubić informacji.

### ⚡ Zdarzenia

Człowiek nie musi być jedynym źródłem wiedzy. Webhooki z usług, urządzeń i lokalnych demonów:

| Źródło | Co trafia do bazy |
|---|---|
| **PR-y** | po merge'u agent decyduje, co warto zapisać |
| **Repozytoria** | nowe repo = nowy projekt w kontekście globalnym |
| **Zgłoszenia supportu** | ogólny stan produktu i o czym mówią użytkownicy |
| **Issues** | destylat, nie kopia — wzbogaca kontekst projektu |
| **Oznaczone maile i wiadomości** | tylko te z etykietą, jako dokumenty |
| **Read Later** | zakładki i zaznaczenia, **połączone** z istniejącą wiedzą |

---

## 9. Szerszy kontekst — tablica zadań

Agent widzi tylko to, co **teraz** jest w bazie. Nie wie, **co było wcześniej** ani **co będzie dalej**.

Rozwiązanie: folder `tasks/` jak tablica Kanban.

| Zrobione | W toku | Planowane | Zarchiwizowane |
|---|---|---|---|
| Inbox jako jedno wejście | 🔴 Indeksowanie semantyczne (zadanie agenta) | Wyszukiwanie hybrydowe | Most do Notion |

**Przykład:** agent robi „eksport danych” i widzi, że w planach jest „Storage na S3” → od razu projektuje eksport przez interfejs storage.

🧭 **Analogia:** kierowca, który zna nie tylko najbliższy zakręt, ale całą trasę.

Pomaga przy implementacji, a także przy pisaniu wymagań i **ADR-ów**.

---

## 10. Przykład: osobisty „drugi mózg”

Baza tylko dla nas i naszego „osobistego agenta AGI”.

### Zasady

| Zasada | Co znaczy |
|---|---|
| **Dostępność** | baza zdalna — agent dosięga z chmury, komputera, telefonu, zegarka (sync np. `mutagen sync`) |
| **Źródło prawdy** | baza jest źródłem prawdy dla swoich notatek, bez dwukierunkowej synchronizacji; dane z zewnętrznych usług zostają tam, a baza ma tylko **wskaźniki** |
| **Samorozwój** | rośnie prawie sama; kontakt z nami tylko **przez agenta** |
| **Prostota** | nie budować osobnego systemu — polegać na rosnących możliwościach agentów |

### Wygenerowany skill `personal-agi-kb`

| Poziom | Zawartość | Jak używany |
|---|---|---|
| `SKILL.md` | cel bazy, zasady z uzasadnieniem, która notatka do czego | zawsze czytany |
| Notatki referencyjne | mapa, przepływ, przyjmowanie, wyszukiwanie, utrzymanie, log struktury | otwierane, gdy trzeba |
| Skrypty | `check.ts` (linki, pola), `kb.ts` (ID, zapytania, strony) | uruchamiane, nie czytane |

> 💡 **Ocena w notatkach, mechanika w skryptach.**

### Struktura bazy

```
inbox  ──►  [ Kontekst: system · narzędzia · projekty ]
            [ Praca: planned → active → review → done ]
            [ Wiedza: czego się nauczyliśmy ]
```

Struktura będzie się **zmieniać** wraz z nowymi informacjami — nie tylko rosnąć, ale dopasowywać się do nas.

---

## 11. Wnioski

- 🏁 Bazy wiedzy, nawet z AI: **łatwo zacząć, trudno opanować** — ale warto zacząć
- 🤖 Budujemy bazę **dla agenta**; ludzie dostają mosty
- 🔍 Wyszukiwanie to nie wszystko — liczy się **kontekst globalny, projektowy i metadane**
- 🌱 Agent sam **buduje i utrzymuje** strukturę; my kształtujemy środowisko
- ⚡ Baza powinna żyć sama: **inbox, harmonogramy, zdarzenia**
- 🧠 Najlepszy start: **osobista baza wiedzy** — nauczy nas możliwości i pokaże, które aplikacje nie są jeszcze gotowe na erę AI
