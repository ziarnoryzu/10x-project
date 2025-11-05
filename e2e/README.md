# E2E Tests - Playwright

## Struktura testów

```
e2e/
├── fixtures/
│   └── testContext.ts       # Custom fixtures with cleanup mechanism
├── helpers/
│   ├── AuthHelper.ts        # Authentication utilities
│   └── cleanupHelper.ts     # Database cleanup utilities
├── pages/
│   ├── NotesListPage.ts     # Page Object Model for notes list
│   ├── NoteEditorPage.ts    # Page Object Model for note editor
│   └── index.ts             # Barrel export
└── notes.spec.ts            # Note management tests
```

## Mechanizm czyszczenia danych testowych

Testy E2E używają chmurowej bazy danych Supabase. Aby zapobiec gromadzeniu się śmieci testowych, zaimplementowano automatyczny mechanizm czyszczenia.

### Jak używać

1. **Import custom test fixture** zamiast standardowego `test` z Playwright:

```typescript
import { test } from "./fixtures/testContext";
import { expect } from "@playwright/test";
```

2. **Użyj fixtures w teście**:

```typescript
test("should create note", async ({ authenticatedPage, createdNoteIds }) => {
  const page = authenticatedPage; // Automatycznie zalogowana strona
  
  // Twój kod testowy...
  
  // Po utworzeniu notatki, dodaj jej ID do listy do czyszczenia
  const noteId = await extractNoteIdFromUrl(page);
  if (noteId) {
    createdNoteIds.push(noteId);
  }
});
```

### Dostępne fixtures

#### `authenticatedPage`
- Automatycznie loguje użytkownika testowego przed każdym testem
- Obsługuje modal z preferencjami użytkownika
- Zwraca gotową do użycia instancję `Page`

#### `createdNoteIds`
- Array do trackowania ID utworzonych notatek
- Po zakończeniu testu automatycznie usuwa wszystkie notatki z listy
- Używa Supabase client do wykonania operacji DELETE

### Helpers

#### `extractNoteIdFromUrl(page)`
Wyciąga ID notatki z URL po nawigacji do `/app/notes/[id]`

```typescript
import { extractNoteIdFromUrl } from "./helpers/cleanupHelper";

const noteId = await extractNoteIdFromUrl(page);
if (noteId) {
  createdNoteIds.push(noteId);
}
```

#### `cleanupAllUserNotes(userId)`
Usuwa WSZYSTKIE notatki danego użytkownika. Używaj ostrożnie!

```typescript
import { cleanupAllUserNotes } from "./helpers/cleanupHelper";

// W test.afterAll lub w specjalnym teście cleanup
await cleanupAllUserNotes("user-uuid");
```

## Uruchamianie testów

```bash
# Wszystkie testy E2E
npx playwright test

# Konkretny plik
npx playwright test notes.spec.ts

# Z widocznym browserem
npx playwright test --headed

# Z UI mode
npx playwright test --ui

# Debug mode
npx playwright test --debug
```

## Zmienne środowiskowe

Testy E2E ładują zmienne z pliku `.env.test`:

- `E2E_USERNAME` - email użytkownika testowego
- `E2E_PASSWORD` - hasło użytkownika testowego
- `SUPABASE_URL` - URL bazy danych Supabase
- `SUPABASE_ANON_KEY` - Klucz publiczny Supabase

## Page Object Model

Wszystkie interakcje z UI są enkapsulowane w klasach Page Object Model:

### NotesListPage
- `clickCreateNote()` - Klika przycisk "Nowa notatka"
- `clickCreateFirstNote()` - Klika przycisk gdy lista jest pusta
- `getNotesCount()` - Zwraca liczbę notatek na liście
- `isEmptyStateVisible()` - Sprawdza czy widoczny jest empty state

### NoteEditorPage
- `fillTitle(title)` - Wypełnia pole tytułu
- `fillContent(content)` - Wypełnia pole treści
- `fillNote(title, content)` - Wypełnia oba pola jednocześnie
- `waitForAutosave()` - Czeka na automatyczny zapis
- `isSaved()` - Sprawdza czy notatka została zapisana
- `getWordCount()` - Zwraca liczbę słów w notatce
- `clickBackToList()` - Klika przycisk powrotu do listy

## Best Practices

1. **Zawsze trackuj utworzone notatki** - Dodawaj ID do `createdNoteIds`
2. **Używaj selektorów hybrydowych** - data-test-id + fallback na tekst
3. **Czekaj na auto-save** - Używaj `waitForAutosave()` przed nawigacją
4. **Weryfikuj zapis** - Sprawdzaj `isSaved()` po wypełnieniu notatki
5. **Używaj Page Object Model** - Nie piszesz selektorów bezpośrednio w testach
