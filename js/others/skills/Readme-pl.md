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

## Podsumowanie w 3 zdaniach

1. **Prompt systemowy** = ciągłe tło — jak charakter człowieka.
2. **Skill** = konkretna umiejętność — jak przepis wyciągnięty z szuflady na żądanie.
3. Razem dają AI zarówno **osobowość**, jak i **specjalistyczne zdolności**.
