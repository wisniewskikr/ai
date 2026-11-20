# S04E05 · Budowanie samodoskonalących się systemów inżynieryjnych

## 📑 Spis treści

- [O co chodzi w jednym zdaniu](#o-co-chodzi)
- [Pięć filarów lekcji](#piec-filarow)
- [1. Film](#film)
- [2. Feedback — zamknij pętlę](#feedback)
- [3. Ewaluacja — oddziel sędziego od zawodnika](#ewaluacja)
- [4. Destylacja — z doświadczenia robimy narzędzia](#destylacja)
- [5. Optymalizacja i Governance](#optymalizacja)
- [Najważniejsze wnioski](#wnioski)
- [Na koniec](#na-koniec)

> Streszczenie ostatniej lekcji MEGA. Lekcja ma dwie części: tę (zasady) i [Build guide](https://hq.mega.dev/lessons/s04e05/build-guide/) (budowa krok po kroku z filmu Johna).

<a id="o-co-chodzi"></a>
## 🧠 O co chodzi w jednym zdaniu

Zamiast myśleć **„jak coś zrobić”**, myślimy **„jak zbudować coś, co to zrobi i samo będzie się poprawiać”**.

> 🌱 **Analogia:** Nie podlewasz rośliny codziennie ręcznie. Budujesz system nawadniania, który sam mierzy wilgotność gleby i dostosowuje ilość wody.

Agent w dobrze zbudowanym systemie potrafi:

- naprawiać błędy,
- zmieniać własną logikę,
- wdrażać zmiany i **cofać je**, gdy coś pójdzie źle,
- budować całe nowe funkcje i moduły.

<a id="piec-filarow"></a>
## 📋 Pięć filarów lekcji

| Filar | Co to znaczy | Analogia |
|---|---|---|
| **Feedback** | Ślady, błędy, poprawki, oceny, decyzje ludzi | Lusterko wsteczne w aucie |
| **Ewaluacja** | Testy, punkty odniesienia, walidatory, wersjonowane wyniki | Egzamin z kluczem odpowiedzi |
| **Destylacja** | Udane przebiegi → skille, reguły, szablony, nowi agenci | Notatki z przepisów babci → książka kucharska |
| **Optymalizacja** | Poprawianie narzędzi, routingu, modeli na podstawie wyników | Trener poprawiający technikę biegacza |
| **Governance** | Proponowanie, testowanie, zatwierdzanie, wersjonowanie, cofanie zmian | Notariusz i „Ctrl+Z” w jednym |

---

<a id="film"></a>
## 1. 🎬 Film

Najważniejsze myśli z filmu Johna:

| Temat | O co chodzi | Analogia |
|---|---|---|
| **llms.md** | Plik ze wszystkimi informacjami dla zewnętrznych agentów | Tablica informacyjna przy wejściu do budynku |
| **Limity** | Warto ustawiać limity dla zewnętrznych agentów i ludzi — każde zapytanie kosztuje | Limit na karcie kredytowej |
| **Pieniądze** | Decyzje o pieniądzach zawsze podejmuje **człowiek** | Dziecko może wybrać zabawkę, ale płaci rodzic |
| **Deployment** | Aplikacja dostępna 24/7 musi działać na zewnętrznym serwerze | Sklep całodobowy, a nie stragan, który zwijasz na noc |
| **Jev** | Model od TypeSave — podejmuje decyzje | Kierownik zmiany |
| **Łowca błędów** | Model, który **szuka** błędów, ale **niczego nie poprawia** | Inspektor, który wypisuje usterki, ale nie bierze się za naprawę |

---

<a id="feedback"></a>
## 2. 🔁 Feedback — zamknij pętlę

System musi **sam** ustalić:

1. **Co** trzeba zrobić (wejście),
2. **Jak dobrze** to zrobił (feedback).

Pętla: **Znajdź pracę → Działaj → Sprawdź wynik → Wybierz kolejny krok → (od nowa)**

### Dobry feedback jest:

| Cecha | Po ludzku |
|---|---|
| Wysoki stosunek sygnału do szumu | Konkret, bez śmieci |
| Prawdziwy | Nie kłamie |
| Kompletny | Nic nie brakuje |
| Na czas | Nie po fakcie |
| Dostępny | Agent może go przeczytać |

### Skąd brać feedback?

- Klasyczne techniki testowania i obserwowalności (testy jednostkowe, canary, feature flagi, monitoring…).
- U Lauren Tan to **~70% tokenów** zespołu → ok. **11 000 PR-ów miesięcznie** przy rosnącej jakości.

### Przykład: agent **self-change**

| Krok | Co się dzieje |
|---|---|
| 1 | Agent przepisuje swoją regułę routingu i restartuje się |
| 2 | **Stały test poza kontrolą agenta** sprawdza regułę |
| 3 | Zła reguła (bilet bez kolejki) → odrzucona, stara zostaje |
| 4 | Agent czyta błąd, poprawia regułę, restartuje się |
| 5 | Test przechodzi → praca toczy się dalej z nową logiką |

- Log i rozmowa są na dysku → restart i crash idą **tą samą ścieżką odzyskiwania**.
- „Paragony” chronią przed podwójnym obsłużeniem biletu.

> 🔧 **Analogia:** Mechanik wymienia część, ale auto nie wyjedzie z warsztatu, dopóki niezależny diagnosta nie da zielonego światła.

### Druga strategia (Peking University + DeepSeek)

| | self-change | Paper |
|---|---|---|
| Restart procesu | ✅ tak | ❌ nie — wymiana jednej części „w locie” |
| Cofanie skutków | przez stary stan | każda zmiana zapisana razem z „przepisem na cofnięcie” |
| Test przed użyciem | ✅ stały test | ❌ brak |

👉 Razem: system zmienia części w locie, odrzuca złe zmiany i czysto cofa te wprowadzone.

Wspólne zasady: **trwałość**, **architektura oparta na prymitywach**, **samoleczenie**, **autorefleksja**.

> 🏗️ **W buildzie Johna:** każda wizyta w „recepcji” zostawia paragon (czas, koszt, cache, zgodność z zapisem). Recepcja celowo zepsuta („uprzejma, ale nic nie zapisuje”) oblewa testy.

---

<a id="ewaluacja"></a>
## 3. ⚖️ Ewaluacja — oddziel sędziego od zawodnika

### Dlaczego ewaluator osobno?

| Powód | Wyjaśnienie |
|---|---|
| **Zakres** | Widzi kilka systemów i szerszy obraz |
| **Uprawnienia** | Ma dostęp do rzeczy, których system nie ma |
| **Niezależność** | System nie „poprawi” testów, żeby przeszły |
| **Kontrola** | Własny harmonogram, budżet, konfiguracja |

> ⚽ **Analogia:** Piłkarz nie może być sędzią we własnym meczu.

Przykład: router mówi „gotowe”, drafter mówi „gotowe”, ale **dopiero sędzia** widzi, że bilet wrócił po kilku dniach → „nierozwiązane”.

### Judge obok agenta Specter (z S04E01)

1. Specter działa → wysyła log i notatki.
2. Judge buduje zbiory danych i ocenia przebiegi → wysyła wnioski.
3. Specter proponuje zmianę.
4. Judge odtwarza zapisane akcje na nowej wersji.
5. Werdykt: **zostaw** lub **cofnij**.

🔒 **Stałe, ustalone przez nas:** testy w kodzie (dozwolone ścieżki, zaufane źródła, jeden mail na klucz), zbiory crashy i prompt injection. **Żaden agent ich nie zmieni.**

### Pięć prymitywów Judge’a

| Prymityw | Co to | Analogia |
|---|---|---|
| **Revision** | Dokładny, zahashowany stan systemu (instrukcje, skille, hooki, ustawienia). Aktywna tylko jedna | Zdjęcie przepisu w danym dniu |
| **Case** | Zapisana sytuacja do odtworzenia | Nagranie meczu |
| **Check** | Jedno pytanie o wynik + sposób odpowiedzi (kod, model, realny efekt) | Pytanie na egzaminie |
| **Trial** | Ograniczony przebieg: Cases × Revision + Checks | Próbny egzamin |
| **Verdict** | Decyzja z dowodami: zostaw / cofnij / zapytaj człowieka | Ocena końcowa |

📖 Czyta się jak zdanie: **Trial** odtwarza **Cases** na **Revision**, **Checks** oceniają, **Verdict** decyduje.
Dla innego systemu zmieniają się tylko **Cases** i **Revision**.

💡 Sędziów może być wielu — to zwykli agenci (wzorce multi-agent z S02E04).

> 🏗️ **W buildzie Johna:** zapieczętowane przypadki leżą w folderze poza projektem, a agent zmieniający kod nie ma do niego dostępu. Git hook uruchamia testy po każdym commicie i głośno mówi, jeśli zapieczętowane przypadki się nie uruchomiły.

---

<a id="destylacja"></a>
## 4. 🧪 Destylacja — z doświadczenia robimy narzędzia

Agent często robi rzeczy, które dałoby się:

- zautomatyzować deterministycznym kodem,
- oddać nowemu, wyspecjalizowanemu agentowi.

Problem: nikt tego nie zauważy, jeśli nie przygotujemy środowiska.

> ☕ **Analogia:** Barista po setnym latte zapisuje proporcje na karteczce. Po tysięcznym — kupuje ekspres z gotowym programem.

### Ewolucja zadań Spectera (zapis źródła → notatka)

| Etap | Kto robi kroki (pobierz, wyciągnij, zapisz) | Kto łączy (connect) |
|---|---|---|
| Na początku | model — wszystko | model |
| Po tygodniach | skill + skrypt dla papierów | model |
| Po miesiącach | **jeden szablon** dla papierów, repo, artykułów | model |
| Jeszcze później | szablon się zmienia, dochodzą nowe typy | model |

⚠️ Zmiana w szablonie wpływa na **wszystko**, co na nim stoi → wymaga **ostrzejszej** kontroli niż nowy skill.

Powiązane tematy MEGA: **pamięć** (S02E01), **skille** (S02E02/03), **Journal** (log agenta).

> 🏗️ **W buildzie Johna:** `/lab suggest` szuka powtarzających się problemów i **proponuje** nowych agentów. Nic nie buduje — decyduje człowiek.

---

<a id="optymalizacja"></a>
## 5. 🛡️ Optymalizacja i Governance

- Agent powinien mieć dostęp do **własnej konfiguracji** i cyklu życia.
- W pewnym momencie nie **budujemy** agentów, tylko ich **„trenujemy”** do lepszego poruszania się w środowisku (np. [Self-Improving Memory](https://facebookresearch.github.io/RAM/blogs/self_improving_memory/)).

### Ale uwaga na ryzyka

| Zagrożenie | Przykład |
|---|---|
| Atak | Fałszywy mail „od nas” prosi Spectera o raport z badań |
| Złe polecenie | Niewyraźna komenda głosowa |
| Brak kontekstu | Agent robi coś, czego nie chcieliśmy |
| Błąd techniczny | Zła konfiguracja, wadliwa łatka, szkodliwe narzędzie |

✅ **Rozwiązanie:** jasne, **deterministyczne** uprawnienia + sandboxing, sieć, wersjonowanie, backupy, logi audytu.
Dobra wiadomość: agent sam to wszystko skonfiguruje i przetestuje.

> 🔑 **Analogia:** Sejf bankowy otwiera się dwoma kluczami — nikt nie otworzy go sam.

> 🏗️ **W buildzie Johna:** Trainer bez narzędzi ulepsza słownik agenta Booking (limity rund i kosztów). Zmiana wchodzi tylko z **dwoma kluczami**: testy przeszły **i** człowiek zatwierdził. Stara wersja jest zapisywana do przywrócenia.

💬 **Morał:** żeby budować autonomiczne systemy, musimy użyć AI do ulepszenia **własnego procesu**.

---

<a id="wnioski"></a>
## 🎯 Najważniejsze wnioski

| # | Wniosek |
|---|---|
| 1 | **Wybierz jeden pomysł** i po prostu go zrealizuj z AI i wiedzą z MEGA |
| 2 | **Porzuć etykiety** („jestem frontendowcem”, „nie znam tego narzędzia”) — z AI to tylko iluzje |
| 3 | Zostań **MEGA developerem**: bez lęku przed wyzwaniami, otwartym na każdą technologię, z własnym spersonalizowanym systemem |

> *„Technologia ma ograniczenia. Ty nie.”* — Lou Gerstner

<a id="na-koniec"></a>
## 🙏 Na koniec

Adam dziękuje uczestnikom i zespołowi MEGA. Prośba: podziel się opinią w social media lub na [Wall of Love](https://app.easy.tools/review-ask/megadev?lang=en).
