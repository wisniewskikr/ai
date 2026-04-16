# Baza Wiedzy w AI — Prosty Przewodnik

## Czym jest baza wiedzy?

Wyobraź sobie, że masz **zeszyt z notatkami**. Zapisujesz w nim wszystko, co ważne — przepisy, telefony do znajomych, ważne daty. Kiedy czegoś nie pamiętasz, otwierasz zeszyt i szukasz odpowiedzi.

**Baza wiedzy to właśnie taki zeszyt dla modelu AI.** Model nie musi "pamiętać" wszystkiego na pamięć — może zajrzeć do bazy i znaleźć potrzebne informacje.

> Model AI bez bazy wiedzy wie tylko tyle, czego go nauczono podczas treningu. Z bazą wiedzy — może wiedzieć znacznie więcej i być na bieżąco.

---

## Różnica między bazą wiedzy a RAG

| | Baza wiedzy | RAG (Retrieval-Augmented Generation) |
|---|---|---|
| **Co to jest?** | Miejsce przechowywania informacji | Jeden ze sposobów pobierania informacji z bazy |
| **Analogia** | Biblioteka z książkami | Bibliotekarz, który szuka i przynosi Ci właściwą książkę |
| **Rola** | Magazyn danych | Semantyczne wyszukiwanie + generowanie odpowiedzi |
| **Zależność** | Może istnieć bez RAG | Potrzebuje bazy, żeby działać |

**Krótko:** Baza wiedzy to **biblioteka**, a RAG to **jeden ze sposobów szukania w niej książek** — ale nie jedyny.

---

## Jak AI może dostać się do bazy wiedzy?

RAG to tylko jedna z opcji. Są cztery sposoby:

| Sposób | Jak działa | Kiedy używać |
|---|---|---|
| **RAG** | System automatycznie szuka semantycznie podobnych fragmentów przed każdą odpowiedzią | Duże bazy, pytania ogólne |
| **Narzędzia (Tools)** | Model sam decyduje kiedy i co zapytać — wywołuje funkcję/API (`search_db(...)`, `SELECT ...`) | Gdy potrzebna precyzyjna odpowiedź na konkretne pytanie |
| **Pełny kontekst** | Cała baza wrzucona do okna kontekstu modelu (tzw. system prompt) | Małe bazy, do kilkudziesięciu stron tekstu |
| **Fine-tuning** | Wiedza "wgrana" na stałe w wagi modelu podczas dodatkowego treningu | Stała, rzadko zmieniająca się wiedza dziedzinowa |

### Kluczowa różnica: RAG vs Narzędzia

```
RAG:
  każde zapytanie → automatyczne wyszukiwanie → trafne fragmenty → odpowiedź

Narzędzia:
  zapytanie → model myśli → sam decyduje czy i co wyszukać → wywołuje funkcję → odpowiedź
```

- **RAG** — zawsze szuka, zanim odpowie (automatycznie)
- **Narzędzia** — model sam ocenia, czy w ogóle trzeba szukać, i pyta o konkret

---

## Rodzaje baz wiedzy

### Według formatu danych

| Rodzaj | Co przechowuje | Przykład |
|---|---|---|
| **Tekstowa** | Dokumenty, artykuły, FAQ | Instrukcje obsługi, Wikipedia |
| **Strukturalna** | Tabele, dane w kolumnach | Baza produktów, cenniki |
| **Wektorowa** | Znaczenie tekstu jako liczby | Embeddingi zdań i dokumentów |
| **Grafowa** | Powiązania między rzeczami | "Paryż jest stolicą Francji" |
| **Multimodalna** | Tekst + obrazy + audio | Dokumentacja ze zdjęciami |

### Według dostępu

- **Prywatna** — tylko dla Twojej firmy/aplikacji
- **Publiczna** — dostępna dla wszystkich (np. Wikipedia)
- **Hybrydowa** — część publiczna, część prywatna

---

## Architektury baz wiedzy

### 1. Flat (płaska)

```
[Dokument 1] [Dokument 2] [Dokument 3] ...
```

- Wszystkie dokumenty na jednym poziomie
- Proste, ale wolne przy duzej ilości danych
- Dobre dla małych zbiorów

---

### 2. Hierarchiczna

```
Kategoria A
  ├── Podkategoria A1
  │     ├── Dokument 1
  │     └── Dokument 2
  └── Podkategoria A2
        └── Dokument 3
```

- Dane ułożone jak drzewo
- Łatwa nawigacja
- Dobre dla dokumentacji z działami i poddziałami

---

### 3. Wektorowa (Vector Store)

```
Tekst → [Model Embeddingów] → [0.12, 0.87, 0.34, ...] → Baza wektorów
```

- Zamienia tekst na liczby (wektory)
- Szuka dokumentów **podobnych znaczeniowo**, nie tylko słownie
- Serce większości nowoczesnych systemów RAG

| Popularne rozwiązania | Opis |
|---|---|
| **Pinecone** | Chmurowa baza wektorów |
| **Chroma** | Lokalna, łatwa w użyciu |
| **Weaviate** | Open-source, bogaty w funkcje |
| **pgvector** | Wektory w PostgreSQL |

---

### 4. Grafowa (Knowledge Graph)

```
[Paryż] --jest stolicą--> [Francja]
[Francja] --należy do--> [Unia Europejska]
[Paryż] --leży nad--> [Sekwana]
```

- Przechowuje **relacje** między pojęciami
- Świetna do odpowiadania na złożone pytania
- Używana np. w Google Knowledge Graph

---

### 5. Hybrydowa

Łączy kilka architektur naraz:

```
Zapytanie użytkownika
        ↓
  ┌─────┴─────┐
  ↓           ↓
Wyszukiwanie  Wyszukiwanie
wektorowe     pełnotekstowe
  └─────┬─────┘
        ↓
   Połączone wyniki
        ↓
   Odpowiedź AI
```

- Najlepsza dokładność
- Bardziej złożona w budowie
- Standard w profesjonalnych aplikacjach

---

## Podsumowanie

| Temat | Skrót myślowy |
|---|---|
| Baza wiedzy | Zeszyt z notatkami dla AI |
| RAG | Mechanizm szukania w tym zeszycie |
| Baza płaska | Pudełko na kartkach |
| Baza hierarchiczna | Segregator z działami |
| Baza wektorowa | Szukanie po znaczeniu, nie słowach |
| Baza grafowa | Mapa powiązań między rzeczami |
| Baza hybrydowa | Wszystko naraz = najlepsze wyniki |
