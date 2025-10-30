# Plan implementacji widoku Generowanie Planu Podróży (Modal)

## 1. Przegląd

Widok "Generowanie Planu Podróży" jest modalem (oknem dialogowym), który umożliwia użytkownikowi zainicjowanie procesu tworzenia planu podróży przez AI na podstawie istniejącej notatki. Użytkownik może spersonalizować parametry generowania, śledzić postęp, przeglądać wynik i zapisywać go. Modal zarządza całym procesem, od zebrania danych, przez komunikację z API, aż po prezentację wyników i obsługę błędów.

## 2. Routing widoku

Widok nie posiada własnej, dedykowanej ścieżki (URL). Jest renderowany jako komponent modalny na stronie szczegółów notatki, znajdującej się pod ścieżką `/app/notes/[noteId]`.

## 3. Struktura komponentów

Hierarchia komponentów React, które należy utworzyć, jest następująca. Głównym kontenerem będzie `GeneratePlanModal`, który będzie warunkowo renderował pozostałe komponenty w zależności od stanu procesu.

```
GeneratePlanModal (Kontener, oparty o Shadcn/ui Dialog)
├── GenerationOptionsForm (stan początkowy)
│   ├── Select (Styl)
│   ├── Select (Transport)
│   ├── Select (Budżet)
│   ├── Checkbox (Potwierdzenie nadpisania, jeśli plan istnieje)
│   └── Button ("Generuj")
├── LoadingView (stan ładowania)
│   └── Spinner
├── GeneratedPlanView (stan sukcesu)
│   ├── [Sformatowany widok planu]
│   └── Button ("Zapisz do moich podróży")
└── ErrorView (stan błędu)
    ├── [Komunikat o błędzie]
    └── Button ("Spróbuj ponownie")
```

## 4. Szczegóły komponentów

### GeneratePlanModal

-   **Opis komponentu**: Główny komponent-kontener zarządzający całym procesem generowania planu. Wykorzystuje komponent `Dialog` z biblioteki `Shadcn/ui`. Jest odpowiedzialny za zarządzanie stanem (`idle`, `loading`, `success`, `error`) i renderowanie odpowiednich komponentów podrzędnych.
-   **Główne elementy**: `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogFooter`.
-   **Obsługiwane interakcje**: Otwieranie/zamykanie modala.
-   **Obsługiwana walidacja**: Brak.
-   **Typy**: `GeneratePlanModalProps`.
-   **Propsy**:
    -   `note: NoteWithPlan`: Obiekt notatki, dla której generowany jest plan.
    -   `isOpen: boolean`: Stan określający, czy modal jest otwarty.
    -   `onOpenChange: (isOpen: boolean) => void`: Funkcja zwrotna do zmiany stanu otwarcia.
    -   `onSuccess: () => void`: Funkcja zwrotna wywoływana po pomyślnym zapisaniu planu, w celu odświeżenia danych na stronie nadrzędnej.

### GenerationOptionsForm

-   **Opis komponentu**: Formularz zbierający od użytkownika opcje personalizacji planu.
-   **Główne elementy**: `form`, `Select` (dla stylu, transportu, budżetu), `Checkbox` (do potwierdzenia nadpisania), `Button` (do wysłania).
-   **Obsługiwane interakcje**: Wybór opcji z list rozwijanych, zaznaczenie checkboxa, kliknięcie przycisku "Generuj".
-   **Obsługiwana walidacja**:
    -   Wszystkie pola `Select` muszą mieć wybraną wartość.
    -   Jeśli dla notatki istnieje już plan, `Checkbox` musi być zaznaczony.
    -   Przycisk "Generuj" jest nieaktywny, dopóki walidacja nie przejdzie pomyślnie.
-   **Typy**: `GenerationOptions`, `GenerationOptionsFormProps`.
-   **Propsy**:
    -   `existingPlan: TravelPlan | null`: Informacja o istniejącym planie.
    -   `isSubmitting: boolean`: Informuje, czy formularz jest w trakcie przetwarzania.
    -   `onSubmit: (options: GenerationOptions) => void`: Funkcja zwrotna wywoływana po pomyślnej walidacji i kliknięciu "Generuj".

### LoadingView

-   **Opis komponentu**: Prosty komponent wyświetlany w trakcie komunikacji z API i generowania planu.
-   **Główne elementy**: Komponent `Spinner`/`Loader`, element `p` z tekstem informacyjnym (np. "Generowanie planu, proszę czekać...").
-   **Obsługiwane interakcje**: Brak.
-   **Obsługiwana walidacja**: Brak.
-   **Typy**: Brak.
-   **Propsy**: Brak.

### GeneratedPlanView

-   **Opis komponentu**: Komponent do prezentacji wygenerowanego planu w ustrukturyzowanej, czytelnej formie.
-   **Główne elementy**: Struktura zagnieżdżonych `div`, `h2`, `h3`, `ul`, `li` do wyświetlania dni, pór dnia i aktywności. Przycisk `Button` do zapisania planu.
-   **Obsługiwane interakcje**: Kliknięcie przycisku "Zapisz do moich podróży".
-   **Obsługiwana walidacja**: Brak.
-   **Typy**: `TravelPlan`, `TravelPlanContent`, `GeneratedPlanViewProps`.
-   **Propsy**:
    -   `plan: TravelPlan`: Obiekt wygenerowanego planu.
    -   `onSave: () => void`: Funkcja zwrotna wywoływana po kliknięciu przycisku "Zapisz".

### ErrorView

-   **Opis komponentu**: Komponent wyświetlany w przypadku wystąpienia błędu podczas generowania planu.
-   **Główne elementy**: Element `p` z komunikatem błędu, `Button` "Spróbuj ponownie".
-   **Obsługiwane interakcje**: Kliknięcie przycisku "Spróbuj ponownie".
-   **Obsługiwana walidacja**: Brak.
-   **Typy**: `ErrorViewProps`.
-   **Propsy**:
    -   `errorMessage: string`: Treść komunikatu o błędzie do wyświetlenia.
    -   `onRetry: () => void`: Funkcja zwrotna do zresetowania stanu i powrotu do formularza.

## 5. Typy

Należy zdefiniować następujące typy, prawdopodobnie w pliku `src/types.ts`.

```typescript
// DTO dla opcji personalizacji w zapytaniu API
export interface GenerationOptions {
  style: 'adventure' | 'leisure';
  transport: 'car' | 'public' | 'walking';
  budget: 'economy' | 'standard' | 'luxury';
}

// DTO dla zapytania PUT (nadpisanie planu)
export interface UpdatePlanRequest {
  confirm: true;
  options: GenerationOptions;
}

// Typy ViewModel dla bezpiecznego renderowania treści planu
export interface PlanActivity {
  name: string;
  description: string;
  priceCategory: string;
  logistics: {
    address?: string;
    mapLink?: string;
    estimatedTime?: string;
  };
}

export interface TravelDay {
  day: number;
  title: string;
  activities: {
    morning: PlanActivity[];
    afternoon: PlanActivity[];
    evening: PlanActivity[];
  };
}

export interface TravelPlanContent {
  days: TravelDay[];
  disclaimer: string;
}

// Rozszerzenie istniejącego typu TravelPlan, aby content był silnie typowany
export interface TypedTravelPlan extends Omit<TravelPlan, 'content'> {
  content: TravelPlanContent;
}

// Notatka z opcjonalnie dołączonym planem
export type NoteWithPlan = Note & { travel_plan: TravelPlan | null };

```

## 6. Zarządzanie stanem

Logika biznesowa i stan komponentu `GeneratePlanModal` zostaną zamknięte w customowym hooku `useGeneratePlan`.

**`useGeneratePlan(noteId: string, existingPlan: TravelPlan | null, onSuccess: () => void)`**

-   **Cel**: Enkapsulacja logiki generowania, zapisywania planu oraz zarządzania stanem UI modala.
-   **Zmienne stanu**:
    -   `status: 'idle' | 'loading' | 'success' | 'error'`: Aktualny stan procesu.
    -   `generatedPlan: TypedTravelPlan | null`: Przechowuje pomyślnie wygenerowany plan.
    -   `error: string | null`: Przechowuje komunikat o błędzie.
-   **Funkcje**:
    -   `generatePlan(options: GenerationOptions)`: Ustawia status na `loading`, wywołuje odpowiedni endpoint API (`POST` lub `PUT`), a następnie aktualizuje stan w zależności od odpowiedzi.
    -   `savePlan()`: Wywołuje `onSuccess` i resetuje stan, przygotowując do zamknięcia modala.
    -   `reset()`: Przywraca stan do `idle`, umożliwiając ponowną próbę.

## 7. Integracja API

Komunikacja z backendem będzie realizowana poprzez wywołania `fetch` w hooku `useGeneratePlan`.

-   **Generowanie nowego planu (brak istniejącego)**:
    -   **Metoda**: `POST`
    -   **Endpoint**: `/api/notes/${noteId}/generate-plan`
    -   **Typ body zapytania**: `{ options: GenerationOptions }`
    -   **Typ odpowiedzi (sukces)**: `TravelPlan`

-   **Nadpisywanie istniejącego planu**:
    -   **Metoda**: `PUT`
    -   **Endpoint**: `/api/notes/${noteId}/travel-plan`
    -   **Typ body zapytania**: `UpdatePlanRequest` (czyli `{ confirm: true, options: GenerationOptions }`)
    -   **Typ odpowiedzi (sukces)**: `TravelPlan`

Należy zaimplementować klienta API z obsługą timeoutu (60 sekund) oraz parsowaniem odpowiedzi błędów.

## 8. Interakcje użytkownika

-   **Użytkownik klika "Wygeneruj plan podróży" na stronie notatki**: Otwiera się `GeneratePlanModal` z widocznym `GenerationOptionsForm`.
-   **Użytkownik wypełnia formularz i klika "Generuj"**: Wyświetla się `LoadingView`, rozpoczyna się wywołanie API.
-   **Generowanie kończy się sukcesem**: `LoadingView` jest zastępowany przez `GeneratedPlanView` z danymi planu.
-   **Użytkownik klika "Zapisz do moich podróży"**: Modal jest zamykany, a lista notatek/widok szczegółowy jest odświeżany.
-   **Generowanie kończy się błędem**: `LoadingView` jest zastępowany przez `ErrorView` z komunikatem.
-   **Użytkownik klika "Spróbuj ponownie"**: `ErrorView` jest zastępowany przez `GenerationOptionsForm`, umożliwiając ponowne wysłanie.

## 9. Warunki i walidacja

-   **Długość notatki**: Przycisk otwierający modal na stronie notatki jest nieaktywny, jeśli notatka ma mniej niż 10 słów. Walidacja po stronie klienta: `note.content.trim().split(/\s+/).length < 10`.
-   **Wypełnienie formularza**: Przycisk "Generuj" w `GenerationOptionsForm` jest nieaktywny, dopóki wszystkie opcje (`style`, `transport`, `budget`) nie zostaną wybrane.
-   **Nadpisanie planu**: Jeśli `existingPlan` nie jest `null`, w `GenerationOptionsForm` pojawia się dodatkowy `Checkbox`, który musi być zaznaczony, aby aktywować przycisk "Generuj".

## 10. Obsługa błędów

-   **Błąd sieci / Timeout**: Klient API (oparty na `fetch`) powinien obsłużyć błąd połączenia lub przekroczenie czasu oczekiwania. Hook `useGeneratePlan` przechwyci błąd i ustawi stan na `error` z ogólnym komunikatem ("Wystąpił błąd sieci. Spróbuj ponownie.").
-   **Błąd API (np. 400, 404, 500)**: Hook `useGeneratePlan` powinien spróbować odczytać komunikat błędu z ciała odpowiedzi API. Jeśli jest dostępny, zostanie wyświetlony w `ErrorView`. W przeciwnym razie wyświetlony zostanie generyczny komunikat.
-   **Błąd parsowania odpowiedzi**: Jeśli pole `content` w odpowiedzi `TravelPlan` nie jest poprawnym JSON-em zgodnym z typem `TravelPlanContent`, należy to potraktować jako błąd krytyczny. Aplikacja powinna złapać ten błąd podczas parsowania i wyświetlić `ErrorView` z komunikatem "Otrzymano plan w nieprawidłowym formacie".

## 11. Kroki implementacji

1.  **Definicja typów**: Zdefiniuj wszystkie nowe typy (`GenerationOptions`, `TravelPlanContent`, etc.) w pliku `src/types.ts`.
2.  **Implementacja hooka `useGeneratePlan`**: Stwórz plik `src/lib/hooks/useGeneratePlan.ts` i zaimplementuj w nim całą logikę zarządzania stanem i komunikacji z API.
3.  **Implementacja komponentów widoków**: Stwórz komponenty `LoadingView`, `GeneratedPlanView` oraz `ErrorView` w katalogu `src/components/`. Komponenty te powinny być czysto prezentacyjne i przyjmować dane przez propsy.
4.  **Implementacja komponentu `GenerationOptionsForm`**: Stwórz komponent formularza w `src/components/`. Zaimplementuj logikę walidacji i obsługę stanu (np. przy użyciu `react-hook-form`).
5.  **Implementacja głównego komponentu `GeneratePlanModal`**: Stwórz komponent w `src/components/`. Połącz w nim hook `useGeneratePlan` z komponentami widoków, implementując logikę warunkowego renderowania.
6.  **Integracja ze stroną notatki**: W komponencie strony `/app/notes/[noteId]`, dodaj przycisk "Wygeneruj plan podróży". Zaimplementuj logikę otwierania `GeneratePlanModal` oraz przekazania do niego wymaganych propsów (`note`, `onSuccess` callback).
7.  **Stylowanie**: Użyj `Tailwind CSS` i komponentów `Shadcn/ui` do ostylowania wszystkich nowych komponentów zgodnie z designem aplikacji.
8.  **Testowanie**: Manualnie przetestuj wszystkie ścieżki użytkownika: generowanie nowego planu, nadpisywanie istniejącego, obsługa błędów API, timeout, walidacja formularza i warunek długości notatki.

