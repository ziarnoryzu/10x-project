# Plan implementacji widoku Lista Notatek (Dashboard)

## 1. Przegląd
Widok "Lista Notatek" jest głównym pulpitem aplikacji po zalogowaniu użytkownika. Jego celem jest wyświetlenie paginowanej listy wszystkich notatek podróżniczych użytkownika, umożliwienie nawigacji do szczegółów każdej notatki oraz inicjowanie procesu tworzenia nowej notatki. Widok obsługuje również stan pusty (gdy użytkownik nie ma żadnych notatek) oraz stan ładowania.

## 2. Routing widoku
Widok będzie dostępny pod następującą ścieżką:
-   **Ścieżka:** `/app/notes`
-   **Plik:** `src/pages/app/notes.astro`

## 3. Struktura komponentów
Komponenty zostaną zorganizowane w hierarchiczną strukturę, gdzie strona Astro renderuje główny komponent React, który zarządza stanem i logiką.

```
/src/pages/app/notes.astro
└── /src/layouts/MainLayout.astro
    └── /src/components/NotesDashboard.tsx (client:load)
        ├── /src/components/OnboardingBanner.tsx (warunkowo)
        ├── /src/components/ui/Button.tsx ("Nowa notatka")
        ├── if (isLoading)
        │   └── /src/components/NotesListSkeleton.tsx
        ├── else if (notes.length === 0)
        │   └── /src/components/EmptyState.tsx
        └── else
            ├── /src/components/NotesList.tsx
            │   └── /src/components/NoteListItem.tsx[]
            └── /src/components/Pagination.tsx
```

## 4. Szczegóły komponentów

### `NotesDashboard.tsx`
-   **Opis komponentu:** Główny, inteligentny komponent widoku. Odpowiada za zarządzanie stanem (ładowanie, błędy, dane), wywoływanie hooka `useNotes` do pobierania danych oraz warunkowe renderowanie odpowiednich komponentów podrzędnych (szkielet, stan pusty, lista notatek).
-   **Główne elementy:** `div` jako kontener, przycisk `Button` do tworzenia notatki, komponent `NotesList`, `NotesListSkeleton`, `EmptyState`, `Pagination`.
-   **Obsługiwane interakcje:**
    -   Kliknięcie przycisku "Nowa notatka" nawiguje do `/app/notes/new`.
    -   Zmiana strony w komponencie `Pagination` powoduje ponowne pobranie danych dla nowej strony.
-   **Obsługiwana walidacja:** Brak.
-   **Typy:** Wykorzystuje bezpośrednio typy `NoteListItemDTO`, `PaginationViewModel` i `NoteListItemViewModel`.
-   **Propsy:** Brak.

### `NotesList.tsx`
-   **Opis komponentu:** Komponent prezentacyjny, który otrzymuje listę notatek i renderuje je przy użyciu komponentu `NoteListItem`.
-   **Główne elementy:** `ul` lub `div` jako kontener listy.
-   **Obsługiwane interakcje:** Brak (interakcje są obsługiwane przez `NoteListItem`).
-   **Obsługiwana walidacja:** Brak.
-   **Typy:** `NoteListItemViewModel[]`.
-   **Propsy:** `notes: NoteListItemViewModel[]`.

### `NoteListItem.tsx`
-   **Opis komponentu:** Reprezentuje pojedynczy element na liście notatek. Wyświetla tytuł, datę ostatniej modyfikacji oraz ikonę informującą o istnieniu planu podróży. Jest klikalnym linkiem prowadzącym do szczegółów notatki.
-   **Główne elementy:** Element `<a>` owijający całą treść, aby zapewnić nawigację. Elementy `<h2>` lub `<p>` na tytuł, `<span>` na datę oraz komponent ikony (np. `MapIcon`).
-   **Obsługiwane interakcje:**
    -   `onClick`: Nawigacja do `/app/notes/[id]`.
-   **Obsługiwana walidacja:** Brak.
-   **Typy:** `NoteListItemViewModel`.
-   **Propsy:** `note: NoteListItemViewModel`.

### `NotesListSkeleton.tsx`
-   **Opis komponentu:** Wyświetla uproszczoną wersję interfejsu listy notatek na czas ładowania danych. Zapewnia lepsze doświadczenie użytkownika (UX), unikając przesunięć układu strony.
-   **Główne elementy:** Seria komponentów `Skeleton` (z biblioteki Shadcn/ui) ułożonych w sposób naśladujący układ `NoteListItem`.
-   **Obsługiwane interakcje:** Brak.
-   **Obsługiwana walidacja:** Brak.
-   **Typy:** Brak.
-   **Propsy:** `count: number` (opcjonalnie, do renderowania określonej liczby szkieletów).

### `EmptyState.tsx`
-   **Opis komponentu:** Wyświetlany, gdy użytkownik nie posiada żadnych notatek. Zawiera informację tekstową oraz przycisk wzywający do działania (CTA) w celu utworzenia pierwszej notatki.
-   **Główne elementy:** Kontener `div`, element tekstowy `<p>` z komunikatem "Nie masz jeszcze żadnych notatek. Stwórz swoją pierwszą!", oraz komponent `Button`.
-   **Obsługiwane interakcje:**
    -   Kliknięcie przycisku "Stwórz notatkę" emituje zdarzenie `onActionClick`.
-   **Obsługiwana walidacja:** Brak.
-   **Typy:** Brak.
-   **Propsy:** `onActionClick: () => void`.

## 5. Typy

Do implementacji widoku wymagane będą następujące typy i modele widoku.

```typescript
// src/types/notes.ts

/**
 * DTO bezpośrednio z odpowiedzi API dla pojedynczej notatki na liście.
 */
export interface NoteListItemDTO {
  id: string;
  title: string;
  updated_at: string;
  has_travel_plan: boolean;
}

/**
 * ViewModel dla paginacji, używany przez komponent Pagination.
 */
export interface PaginationViewModel {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * ViewModel dla komponentu NoteListItem.
 * Zawiera sformatowane dane gotowe do wyświetlenia.
 */
export interface NoteListItemViewModel {
  id: string;
  title: string;
  lastModified: string; // Sformatowana data, np. "2 dni temu"
  hasTravelPlan: boolean;
  href: string; // Ścieżka do szczegółów notatki, np. /app/notes/some-uuid
}
```

**Uwaga:** Typ `NotesListApiResponseViewModel` był planowany, ale w finalnej implementacji nie jest używany. API zwraca bezpośrednio strukturę `{ notes: NoteListItemDTO[], pagination: PaginationViewModel }`, a hook `useNotesList` destructure tę odpowiedź inline.

## 6. Zarządzanie stanem
Zarządzanie stanem zostanie scentralizowane w dedykowanym customowym hooku `useNotesList` w celu hermetyzacji logiki i ułatwienia ponownego użycia.

**`useNotesList` (plik `src/components/hooks/useNotesList.ts`)**
-   **Cel:** Obsługa cyklu życia danych dla listy notatek: pobieranie, buforowanie, obsługa stanu ładowania i błędów.
-   **Stan wewnętrzny:**
    -   `notes: NoteListItemViewModel[]`
    -   `pagination: PaginationViewModel | null`
    -   `isLoading: boolean`
    -   `error: string | null`
-   **Zwracane wartości:** `{ notes, isLoading, error, pagination, createNote }`
-   **Logika:** Hook pobiera dane z API i transformuje `NoteListItemDTO` na `NoteListItemViewModel` (np. formatowanie daty). Response z API ma strukturę `{ notes, pagination }`, którą hook destructure bezpośrednio.

## 7. Integracja API
Integracja z API będzie realizowana poprzez hook `useNotesList`, który będzie komunikował się z endpointem `GET /api/notes`.

-   **Endpoint:** `GET /api/notes`
-   **Metoda:** `GET`
-   **Parametry zapytania:**
    -   `page`: `number` (np. `?page=1`)
    -   `limit`: `number` (np. `?limit=10`)
-   **Typy żądania:** Brak (dane przekazywane w URL).
-   **Typ odpowiedzi:** `{ notes: NoteListItemDTO[], pagination: PaginationViewModel }`
-   **Wywołanie:**
    ```typescript
    // Wewnątrz hooka useNotesList
    const response = await fetch(`/api/notes?page=${page}&limit=${limit}`);
    const { notes, pagination } = await response.json();
    ```
    const fetcher = (url) => fetch(url).then((res) => res.json());
    const { data, error } = useSWR(`/api/notes?page=${page}&limit=10`, fetcher);
    ```

## 8. Interakcje użytkownika
-   **Wyświetlenie listy:** Po załadowaniu widoku, użytkownik widzi stan ładowania (`NotesListSkeleton`), a następnie listę swoich notatek.
-   **Nawigacja do szczegółów:** Kliknięcie dowolnego elementu `NoteListItem` przenosi użytkownika na stronę szczegółów tej notatki (`/app/notes/[id]`).
-   **Paginacja:** Kliknięcie na przyciski w komponencie `Pagination` powoduje załadowanie i wyświetlenie odpowiedniej strony z listy notatek.
-   **Tworzenie notatki:** Kliknięcie przycisku "Nowa notatka" przenosi użytkownika na stronę tworzenia nowej notatki (`/app/notes/new`).

## 9. Warunki i walidacja
Walidacja parametrów (np. `page`) odbywa się po stronie API. Frontend jest odpowiedzialny za zapewnienie, że interfejs użytkownika (np. komponent `Pagination`) nie pozwala na generowanie nieprawidłowych wartości (np. ujemnych numerów stron). Komponent `Pagination` powinien dezaktywować przyciski "Wstecz" i "Dalej" na odpowiednio pierwszej i ostatniej stronie.

## 10. Obsługa błędów
-   **Błąd pobierania danych:** Jeśli wywołanie `GET /api/notes` zakończy się niepowodzeniem (np. błąd serwera 500 lub problem z siecią), hook `useNotes` przechwyci błąd. Komponent `NotesDashboard` wyświetli wtedy komunikat o błędzie (np. "Wystąpił błąd podczas ładowania notatek. Spróbuj ponownie.") zamiast listy. Opcjonalnie można dodać przycisk "Spróbuj ponownie", który wywołałby funkcję odświeżenia danych z hooka.
-   **Brak notatek (stan pusty):** Jeśli API zwróci status 200, ale z pustą tablicą `notes`, nie jest to traktowane jako błąd. Komponent `NotesDashboard` renderuje komponent `EmptyState`, zachęcając użytkownika do utworzenia pierwszej notatki.
-   **Błąd autoryzacji (401):** Globalny mechanizm obsługi fetch (lub middleware w SWR) powinien przechwycić status 401 i przekierować użytkownika na stronę logowania.

## 12. Kroki implementacji
1.  **Utworzenie typów:** Zdefiniuj wszystkie wymagane typy (`NoteListItemDTO`, `PaginationViewModel`, `NoteListItemViewModel`) w pliku `src/types.ts`.
2.  **Implementacja hooka `useNotesList`:** Stwórz hook obsługujący pobieranie i transformację danych oraz zarządzanie stanem.
3.  **Implementacja komponentów szkieletowych i stanu pustego:** Stwórz komponenty `NotesListSkeleton.tsx` oraz `EmptyState.tsx`.
4.  **Implementacja komponentów listy:** Stwórz komponenty `NoteListItem.tsx` (jako element klikalny `<a>`) oraz `NotesList.tsx`, które będą renderować dane.
5.  **Implementacja komponentu `NotesDashboard`:** Zintegruj wszystkie stworzone komponenty. Użyj hooka `useNotes` do pobrania danych i zaimplementuj logikę warunkowego renderowania w zależności od stanu (`isLoading`, `error`, `data.notes.length`).
6.  **Stworzenie strony Astro:** Utwórz plik `src/pages/app/notes.astro`, który zaimportuje i wyrenderuje komponent `NotesDashboard.tsx` z dyrektywą `client:load`.
7.  **Dodanie routingu i nawigacji:** Upewnij się, że przycisk "Nowa notatka" oraz elementy listy (`NoteListItem`) poprawnie nawigują do odpowiednich ścieżek.
8.  **Stylowanie:** Ostyluj wszystkie komponenty zgodnie z systemem designu, używając Tailwind CSS i komponentów Shadcn/ui.
9.  **Testowanie:** Przetestuj wszystkie scenariusze: stan ładowania, stan z danymi, stan pusty, paginację oraz obsługę błędów.

