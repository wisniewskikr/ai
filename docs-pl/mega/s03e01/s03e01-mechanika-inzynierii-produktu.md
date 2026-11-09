# S03E01 · Mechanika inżynierii produktu

> **W skrócie:** AI pisze kod coraz lepiej. Naszą pracą nie jest już samo pisanie kodu, tylko **decydowanie, co zbudować, jak dobrze i jak szybko to rozwijać**.

🍳 **Analogia:** Kiedy każdy ma robota-kucharza, który ugotuje każdy przepis, wygrywa ten, kto **wie, co ugotować**, dla kogo i kiedy podać.

---

## 📋 Plan lekcji

| Temat | O co chodzi |
|---|---|
| **Zmiana** | Liczy się efekt, a nie ilość pracy |
| **Odpowiedzialność** | Zakres, wpływ na użytkownika, wartość dla biznesu |
| **Osąd** | Założenia, kompromisy, wyczucie, niepewność |
| **Myślenie systemowe** | Architektura, zależności, skutki działania |
| **Dźwignia** | AI pomaga badać pomysły i szybko robić prototypy |

---

## 1. 🔄 Zmiana: efekt zamiast ilości pracy

Załóżmy, że agenci przejmą **prawie całe** programowanie. Co wtedy będzie nas wyróżniać?

| Da się wygenerować 🤖 | Nie da się wygenerować 🏆 |
|---|---|
| Funkcje aplikacji | Użytkownicy |
| Kod | Klienci |
| Kopia produktu w 1 dzień | Prawdziwe dane |
| | Reputacja |

🧱 **Analogia:** Kopię sklepu można postawić w jeden dzień. Ale nie da się w jeden dzień skopiować **stałych klientów**.

### Pętla produktu

```
sygnał → decyzja → poprzeczka jakości → budowa z agentami → wydanie i nauka
   ↑                                                              ↓
   └──────────── użytkownicy, klienci, dane, reputacja ◄──────────┘
```

- Klon ma te same funkcje, ale **0 użytkowników** i **0 obrotów pętli**.
- Klon zgaduje, co zbudować dalej. My **wiemy**.

### Agenci stają się pośrednikami

- Coraz częściej to **agent** korzysta z aplikacji za nas (np. Google Search, ffmpeg, Stripe, Resend).
- Tych usług **nie da się łatwo wygenerować**.
- Każdy będzie miał **całą flotę agentów** → oprogramowania będzie potrzeba **więcej**, nie mniej.

| Rodzaj narzędzia | Przykład |
|---|---|
| Agent napisze sam | Skrypt do zmiany nazwy pliku |
| Szybciej wywołać | ffmpeg (20+ lat pracy) |
| Tylko wywołać | Google Search, Stripe, Gmail |

### Najważniejsze pytanie

| Stare pytanie ❌ | Nowe pytanie ✅ |
|---|---|
| „Czy zadanie jest zrobione?” | „Czy użytkownik może teraz zrobić to, czego potrzebuje?” |

---

## 2. 🎯 Odpowiedzialność

Agenci robią dużo, ale **kształt systemu** wciąż zależy od nas.

### Przykład: prymityw „Subskrypcje” (Grok Bot)

Prośba: *„Połącz aplikację z e-mailem i kalendarzem”*.

| Podejście | Co robimy | Efekt |
|---|---|---|
| **Wynik (output)** | Bramka + osobny adapter na każdą usługę | 6 adapterów do utrzymania, 16 dni pracy |
| **Efekt (outcome)** | Jeden prymityw: `subscribe(trigger)` / `wake(event)` | 1 prymityw, 5 dni, agent sam dodaje nowe źródła |

🔌 **Analogia:** Zamiast kupować osobną ładowarkę do każdego urządzenia, robisz **jedno gniazdko**, do którego pasuje wszystko.

Subskrypcje obsługują: e-mail, Slacka, przeglądy PR, alerty, harmonogramy… i wszystko, co może „obudzić” agenta.

> Znalezienie dobrego prymitywu wymaga **wysiłku** i szukania kontekstu: od biznesu, użytkowników i z własnych badań.

### PM vs PE

| Rola | Decyduje o… |
|---|---|
| **Product Manager (PM)** | **Jaki problem** rozwiązać i **dlaczego** |
| **Product Engineer (PE)** | **Co produkt musi robić**, żeby go rozwiązać |

**Wspólne obszary:** wartość biznesowa, zakres, wpływ na użytkownika, założenia i kompromisy.

### Dobre pytania do zadawania

- Czy ta funkcja powinna istnieć?
- Czy to jest jeszcze potrzebne?
- Jak połączyć te funkcje?
- Co daje użytkownikom najwięcej wartości?
- Dlaczego użytkownicy odchodzą?

### Co się zmienia w trakcie przejścia? (powoli, nie od razu)

| Kto/co | Zmiana |
|---|---|
| **Produkt** | Lepiej pasuje do potrzeb, szybciej się zmienia |
| **Użytkownicy** | Widzą szybszy rozwój, ich agenci mogą korzystać z aplikacji |
| **Kod** | Prostszy, mniej zbędnych funkcji, agenci sami sprawdzają swoją pracę |
| **Biznes** | Więcej klientów, dłużej zostają, zdrowsze finanse |

---

## 3. ⚖️ Osąd

AI pisze kod lepiej niż wielu ludzi, ale **nasze doświadczenie wciąż się liczy**. Musimy działać szerzej: biznes, produkt, niskopoziomowe szczegóły, nowe technologie.

### Nieznane niewiadome

| | Wiemy | Nie wiemy |
|---|---|---|
| **Jesteśmy świadomi** | Znane wiadome | Znane niewiadome |
| **Nie jesteśmy świadomi** | Nieznane wiadome | 🔴 **Nieznane niewiadome** |

🔦 **Analogia:** To jak ciemny pokój — nie wiesz nawet, jakie meble są w środku. AI to **latarka**, która pokazuje, o co warto zapytać.

**Jak AI pomaga:**
- Podsuwa pytania, o których nie pomyśleliśmy.
- Odpowiada krótko, zamiast „ściany tekstu”.
- Tworzy **mapy myśli**, **makiety** i **prototypy**.

### Narzędzia do podejmowania decyzji

Agenci (z **systemem wiedzy** z S01E03) mogą przygotować dokument HTML z opcjami, używając:

- **Macierzy wykonalności** (wartość × złożoność × ryzyko)
- Macierzy Eisenhowera
- Drzewa decyzyjnego
- Analizy pre-mortem („co by poszło nie tak?”)

| Funkcja | Złożoność | Wartość | Ryzyko |
|---|---|---|---|
| Integracja e-mail / kalendarz / PR | niska | niska | — |
| Bramka i adaptery | średnia | trochę wyższa | wysokie |
| 🔴 Prymityw Subskrypcje | wysoka | wysoka | średnie |
| Nowe źródło jako subskrypcja | niska | wysoka | niskie |

> Dobry osąd to nie trafienie za pierwszym razem. To **wybór następnego kroku**, który odkryje najwięcej niewiadomych przy rozsądnym koszcie.

---

## 4. 🚀 Dźwignia

Szybkość nic nie daje, jeśli **budujemy nie to, co trzeba**.

> *„Najlepsi projektanci i programiści to ci, którzy potrafią ustalić, **co po prostu nie ma znaczenia**.”* — Getting Real (2006)

🧭 **Analogia:** Szybki samochód jadący w złą stronę tylko szybciej oddala cię od celu. A raz wydanej funkcji nie cofniesz łatwo — chodzi o **zaufanie użytkowników**.

### Fundamenty

| Fundament | Po co |
|---|---|
| **Telemetria** | Nie poprawisz czegoś, czego nie mierzysz |
| **Opinie użytkowników** | Czat, rozmowy, zgłoszenia błędów, rozmowy z niedoszłymi klientami |
| **Kontekst biznesowy** | Cele, kierunek, wyzwania, rynek |
| **Analityka produktu** | Wiedza PM-ów o użytkownikach i konkurencji |
| **Środowisko agentów** | Zdalne maszyny / chmura (S01E05) — bez tego nie ma autonomii |
| **Laby** | Proste aplikacje HTML/CSS w produkcie do testowania pomysłów |
| **Kanał beta** | Wersje nightly, gdzie funkcje szybko przychodzą i odchodzą |

### Co dalej?

- Sprawdź, co możesz zrobić z **obecnymi systemami i narzędziami**.
- Przygotuj je na **większą szybkość** i na **agentów działających za użytkowników**.
- Rozważ odważne decyzje — czasem nawet nową wersję systemu.
- Częściej: plan, który zmienia produkt **stopniowo, a potem nagle**.

---

## ✅ Wnioski

- Rola inżyniera to coś **więcej niż kod, błędy i funkcje**.
- Warto myśleć szerzej, nawet jeśli firma jeszcze nie jest gotowa.
- **Autonomiczne programowanie to nie koniec naszej pracy. To nowy rozdział.**

### 📚 Polecane książki

| Książka | O czym |
|---|---|
| [Getting Real](https://basecamp.com/gettingreal) | Co naprawdę ma znaczenie |
| [Empowered](https://www.goodreads.com/book/show/53481975) | Zespoły produktowe z prawdziwą odpowiedzialnością |
| [The Mom Test](https://www.goodreads.com/book/show/52283963) | Jak rozmawiać z klientami, żeby nie kłamali |
| [Shape Up](https://www.goodreads.com/en/book/show/50776459-shape-up) | Jak planować i budować w cyklach |
