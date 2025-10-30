# Plan implementacji widoku Profilu Użytkownika

## 1. Przegląd
Widok "Profil Użytkownika" umożliwia zalogowanym użytkownikom zarządzanie kluczowymi aspektami ich konta. Użytkownicy mogą aktualizować swoje dane osobowe (imię), zmieniać hasło, personalizować swoje preferencje turystyczne, które wpływają na działanie silnika AI, oraz trwale usuwać swoje konto. Widok ten jest centralnym miejscem do zarządzania tożsamością i preferencjami w aplikacji.

## 2. Routing widoku
Widok będzie dostępny pod ścieżką `/app/profile`. Dostęp do tej ścieżki powinien być chroniony i wymagać zalogowania użytkownika.

## 3. Struktura komponentów
Komponenty zostaną zorganizowane w hierarchiczną strukturę, aby zapewnić separację odpowiedzialności i reużywalność. Główny komponent widoku będzie zarządzał stanem i komunikacją z API.

```
/src/pages/app/profile.astro
└── /src/components/views/ProfileView.tsx (Komponent kliencki)
    ├── /src/components/profile/ProfileForm.tsx
    ├── /src/components/profile/PasswordChangeForm.tsx
    ├── /src/components/profile/PreferencesManager.tsx
    ├── /src/components/profile/DeleteAccountSection.tsx
    └── /src/components/ui/ConfirmationModal.tsx (Renderowany warunkowo)
```

## 4. Szczegóły komponentów

### `ProfileView.tsx`
- **Opis komponentu:** Główny kontener strony profilu. Odpowiedzialny za pobieranie danych profilu użytkownika, zarządzanie ogólnym stanem (ładowanie, błędy) oraz koordynację akcji w komponentach podrzędnych.
- **Główne elementy:** Wykorzystuje komponenty `ProfileForm`, `PasswordChangeForm`, `PreferencesManager` i `DeleteAccountSection`, przekazując im odpowiednie dane i funkcje do obsługi zdarzeń. Renderuje nagłówek strony.
- **Obsługiwane interakcje:** Inicjuje pobieranie danych profilu przy pierwszym załadowaniu.
- **Obsługiwana walidacja:** Brak.
- **Typy:** Zarządza stanem bezpośrednio w `useProfile` hooku (bez dedykowanego ViewModel)
- **Propsy:** Brak.

### `ProfileForm.tsx`
- **Opis komponentu:** Formularz do edycji imienia użytkownika.
- **Główne elementy:** `Input` (dla imienia), `Button` (do zapisu). Komponenty z biblioteki `Shadcn/ui`.
- **Obsługiwane interakcje:** `onSubmit` (wysyła żądanie aktualizacji imienia).
- **Obsługiwana walidacja:** Imię nie może być puste.
- **Typy:** `UserProfileDTO`, `UpdateUserProfileDTO`
- **Propsy:**
  - `initialData: UserProfileDTO`
  - `onSave: (data: UpdateUserProfileDTO) => Promise<void>`
  - `isLoading: boolean`

### `PasswordChangeForm.tsx`
- **Opis komponentu:** Formularz umożliwiający zmianę hasła.
- **Główne elementy:** Trzy komponenty `Input` (obecne hasło, nowe hasło, potwierdzenie nowego hasła) oraz `Button` (do zapisu).
- **Obsługiwane interakcje:** `onSubmit` (wysyła żądanie zmiany hasła).
- **Obsługiwana walidacja:**
  - Wszystkie pola są wymagane.
  - Nowe hasło musi być zgodne z potwierdzeniem.
  - Nowe hasło musi spełniać wymogi bezpieczeństwa (min. 8 znaków, jedna wielka litera, jedna mała litera, jedna cyfra).
- **Typy:** `ChangePasswordDTO`
- **Propsy:**
  - `onChangePassword: (data: ChangePasswordDTO) => Promise<void>`
  - `isLoading: boolean`

### `PreferencesManager.tsx`
- **Opis komponentu:** Interfejs do zarządzania preferencjami turystycznymi użytkownika.
- **Główne elementy:** Grupy przełączników (`ToggleGroup` z Shadcn/ui) lub checkboxów dla każdej kategorii preferencji (`Styl podróży`, `Zainteresowania` itd.). `Button` do zapisu zmian.
- **Obsługiwane interakcje:** Wybór/odznaczenie tagów preferencji, `onSave` (wysyła żądanie aktualizacji preferencji).
- **Obsługiwana walidacja:** Brak.
- **Typy:** `UpdateUserProfileDTO`
- **Propsy:**
  - `initialPreferences: string[]`
  - `onUpdate: (preferences: string[]) => Promise<void>`
  - `isSaving: boolean`

### `DeleteAccountSection.tsx`
- **Opis komponentu:** Sekcja zawierająca przycisk do zainicjowania procesu usuwania konta.
- **Główne elementy:** `Button` z ostrzegawczym stylem.
- **Obsługiwane interakcje:** `onClick` (otwiera modal potwierdzający).
- **Obsługiwana walidacja:** Brak.
- **Typy:** Brak.
- **Propsy:**
  - `onDelete: () => void`

### `ConfirmationModal.tsx`
- **Opis komponentu:** Modal dialogowy wymagający od użytkownika potwierdzenia nieodwracalnej akcji poprzez wpisanie swojego adresu e-mail.
- **Główne elementy:** `Dialog` (z Shadcn/ui), `Input` na e-mail, `Button` do potwierdzenia, `Button` do anulowania.
- **Obsługiwane interakcje:** `onConfirm`, `onCancel`.
- **Obsługiwana walidacja:** Wpisany tekst musi być identyczny z adresem e-mail użytkownika, aby aktywować przycisk potwierdzenia.
- **Typy:** Brak.
- **Propsy:**
  - `isOpen: boolean`
  - `onClose: () => void`
  - `onConfirm: () => Promise<void>`
  - `userEmail: string`
  - `isLoading: boolean`

## 5. Typy
Do implementacji widoku wykorzystane zostaną istniejące DTO, które zapewniają spójność między API a komponentami.

- **`UserProfileDTO` (istniejący):** Reprezentuje dane profilu pobierane z API.
  ```typescript
  interface UserProfileDTO {
    id: string;
    email: string;
    name: string;
    preferences: string[]; // Tablica preferencji użytkownika
    created_at: string;
  }
  ```
- **`UpdateUserProfileDTO` (istniejący):** Używany do wysyłania zaktualizowanych danych imienia i preferencji.
  ```typescript
  interface UpdateUserProfileDTO {
    name?: string;
    preferences?: string[];
  }
  ```
- **`ChangePasswordDTO` (istniejący):** Używany do wysyłania danych zmiany hasła.
  ```typescript
  interface ChangePasswordDTO {
    current_password: string;
    new_password: string;
  }
  ```

**Uwaga:** Typy `ProfileViewModel` i `PreferenceCategoryViewModel` były planowane, ale w finalnej implementacji nie są używane. Komponenty zarządzają stanem bezpośrednio w `useProfile` hooku, a `PreferencesManager` pracuje z prostymi tablicami stringów.

## 6. Zarządzanie stanem
Zarządzanie stanem zostanie scentralizowane w niestandardowym hooku `useUserProfile`, aby uprościć komponent `ProfileView.tsx` i zamknąć logikę biznesową w jednym miejscu.

- **`useProfile` custom hook:**
  - **Cel:** Abstrakcja logiki pobierania, aktualizowania i obsługi stanu profilu użytkownika.
  - **Eksportowane wartości:**
    - `profile: UserProfileDTO | null`: Dane profilu użytkownika.
    - `loading: boolean`: Stan ładowania.
    - `error: string | null`: Komunikat błędu.
    - `updateProfile: (data: UpdateUserProfileDTO) => Promise<void>`: Funkcja do aktualizacji imienia lub preferencji.
    - `changePassword: (data: ChangePasswordDTO) => Promise<void>`: Funkcja do zmiany hasła.
    - `deleteAccount: () => Promise<void>`: Funkcja do usunięcia konta.
  - **Logika wewnętrzna:** Używa `useState` do przechowywania stanu i `useEffect` do pobrania danych profilu przy montowaniu. Każda funkcja obsługuje wywołanie API, aktualizację stanu ładowania i obsługę błędów.

## 7. Integracja API
Integracja z backendem będzie realizowana poprzez wywołania do zdefiniowanych punktów końcowych API.

- **`GET /api/profiles/me`**
  - **Akcja:** Pobranie danych profilu użytkownika.
  - **Typ odpowiedzi:** `UserProfileDTO`
- **`PUT /api/profiles/me`**
  - **Akcja:** Aktualizacja imienia i/lub preferencji.
  - **Typ żądania:** `UpdateUserProfileDTO`
  - **Typ odpowiedzi:** `UserProfileDTO`
- **`PUT /api/auth/password`** (Założony endpoint)
  - **Akcja:** Zmiana hasła użytkownika.
  - **Typ żądania:** `ChangePasswordDTO`
- **`DELETE /api/profiles/me`** (Założony endpoint)
  - **Akcja:** Usunięcie konta użytkownika.

Wszystkie wywołania będą asynchroniczne i obsłużą stany ładowania oraz potencjalne błędy.

## 8. Interakcje użytkownika
- **Zmiana imienia:** Użytkownik wpisuje nowe imię w formularzu i klika "Zapisz". Przycisk jest nieaktywny, dopóki formularz się nie załaduje lub trwa zapisywanie. Po sukcesie wyświetlany jest toast.
- **Zmiana hasła:** Użytkownik wypełnia wszystkie trzy pola i klika "Zmień hasło". Logika walidacji jest uruchamiana po stronie klienta. Po sukcesie pola formularza są czyszczone i wyświetlany jest toast.
- **Zmiana preferencji:** Użytkownik zaznacza/odznacza tagi w `PreferencesManager` i klika "Zapisz preferencje". Po sukcesie wyświetlany jest toast.
- **Usuwanie konta:** Użytkownik klika "Usuń konto", co otwiera modal. W modalu musi wpisać swój e-mail, aby odblokować przycisk "Potwierdź usunięcie". Po kliknięciu i pomyślnym usunięciu konta, użytkownik jest wylogowywany i przekierowywany na stronę logowania.

## 9. Warunki i walidacja
- **`ProfileForm`:** Przycisk zapisu jest nieaktywny, jeśli pole imienia jest puste.
- **`PasswordChangeForm`:** Przycisk zapisu jest nieaktywny, jeśli:
  - Którekolwiek z pól jest puste.
  - Hasła w polach "Nowe hasło" i "Potwierdź nowe hasło" nie są identyczne.
  - Nowe hasło nie spełnia wymogów bezpieczeństwa (komunikaty o błędach wyświetlane są pod polem).
- **`ConfirmationModal`:** Przycisk ostatecznego usunięcia jest nieaktywny, dopóki użytkownik nie wpisze w polu tekstowym swojego pełnego adresu e-mail.

## 10. Obsługa błędów
- **Błąd pobierania danych:** Jeśli początkowe żądanie `GET /api/profiles/me` nie powiedzie się, zamiast formularzy na stronie zostanie wyświetlony komunikat o błędzie z opcją ponownego załadowania.
- **Błędy walidacji serwera:** Jeśli API zwróci błąd (np. 400 Bad Request przy zmianie hasła z powodu nieprawidłowego obecnego hasła), odpowiedni komunikat zostanie wyświetlony w formularzu, blisko pola, którego dotyczy.
- **Błędy sieciowe/serwera:** W przypadku ogólnych błędów (np. 500, błąd sieci), użytkownik zobaczy powiadomienie typu `Toast` z informacją o problemie i sugestią, aby spróbować ponownie później.
- **Stan ładowania:** Wszystkie akcje wywołujące API będą blokować przyciski i pokazywać wskaźnik ładowania (np. spinner), aby zapobiec wielokrotnemu przesyłaniu formularza.

## 11. Kroki implementacji
1.  **Struktura plików:** Utworzenie plików dla komponentów: `ProfileView.tsx`, `ProfileForm.tsx`, `PasswordChangeForm.tsx`, `PreferencesManager.tsx`, `DeleteAccountSection.tsx` oraz strony `profile.astro`.
2.  **Hook `useProfile`:** Implementacja logiki pobierania danych (`GET /api/profiles/me`) i podstawowej struktury hooka.
3.  **Komponent `ProfileView`:** Implementacja głównego komponentu, który używa hooka `useProfile` i wyświetla stan ładowania/błędu lub podstawowy szkielet strony.
4.  **Komponent `ProfileForm`:** Budowa formularza zmiany imienia, podłączenie go do funkcji `updateProfile` z hooka.
5.  **Komponent `PasswordChangeForm`:** Budowa formularza zmiany hasła, implementacja walidacji po stronie klienta oraz podłączenie do funkcji `changePassword`.
6.  **Komponent `PreferencesManager`:** Zdefiniowanie statycznej konfiguracji dla kategorii i tagów preferencji. Budowa interfejsu i podłączenie do funkcji `updateProfile`.
7.  **Logika usuwania konta:** Implementacja `DeleteAccountSection` i `ConfirmationModal`. Podłączenie ich do funkcji `deleteAccount` i logiki otwierania/zamykania modala.
8.  **Powiadomienia (Toasts):** Integracja z `shadcn/ui/use-toast` w celu wyświetlania komunikatów o sukcesie i błędach po wykonaniu akcji.
9.  **Stylowanie i UX:** Dopracowanie stylów za pomocą Tailwind CSS, zapewnienie responsywności i spójności wizualnej z resztą aplikacji.
10. **Testowanie:** Ręczne przetestowanie wszystkich interakcji, walidacji i scenariuszy błędów.

