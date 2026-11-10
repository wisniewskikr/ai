# S03E02 — nothing ships unmarked — log

## 2026-11-10 start-challenge
- challengeId: c0000000-0000-4000-8000-0000005e03e2
- session: v1.eyJ…(masked; full value in s03e02-work/session.txt, git-ignored), expires 2026-11-11T11:09:34Z
- repo: https://hq.mega.dev/media/nothing-ships-unmarked/sched-prod-3e6e841d.zip
- api: https://hq.mega.dev/challenges/nothing-ships-unmarked/api
- ask: triage every request into tracker; each open issue labeled agent-ready or needs-human. README names issue file format.
- skill: own skill named `triage`; send its text with tracker. check-lane {need: skill-wiring}.
- submit: claim-challenge answer {session, tracker:{kind:"md",files:[{path,text}]} | {kind:"gh",ghJson}, skill:{name,path,text}}; ≤256 KB.
- rook: "#4471 shipped itself at 04:04. nobody marked it. this week nothing ships unmarked."
- run 5: desk 2 (IN-6090, IN-7446), chat 2 (IN-2382, IN-8449), mail 1 (IN-5303)
- run 6: chat 1 (IN-6670 withdraws IN-5662)
- runs 7-10: 0 new
- reverted SCHED-4471 to done after IN-7446 ("filed before last week's date fix") — had reopened it as needs-human on Rook's hint
- check.mjs caught leftover raw IN-6410 / IN-5408 after merging/splitting

## claim-challenge (receipts {}, answer: session masked, tracker md 34 files, skill .agents/skills/triage/SKILL.md) ~31.8 KB
- status: solved, solvedAt 2026-11-10T11:22:10Z
- stats: 22 requests in → 19 issues carry them · 6 merged into another issue · closed: 2 obsolete, 1 contradicts-spec, 1 not-planned · open: 21 agent-ready, 3 needs-human.
- note (rook): "the ones you marked human are questions. ask carries them now."

## Podsumowanie (debrief)
- Wynik: rozwiązane za pierwszym podejściem (2026-11-10 11:22 UTC). 22 prośby → 19 zgłoszeń; 6 dołączonych do istniejących; zamknięte: 2 obsolete, 1 contradicts-spec, 1 not-planned; otwarte: 21 agent-ready, 3 needs-human.
- A request is not an issue: duplikaty połączone (np. 15-min sloty), zgłoszenie z dwoma problemami (IN-5408) rozdzielone na dwa.
- Loud is not right: „my call, ship it” (usunięcie kolumny notes z CSV) zamknięte jako sprzeczne z PRD-3.
- The inbox keeps going: 11 próśb przyszło po pierwszym przejściu; IN-6670 wycofało zmianę nazwy na „class”.
- Someone relies on it: daty dd/mm w eksporcie (klient polega na mm/dd), skrócenie numerów rezerwacji, kasowanie logu audytowego → needs-human (AUT-2).
- Not everything is a question: 21 zgłoszeń agent-ready, każde cytuje linię AUT-1.
- Urgent is not first: tryb wysokiego kontrastu blocked-by SCHED-4412 (migracja kolorów do tokenów).
- Snagi: SCHED-4471 najpierw ponownie otwarte na podstawie wskazówki z fabuły, cofnięte po IN-7446 (decydująca decyzja); skrypt check.mjs wykrył dwa pozostawione surowe pliki.
- Na przyszłość: przed zmianą statusu zgłoszenia z backlogu szukaj prośby, która to potwierdza; uruchamiaj skrypt sprawdzający po każdym łączeniu.
- Artefakt w decku: „ask” (skill do wywiadów i dowodów), niezainstalowany.
- Debrief: https://hq.mega.dev/challenges/nothing-ships-unmarked#debrief
