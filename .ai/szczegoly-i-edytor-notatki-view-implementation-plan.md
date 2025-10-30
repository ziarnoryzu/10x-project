# Plan implementacji widoku: Szczegóły i Edytor Notatki

## 1. Przegląd
Widok "Szczegóły i Edytor Notatki" jest centralnym miejscem do interakcji z pojedynczą notatką podróżniczą. Umożliwia użytkownikom przeglądanie i edycję treści notatki, zarządzanie nią poprzez kopiowanie lub usuwanie, a także przeglądanie powiązanego z nią, wygenerowanego przez AI planu podróży. Widok ten implementuje kluczowe funkcjonalności aplikacji, takie jak edycja w czasie rzeczywistym z autozapisem oraz inicjowanie generowania planu podróży.

## 2. Routing widoku
Widok będzie dostępny pod dynamiczną ścieżką, gdzie `[noteId]` jest unikalnym identyfikatorem notatki.
- **Ścieżka:** `/app/notes/[noteId]`
- **Plik:** `src/pages/app/notes/[noteId].astro`

## 3. Struktura komponentów
Hierarchia komponentów zostanie zorganizowana w celu oddzielenia odpowiedzialności, od pobierania danych i zarządzania stanem na najwyższym poziomie, po renderowanie UI w komponentach podrzędnych.

```
- MainLayout
  - NoteDetailView (Komponent główny, renderowany przez Astro)
    - NoteHeader
      - NoteActions (Przyciski: Generuj/Regeneruj Plan, Kopiuj, Usuń)
    - NoteEditor (Formularz edycji tytułu i treści z wskaźnikiem statusu autozapisu)
    - TravelPlanView (Warunkowo renderowany widok planu podróży)
    - ConfirmationModal (Modal do potwierdzania akcji destrukcyjnych)
    - GeneratePlanModal (Modal z opcjami personalizacji planu)
```

## 4. Szczegóły komponentów

### `NoteDetailView` (Komponent-kontener)
- **Opis komponentu:** Główny komponent strony, odpowiedzialny za pobranie danych notatki i planu podróży na podstawie `noteId` z URL. Zarządza całym stanem widoku, w tym logiką autozapisu, obsługą modali i wywołaniami API.
- **Główne elementy:** Renderuje komponenty `NoteHeader`, `NoteEditor` i `TravelPlanView`. Wyświetla wskaźniki ładowania lub komunikaty o błędach.
- **Obsługiwane interakcje:**
    - Pobieranie danych przy pierwszym renderowaniu.
    - Otwieranie modali (`ConfirmationModal`, `GeneratePlanModal`).
    - Wywoływanie akcji (usuń, kopiuj, generuj plan) w odpowiedzi na zdarzenia z komponentów podrzędnych.
- **Obsługiwana walidacja:** Brak bezpośredniej walidacji; przekazuje dane walidacyjne (np. `isReadyForPlanGeneration`) do komponentów podrzędnych.
- **Typy:** `NoteWithPlanViewModel`, `AutosaveStatusViewModel`.
- **Propsy:** `noteId: string`.

### `NoteEditor`
- **Opis komponentu:** Interaktywny formularz do edycji tytułu i treści notatki. Implementuje logikę autozapisu i wizualnie komunikuje jego status (np. "Zapisywanie...", "Zapisano").
- **Główne elementy:**
    - `Input` dla tytułu notatki.
    - `Textarea` dla treści notatki.
    - Element tekstowy wyświetlający datę ostatniej modyfikacji i status zapisu.
- **Obsługiwane interakcje:**
    - `onChange` na polach `Input` i `Textarea`, które propaguje zmiany do `NoteDetailView`.
- **Obsługiwana walidacja:** Brak; logiką walidacji (np. długość notatki) zarządza komponent nadrzędny.
- **Typy:** `NoteEditorViewModel`.
- **Propsy:**
    - `note: NoteEditorViewModel`
    - `onNoteChange: (field: 'title' | 'content', value: string) => void`

### `NoteActions`
- **Opis komponentu:** Pasek narzędzi z przyciskami do wykonywania głównych akcji na notatce.
- **Główne elementy:**
    - `Button` "Generuj plan" / "Regeneruj plan".
    - `Button` "Kopiuj".
    - `Button` "Usuń".
- **Obsługiwane interakcje:** `onClick` na każdym przycisku, wywołujące odpowiednie funkcje zwrotne.
- **Obsługiwana walidacja:** Przycisk "Generuj plan" jest wyłączony (`disabled`), jeśli notatka nie spełnia kryterium minimalnej długości. Tooltip wyjaśnia powód.
- **Typy:** Brak specyficznych typów.
- **Propsy:**
    - `isReadyForPlanGeneration: boolean`
    - `hasTravelPlan: boolean`
    - `onGenerateClick: () => void`
    - `onCopyClick: () => void`
    - `onDeleteClick: () => void`

### `TravelPlanView`
- **Opis komponentu:** Komponent tylko do odczytu, wyświetlający w ustrukturyzowany sposób wygenerowany plan podróży.
- **Główne elementy:** Struktura zagnieżdżonych `div` lub `section` renderujących dni, pory dnia i poszczególne aktywności zgodnie ze schematem `TravelPlanContent`.
- **Obsługiwane interakcje:** Brak.
- **Obsługiwana walidacja:** Brak.
- **Typy:** `TypedTravelPlan`.
- **Propsy:** `plan: TypedTravelPlan`.

## 5. Typy
Do implementacji widoku potrzebne będą nowe, specyficzne dla frontendu modele widoku (ViewModel), które będą pochodnymi istniejących typów DTO.

- **`NoteWithPlanViewModel`**
  - **Cel:** Reprezentuje kompletny stan danych dla widoku, łącząc dane z API z obliczonymi właściwościami na potrzeby UI.
  - **Pola:**
    - `id: string` - ID notatki.
    - `title: string` - Tytuł notatki.
    - `content: string | null` - Treść notatki.
    - `createdAt: string` - Sformatowana data utworzenia.
    - `updatedAt: string` - Sformatowana data ostatniej modyfikacji (np. "2 godziny temu").
    - `travelPlan: TypedTravelPlan | null` - Powiązany, silnie typowany plan podróży.
    - `wordCount: number` - Liczba słów w treści notatki.
    - `isReadyForPlanGeneration: boolean` - Flaga `true`, jeśli `wordCount >= 10`.

- **`AutosaveStatusViewModel`**
  - **Cel:** Typ wyliczeniowy (enum) do śledzenia stanu operacji autozapisu.
  - **Wartości:** `'idle'` (bezczynny), `'saving'` (zapisywanie), `'success'` (zapisano pomyślnie), `'error'` (błąd zapisu).

- **`NoteEditorViewModel`**
  - **Cel:** Model widoku dla komponentu `NoteEditor`.
  - **Pola:**
    - `title: string`
    - `content: string | null`
    - `status: AutosaveStatusViewModel`
    - `lastSavedTimestamp: string` - Sformatowana data ostatniego pomyślnego zapisu.

## 6. Zarządzanie stanem
Cała logika związana ze stanem, pobieraniem danych i akcjami zostanie zamknięta w customowym hooku `useNoteDetail(noteId: string)`. Takie podejście zapewnia czystość komponentu `NoteDetailView` i separację logiki od prezentacji.

- **Hook `useNoteDetail(noteId)` będzie zarządzał:**
  - Stanem ładowania (`isLoading`) i błędów (`error`) dla początkowego pobrania danych.
  - Głównym obiektem stanu `note: NoteWithPlanViewModel | null`.
  - Stanem autozapisu `autosaveStatus: AutosaveStatusViewModel`.
  - Stanami ładowania dla poszczególnych akcji (`isDeleting`, `isCopying`).
  - Widocznością modali (`isDeleteDialogOpen`).
- **Hook będzie eksponował:**
  - Wartości stanu (np. `note`, `isLoading`, `autosaveStatus`).
  - Funkcje do obsługi akcji:
    - `updateNote(changes: UpdateNoteDTO)`: Debouncowana funkcja do zapisu zmian.
    - `deleteNote()`: Wywołuje API usuwania.
    - `copyNote()`: Wywołuje API kopiowania.
    - `generatePlan(options: GenerationOptions)`: Wywołuje API generowania planu.

## 7. Integracja API
Integracja będzie polegać na wywoływaniu odpowiednich endpointów API w reakcji na akcje użytkownika i cykl życia komponentu.

- **`GET /api/notes/{noteId}`** i **`GET /api/notes/{noteId}/travel-plan`**:
  - **Wywołanie:** Przy montowaniu komponentu `NoteDetailView`.
  - **Typy odpowiedzi:** `NoteDTO` i `TravelPlanDTO`.
  - **Akcja frontendu:** Połączenie odpowiedzi w obiekt `NoteWithPlanViewModel` i zapisanie w stanie.

- **`PUT /api/notes/{noteId}`**:
  - **Wywołanie:** Debouncowane wywołanie po zmianie treści w `NoteEditor`.
  - **Typ żądania:** `UpdateNoteDTO`.
  - **Akcja frontendu:** Aktualizacja `autosaveStatus` przed i po wywołaniu. Wyświetlanie toastów w przypadku błędu.

- **`DELETE /api/notes/{noteId}`**:
  - **Wywołanie:** Po potwierdzeniu w `ConfirmationModal`.
  - **Akcja frontendu:** Przekierowanie do listy notatek (`/app/notes`) po pomyślnym usunięciu. Wyświetlenie toasta z informacją o sukcesie/błędzie.

- **`POST /api/notes/{noteId}/copy`**:
  - **Wywołanie:** Po kliknięciu przycisku "Kopiuj".
  - **Typ odpowiedzi:** `NoteDTO` (nowo utworzona notatka).
  - **Akcja frontendu:** Przekierowanie do widoku edycji nowej notatki (`/app/notes/{newNoteId}`) po sukcesie. Wyświetlenie toasta.

- **`POST /api/notes/{noteId}/generate-plan`**:
  - **Wywołanie:** Po wypełnieniu i zatwierdzeniu `GeneratePlanModal`.
  - **Typ żądania:** `GenerateTravelPlanCommand`.
  - **Akcja frontendu:** Po sukcesie, odświeżenie danych planu podróży i zamknięcie modala.

## 8. Interakcje użytkownika
- **Edycja notatki:** Użytkownik wpisuje tekst w polach tytułu lub treści. Po 1.5 sekundach bezczynności, UI pokazuje status "Zapisywanie...", a następnie "Zapisano".
- **Usuwanie notatki:** Kliknięcie "Usuń" otwiera modal. Potwierdzenie powoduje usunięcie notatki i przekierowanie na listę notatek.
- **Kopiowanie notatki:** Kliknięcie "Kopiuj" powoduje utworzenie kopii i natychmiastowe przekierowanie do jej edycji.
- **Generowanie planu:** Kliknięcie "Generuj plan" otwiera modal z opcjami. Po zatwierdzeniu, UI pokazuje stan ładowania, a następnie wyświetla nowo wygenerowany plan. Jeśli plan już istnieje, najpierw pojawi się modal z prośbą o potwierdzenie nadpisania.

## 9. Warunki i walidacja
- **Warunek:** Generowanie planu jest możliwe tylko dla notatek zawierających co najmniej 10 słów.
  - **Komponent:** Logika w `useNoteDetail`, UI w `NoteActions`.
  - **Weryfikacja:** Na podstawie `note.wordCount`.
  - **Efekt w UI:** Przycisk "Generuj plan" jest nieaktywny (`disabled`). Tooltip na przycisku informuje: "Dodaj więcej szczegółów do notatki (min. 10 słów), aby wygenerować plan."

## 10. Obsługa błędów
- **Błąd pobierania danych:** Jeśli `GET /api/notes/{noteId}` zwróci 404, wyświetlony zostanie komunikat "Nie znaleziono notatki" z linkiem powrotnym. Przy błędzie 500, wyświetlony zostanie generyczny komunikat o błędzie z przyciskiem "Spróbuj ponownie".
- **Błąd autozapisu:** `autosaveStatus` zmieni się na `'error'`. W `NoteEditor` pojawi się stały komunikat "Błąd zapisu". Dodatkowo, zostanie wyświetlony toast z komunikatem błędu.
- **Błąd usuwania/kopiowania:** Operacja zostanie przerwana, a użytkownikowi zostanie wyświetlony toast z informacją o niepowodzeniu. Użytkownik pozostanie w bieżącym widoku.
- **Błąd generowania planu:** W `GeneratePlanModal` zostanie wyświetlony komunikat o błędzie, a wskaźnik ładowania zostanie ukryty, pozwalając użytkownikowi spróbować ponownie.

## 11. Kroki implementacji
1.  **Struktura plików:** Utworzenie pliku `src/pages/app/notes/[noteId].astro` oraz plików dla komponentów React: `NoteDetailView.tsx`, `NoteEditor.tsx`, `NoteActions.tsx`, `TravelPlanView.tsx`.
2.  **Definicje typów:** Zdefiniowanie `NoteWithPlanViewModel`, `AutosaveStatusViewModel` i `NoteEditorViewModel` w `src/types.ts`.
3.  **Custom Hook (`useNoteDetail`):** Implementacja haka z logiką pobierania danych (`fetch`), stanami `isLoading` i `error`.
4.  **Komponent `NoteDetailView`:** Implementacja głównego komponentu, który używa `useNoteDetail` i renderuje szkielet UI, stany ładowania i błędu.
5.  **Komponent `NoteEditor`:** Budowa formularza i połączenie go ze stanem i funkcją `updateNote` z haka nadrzędnego. Implementacja logiki wyświetlania statusu autozapisu.
6.  **Logika autozapisu:** Dodanie w `useNoteDetail` debouncingu dla funkcji `updateNote` oraz obsługa wywołania `PUT /api/notes/{noteId}`.
7.  **Komponenty `NoteActions` i `TravelPlanView`:** Implementacja paska akcji oraz widoku planu, przekazując im odpowiednie propsy.
8.  **Implementacja akcji:** Dodanie do `useNoteDetail` funkcji `deleteNote` i `copyNote` wraz z obsługą API (`DELETE`, `POST /copy`) i logiką przekierowań.
9.  **Implementacja generowania planu:** Stworzenie `GeneratePlanModal` i dodanie funkcji `generatePlan` do `useNoteDetail`, włączając w to logikę potwierdzenia nadpisania istniejącego planu.
10. **Obsługa błędów i przypadków brzegowych:** Finalizacja obsługi wszystkich możliwych scenariuszy błędów za pomocą komponentu `Toast` (z Shadcn/ui) i komunikatów w UI.
11. **Stylowanie i dopracowanie UI:** Zastosowanie Tailwind CSS i komponentów Shadcn/ui do finalnego wyglądu, dbając o spójność z resztą aplikacji.
