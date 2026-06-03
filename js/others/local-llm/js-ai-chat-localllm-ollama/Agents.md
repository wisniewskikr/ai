# Chatbot TypeScript z lokalnym LLM (Ollama)

Projekt to chatbot napisany w TypeScript, który używa lokalnego modelu AI przez Ollama. Działa bez internetu — model działa na Twoim komputerze, nie w chmurze.

---

## Instalacja Ollama na Windows

### 1. Pobierz instalator

Pobierz plik `OllamaSetup.exe` ze strony **https://ollama.com/download/windows** i uruchom go. Ollama zainstaluje się jako serwis systemowy.

### 2. Sprawdź instalację

```bash
ollama --version
```

Ollama nasłuchuje domyślnie na `http://localhost:11434`.

### 3. Pobierz model

```bash
# Lekkie modele — dobre na start
ollama pull llama3.2        # 2 GB — dobry ogólny model
ollama pull mistral         # 4 GB — bardzo dobry model
ollama pull phi3            # 2.3 GB — szybki, od Microsoft
ollama pull qwen2.5-coder   # 4.7 GB — dobry do kodu

# Lista pobranych modeli
ollama list
```

### 4. Przetestuj w terminalu

```bash
ollama run llama3.2
```

### 5. Sprawdź API

```bash
curl http://localhost:11434/api/tags
```

### 6. Usuń model

```bash
# Usuń konkretny model
ollama rm llama3.2

# Sprawdź, co zostało
ollama list
```

Pliki modeli są domyślnie przechowywane w:
```
C:\Users\<TwójUser>\.ollama\models
```
Możesz je usunąć ręcznie, jeśli chcesz zwolnić miejsce na dysku.

### 7. Odinstaluj Ollama z Windows

1. Otwórz **Ustawienia → Aplikacje → Zainstalowane aplikacje**
2. Znajdź **Ollama** i kliknij **Odinstaluj**

Następnie ręcznie usuń pozostałości:

```bash
# Usuń pliki modeli i konfigurację
rmdir /s /q "%USERPROFILE%\.ollama"
```

Lub w PowerShell:
```powershell
Remove-Item -Recurse -Force "$env:USERPROFILE\.ollama"
```

---

## Wymagania sprzętowe

| Rozmiar modelu | RAM | GPU VRAM |
|----------------|-----|----------|
| 7B | 8 GB | 6 GB |
| 13B | 16 GB | 12 GB |
| 70B | 64 GB | 48 GB |

> Bez GPU też działa — tylko wolniej.

---

## Ollama vs LM Studio

Dwa narzędzia do uruchamiania modeli AI na swoim komputerze. Jak wybór między samochodem z GPS a bez — oba dowozą, ale inaczej.

| Cecha | Ollama | LM Studio |
|-------|--------|-----------|
| Interfejs | Terminal | Okienko (GUI) |
| Łatwość startu | Średnia | Bardzo łatwa |
| API | Własne + OpenAI | OpenAI |
| Zarządzanie modelami | Komenda w terminalu | Klikasz myszką |
| Wydajność | Bardzo dobra | Bardzo dobra |
| Działa w tle | Tak (automatycznie) | Nie (trzeba uruchomić) |
| Docker | Tak | Nie |
| Open source | Tak | Częściowo |

### Kiedy wybrać?

- **Ollama** — piszesz kod, chcesz API, lubisz terminal
- **LM Studio** — testujesz modele, wolisz klikać niż pisać

---

## Integracja z TypeScript

Ollama ma oficjalną bibliotekę dla Node.js:

```bash
npm install ollama
```
