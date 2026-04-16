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

## Chunking i Embeddingi — fundamenty bazy wektorowej

Zanim dokument trafi do bazy wiedzy, przechodzi przez dwa kroki. Bez nich baza wektorowa nie istnieje.

### Krok 1 — Chunking (cięcie na kawałki)

Wyobraź sobie, że masz grubą książkę. Nie wrzucasz jej do bazy w całości — tną ją na **małe karteczki**, bo:
- model AI ma ograniczoną pamięć (okno kontekstu)
- łatwiej znaleźć konkretny fragment niż przeszukiwać całą książkę

```
[Cały dokument PDF]
        ↓
  [fragment 1]  [fragment 2]  [fragment 3]  [fragment 4] ...
  (ok. 200-500 słów każdy)
```

| Strategia cięcia | Jak działa | Kiedy używać |
|---|---|---|
| **Stały rozmiar** | Co N znaków/słów | Proste, szybkie w implementacji |
| **Po zdaniach/akapitach** | Respektuje strukturę tekstu | Dokumenty narracyjne |
| **Rekurencyjna** | Próbuje ciąć po nagłówkach, potem akapitach, potem zdaniach | Dokumentacja techniczna |
| **Semantyczna** | Tnie tam, gdzie zmienia się temat | Najlepsza jakość, najdroższa |

> Zły chunking = złe wyniki RAG, nawet jeśli reszta systemu jest idealna.

---

### Krok 2 — Embeddingi (zamiana tekstu na liczby)

Każdy fragment tekstu jest zamieniany na **listę liczb** (wektor). Te liczby kodują **znaczenie** tekstu.

```
"Jak zresetować hasło?"     → [0.12, 0.87, 0.34, 0.56, ...]
"Procedura odzyskiwania hasła" → [0.11, 0.85, 0.36, 0.54, ...]  ← podobne liczby!
"Przepis na pizzę"           → [0.91, 0.02, 0.78, 0.11, ...]  ← zupełnie inne
```

Dwa teksty o **podobnym znaczeniu** mają **podobne wektory** — nawet jeśli używają innych słów. Dlatego wyszukiwanie semantyczne działa lepiej niż zwykłe `CTRL+F`.

| | Wyszukiwanie klasyczne | Wyszukiwanie wektorowe |
|---|---|---|
| Szuka | Dokładnych słów | Podobnego znaczenia |
| Przykład zapytania | "reset password" | "nie mogę się zalogować" |
| Znajdzie | Tylko jeśli jest słowo "reset password" | Artykuł o odzyskiwaniu dostępu |

---

## Pełny pipeline — od dokumentu do odpowiedzi

### Faza 1: Indeksowanie (jednorazowo, przy dodawaniu danych)

```
Dokumenty (PDF, Word, strony www)
        ↓
    Chunking
    (cięcie na fragmenty)
        ↓
    Embeddingi
    (każdy fragment → wektor liczb)
        ↓
    Zapis do bazy wektorowej
    (fragment + jego wektor)
```

### Faza 2: Wyszukiwanie (przy każdym pytaniu użytkownika)

```
Pytanie użytkownika: "Jak zresetować hasło?"
        ↓
    Embedding pytania
    (pytanie → wektor liczb)
        ↓
    Wyszukiwanie w bazie
    (znajdź wektory najbardziej podobne do pytania)
        ↓
    Top 3-5 najbardziej trafnych fragmentów
        ↓
    Wysłanie do modelu AI:
    [kontekst z fragmentów] + [pytanie użytkownika]
        ↓
    Odpowiedź AI
```

---

## Kiedy co wybrać?

| Sytuacja | Najlepsze podejście | Dlaczego |
|---|---|---|
| Mała baza (< 50 stron) | Pełny kontekst | Prosto, bez infrastruktury |
| Duża baza, pytania ogólne | RAG | Skalowalne, ekonomiczne |
| Pytania o konkretne rekordy | Narzędzia + SQL | Precyzja ważniejsza niż semantyka |
| Wiedza stała, specjalistyczna | Fine-tuning | Model "wie" bez szukania |
| Pytania wymagające relacji | Baza grafowa | Łączy fakty z różnych miejsc |
| Produkcja, wysoka jakość | RAG hybrydowy | Łączy semantykę z dokładnością |

---

## Przykłady zastosowań

| Zastosowanie | Jak działa |
|---|---|
| **Chatbot obsługi klienta** | Baza = FAQ + dokumentacja produktu, RAG wyszukuje odpowiedź |
| **Asystent prawny** | Baza = umowy i przepisy, model analizuje konkretny dokument |
| **Wyszukiwarka wewnętrzna** | Baza = dokumenty firmowe, pracownicy pytają jak Google |
| **Asystent medyczny** | Baza = literatura medyczna, odpowiada na pytania kliniczne |
| **Analiza kodu** | Baza = cały kod projektu, model odpowiada na pytania o architekturę |

---

## Ograniczenia i pułapki

| Problem | Na czym polega | Jak uniknąć |
|---|---|---|
| **Nieaktualne dane** | Baza nie aktualizuje się automatycznie | Zaplanować regularny re-indeksing |
| **Zły chunking** | Ważna informacja rozbita na dwa fragmenty | Testować różne strategie cięcia |
| **Halucynacje mimo bazy** | Model "dopowiada" gdy fragment jest niewystarczający | Dodać instrukcję: "odpowiedz tylko na podstawie kontekstu" |
| **Za dużo wyników** | Model dostaje 20 fragmentów i gubi się | Ograniczyć do 3-5 najlepszych |
| **Limit kontekstu** | Fragmenty nie mieszczą się w oknie kontekstu modelu | Mniejsze chunki lub mocniejszy model |
| **Brak odpowiedzi w bazie** | Użytkownik pyta o coś czego w bazie nie ma | Model powinien powiedzieć "nie wiem", nie zgadywać |

---

## Projekty edukacyjne

Projekty od najbardziej do najmniej użytecznego. Każdy reprezentuje inną architekturę.

| # | Projekt | Architektura | Cel |
|---|---|---|---|
| 1 | **Chat z dokumentem (pełny kontekst)** | Pełny kontekst | Najprostszy start — zero infrastruktury, rozumiesz baseline przed RAG |
| 2 | **RAG z in-memory vector store** | Wektorowa + RAG | Najważniejszy pattern w produkcji — chunking + embeddingi + wyszukiwanie |
| 3 | **Asystent z narzędziami (Tools + JSON/SQLite)** | Strukturalna + Tools | Inny paradygmat niż RAG — model sam decyduje co i kiedy zapytać |
| 4 | **RAG hybrydowy** | Hybrydowa | Rozszerzenie projektu 2 o wyszukiwanie pełnotekstowe — widać różnicę w jakości |
| 5 | **Knowledge Graph** | Grafowa | Najtrudniejszy, najbardziej niszowy — relacje między pojęciami |

Kolejność ma sens bo:
- Projekt 1 → rozumiesz **problem**
- Projekt 2 → rozumiesz **rozwiązanie** (RAG)
- Projekt 3 → rozumiesz **alternatywę** (Tools)
- Projekt 4 → rozumiesz **optymalizację**
- Projekt 5 → rozumiesz **specjalne przypadki**

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
