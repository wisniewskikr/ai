# Kompresja kontekstu w modelach językowych (LLM)

Wyobraź sobie, że model językowy to człowiek z bardzo małą **kartką papieru** — może zapamiętać tylko tyle, ile się na niej zmieści. Kompresja kontekstu to sposób, żeby na tej kartce zmieściło się więcej ważnych rzeczy.

---

## Podstawowe typy

### 1. Podsumowanie (Summarization)
**Analogia:** Czytasz grubą książkę, ale na kartce możesz zapisać tylko najważniejsze punkty, nie każde zdanie.

Model "czyta" starą część rozmowy i zastępuje ją krótkim podsumowaniem. Szczegóły giną, ale sens zostaje.

---

### 2. Wyrzucanie (Truncation)
**Analogia:** Szuflada jest pełna — wyrzucasz najstarsze rysunki, żeby zmieścić nowe.

Najstarsze wiadomości są po prostu usuwane. Proste, ale traci się historię.

---

### 3. Wybieranie ważnych fragmentów (RAG / Retrieval)
**Analogia:** Masz wielki segregator z notatkami, ale na biurko kładziesz tylko te kartki, które są potrzebne DO TEGO zadania.

Zamiast wciskać wszystko, model "sięga" do zewnętrznej bazy i pobiera tylko to, co jest teraz relevantne.

---

### 4. Kompresja tokenów (Token Compression / KV Cache Merging)
**Analogia:** Zamiast pisać "Ala ma kota i Ala lubi kota i kot jest Ali" — piszesz po prostu "Ala ma kota, który jej się podoba."

Model łączy podobne, powtarzające się fragmenty w jeden, krótszy zapis.

---

### 5. Hierarchiczna pamięć (Memory Tiers)
**Analogia:** Masz pamięć krótkotrwałą (co jadłeś dziś rano), długotrwałą (że lubisz pizzę) i notatnik (gdzie zapisujesz ważne rzeczy).

Różne informacje trafiają do różnych "miejsc" — ostatnia rozmowa jest blisko, stare fakty gdzieś dalej, a kluczowe rzeczy są zapisane osobno.

---

## Podsumowanie

| Typ | Co robi |
|-----|---------|
| Podsumowanie | Skraca stare fragmenty |
| Truncation | Usuwa najstarsze fragmenty |
| RAG | Dobiera tylko potrzebne fragmenty |
| Kompresja tokenów | Scala powtórzenia |
| Hierarchiczna pamięć | Sortuje info według ważności |

Każda metoda to kompromis: **szybkość vs. dokładność vs. koszt**.
