# S03E05 · Produkty, które uczą się po wydaniu

## Spis treści

- [Plan lekcji](#plan-lekcji)
- [1. Film](#1-film)
- [2. Sygnały](#2-sygnały)
- [3. Obserwacja](#3-obserwacja)
- [4. Synteza](#4-synteza)
- [5. Decyzje](#5-decyzje)
- [6. Pętle zwrotne](#6-pętle-zwrotne)
- [Wnioski](#wnioski)

---

> **W skrócie:** wypuszczenie funkcji to nie meta, tylko start. Agenci słuchają sygnałów, obserwują, łączą fakty, podejmują drobne decyzje i zapisują wnioski, żeby nikt nie musiał uczyć się tego samego drugi raz.

**Analogia:** produkt jest jak ogród. Posadzenie rośliny (wydanie) to dopiero początek. Potem trzeba patrzeć, co rośnie, podlewać, wyrywać chwasty i notować, co działa.

---

## Plan lekcji

| Etap | Pytanie | Analogia |
|---|---|---|
| **Sygnały** | Skąd wiemy, co się dzieje? | Uszy |
| **Obserwacja** | Czy jest tak, jak się umawialiśmy? | Oczy |
| **Synteza** | Co z tego wynika? Jaka jest prawdziwa przyczyna? | Detektyw |
| **Decyzje** | Rozwinąć, poprawić, uprościć, cofnąć, zbadać czy zatrzymać? | Kierownica |
| **Pętle zwrotne** | Gdzie zapisać wniosek? | Pamiętnik |

---

## 1. Film

Główna myśl: agenci chętnie **dodają** (kod, dokumentację, testy), ale niechętnie **usuwają** i **narzekają**. Trzeba ich o to wprost poprosić.

| Temat | Co robić | Analogia |
|---|---|---|
| 🪨 **Tarcia w projekcie** | Gdy produkt jest na produkcji, poproś agentów, żeby zgłaszali niedociągnięcia. Sami z siebie nigdy nie narzekają. | Grzeczne dziecko, które nie powie, że go boli, dopóki nie zapytasz |
| 🧹 **Czyszczenie kodu** | Agenci uwielbiają pisać kod, ale nie lubią go usuwać. Nie wiesz, czy coś jest potrzebne? Najpierw **zmierz**, potem usuń. | Zanim wyrzucisz zabawkę, sprawdź, czy ktoś się nią jeszcze bawi |
| 📚 **Aktualizacja dokumentacji** | Agenci piszą za długą dokumentację. Uruchamiaj agenta, który przejrzy świeże dokumenty i wytnie zbędne rzeczy. | Przycinanie krzaka, żeby nie zarósł ścieżki |
| 🧪 **Czyszczenie testów** | Agenci piszą za dużo testów. Regularnie usuwaj te niepotrzebne. | Sprzątanie szafy co sezon |
| 📜 **Logi z produkcji** | Logi z produkcji to podstawa. Pomaga w tym **Sentry**. | Czarna skrzynka w samolocie |
| 💬 **Odpowiedzi od użytkowników** | Wykorzystuj opinie użytkowników do poprawy produktu. Najlepiej niech zajmuje się tym **jeden agent z historią** próśb i zażaleń, bo wtedy widzi, co się powtarza i jest ważne. | Lekarz rodzinny, który zna całą twoją historię choroby |

---

## 2. Sygnały

Sygnał = każda wskazówka, jak radzi sobie produkt. Nie tylko logi.

| Źródło | Przykład |
|---|---|
| Logi systemowe | Błędy, wydajność |
| Webhooki | Zdarzenia z zewnętrznych usług |
| Heartbeaty | Zaplanowane skany |
| Transkrypcje | Spotkania sprzedażowe |
| Kanały wsparcia | Zgłoszenia użytkowników |

### Kto daje, kto potrzebuje

| Zespół | Daje | Potrzebuje |
|---|---|---|
| **Product Manager** | Kierunek, opinie użytkowników | Szczegóły aktywności użytkowników |
| **Marketing** | Opinie z social mediów | Nadchodzące funkcje |
| **Sprzedaż** | Prośby klientów, powody, dla których nie kupują | Fakty i liczby o produkcie |
| **Zarząd** | Wizja, priorytety | Wyniki, trendy |

- Źródła ustalamy **z zespołem** (czego używają, czego im brakuje) i **z agentami** (jak to zintegrować, np. Deep Research).
- Efekt: kontekst **spoza kodu**, który pomaga agentom, plus pomysły na **narzędzia wewnętrzne**.

### Start na małą skalę: zgłoszenie błędu → poprawka

| Krok | Co się dzieje | Kto |
|---|---|---|
| 1. Sygnał | Zgłoszenie otwiera issue (słowa użytkownika, metadane, request ID) | Skrypt |
| 2. Triage | Agent opisuje, kategoryzuje, usuwa duplikaty | Workflow |
| 3. Umowa | Kroki reprodukcji, kryteria akceptacji, dowód | Workflow |
| 4. Agent w chmurze | Naprawia błąd, zbiera dowody | Agent w chmurze |
| 5. Dowód | Raport: diff i stan przed/po | Agent w chmurze |
| 6. Merge | Bramki jakości, wdrożenie | Workflow |
| 7. Odpowiedź | Użytkownik dostaje informację „Naprawione” | Workflow |

> ⚠️ **Źródło musi być zaufane.** Słowa użytkownika to dane, nie polecenia (ochrona przed prompt injection).

### Przykład: onboarding na całe życie

- Zamiast uczyć użytkownika raz na starcie, agent pomaga **cały czas**.
- Agent czyta **strumień zdarzeń** i podpowiada, ale **nic nie robi za użytkownika**.

| Zdarzenie | Reakcja agenta |
|---|---|
| Pominął konfigurację | Podpowiedź: zaimportuj dane |
| Utknął na eksporcie | Alert: odzywa się wsparcie |
| Dwa razy oglądał cennik | Alert: odzywa się sprzedaż |

---

## 3. Obserwacja

Agent porównuje **to, co się stało**, z **pierwotną umową** (cel, miara sukcesu, zakres).

**Przykład:** cotygodniowy e-mail do nieaktywnych użytkowników. Cel: 15% powrotów. Wynik: 18% ✅, ale użytkownicy pytają „Czemu dwa maile w poniedziałek?”, bo jest jeszcze newsletter. Wynik: **zgadza się z umową, ale nie pasuje do reszty** → połączyć z newsletterem.

### Fazy obserwacji

| Faza | Co robimy |
|---|---|
| **Wydanie** | Zapisujemy umowę i dowody jako dokumenty |
| **Konfiguracja** | Instrukcja, skille, opcjonalnie skrypty i wyzwalacz |
| **Weryfikacja** | Sprawdzamy, czy konfiguracja działa |
| **Pobudka** | Wyzwalacz uruchamia agenta w tle |
| **Raport** | Agent zostawia notatkę dla kolejnych uruchomień |
| **Zarządzanie** | Agent zmienia lub wyłącza harmonogramy (w granicach, które mu damy) |

### Klocki (prymitywy)

| Klocek | Rola | Analogia |
|---|---|---|
| Subscription | Budzi agenta | Budzik |
| Integration | Dostęp do danych | Klucz do drzwi |
| Skill | Powtarzalny sposób działania | Przepis |
| Document | Wiedza | Książka |
| Journal | Co się działo w każdym uruchomieniu | Dziennik |
| Channel | Rozmowa z ludźmi i agentami | Telefon |

---

## 4. Synteza

Sama obserwacja rzadko mówi, co zrobić. Sygnały trzeba **połączyć**. Każdy agent pilnuje jednej rzeczy (mniej kontekstu, węższe uprawnienia, niższy koszt).

### Przykład 1: flaga bezpieczeństwa (projekt Kenta)

- Zmiana: pakiety nie mogą używać niezadeklarowanych poświadczeń.
- Warunek: flaga włącza się **tylko, gdy skan produkcji jest czysty**.
- Skan: **211 pakietów od 89 właścicieli** wymaga ręcznych zmian → flaga zostaje wyłączona.
- Agent sam pogrupował wyniki:

| Grupa | Co dalej |
|---|---|
| W porządku | Nic |
| Agent naprawi | Jedna poprawka, przetestowana na próbce |
| Wymaga decyzji | Jedna główna przyczyna → **jedno pytanie do człowieka** |

### Przykład 2: błąd, który wraca

- Sentry zgłosiło błąd → szybka poprawka.
- Po 2 tygodniach błąd wrócił w innej formie.
- Agent **nie** naprawił go tak samo. Powiązał go z poprzednim błędem, znalazł **prawdziwą przyczynę** i poczekał na zgodę.

**Analogia:** zamiast co tydzień wycierać kałużę, znajdź przeciekającą rurę.

> Niektórych problemów nie da się rozwiązać od razu. Trzeba połączyć historię zmian z kontekstem spoza kodu.

---

## 5. Decyzje

Cel: **jak najmniej miejsc, gdzie potrzebny jest człowiek.**

| Zasada | Na czym polega |
|---|---|
| **Twarde bariery** | CI/CD, których agent nie obejdzie, oraz wąskie narzędzia i kontekst |
| **Umowa** | Agent sprawdza wynik z umową i wie, kiedy nas wołać |
| **Odwracalność** | Agent sam decyduje o rzeczach łatwych do cofnięcia |
| **Preferencje** | Pilne sprawy idą jednym kanałem, mniej pilne innym |

- 🧑 **Decyzje produktowe** → człowiek
- 🤖 **Szczegóły implementacji** → agent
- 🆘 Na awarie: dokument **disaster recovery**, który agenci utrzymują na bieżąco.

---

## 6. Pętle zwrotne

Po każdej aktywności agent pyta: **„Czy coś z tego wynika? Gdzie to zapisać, żeby nikt nie uczył się tego drugi raz?”**

| Co agent się nauczył | Gdzie trafia | Lekcja |
|---|---|---|
| Nowa praca na później | **Issues** | S01E05 |
| Zmiana działania produktu | **Specyfikacje** (mapa funkcji, wizja) | S03E03, S01E04 |
| Błąd, który może wrócić | **Ewaluacje** (eval case) | S02E05 |
| Decyzja człowieka | **Pamięć produktu** (decision records, baza wiedzy) | S03E02, S01E03 |
| Lekcja o pracy agentów | **Kontekst agenta** (AGENTS.md, zasady, skille) | S01E02, S03E02 |
| Nic przydatnego | Pomiń | — |

### Pętla ciągłego doskonalenia (Kent)

**zamiar → budowa → sprawdzenie → zapis wniosku → zamiana powtarzanej rady w regułę**

Ten sam błąd drugi raz? → staje się **lintem, typem albo testem**.

### Friction log, czyli dziennik tarć

1. Coś przeszkadza agentowi więcej niż raz → issue z etykietą `friction`.
2. Codziennie job uruchamia agenta w chmurze → naprawia problem albo zostawia Kentowi podsumowanie.

**Prawdziwy przykład:** limit tokenów CLI zapchany przez stare tokeny agentów.

| Krok | Kto |
|---|---|
| Obejście problemu (unieważnienie 3 tokenów) i zgłoszenie friction | Agent |
| Znalezienie przyczyny, bez zmian w autoryzacji | Codzienny przegląd |
| **Jedna decyzja** | Kent |
| Poprawka i notatka w decision record (~10 h od problemu) | Agent |

### Ważne zasady

- ✅ Pętla jest zamknięta dopiero, gdy **sygnał ucichnie**, a nie gdy poprawka trafi na produkcję.
- 🧪 Eksperyment wygrał → wdrożyć dla wszystkich i **usunąć flagę**.
- 🗑️ **Usuwanie jest tak samo ważne jak dodawanie.** Za dużo notatek i reguł psuje agentów. Agenci od utrzymania mają głównie sprzątać.
- 📬 Użytkownik, który zgłosił problem, **dostaje odpowiedź**, ale jego słowa są filtrowane (prompt injection).

---

## Wnioski

- Produkt **AI-native** to nie kilka promptów, tylko system obejmujący prawie każdy obszar firmy.
- Coraz częściej z produktu będą korzystać **agenci użytkowników**, a nie sami użytkownicy.
- Wszystko z kursu (prymitywy, MCP, workflowy, rutyny, bazy wiedzy) prowadzi właśnie w tę stronę.
