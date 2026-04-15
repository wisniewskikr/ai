# MODELE LOKALNE

Modele lokalne to jak mały robot w Twoim komputerze.  
Możesz z nim rozmawiać nawet bez internetu.

## 1) LM Studio

LM Studio to prosty program do uruchamiania modeli lokalnie.

| Co to robi? | Prosto |
|---|---|
| Interfejs | Klikasz i model działa |
| Tryb serwera OpenAI | Inne aplikacje mogą gadać z modelem jak z API OpenAI |
| RAG | Model może czytać Twoje pliki i lepiej odpowiadać |
| SDK dla programistów | Łatwo podłączyć model w kodzie |

## 2) Rozmiar modelu (3B, 7B)

- `B` = miliardy parametrów (czyli "części mózgu" modelu).
- `3B` lub `7B` mogą być bardzo wolne na słabszym sprzęcie.

| Wersja | Co to znaczy |
|---|---|
| 3B | mniejszy model |
| 7B | większy model, zwykle lepszy, ale cięższy |

## 3) Kontekst (tokeny)

Kontekst to ile tekstu model "pamięta naraz".

- Przykłady: `2048`, `16K`, `36K`, `128K` tokenów.
- Większy kontekst = więcej potrzebnej pamięci.
- Zapotrzebowanie na RAM rośnie bardzo szybko (prawie jak do kwadratu).
- Przykład: około `8K` kontekstu może potrzebować ~`36 GB RAM`.

| Kontekst | Co to oznacza |
|---|---|
| 2048 | mało pamięta |
| 16K | pamięta dużo więcej |
| 36K | długie rozmowy/teksty |
| 128K | bardzo długi kontekst, duże wymagania |

## 4) RAM vs VRAM

| Pamięć | Co to jest |
|---|---|
| RAM | pamięć komputera |
| VRAM | pamięć karty graficznej |

- VRAM to po prostu RAM na GPU.

## 5) Kwantyzacja

Kwantyzacja = zapis wag modelu w niższej precyzji.

- To trochę jak kompresja zdjęcia: mniejszy plik, lekka utrata jakości.
- Dzięki temu model działa szybciej i potrzebuje mniej pamięci.

| Format | Prosto |
|---|---|
| FP32 | bardzo dokładny, ciężki |
| FP16 | lżejszy |
| INT8 | jeszcze lżejszy |
| INT4 | bardzo lekki |
| 1 BIT | ultra lekki, największa utrata jakości |

## 6) Typy modeli

| Typ | Znaczenie |
|---|---|
| BASE | bazowy model po treningu |
| CHAT / INSTRUCT | po fine-tune, lepiej rozmawia i rozumie polecenia |
| ROLE PLAY | po fine-tune, bardziej kreatywny |
| CODING | nastawiony na programowanie |

- **Fine-tune** = dodatkowe dotrenowanie modelu do konkretnego stylu/pracy.

## 7) Szybkość

- Do `7B` często można uzyskać kilkadziesiąt tokenów na sekundę.
- Realna szybkość zależy od CPU, GPU, RAM/VRAM i kwantyzacji.
