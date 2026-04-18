# Skille w AI — czym są i jak działają?

---

## Wyobraź sobie...

Masz asystenta AI — jak Claude. Normalnie odpowiada na pytania i pomaga pisać kod.

Ale co, jeśli chcesz, żeby **umiał robić coś specjalnego** — np. zawsze commitował kod w określony sposób albo recenzował PR-y według Twoich zasad?

Tu właśnie wchodzą **skille**.

---

## Co to jest skill?

> Skill = gotowy "przepis" na konkretne zadanie, który AI może wywołać.

Analogia: wyobraź sobie kucharza (AI). Może gotować wszystko z głowy — ale jeśli dasz mu **przepis na bigos** (skill), to za każdym razem zrobi go tak samo, zgodnie z Twoimi oczekiwaniami.

Skill to plik Markdown z instrukcją, który AI wywołuje, gdy rozpozna odpowiednie życzenie użytkownika.

---

## Skill vs Prompt systemowy — jaka różnica?

| Cecha | Prompt systemowy | Skill |
|---|---|---|
| **Kiedy działa?** | Zawsze, przez cały czas | Tylko gdy zostanie wywołany |
| **Co opisuje?** | Ogólne zachowanie AI | Jedno konkretne zadanie |
| **Analogia** | Osobowość kucharza | Przepis na konkretne danie |
| **Przykład** | "Bądź zwięzły i pomocny" | "Zrób commit wg tych zasad" |
| **Zasięg** | Globalny | Lokalny / na żądanie |

---

## Jak wygląda skill? (prosta struktura)

```markdown
---
name: commit
description: Tworzy git commit według ustalonych zasad
allowed-tools: Bash, Read
---

Stwórz commit z wiadomością zaczynającą się od czasownika...
(reszta instrukcji)
```

- `name` — jak się woła ten skill (np. `/commit`)
- `description` — kiedy AI ma go użyć
- `allowed-tools` — jakich narzędzi może użyć
- Treść — co dokładnie ma zrobić

---

## Gdzie żyją skille?

```
~/.claude/skills/       ← skille globalne (działają wszędzie)
.claude/skills/         ← skille projektowe (tylko w tym repo)
```

---

## Przykłady skillli

| Skill | Co robi |
|---|---|
| `/commit` | Tworzy git commit wg zasad |
| `/review-pr` | Recenzuje Pull Request |
| `/simplify` | Upraszcza zmieniony kod |
| `/loop` | Uruchamia zadanie cyklicznie |

---

## Czy skille są częścią modelu AI?

**Nie.** Model (np. Claude Sonnet) nic o skillach nie wie.

Analogia: model to **silnik samochodu** — nie wie, dokąd jedziesz. Agent (Claude Code) to **nawigacja** — ona decyduje, jaką trasę wybrać i kiedy użyć skilla.

```
Ty → /commit → Claude Code (czyta skill) → gotowy prompt → Model AI
                     ↑
              skill działa tutaj
              model widzi tylko tekst
```

### Skille to funkcja agenta, nie modelu

| | Model AI | Agent (np. Claude Code) |
|---|---|---|
| **Przykład** | Claude Sonnet, GPT-4 | Claude Code, Cursor, Copilot |
| **Zna skille?** | Nie | Tak |
| **Analogia** | Silnik | Kierowca z nawigacją |

### Inne agenty mają podobne mechanizmy

| Agent | Odpowiednik skilla |
|---|---|
| **Claude Code** | Skills (`.claude/skills/`) |
| **Cursor** | Rules (`.cursorrules`) |
| **GitHub Copilot** | Custom Instructions |
| **OpenAI GPTs** | System prompt + Actions |

---

## Zasady pisania jako skill

Zestaw zasad pisania dokumentacji (np. "pisz jak dla 5-latka") to **idealny kandydat na skill** — używasz ich wielokrotnie, w różnych projektach.

### Przykładowy plik skilla

```markdown
---
name: wisniewk-doc-rules
description: Zasady tworzenia dokumentacji — używaj przy pisaniu każdego pliku .md
---

Tworząc dokumentację, zawsze stosuj poniższe zasady:

- Pisz jak dla 5-latka — prosto i przyjaźnie
- Mniej znaczy lepiej — unikaj zbędnych słów
- Używaj tabel i punktów wszędzie tam, gdzie to możliwe
- Stosuj analogie, gdzie tylko możliwe
```

### Lokalnie czy globalnie?

| | Lokalnie | Globalnie |
|---|---|---|
| **Ścieżka** | `.claude/skills/wisniewk-doc-rules.md` | `~/.claude/skills/wisniewk-doc-rules.md` |
| **Działa w** | Tylko ten projekt | Każdy projekt na tym komputerze |
| **Kiedy użyć** | Zasady specyficzne dla repo | Twój osobisty styl pisania |

### Jak wywołać?

```
/wisniewk-doc-rules Stwórz Readme.md dla tego projektu
```

---

## Podsumowanie w 3 zdaniach

1. **Prompt systemowy** = ciągłe tło — jak charakter człowieka.
2. **Skill** = konkretna umiejętność — jak przepis wyciągnięty z szuflady na żądanie.
3. **Model AI** to tylko silnik — to agent decyduje, kiedy i jaki skill uruchomić.
