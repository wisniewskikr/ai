# S04E04 · Automatyzacja pracy poza kodem

## Spis treści

- [O co chodzi?](#o-co-chodzi)
- [Cztery klocki systemu](#cztery-klocki-systemu)
- [1. Film](#1-film)
- [2. Zdarzenia — budzik systemu](#2-zdarzenia--budzik-systemu)
- [3. Haki — czujnik dymu](#3-haki--czujnik-dymu)
- [4. Potoki — taśma w fabryce](#4-potoki--taśma-w-fabryce)
- [5. Systemy push — spakowany plecak](#5-systemy-push--spakowany-plecak)
- [Najważniejsze wnioski](#najważniejsze-wnioski)

> Streszczenie lekcji. Pełna wersja: [s04e04-automating-work-beyond-code.md](./s04e04-automating-work-beyond-code.md). Krok po kroku: [Build guide](https://hq.mega.dev/lessons/s04e04/build-guide/).

## O co chodzi?

AI umie dziś prawie wszystko. Słabe wyniki biorą się głównie z dwóch rzeczy:

| Problem | Co to znaczy |
|---|---|
| Praca poza naszą wiedzą | Nie umiemy sprawdzić, czy AI ma rację |
| Słabe modele | Ludzie nie używają najlepszych (SOTA) modeli |

**Wniosek:** wyjdźmy poza kod. Połączmy agentów z aplikacjami i usługami firmy i szukajmy **przypadków użycia** dla biznesu.

> 🏠 **Analogia:** agent to już nie tylko „mechanik od kodu”, ale „złota rączka” całego domu firmy.

## Cztery klocki systemu

| Klocek | Pytanie | Analogia |
|---|---|---|
| **Zdarzenia** (Events) | *Kiedy* system się budzi? | Budzik ⏰ |
| **Haki** (Hooks) | *Co się dzieje* po drodze? | Czujnik dymu 🚨 |
| **Potoki** (Pipelines) | *Jaką stałą drogą* idzie praca? | Taśma w fabryce 🏭 |
| **Systemy push** | *Jaką wiedzę* dostaje agent na start? | Spakowany plecak 🎒 |

---

## 1. Film

W filmie John buduje małe zadania wokół aplikacji. Najważniejsze elementy:

| Element | Co robi | Analogia |
|---|---|---|
| **Wytrzymały serwer** | Działa cały czas. Gdy coś padnie, sprawdza, do którego momentu zadanie zostało wykonane, i zaczyna od tego miejsca | Zakładka w książce 🔖 |
| **Jev** | Model od TypeSave. Podejmuje decyzje | Kierownik 🧑‍💼 |
| **Łowca błędów** | Model, który szuka błędów, ale niczego nie poprawia | Detektyw 🔍 — wskazuje winnego, nie wymierza kary |

---

## 2. Zdarzenia — budzik systemu

Cel: system **sam się budzi**, robi prawie wszystko i prosi o pomoc tylko gdy trzeba.

- Za mało zdarzeń → system śpi.
- Za dużo → hałas.

### Zanim podłączysz zdarzenia — dopasuj 7 rzeczy

| # | Punkt | Pytanie |
|---|---|---|
| 1 | Kontekst biznesu | Co oferujemy i po co? |
| 2 | Metryki | Co mierzymy (MRR, churn, trial→płatny, LTV)? |
| 3 | Narzędzia analityczne | Co dają i jak się do nich podłączyć? |
| 4 | Produkt | Jak produkt realizuje cele? |
| 5 | Zdarzenie | Co agent ma obserwować? |
| 6 | Akcja | Co agent może zrobić? |
| 7 | Ewaluacja | Jak sprawdzimy, że zadziałało? |

### Przykłady

| Obszar | Zdarzenie | Co robi agent | Co zostaje u ludzi |
|---|---|---|---|
| Cennik | Konkurent zmienia plany (Firecrawl) | Porównuje z naszymi i ze Stripe, daje opcje | Decyzja, rozmowy z klientami |
| Płatności | Rośnie liczba nieudanych płatności (Stripe) | Sprawdza lejek w PostHog, proponuje poprawkę | Kontakt z klientami |
| Wsparcie | To samo pytanie od miesięcy (Plain) | Poprawia dokumentację, proponuje zmianę UI | Odpowiadanie ludziom |
| Sprzedaż | Rozmowy wspominają brakującą funkcję (Granola) | Ocenia wykonalność, szkic w Linear | Decyzja |
| Oceny w sklepie | Spadek oceny po wersji | Łączy recenzje i błędy ze zmianami | Co cofnąć |
| Spam | Więcej skarg na kampanie (Resend) | Szuka przyczyny, proponuje zmiany | Akceptacja |

> ⚠️ To nie są „prompty”. Dotykają prawdziwego świata i klientów, więc wymagają **pracy zespołowej**. Projektuj **prymitywy**, które da się użyć w innych procesach.

### Kroki do działania

| Krok | Co zrobić |
|---|---|
| **Mapuj** | Niech agent spisze webhooki, API i logi naszych usług |
| **Wybierz** | Jeden proces: 1 zdarzenie, 1 akcja, 1 ewaluacja |
| **Ujednolicaj** | Jedno wejście, jeden kształt: źródło, typ, ID, czas, dane (prymityw *Subscriptions* z S03E01) |
| **Identyfikuj** | Duplikat = ta sama praca. Inna treść = zmiana, nie ponowienie |
| **Filtruj** | Najpierw proste reguły, mały model tylko gdzie reguły zawodzą |
| **Zamieniaj** | Zdarzenie → jedno zadanie z właścicielem. Brak właściciela? Pytaj, nie zgaduj |
| **Obserwuj** | Agent najpierw mówi, *co by zrobił*. Usuwaj hałaśliwe zdarzenia |

**U Johna:** nowe zgłoszenie → linia w logu → „watcher” uruchamia sortera. Duplikat dostaje jeden tag, zakładka pozwala wznowić po restarcie. Błąd żądania budzi „łowcę błędów”.

---

## 3. Haki — czujnik dymu

Zdarzenie **startuje** pracę, hak **zmienia jej bieg**. Dzięki hakom agent może prowadzić zadania trwające tygodnie i spać, gdy nic się nie dzieje.

Przykład: współczynnik dostarczania maili spada poniżej progu → hak zbacza z domyślnej ścieżki → właściciel decyduje → zadanie wraca do pracy.

### Haki wielokrotnego użytku

| Hak | Do czego |
|---|---|
| **Alert** | Coś poszło źle → człowiek albo procedura |
| **Approval** | Prośba o zgodę lub informację |
| **Timeout** | Brak decyzji → przypomnienie |
| **Join** | Nowe zgłoszenia dołączają do zadania |
| **Threshold** | Przekroczony limit → wstrzymaj |
| **Completion** | Wynik zmierzony → zadanie zamyka się samo |

### Budowa haka

> **Dla** tego zadania, **gdy** to się stanie, **wtedy** zrób to, **aż do** końca zadania.

| Pole | Znaczenie |
|---|---|
| Owner | Do którego zadania należy |
| Trigger | Czego słucha (zdarzenie, czas, krok) |
| Condition | Kiedy działa (np. próg) |
| Response | Co robi (budzi agenta, skrypt, alert, zgoda) |
| Description | Dlaczego istnieje — dla agenta z pustą pamięcią |
| Expiration | Kiedy znika (zwykle koniec zadania) |

### Jak to działa

- Haki trzymamy w **rejestrze** (plik lub tabela).
- Dopasowanie robi **zwykły kod** — model nie musi działać w tle.
- Każde odpalenie trafia do historii zadania.

### 3 zasady

| Zasada | |
|---|---|
| Uprawnienia | Hak może tyle, ile jego zadanie |
| Jednorazowość | To samo zdarzenie odpala hak raz |
| Umiar | Mało haków — za dużo = hałas |

**U Johna:** jedna reguła w sorterze. Sprawa o pieniądze albo niepewny właściciel → zgłoszenie oznaczone „niepewne”, z powodem, na górze listy dla człowieka.

---

## 4. Potoki — taśma w fabryce

Nie wszystko musi być dynamiczne. Ustalone procesy idą **stałą ścieżką**. Większość kroków to kod, agent tylko zarządza.

| Krok | Co robi | Kto |
|---|---|---|
| **Obserwuj** | Przyjmuje i zapisuje zdarzenie | Kod |
| **Klasyfikuj** | Nazywa rodzaj (niejasne → ręczny przegląd) | Reguły / model |
| **Kieruj** | Wybiera właściciela | Kod |
| **Wykonaj** | Robi właściwą pracę | **Agent** |
| **Weryfikuj** | Sprawdza dowody (porażka → wróć do „Wykonaj”) | Kod / model |
| **Komunikuj** | Raportuje i zapisuje na następny raz | Kod |

Każdy krok ma: **wejście**, **wyjście**, **sprawdzenie**. Pasują tu prymitywy *code mode* i *package*.

### Przykłady

| Potok | Start | Krok z AI |
|---|---|---|
| Materiały do wydania | Każdy merge | Pisanie tekstów |
| Uzgadnianie płatności | Co noc | Wyjaśnianie wyjątków |
| Sortowanie opinii | Nowa opinia | Klasyfikacja funkcji |
| Publikacja lekcji | Zapisany szkic | Recenzja i rysunki |

> 💡 Zwykle **tylko jeden krok** potrzebuje AI. Reszta to kod.

**U Johna:** sorter (kod czyta → model odpowiada na 2 pytania → kod zapisuje tag) i drafter (kod sprawdza pobyt → Booking pisze odpowiedź → kontrola każdej kwoty). Każdy wynik czeka na człowieka.

---

## 5. Systemy push — spakowany plecak

Zamiast kazać agentowi szukać, **dajemy mu kontekst od razu**.

| Po co | Dlaczego |
|---|---|
| Mniejsze modele | Same słabo szukają |
| Pewność | Kontekst **musi** być obecny |
| Koszt i czas | Ważne przy powtarzanych zadaniach |

### Jak wybrać kontekst

| Sposób | Kiedy |
|---|---|
| **Stała lista** | Wiemy, czego trzeba |
| **Router** | Mały model wybiera |

Co pakujemy: **fakty** (z wiekiem), **reguły** (dla danego przypadku), **ostatni przebieg** (czego się nauczył). Brakuje czegoś? **Krok czeka.**

### Pułapka: ile spakować?

| Plecak | Efekt |
|---|---|
| 🪶 Za mało | Brak „ostatniego zamówienia” → agent potwierdza duplikat |
| 🧳 Za dużo | Stary adres → wysyłka pod zły adres |
| ✅ W sam raz | Agent pyta przed potwierdzeniem |

**Złoty środek:** zamiast pełnej treści daj **ID/odnośniki + krótki opis**. Zwięźle, a agent dociągnie resztę.

**U Johna:** drafter to system push. Kod podaje Bookingowi daty, cenę i sumę + notatki dla klienta. Booking nie ma narzędzi. Notatki wewnętrzne wyłączone (bo zdradzał gościom wewnętrzne mechanizmy). Brak danych → „nieznane”, bez kwot.

---

## Najważniejsze wnioski

- Agenci to nie tylko kod — mogą wejść w **każdy obszar** pracy.
- Myśl o tym, **co jest możliwe** i **z czego możesz wybierać**.
- Przeskakuj między **szerokim** a **wąskim** spojrzeniem.
- Buduj **prymitywy** (zdarzenia, haki, potoki, push), które łączą się w nowe możliwości → droga do **prawie pełnej autonomii**.

> 🏔️ **Analogia:** pierwsza lekcja MEGA to widok ze szczytu góry. Ta lekcja to umiejętność szybkiego zejścia tam, gdzie akurat trzeba — a czasem bycia w kilku miejscach naraz.
