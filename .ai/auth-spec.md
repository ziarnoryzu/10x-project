# Specyfikacja Techniczna - System Autentykacji VibeTravels

## 1. ARCHITEKTURA INTERFEJSU UŻYTKOWNIKA

### 1.1 Struktura Stron i Layoutów

#### Layout Podstawowy
**Lokalizacja:** `src/layouts/BaseLayout.astro`

**Odpowiedzialność:**
- Sprawdzanie stanu autentykacji użytkownika na serwerze przy użyciu danych z `Astro.locals`.
- Warunkowe renderowanie elementów nawigacji (np. linków do logowania/rejestracji dla gości oraz linków do profilu/wylogowania dla zalogowanych użytkowników).
- Przekazywanie informacji o sesji i użytkowniku do komponentów potomnych.
- Zapewnienie płynnych przejść między stronami z wykorzystaniem View Transitions API.

#### Layout Autentykacji
**Lokalizacja:** `src/layouts/AuthLayout.astro`

**Odpowiedzialność:**
- Zapewnienie spójnego, minimalistycznego layoutu dla stron formularzy (rejestracja, logowanie, reset hasła).
- Wycentrowanie treści na stronie, aby skupić uwagę użytkownika na formularzu.
- Zawarcie logo aplikacji i podstawowych linków nawigacyjnych między formularzami autentykacji.

### 1.2 Strony Astro (Server-Side Rendered)

#### Strona Rejestracji
**Lokalizacja:** `src/pages/register.astro`

**Odpowiedzialność:**
- Renderowanie strony po stronie serwera (`prerender = false`).
- Wykorzystanie funkcji pomocniczej do weryfikacji, czy użytkownik nie jest już zalogowany; jeśli jest, nastąpi przekierowanie.
- Odczytywanie parametrów z URL w celu wyświetlenia odpowiednich komunikatów o błędach (np. zajęty email).
- Osadzenie klienckiego komponentu React `RegisterForm` i przekazanie mu przetworzonych komunikatów błędów.

#### Strona Logowania
**Lokalizacja:** `src/pages/login.astro`

**Odpowiedzialność:**
- Renderowanie strony po stronie serwera (`prerender = false`).
- Weryfikacja, czy użytkownik nie jest już zalogowany i ewentualne przekierowanie.
- Obsługa parametru `redirect` z URL, aby umożliwić powrót na docelową stronę po pomyślnym logowaniu.
- Wyświetlanie komunikatów o sukcesie (np. po zresetowaniu hasła) na podstawie parametrów URL.
- Osadzenie klienckiego komponentu React `LoginForm`.

#### Strona Resetowania Hasła - Żądanie
**Lokalizacja:** `src/pages/forgot-password.astro`

**Odpowiedzialność:**
- Renderowanie strony po stronie serwera (`prerender = false`).
- Weryfikacja, czy użytkownik nie jest już zalogowany.
- Wyświetlanie komunikatu potwierdzającego wysłanie linku na podstawie parametru z URL.
- Osadzenie klienckiego komponentu React `ForgotPasswordForm`.

#### Strona Resetowania Hasła - Ustawienie Nowego
**Lokalizacja:** `src/pages/reset-password.astro`

**Odpowiedzialność:**
- Renderowanie strony po stronie serwera (`prerender = false`).
- Walidacja obecności kodu do resetu hasła w parametrach URL. W przypadku jego braku, przekierowanie na stronę logowania z komunikatem błędu.
- Osadzenie klienckiego komponentu React `ResetPasswordForm` i przekazanie mu kodu z URL.

#### Strona Profilu
**Lokalizacja:** `src/pages/profile.astro`

**Odpowiedzialność:**
- Renderowanie strony po stronie serwera (`prerender = false`).
- Zabezpieczenie strony poprzez wymuszenie autentykacji; niezalogowani użytkownicy są przekierowywani na stronę logowania.
- Pobranie danych profilu zalogowanego użytkownika z bazy danych przy użyciu klienta Supabase z `Astro.locals`.
- Osadzenie klienckich komponentów React do zarządzania profilem (`ProfileForm`, `ChangePasswordForm`, `DeleteAccountButton`) i przekazanie im danych profilu.

### 1.3 Komponenty React (Client-Side)

#### Formularz Rejestracji
**Lokalizacja:** `src/components/auth/RegisterForm.tsx`

**Odpowiedzialność:**
- Zarządzanie stanem formularza (dane wejściowe, stan ładowania, błędy).
- Walidacja danych w czasie rzeczywistym po stronie klienta (format email, siła hasła zgodnie z `US-001`: min. 8 znaków, mała i wielka litera, cyfra).
- Komunikacja z endpointem API `/api/auth/register` w celu utworzenia konta.
- Wyświetlanie błędów walidacyjnych oraz błędów zwróconych przez API.
- Przekierowanie użytkownika po pomyślnej rejestracji.
- Wyświetlenie modala z prośbą o uzupełnienie preferencji po pierwszym logowaniu, z opcją pominięcia.

#### Formularz Logowania
**Lokalizacja:** `src/components/auth/LoginForm.tsx`

**Odpowiedzialność:**
- Zarządzanie stanem formularza.
- Komunikacja z endpointem API `/api/auth/login`.
- Wyświetlanie komunikatów o błędach (np. nieprawidłowe dane).
- Przekierowanie użytkownika na docelową stronę po pomyślnym logowaniu.

#### Formularz Żądania Resetu Hasła
**Lokalizacja:** `src/components/auth/ForgotPasswordForm.tsx`

**Odpowiedzialność:**
- Zarządzanie stanem formularza (email, status wysłania).
- Komunikacja z endpointem API `/api/auth/forgot-password`.
- Wyświetlanie komunikatu o pomyślnym wysłaniu linku.

#### Formularz Ustawienia Nowego Hasła
**Lokalizacja:** `src/components/auth/ResetPasswordForm.tsx`

**Odpowiedzialność:**
- Zarządzanie stanem formularza (nowe hasło, potwierdzenie).
- Walidacja siły nowego hasła i zgodności z potwierdzeniem.
- Komunikacja z endpointem API `/api/auth/reset-password`, przesyłając nowe hasło oraz kod odzyskany z URL.
- Przekierowanie na stronę logowania po pomyślnej zmianie hasła.

#### Formularz Edycji Profilu
**Lokalizacja:** `src/components/profile/ProfileForm.tsx`

**Odpowiedzialność:**
- Umożliwienie edycji imienia użytkownika.
- Walidacja wprowadzonych danych (minimum 2 znaki).
- Komunikacja z endpointem API `/api/profiles/me` w celu zapisania zmian.
- Wyświetlanie komunikatów o sukcesie (toast notification) lub błędzie.
- Automatyczne odświeżenie strony po pomyślnym zapisaniu.

#### Formularz Zmiany Hasła
**Lokalizacja:** `src/components/profile/ChangePasswordForm.tsx`

**Odpowiedzialność:**
- Umożliwienie zalogowanemu użytkownikowi zmiany hasła.
- Walidacja w czasie rzeczywistym (nowe hasło, potwierdzenie, siła hasła).
- Komunikacja z endpointem API `/api/auth/change-password`.
- Wyświetlanie wskaźnika siły hasła.
- Wyświetlanie komunikatów zwrotnych (sukces/błąd).
- Czyszczenie formularza po pomyślnej zmianie.

#### Formularz Preferencji Turystycznych
**Lokalizacja:** `src/components/profile/TravelPreferencesForm.tsx`

**Odpowiedzialność:**
- Umożliwienie zarządzania preferencjami turystycznymi użytkownika.
- Prezentacja predefiniowanych tagów w kategoriach (styl, zainteresowania, kuchnia, tempo).
- Komunikacja z endpointem API `/api/profiles/me` w celu zapisania preferencji.
- Wyświetlanie komunikatów o sukcesie lub błędzie.

#### Przycisk Usuwania Konta
**Lokalizacja:** `src/components/profile/DeleteAccountButton.tsx`

**Odpowiedzialność:**
- Inicjowanie procesu usuwania konta, w tym wyświetlenie modala z potwierdzeniem.
- Komunikacja z endpointem API `DELETE /api/profiles/me`.
- Wylogowanie i przekierowanie użytkownika po pomyślnym usunięciu konta.

#### Komponent Wylogowania
**Lokalizacja:** `src/components/auth/LogoutButton.tsx`

**Odpowiedzialność:**
- Komunikacja z endpointem API `/api/auth/logout`.
- Przekierowanie na stronę logowania po wylogowaniu.

### 1.4 Komponenty UI Współdzielone

- **Wskaźnik Siły Hasła:** Komponent wizualizujący spełnienie wymagań bezpieczeństwa dla hasła.
- **Komponent Komunikatu Błędu:** Standaryzowany komponent do wyświetlania błędów formularzy.
- **Modal Potwierdzenia:** Generyczny modal używany do potwierdzania krytycznych akcji (np. usunięcie konta).

### 1.5 Scenariusze i Walidacja

Opisane zostaną kluczowe scenariusze interakcji użytkownika z systemem, takie jak pomyślna rejestracja, błędy walidacji, logowanie, reset hasła, zmiana hasła w profilu oraz usuwanie konta, wraz z oczekiwanym zachowaniem systemu i komunikatami zwrotnymi.

## 2. LOGIKA BACKENDOWA

### 2.1 Struktura Endpointów API

Wszystkie endpointy będą zlokalizowane w `src/pages/api/auth/` i będą renderowane dynamicznie.

#### Endpoint Rejestracji (`/api/auth/register.ts`, POST)
- Waliduje dane wejściowe (imię, email, hasło) przy użyciu schematu Zod, uwzględniając politykę siły hasła.
- Wywołuje funkcję `signUp` z Supabase Auth.
- Po stronie bazy danych, trigger automatycznie tworzy powiązany profil w tabeli `profiles`.
- W odpowiedzi ustawia ciasteczka sesji, aby użytkownik był automatycznie zalogowany.
- Opcjonalnie tworzy dane startowe dla nowego użytkownika (onboarding).

#### Endpoint Logowania (`/api/auth/login.ts`, POST)
- Waliduje email i hasło.
- Wywołuje funkcję `signInWithPassword` z Supabase Auth.
- W odpowiedzi ustawia ciasteczka sesji.

#### Endpoint Wylogowania (`/api/auth/logout.ts`, POST)
- Wywołuje funkcję `signOut` z Supabase Auth, co unieważnia sesję.
- Usuwa ciasteczka sesji.

#### Endpoint Żądania Resetu Hasła (`/api/auth/forgot-password.ts`, POST)
- Waliduje format adresu email.
- Wywołuje funkcję `resetPasswordForEmail` z Supabase Auth, wskazując odpowiedni URL do przekierowania.
- Zawsze zwraca odpowiedź sukcesu, aby zapobiec enumeracji użytkowników.

#### Endpoint Ustawienia Nowego Hasła (`/api/auth/reset-password.ts`, POST)
- Waliduje nowe hasło oraz kod autoryzacyjny.
- Wymienia otrzymany kod na sesję (`exchangeCodeForSession`).
- Aktualizuje hasło użytkownika (`updateUser`).

#### Endpoint Zmiany Hasła (`/api/auth/change-password.ts`, POST)
- Wymaga aktywnej sesji użytkownika.
- Waliduje obecne i nowe hasło przy użyciu schematu Zod.
- Weryfikuje poprawność obecnego hasła poprzez próbę logowania (`signInWithPassword`).
- Aktualizuje hasło zalogowanego użytkownika (`updateUser`).
- Zwraca komunikat sukcesu lub odpowiedni błąd (np. "Obecne hasło jest nieprawidłowe").

#### Endpoint Usuwania Konta (obsługiwany przez DELETE `/api/profiles/me.ts`)
- Wymaga aktywnej sesji użytkownika.
- Usuwa kaskadowo wszystkie powiązane dane:
  - Wszystkie plany podróży powiązane z notatkami użytkownika
  - Wszystkie notatki użytkownika
  - Profil użytkownika
- W przyszłości powinien używać klienta administracyjnego Supabase do usunięcia użytkownika z systemu Auth (`admin.deleteUser`).
- Zwraca komunikat sukcesu po pomyślnym usunięciu.

#### Endpoint Aktualizacji Profilu (`/api/profiles/me.ts`, GET/PUT/DELETE)

**GET /api/profiles/me:**
- Wymaga aktywnej sesji użytkownika.
- Pobiera dane profilu zalogowanego użytkownika z tabeli `profiles`.
- Zwraca obiekt UserProfileDTO zawierający id, email, imię i preferencje.

**PUT /api/profiles/me:**
- Wymaga aktywnej sesji użytkownika.
- Waliduje dane profilowe (imię i/lub preferencje) przy użyciu schematu Zod.
- Wymaga podania co najmniej jednego pola (name lub preferences).
- Aktualizuje odpowiedni wiersz w tabeli `profiles` dla zalogowanego użytkownika.
- Zwraca zaktualizowane dane profilu lub odpowiedni komunikat błędu.

**DELETE /api/profiles/me:**
- Wymaga aktywnej sesji użytkownika.
- Usuwa wszystkie plany podróży powiązane z notatkami użytkownika.
- Usuwa wszystkie notatki użytkownika.
- Usuwa profil użytkownika z tabeli `profiles`.
- W przyszłości powinno także usuwać użytkownika z Supabase Auth (wymaga admin privileges).

### 2.2 Modele Danych (Typy TypeScript)

**Lokalizacja:** `src/types.ts`

Zdefiniowane zostaną interfejsy TypeScript dla kluczowych encji, takich jak `Profile` i `TravelPreferences`, aby zapewnić typowanie w całej aplikacji.

### 2.3 Schemat Bazy Danych (Supabase)

Zostanie utworzona tabela `profiles` z kolumnami takimi jak `id` (klucz obcy do `auth.users`), `name`, `email`, `travel_preferences`. Tabela będzie zabezpieczona za pomocą RLS (Row Level Security), aby zapewnić, że użytkownicy mogą modyfikować tylko własne dane. Zdefiniowany zostanie również trigger bazodanowy, który automatycznie utworzy profil dla każdego nowo zarejestrowanego użytkownika w `auth.users`.

## 3. SYSTEM AUTENTYKACJI

### 3.1 Integracja Supabase Auth z Astro

Zostaną utworzone dedykowane funkcje do tworzenia klientów Supabase:
- **`createSupabaseServerClient`**: Do użytku po stronie serwera (w middleware, na stronach, w API), zintegrowany z obsługą ciasteczek Astro.
- **`createSupabaseAdminClient`**: Do operacji wymagających uprawnień administratora (np. usuwanie konta), wykorzystujący `service_role_key`.

### 3.2 Middleware Autentykacji

**Lokalizacja:** `src/middleware/index.ts`

Middleware będzie odpowiedzialne za:
- Tworzenie instancji klienta Supabase dla każdego żądania i udostępnianie jej w `Astro.locals.supabase`.
- Pobieranie i odświeżanie sesji użytkownika (`getSession`) i udostępnianie jej w `Astro.locals.session`.
- Obsługę callbacków autentykacji (np. po kliknięciu w link w emailu), wymianę kodu na sesję i ustawienie odpowiednich ciasteczek.

Typy `Astro.locals` zostaną rozszerzone w pliku `src/env.d.ts`, aby zapewnić wsparcie dla `supabase`, `session` i `user`.

### 3.3 Ochrona Stron

**Lokalizacja:** `src/lib/utils/auth-guard.ts`

Zostaną utworzone funkcje pomocnicze:
- **`requireAuth`**: Sprawdza, czy użytkownik jest zalogowany. Jeśli nie, przekierowuje na stronę logowania z parametrem `redirect`.
- **`requireNoAuth`**: Sprawdza, czy użytkownik jest gościem. Jeśli jest zalogowany, przekierowuje go na stronę główną aplikacji.

### 3.4 Konfiguracja Email Templates w Supabase

W panelu Supabase zostaną skonfigurowane szablony wiadomości email dla:
- **Resetu hasła**: Będzie zawierać link kierujący do endpointu zwrotnego `/api/auth/callback`, który po przetworzeniu przekieruje na stronę `/reset-password`.
- **Potwierdzenia adresu email** (opcjonalnie): Analogicznie, z przekierowaniem na stronę główną aplikacji.

### 3.5 Bezpieczeństwo

- **CSRF:** Ochrona jest zapewniona przez użycie ciasteczek HTTP-only do przechowywania tokenów sesji.
- **Password Strength:** Walidacja siły hasła (min. 8 znaków, mała i wielka litera, cyfra) będzie implementowana zarówno po stronie klienta, jak i serwera.
- **User Enumeration:** Endpointy takie jak reset hasła będą zaprojektowane tak, aby nie ujawniać, czy dany użytkownik istnieje w systemie.
- **RLS:** Dostęp do danych w bazie będzie ściśle kontrolowany przez polityki Row Level Security.

## 4. ZMIENNE ŚRODOWISKOWE

Aplikacja będzie wymagać konfiguracji następujących zmiennych środowiskowych: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` oraz `PUBLIC_APP_URL`.
