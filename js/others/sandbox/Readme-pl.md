# Sandbox w kontekście agentów AI

**Sandbox** to izolowane środowisko wykonawcze, w którym agent AI może uruchamiać kod, wykonywać polecenia i podejmować działania — bez ryzyka uszkodzenia systemu hosta, wycieku danych lub niekontrolowanych efektów ubocznych.

Kluczowa zasada: agent działa wewnątrz "piaskownicy", skąd nie może wyjść bez zgody systemu nadrzędnego.

---

## Podstawowe rodzaje sandboxów

### 1. Izolacja procesów (OS-level)
- Ograniczenia syscalli (np. `seccomp` na Linuxie)
- Oddzielne przestrzenie nazw (`namespaces`: filesystem, network, PID)
- Przykład: każdy agent dostaje własny chroot lub Linux namespace

### 2. Kontenery (Docker/OCI)
- Najczęściej stosowane w praktyce
- Izolacja filesystem, sieci, zasobów (CPU/RAM)
- Krótkotrwałe kontenery: po zakończeniu zadania — zniszczone
- Przykład: **E2B**, **Modal**, Docker-in-Docker

### 3. Maszyny wirtualne (VM-level)
- Silniejsza izolacja niż kontenery (osobne jądro)
- Wyższy overhead, ale większe bezpieczeństwo
- Przykład: **Firecracker** (używany przez AWS Lambda), **gVisor**

### 4. WebAssembly (WASM)
- Sandbox na poziomie runtime — kod WASM nie ma dostępu do systemu bez jawnych uprawnień
- Bardzo lekki, działa w przeglądarce i na serwerze
- Przykład: **Extism**, **wasmtime**

### 5. Sandbox w chmurze (managed)
- Gotowe usługi: **E2B Sandbox**, **Daytona**, **Modal**
- Agent dostaje efemeryczne środowisko przez API
- Brak konfiguracji infrastruktury po stronie dewelopera

---

## E2B: chmura managed vs self-hosted

E2B można używać na dwa sposoby, które różnią się modelem dostępu, ale pod spodem używają tej samej technologii izolacji (Firecracker micro-VM):

| | **E2B Cloud (managed)** | **E2B Self-hosted** |
|---|---|---|
| Dostęp | API + SDK, bez własnej infrastruktury | Własny serwer Linux z KVM |
| Konfiguracja | Brak — `Sandbox.create()` i gotowe | Złożona (`e2b-dev/infra` na GitHubie) |
| Izolacja | Firecracker VM (osobne jądro) | Firecracker VM (osobne jądro) |
| Działa na Dockerze? | Nie dotyczy | Nie — wymaga KVM, nie działa w nested Docker |
| Koszt | Płatne za czas działania sandboxa | Własna infrastruktura (prąd, serwer, ops) |
| Kiedy używać? | Development, produkcja bez własnego infra | Regulacje, air-gap, pełna kontrola danych |

> **Kluczowa różnica** nie leży w technologii, lecz w tym, *kto zarządza infrastrukturą*. W obu przypadkach sandbox to izolowana micro-VM, a nie zwykły kontener Docker.

---

## Dlaczego sandbox jest krytyczny dla agentów?

| Zagrożenie | Jak sandbox chroni |
|---|---|
| Uruchomienie złośliwego kodu | Izoluje filesystem i sieć |
| Prompt injection → wykonanie `rm -rf /` | Agent nie ma dostępu do hosta |
| Wyciek kluczy API | Kontrola zmiennych środowiskowych |
| Nieskończone pętle / zużycie zasobów | Limity CPU/RAM/timeout |
