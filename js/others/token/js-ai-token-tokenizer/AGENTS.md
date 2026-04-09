# AI Chat Token Tokenizer — Specyfikacja aplikacji

## Opis

Konsolowa aplikacja czatu AI z podglądem liczby tokenów przed wysłaniem wiadomości i po otrzymaniu odpowiedzi.

## Konfiguracja

- Model i parametry API definiowane w `config.json` (model, maxTokens, temperature, baseUrl)
- Klucz API pobierany ze zmiennej środowiskowej `OPENROUTER_API_KEY` z pliku `.env`

## Funkcjonalności

### Ekran startowy i po `/clear`
Przy uruchomieniu oraz po wyczyszczeniu konsoli wyświetlane są dostępne polecenia:
```
Dostępne polecenia:
  /clear  — czyści konsolę
  /exit   — kończy pracę
```

### Przepływ rozmowy

1. Użytkownik wpisuje wiadomość
2. Aplikacja oblicza **przewidywaną liczbę tokenów inputu** (cały kontekst: historia + nowa wiadomość)
3. Aplikacja wyświetla tę liczbę i pyta: **"Czy chcesz kontynuować? (t/n)"**
4. Jeśli użytkownik potwierdzi (`t`), wiadomość jest wysyłana do API
5. Wyświetlana jest **odpowiedź AI**
6. Pod odpowiedzią wyświetlane jest podsumowanie tokenów:
   ```
   Tokeny — przewidywane input: X | rzeczywiste input: Y | output: Z
   ```

### Polecenia specjalne

| Polecenie | Działanie |
|-----------|-----------|
| `/clear`  | Czyści ekran konsoli, resetuje historię rozmowy, wyświetla ponownie listę poleceń |
| `/exit`   | Kończy działanie aplikacji |

## Wymagania techniczne

- Node.js
- Biblioteka `@anthropic-ai/sdk` lub dedykowana biblioteka tokenizacji (np. `tiktoken` / `js-tiktoken`) do szacowania tokenów **przed** wysłaniem
- Wywołania API przez OpenRouter (baseUrl z `config.json`)
- Historia rozmowy przechowywana w pamięci (tablica wiadomości `messages`)
- Liczba tokenów inputu szacowana lokalnie na podstawie całej historii + nowej wiadomości
- Rzeczywista liczba tokenów pobierana z odpowiedzi API (`usage.prompt_tokens`, `usage.completion_tokens`)
