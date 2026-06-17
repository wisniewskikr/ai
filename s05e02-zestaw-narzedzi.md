# Zestaw narzędzi

## Film do lekcji

Budowanie systemów AI przypomina **składanie mebli z gotowych elementów** zamiast samodzielnego wycinania każdej deski w lesie.

### Skrypty kontra Platformy

| Cecha | Proste skrypty | Gotowe platformy |
| :--- | :--- | :--- |
| **Zastosowanie** | Małe, pojedyncze zadania | Rozbudowane, profesjonalne serwisy |
| **Problemy** | Rozwiązywane doraźnie | Jasno zdefiniowane i powtarzalne |
| **Efektywność** | Wymagają dużo pracy ręcznej | Wykorzystują sprawdzone rozwiązania rynkowe |

### Kluczowe wnioski:

*   **Nie wyważaj otwartych drzwi** – jeśli na rynku istnieje gotowe narzędzie rozwiązujące konkretny problem, warto z niego skorzystać.
*   **AI to nie wszystko** – sama sztuczna inteligencja potrafi wygenerować logikę, ale to za mało, by stworzyć stabilny, rozbudowany serwis.
*   **Szukaj powtarzalności** – twórz własne narzędzia tylko wtedy, gdy wiesz, że przydadzą Ci się w wielu różnych projektach.

**Analogia:**
Budowanie aplikacji AI bez platformy jest jak **próba zbudowania samochodu od podstaw**, zaczynając od samodzielnego odlewania opon. Korzystanie z platformy to jak **zakup gotowego podwozia** – Ty skupiasz się tylko na tym, jak Twój pojazd ma wyglądać i dokąd ma jechać.

## Budowanie interfejsu użytkownika

Budowanie zaawansowanego interfejsu dla agenta AI to nie tylko stworzenie prostego okna czatu. To jak **projektowanie nowoczesnego kokpitu pilota**, który musi przetwarzać dane w czasie rzeczywistym i reagować na dynamiczne zmiany.

Oto kluczowe wyzwania i narzędzia, które pomogą Ci stworzyć taki system:

### 1. Wyzwania w budowie UI dla Agentów
Zwykły czat to „statyczna rozmowa”, ale interfejs agenta to **„żyjący organizm”**.

| Wyzwanie | Dlaczego to trudne? | Analogia |
| :--- | :--- | :--- |
| **Strumieniowanie** | Treść pojawia się po kawałku, co może psuć układ strony. | Jak budowanie mostu w momencie, gdy pociąg już po nim jedzie. |
| **Artefakty i bloki** | Komponenty (np. wykresy, kod) zmieniają swój stan w trakcie generowania. | Interaktywne klocki LEGO, które same się przebudowują na Twoich oczach. |
| **Długie rozmowy** | Wyświetlenie setek wiadomości bez spowolnienia komputera. | Maraton, podczas którego biegacz musi zachować tyle samo energii na starcie, co na 1500. metrze. |

### 2. Twój cyfrowy warsztat (Biblioteki)
Aby interfejs działał płynnie, potrzebujesz zestawu specjalistycznych narzędzi:

*   **markdown-it**: Twój główny **tłumacz**, który zamienia surowy tekst na ładny wygląd HTML.
*   **remend**: **Ekipa remontowa**, która naprawia niedokończone fragmenty tekstu (np. niedomknięte pogrubienie) podczas pisania.
*   **dompurify**: **Ochroniarz**, który sprawdza, czy w odpowiedzi modelu nie przemycono złośliwego kodu.
*   **marked**: **Sortownia**, która dzieli tekst na mniejsze kawałki, dzięki czemu przeglądarka nie musi renderować wszystkiego od nowa przy każdym nowym słowie.
*   **highlight.js**: **Stylista**, który nadaje kolory blokom kodu, by były czytelne.

### 3. Co sprawia, że interfejs staje się „Premium”?
Prawdziwa moc drzemie w detalach, które ułatwiają życie użytkownikowi:

*   **Elastyczność**: Możliwość edytowania wiadomości i tworzenia „rozgałęzień” rozmowy (różne scenariusze).
*   **Multitasking**: Przesyłanie obrazów, dokumentów oraz nagrywanie wiadomości głosowych.
*   **Wizualizacja**: Renderowanie skomplikowanych diagramów (Mermaid), map myśli oraz wzorów matematycznych (LaTeX).
*   **Kontrola**: Skróty klawiszowe, wyszukiwarka wewnątrz rozmowy i przycisk wstrzymujący generowanie.

**Zasada „Mniej znaczy lepiej”:** Choć lista możliwości jest długa, kluczem jest zadbanie o **płynność i detale**, takie jak drobne animacje czy jasne statusy pracy agenta, zamiast przeładowania użytkownika funkcjami.

## Przydatne narzędzia dla agentów

Twój agent to cyfrowy pracownik, a narzędzia to jego **skrzynka z przyborami**. Zamiast uczyć go wszystkiego od zera, dajesz mu gotowe rozwiązania do konkretnych zadań.

### 🛠️ System i Pliki: "Ręce Agenta"
Wyobraź sobie, że agent musi posprzątać w Twoich dokumentach. Zamiast dawać mu klucze do całego domu (terminala), dajesz mu dostęp tylko do wybranych szafek.

| Narzędzie | Co robi? | Dlaczego warto? |
| :--- | :--- | :--- |
| **just-bash** | Wirtualny system plików. | Bezpieczna praca z plikami bez dostępu do terminala. |
| **google-workspace-cli** | Obsługa Google Drive. | Idealne do prywatnych asystentów. |
| **chokidar** | Pilnuje zmian w plikach. | Agent wie natychmiast, gdy coś się zmieni. |
| **daytona / e2b** | Bezpieczne piaskownice (sandboxy). | Pozwalają agentowi bezpiecznie uruchamiać kod. |

### 🌐 Internet: "Oczy i Uszy Agenta"
Internet dla modelu to gigantyczna biblioteka. Te narzędzia pomagają mu sprawnie znajdować i czytać właściwe książki.

*   **agent-browser**: Lokalna przeglądarka (Chrome), która działa "w tle" i oszczędza tokeny.
*   **firecrawl / Jina / Brave**: Specjaliści od przeszukiwania sieci i zamiany stron na tekst zrozumiały dla AI.
*   **browser-use**: Gdy potrzebujesz przeglądarki działającej w chmurze, a nie na własnym komputerze.

### 🎙️ Komunikacja Głosowa: "Mowa Agenta"
Budowanie interfejsu głosowego jest jak nauka rozmowy – agent musi wiedzieć, kiedy zacząć mówić, a kiedy przestać, bo Ty mu przerywasz.

| Funkcja | Narzędzie | Korzyść |
| :--- | :--- | :--- |
| **Interfejs A/V** | **live-kit** | Rozpoznaje ciszę i momenty, gdy wchodzisz agentowi w słowo. |
| **Głos AI** | **elevenlabs** | Oferuje najbardziej naturalne głosy i opcję ich klonowania. |
| **Przetwarzanie dokumentów** | **markitdown** | Zamienia PDF-y i Worda na prosty format Markdown (od Microsoftu). |

**Dwa sposoby na rozmowę z agentem:**
1.  **Klasyczny (STT -> LLM -> TTS):** Agent najpierw zamienia Twój głos na tekst, myśli, a potem generuje odpowiedź głosową. Treść tekstowa jest tu oddzielona od dźwięku.
2.  **Realtime (np. Gemini Live):** Agent przetwarza dźwięk bezpośrednio, co pozwala na interakcję w czasie rzeczywistym, ale jest obecnie droższe.

### 🧠 Pamięć i Dane: "Szafa na Dokumenty"
Aby agent nie zapomniał, o czym rozmawialiście wczoraj, potrzebuje bazy danych.

*   **sqlite-vec**: Prosty sposób na dodanie "pamięci semantycznej" do małych projektów (rozszerzenie SQLite).
*   **qdrant**: Potężna wyszukiwarka wektorowa dla dużych projektów, gdzie zwykłe bazy to za mało.

**Pamiętaj:** Wiele z tych narzędzi jest nowych i szybko się zmienia, więc dobieraj je ostrożnie i z zachowaniem dystansu.

## Silniki wyszukiwania i bazy wektorowe

Wybór odpowiedniej architektury dla systemu RAG przypomina dobieranie pojazdu do podróży: nie potrzebujesz ciężarówki, aby skoczyć po zakupy do osiedlowego sklepu.

### Porównanie podejść: Rozszerzenia vs Dedykowane rozwiązania

Współczesne systemy pozwalają na integrację wyszukiwania bezpośrednio w bazach danych lub korzystanie z wyspecjalizowanych narzędzi.

| Cecha | Rozszerzenia (np. SQLite + fts5/vec) | Dedykowane silniki (np. Qdrant, Algolia) |
| :--- | :--- | :--- |
| **Złożoność** | Niska – wszystko w jednej bazie | Bardzo wysoka – skomplikowany stos technologiczny |
| **Skala danych** | Mała i średnia | Ogromne zestawy danych |
| **Możliwości** | Podstawowe wyszukiwanie hybrydowe | Zaawansowane filtrowanie i grupowanie |
| **Utrzymanie** | Proste (np. Supabase, PostgreSQL) | Trudne (wymaga synchronizacji danych) |

---

### Strategie wyboru — którą drogą iść?

Decyzja o architekturze zależy od charakterystyki Twojego projektu:

*   **Podejście "Grep" (Pliki tekstowe)**:
    *   **Analogia**: Jak przeszukiwanie fizycznych dokumentów w segregatorze.
    *   Bardzo proste w realizacji i często wystarczająco skuteczne.
    *   Stosowane w narzędziach takich jak Claude Code.
*   **Wyszukiwanie Hybrydowe (Standard)**:
    *   **Zasada**: Nigdy nie używaj samych baz wektorowych.
    *   Łączy wyszukiwanie pełnotekstowe (słowa kluczowe) z semantycznym (znaczenie).
    *   Jeśli klasyczny `grep` lub SQL nie wystarcza, rozszerz go o wektory.
*   **Wczytywanie do kontekstu**:
    *   Czasami wyszukiwanie w ogóle nie jest potrzebne.
    *   Priorytetyzuje szybkość działania kosztem precyzji (podobnie jak mechanika pamięci w ChatGPT).
*   **Grafy wiedzy**:
    *   **Analogia**: Jak szczegółowa mapa powiązań między ludźmi i miejscami.
    *   Oferują najwyższą skuteczność, ale wiążą się z wysokimi kosztami i złożoną logiką.

### Kluczowe zasady ("Mniej znaczy lepiej")

1.  **Zacznij od prostoty**: Wykorzystaj to, co już znasz (np. PostgreSQL lub SQLite), zanim przejdziesz do dedykowanych baz wektorowych.
2.  **Skaluj tylko, gdy musisz**: Na dedykowane rozwiązania zdecyduj się dopiero, gdy wymagają tego ogromne zbiory danych lub krytyczna wydajność.
3.  **Łącz metody**: Najlepsze efekty daje podejście hybrydowe, dopasowane do konkretnego problemu, a nie jedno uniwersalne narzędzie.

## Własne rozwiązania i narzędzia

Tworzenie własnych narzędzi AI przypomina budowanie **spersonalizowanego warsztatu**, w którym zamiast szukać uniwersalnego klucza, projektujesz narzędzia idealnie pasujące do Twoich dłoni,.

Oto zestawienie kluczowych obszarów, w których możesz budować własne rozwiązania:

### Twój Cyfrowy Warsztat

| Obszar | Co warto przygotować? | Analogia |
| :--- | :--- | :--- |
| **Prompty** | Biblioteka powtarzalnych instrukcji pod skrótami klawiszowymi. | **Szybkie wybieranie** w telefonie. |
| **Zarządzanie Plikami** | Narzędzia do łączenia AI z Notion czy Google Drive. | **Asystent**, który wie, gdzie leży każdy dokument. |
| **Dostęp do Chmury** | Funkcje odczytu i wgrywania plików na serwery. | **Paczkomat** dostępny dla Twojego agenta 24/7. |
| **Generowanie treści** | Szablony dokumentów i automatyczne tabele. | **Foremka do ciasta**, która zawsze daje ten sam kształt. |
| **Sandbox** | Bezpieczne środowisko do testowania ryzykownych akcji. | **Laboratorium**, w którym wybuchy nie niszczą budynku. |
| **CLI / MCP** | Przenośne integracje między różnymi agentami. | **Szwajcarski scyzoryk**, który pasuje do każdej kieszeni. |

### Jak zacząć? (Zasada "Mniej znaczy lepiej")

*   **Zacznij od małego kroku:** Stwórz jedną integrację CLI lub serwer MCP. Gdy poczujesz jej wartość, łatwiej będzie budować kolejne,.
*   **Buduj z klocków:** Traktuj swoje rozwiązania jak komponenty, które możesz układać w dowolne konfiguracje.
*   **Wykorzystaj AI do pomocy:** Poproś LLM o napisanie kodu dla Twoich pierwszych prostych narzędzi.
*   **Zrób "przegląd":** Przetestuj ("przeklikaj") dostępne narzędzia, by wiedzieć, co masz w zasięgu ręki, nawet jeśli nie użyjesz ich dzisiaj.

Pamiętaj, że własny interfejs to jak **kokpit pilota** – może być skomplikowany, ale daje Ci pełną kontrolę i personalizację, której nie znajdziesz w gotowych rozwiązaniach.
