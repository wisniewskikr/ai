Claude Code to Twój osobisty **agent programowania**, który działa bezpośrednio w terminalu. Możesz o nim myśleć jak o **doświadczonym mechaniku (Agent)**, który nie tylko ma ogromną wiedzę **(Model)**, ale też własny zestaw kluczy i dostęp do podnośnika **(Harness)**, by realnie naprawić Twój samochód (kod).

### Fundamenty Claude Code

| Element | Czym jest? | Co robi? |
| :--- | :--- | :--- |
| **Model** | Mózg (np. Sonnet, Opus) | Myśli i generuje rozwiązania. |
| **Harness** | Układ nerwowy i ręce | Łączy model z Twoimi plikami, terminalem i siecią. |
| **Agent** | Cała postać | Samodzielnie wykonuje zadania, szuka plików i poprawia błędy. |

### Bezpieczeństwo i Kontrola
Zanim dasz Agentowi "klucze do mieszkania", zadbaj o zasady współpracy:

*   **Uprawnienia:** Zawsze kontroluj, kiedy narzędzie chce edytować pliki lub łączyć się z siecią.
*   **Tryb bez pytań:** Używaj go tylko w kontrolowanych testach, nigdy jako domyślny sposób pracy na ważnym kodzie.
*   **Komendy sterujące:** Naucz się poleceń do podglądu zmian, czyszczenia sesji i kontroli kosztów – to Twoje hamulce bezpieczeństwa.

### Pamięć Projektu
Aby Claude Code nie czuł się w Twoim projekcie jak turysta, używaj standardowych plików konfiguracyjnych:

*   **`CLAUDE.md` / Reguły projektu:** Stałe instrukcje, które Agent czyta na starcie każdej sesji.
*   **`AGENTS.md`:** Standardowy dokument ułatwiający "onboarding" Agenta w nowym repozytorium.
*   **`.agents/skills`:** Folder z nowymi umiejętnościami i wiedzą specjalistyczną dla Agenta.

### Na co uważać? (Koszty i Prywatność)
*   **Budżet:** Agent bez kontroli jest jak pracownik na stawce godzinowej bez limitu – może być bardzo skuteczny, ale i bardzo drogi. Sprawdź, czy płacisz abonament, czy za zużycie tokenów.
*   **Prywatność:** Upewnij się, czy Twój kod nie jest wykorzystywany do trenowania przyszłych modeli AI.

Jeśli szukasz alternatyw, rozważ **Codex** (modele GPT) lub ekonomiczny **OpenCode** połączony z otwartymi modelami.

Przydatne komendy Claud Code:
/help
/model
/context
/diff
/clear
/compact