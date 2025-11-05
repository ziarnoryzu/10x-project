# Unit Tests Documentation

## Overview

Ten katalog zawiera testy jednostkowe dla kluczowych elementów aplikacji Vibe Travels. Testy napisane są w **Vitest** zgodnie z guidelines projektu i pokrywają logikę biznesową, walidację, utilities i schematy danych.

## Struktura testów

```
test/unit/
├── services/
│   ├── navigation.service.test.ts     # Testy nawigacji i budowania URL
│   └── travel-plan.service.test.ts    # Testy walidacji treści notatek
├── utils/
│   ├── cn.test.ts                      # Testy utility do Tailwind CSS
│   └── redirect-validation.test.ts    # Testy bezpieczeństwa redirectów
├── schemas/
│   └── travel-plan.schema.test.ts     # Testy schematów Zod
└── example.test.ts                     # Przykładowy test
```

## Pokrycie testami

### ✅ 1. Travel Plan Service (`services/travel-plan.service.test.ts`)

**Testowana funkcja:** `validateNoteContent()`

**Reguła biznesowa:** Notatka musi zawierać minimum 10 słów aby umożliwić sensowne wygenerowanie planu podróży przez AI.

**Liczba testów:** 18

**Scenariusze:**
- ❌ Odrzucanie: `null`, pusty string, whitespace-only, < 10 słów
- ✅ Akceptowanie: dokładnie 10 słów, > 10 słów, z whitespace, wielojęzyczne
- 🔍 Edge cases: URLs jako słowa, długie pojedyncze słowa, emoji, liczby

**Przykład:**
```typescript
it("should reject content with fewer than 10 words", () => {
  const content = "Jadę do Paryża na trzy dni w przyszłym tygodniu"; // 9 słów
  expect(service.validateNoteContent(content)).toBe(false);
});
```

---

### ✅ 2. Redirect Validation (`utils/redirect-validation.test.ts`)

**Testowana funkcja:** `validateRedirectUrl()`

**Reguła bezpieczeństwa:** Blokowanie zewnętrznych redirectów aby zapobiec atakom **Open Redirect**.

**Liczba testów:** 35

**Scenariusze:**
- 🔒 Blokowanie: `http://`, `https://`, `//` (external URLs)
- ✅ Akceptowanie: wewnętrzne ścieżki `/app/notes`
- 🔧 Normalizacja: dodawanie `/` do ścieżek bez niego
- 📊 Zachowanie: query params, hash fragments, encoded characters
- 🚨 Security: próby omijania (uppercase, whitespace, backslashes)

**Przykład:**
```typescript
it("should block HTTPS URLs", () => {
  const maliciousUrl = "https://evil.com/steal-credentials";
  expect(validateRedirectUrl(maliciousUrl)).toBe("/app/notes"); // Fallback
  expect(consoleWarnSpy).toHaveBeenCalled(); // Security warning logged
});
```

---

### ✅ 3. CN Utility (`utils/cn.test.ts`)

**Testowana funkcja:** `cn()`

**Reguła biznesowa:** Mergowanie klas CSS z inteligentnym rozwiązywaniem konfliktów Tailwind.

**Liczba testów:** 39

**Scenariusze:**
- 🎨 Podstawowe: mergowanie prostych klas
- ⚔️ Konflikty Tailwind: `px-2` vs `px-4` → ostatnia wygrywa
- 🔀 Conditional classes: obiekty, ternary, warunkowa logika
- 🚫 Falsy values: `undefined`, `null`, `false`, `""` → ignorowane
- 📱 Responsive: breakpoints, dark mode, hover/focus states
- 🎯 Realistyczne: component variants, className overrides

**Przykład:**
```typescript
it("should resolve padding conflicts (last one wins)", () => {
  const result = cn("px-2", "px-4");
  expect(result).toBe("px-4"); // Konflikt rozwiązany
});
```

---

### ✅ 4. Navigation Service (`services/navigation.service.test.ts`)

**Testowane funkcje:** `buildUrl()`, `getQueryParam()`, `getReturnUrl()`, `Routes`

**Reguła biznesowa:** Type-safe budowanie URL z automatycznym pomijaniem `null`/`undefined`.

**Liczba testów:** 47

**Scenariusze:**

#### `buildUrl()`
- ✅ Tworzenie query string z parametrów
- 🚫 Pomijanie `null`/`undefined`
- 🔢 Konwersja liczb na stringi
- 🔤 Enkodowanie specjalnych znaków

#### `getQueryParam()`
- 🌐 Pobieranie z `window.location.search`
- 🖥️ SSR-safe: `null` gdy brak `window`
- 🔠 Case-sensitive nazwy parametrów

#### `Routes` builder
- 🧭 Type-safe route generation
- 📄 Pagination routes
- 🔗 Return URL handling

**Przykład:**
```typescript
it("should skip null parameters", () => {
  const result = buildUrl("/app/notes", { page: 2, filter: null });
  expect(result).toBe("/app/notes?page=2"); // filter pominięty
});
```

---

### ✅ 5. Travel Plan Schemas (`schemas/travel-plan.schema.test.ts`)

**Testowane schematy:** `ActivitySchema`, `DayActivitiesSchema`, `TravelDaySchema`, `TravelPlanContentSchema`

**Reguła biznesowa:** Walidacja struktury planu podróży generowanej przez AI.

**Liczba testów:** 35

**Scenariusze:**

#### `ActivitySchema`
- ✅ Wszystkie kategorie cenowe: `free`, `budget`, `moderate`, `expensive`
- 🔗 Walidacja URL w `mapLink`
- 📍 Opcjonalne pola logistics

#### `TravelDaySchema`
- 📅 Format dat ISO: `YYYY-MM-DD` (regex validation)
- 🔢 Pozytywne liczby całkowite dla `day`
- 🇵🇱 Polski dzień tygodnia (opcjonalny)
- ⏰ Opcjonalne pory dnia (morning, afternoon, evening)

#### `TravelPlanContentSchema`
- ✅ Minimum 1 dzień wymagany
- 📝 Domyślny disclaimer
- 🔀 Mix dni z datami i bez

**Przykład:**
```typescript
it("should validate complete day with date and dayOfWeek", () => {
  const day = {
    day: 1,
    date: "2025-11-15",
    dayOfWeek: "Piątek",
    title: "Przyjazd do Krakowa",
    activities: { evening: [...] }
  };
  expect(TravelDaySchema.safeParse(day).success).toBe(true);
});
```

---

## Uruchamianie testów

### Wszystkie testy
```bash
npm test
```

### Watch mode (development)
```bash
npm run test:watch
```

### UI mode
```bash
npm run test:ui
```

### Coverage
```bash
npm run test:coverage
```

### Konkretny plik
```bash
npm test -- services/travel-plan.service.test.ts
```

### Konkretny test (filter)
```bash
npm test -- -t "should reject null content"
```

---

## Dobre praktyki zastosowane w testach

### ✅ Arrange-Act-Assert Pattern
Każdy test ma wyraźnie wydzielone sekcje:
```typescript
it("should do something", () => {
  // Arrange - przygotowanie danych
  const input = "test";
  
  // Act - wykonanie akcji
  const result = functionUnderTest(input);
  
  // Assert - weryfikacja rezultatu
  expect(result).toBe("expected");
});
```

### ✅ Opisowe nazwy testów
Testy zaczynają się od `should` i opisują oczekiwane zachowanie:
- ✅ `should reject null content`
- ✅ `should block external URLs`
- ❌ ~~`test1`, `nullTest`~~

### ✅ Grupowanie z `describe()`
Testy są logicznie pogrupowane:
```typescript
describe("validateNoteContent", () => {
  describe("should return false for invalid content", () => {
    it("should reject null content", () => {});
    it("should reject empty string", () => {});
  });
  
  describe("edge cases", () => {
    it("should handle URLs as single words", () => {});
  });
});
```

### ✅ Komentarze dokumentujące reguły biznesowe
```typescript
/**
 * REGUŁA BIZNESOWA: Notatka musi zawierać minimum 10 słów
 * aby umożliwić sensowne wygenerowanie planu podróży przez AI.
 */
```

### ✅ Mockowanie zależności
```typescript
vi.mock("@/lib/openrouter.service", () => {
  const OpenRouterService = vi.fn();
  OpenRouterService.prototype.getStructuredData = vi.fn();
  return { OpenRouterService };
});
```

### ✅ Cleanup w afterEach
```typescript
afterEach(() => {
  vi.clearAllMocks();
  consoleWarnSpy.mockRestore();
});
```

---

## Statystyki

- **Pliki testowe:** 6
- **Wszystkie testy:** 176
- **Sukces rate:** 100% ✅
- **Średni czas wykonania:** ~90ms

---

## Co dalej?

### Potencjalne rozszerzenia:

1. **Integration tests dla API endpoints** (`/api/notes`, `/api/travel-plans`)
2. **Component tests dla React** (NotesList, TravelPlanDisplay)
3. **Tests dla auth utilities** (requireAuth, requireAuthApi)
4. **OpenRouterService tests** z mock API responses
5. **Middleware tests** dla Astro

### Wskazówki:

- Dodawaj testy **przed** implementacją nowych feature'ów (TDD)
- Utrzymuj **wysoką czytelność** testów - to dokumentacja kodu
- **Nie testuj implementacji** - testuj zachowanie (behavior)
- Używaj **realistic test data** zamiast `"test"`, `"foo"`, `"bar"`

---

## Pomoc

### Problemy?

1. **Testy wolno się wykonują** → Sprawdź czy nie wykonujesz prawdziwych API calls
2. **Flaky tests** → Unikaj zależności od czasu, randomu, timers
3. **Type errors** → Upewnij się że mocki mają poprawne typy

### Zasoby:

- [Vitest Docs](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Zod Testing Guide](https://zod.dev/)
- [Project Guidelines](../../.cursor/rules/testing-unit-vitest.mdc)
