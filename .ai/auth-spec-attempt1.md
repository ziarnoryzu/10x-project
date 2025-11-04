# Specyfikacja Techniczna - System Autentykacji VibeTravels

## 1. ARCHITEKTURA INTERFEJSU UŻYTKOWNIKA

### 1.1 Struktura Stron i Layoutów

#### Layout Podstawowy
**Lokalizacja:** `src/layouts/BaseLayout.astro`

**Odpowiedzialność:**
- Sprawdzanie stanu autentykacji użytkownika poprzez `context.locals.supabase`
- Warunkowe renderowanie nawigacji w zależności od stanu zalogowania
- Przekazywanie informacji o użytkowniku do komponentów potomnych
- Obsługa View Transitions API dla płynnych przejść między stronami

**Logika server-side:**
```typescript
const session = await context.locals.supabase.auth.getSession()
const user = session?.data?.session?.user ?? null
```

**Elementy warunkowe:**
- Dla użytkownika niezalogowanego: linki do `/login` i `/register`
- Dla użytkownika zalogowanego: link do `/profile`, `/notes`, przycisk wylogowania

#### Layout Autentykacji
**Lokalizacja:** `src/layouts/AuthLayout.astro`

**Odpowiedzialność:**
- Dedykowany layout dla stron rejestracji, logowania i resetu hasła
- Centrowanie formularzy na ekranie
- Minimalistyczny design skupiający uwagę na formularzach
- Logo aplikacji i podstawowa nawigacja między formularzami auth

**Charakterystyka:**
- Brak głównej nawigacji aplikacji
- Prosty footer z linkami do polityki prywatności
- Responsywny design z maksymalną szerokością 400px dla formularzy

### 1.2 Strony Astro (Server-Side Rendered)

#### Strona Rejestracji
**Lokalizacja:** `src/pages/register.astro`  
**Routing:** `/register`  
**Prerender:** `export const prerender = false`

**Odpowiedzialność:**
- Renderowanie formularza rejestracji (komponent React)
- Sprawdzenie czy użytkownik jest już zalogowany (przekierowanie do `/notes`)
- Obsługa parametrów URL (np. `?error=email-taken`)
- Wyświetlanie komunikatów z parametrów URL

**Logika server-side:**
```typescript
const session = await Astro.locals.supabase.auth.getSession()
if (session?.data?.session) {
  return Astro.redirect('/notes')
}

const errorParam = Astro.url.searchParams.get('error')
const errorMessages = {
  'email-taken': 'Ten adres e-mail jest już zarejestrowany',
  'weak-password': 'Hasło nie spełnia wymagań bezpieczeństwa',
  'invalid-email': 'Podano nieprawidłowy adres e-mail'
}
```

**Integracja z komponentem:**
```tsx
<RegisterForm errorMessage={errorMessages[errorParam]} client:load />
```

#### Strona Logowania
**Lokalizacja:** `src/pages/login.astro`  
**Routing:** `/login`  
**Prerender:** `export const prerender = false`

**Odpowiedzialność:**
- Renderowanie formularza logowania (komponent React)
- Sprawdzenie czy użytkownik jest już zalogowany (przekierowanie do `/notes`)
- Obsługa parametru `redirect` dla powrotu do żądanej strony po zalogowaniu
- Wyświetlanie komunikatów sukcesu (np. po resecie hasła)

**Logika server-side:**
```typescript
const session = await Astro.locals.supabase.auth.getSession()
if (session?.data?.session) {
  return Astro.redirect('/notes')
}

const redirectTo = Astro.url.searchParams.get('redirect') || '/notes'
const successMessage = Astro.url.searchParams.get('message')
```

**Integracja z komponentem:**
```tsx
<LoginForm 
  redirectTo={redirectTo} 
  successMessage={successMessage}
  client:load 
/>
```

#### Strona Resetowania Hasła - Żądanie
**Lokalizacja:** `src/pages/forgot-password.astro`  
**Routing:** `/forgot-password`  
**Prerender:** `export const prerender = false`

**Odpowiedzialność:**
- Renderowanie formularza żądania resetu hasła
- Wyświetlanie komunikatu po wysłaniu emaila
- Sprawdzenie czy użytkownik jest zalogowany (przekierowanie)

**Logika server-side:**
```typescript
const session = await Astro.locals.supabase.auth.getSession()
if (session?.data?.session) {
  return Astro.redirect('/notes')
}

const emailSent = Astro.url.searchParams.get('sent') === 'true'
```

#### Strona Resetowania Hasła - Ustawienie Nowego
**Lokalizacja:** `src/pages/reset-password.astro`  
**Routing:** `/reset-password`  
**Prerender:** `export const prerender = false`

**Odpowiedzialność:**
- Walidacja tokenu resetu hasła z URL
- Renderowanie formularza ustawienia nowego hasła
- Obsługa wygasłych lub nieprawidłowych tokenów

**Logika server-side:**
```typescript
const token = Astro.url.searchParams.get('token')
const type = Astro.url.searchParams.get('type')

if (!token || type !== 'recovery') {
  return Astro.redirect('/login?error=invalid-reset-link')
}

// Weryfikacja tokenu poprzez próbę weryfikacji OTP
const { error } = await Astro.locals.supabase.auth.verifyOtp({
  token_hash: token,
  type: 'recovery'
})

if (error) {
  return Astro.redirect('/login?error=expired-reset-link')
}
```

#### Strona Profilu
**Lokalizacja:** `src/pages/profile.astro`  
**Routing:** `/profile`  
**Prerender:** `export const prerender = false`

**Odpowiedzialność:**
- Sprawdzenie autentykacji (przekierowanie do `/login?redirect=/profile`)
- Pobranie danych użytkownika z bazy
- Renderowanie komponentów zarządzania profilem

**Logika server-side:**
```typescript
const session = await Astro.locals.supabase.auth.getSession()
if (!session?.data?.session) {
  return Astro.redirect('/login?redirect=/profile')
}

const userId = session.data.session.user.id

// Pobranie profilu użytkownika
const { data: profile, error } = await Astro.locals.supabase
  .from('profiles')
  .select('*')
  .eq('id', userId)
  .single()
```

**Integracja z komponentami:**
```tsx
<ProfileForm profile={profile} client:load />
<ChangePasswordForm client:load />
<DeleteAccountButton client:load />
```

#### Middleware Autentykacji
**Lokalizacja:** `src/middleware/index.ts`

**Odpowiedzialność:**
- Inicjalizacja klienta Supabase dla każdego żądania
- Odświeżanie sesji użytkownika
- Udostępnienie klienta Supabase w `context.locals`
- Obsługa ciasteczek sesji

**Implementacja:**
```typescript
import { createServerClient } from '@supabase/ssr'
import type { SupabaseClient } from './db/supabase.client'

export async function onRequest(context, next) {
  const supabase: SupabaseClient = createServerClient(
    import.meta.env.SUPABASE_URL,
    import.meta.env.SUPABASE_ANON_KEY,
    {
      cookies: {
        get: (key) => context.cookies.get(key)?.value,
        set: (key, value, options) => {
          context.cookies.set(key, value, options)
        },
        remove: (key, options) => {
          context.cookies.delete(key, options)
        }
      }
    }
  )

  context.locals.supabase = supabase
  
  // Odświeżenie sesji
  await supabase.auth.getSession()

  return next()
}
```

### 1.3 Komponenty React (Client-Side)

#### Formularz Rejestracji
**Lokalizacja:** `src/components/auth/RegisterForm.tsx`

**Props:**
```typescript
interface RegisterFormProps {
  errorMessage?: string
}
```

**Stan komponentu:**
```typescript
interface FormState {
  name: string
  email: string
  password: string
  isLoading: boolean
  validationErrors: {
    name?: string
    email?: string
    password?: string
  }
}
```

**Odpowiedzialność:**
- Walidacja w czasie rzeczywistym (email format, siła hasła)
- Wysłanie żądania POST do `/api/auth/register`
- Wyświetlanie błędów walidacji i błędów z API
- Obsługa stanu ładowania podczas rejestracji
- Przekierowanie do onboardingu po sukcesie

**Walidacja hasła:**
- Minimum 8 znaków
- Co najmniej jedna mała litera
- Co najmniej jedna wielka litera
- Co najmniej jedna cyfra

**Walidacja emaila:**
- Sprawdzenie formatu za pomocą regex
- Realtime feedback podczas pisania

**Obsługa błędów:**
```typescript
const errorMap = {
  'User already registered': 'Ten adres e-mail jest już zarejestrowany',
  'Invalid email format': 'Nieprawidłowy format adresu e-mail',
  'Password too weak': 'Hasło nie spełnia wymagań bezpieczeństwa'
}
```

**Formularz zawiera:**
- Pole: Imię (wymagane, min. 2 znaki)
- Pole: Email (wymagane, format email)
- Pole: Hasło (wymagane, wskaźnik siły hasła)
- Checkbox: Akceptacja regulaminu
- Przycisk: "Zarejestruj się"
- Link: "Masz już konto? Zaloguj się"

#### Formularz Logowania
**Lokalizacja:** `src/components/auth/LoginForm.tsx`

**Props:**
```typescript
interface LoginFormProps {
  redirectTo?: string
  successMessage?: string
}
```

**Stan komponentu:**
```typescript
interface FormState {
  email: string
  password: string
  isLoading: boolean
  error?: string
}
```

**Odpowiedzialność:**
- Podstawowa walidacja przed wysłaniem
- Wysłanie żądania POST do `/api/auth/login`
- Przekierowanie do `redirectTo` po sukcesie
- Wyświetlanie komunikatów błędów
- Obsługa stanu ładowania

**Formularz zawiera:**
- Pole: Email
- Pole: Hasło
- Link: "Nie pamiętasz hasła?"
- Przycisk: "Zaloguj się"
- Link: "Nie masz konta? Zarejestruj się"

#### Formularz Żądania Resetu Hasła
**Lokalizacja:** `src/components/auth/ForgotPasswordForm.tsx`

**Stan komponentu:**
```typescript
interface FormState {
  email: string
  isLoading: boolean
  emailSent: boolean
  error?: string
}
```

**Odpowiedzialność:**
- Walidacja formatu emaila
- Wysłanie żądania POST do `/api/auth/forgot-password`
- Wyświetlenie komunikatu po wysłaniu emaila
- Obsługa błędów (np. email nie istnieje w systemie)

**Formularz zawiera:**
- Pole: Email
- Przycisk: "Wyślij link do resetu"
- Link: "Powrót do logowania"
- Komunikat sukcesu: "Link do resetu hasła został wysłany na adres {email}"

#### Formularz Ustawienia Nowego Hasła
**Lokalizacja:** `src/components/auth/ResetPasswordForm.tsx`

**Props:**
```typescript
interface ResetPasswordFormProps {
  token: string
}
```

**Stan komponentu:**
```typescript
interface FormState {
  password: string
  confirmPassword: string
  isLoading: boolean
  validationErrors: {
    password?: string
    confirmPassword?: string
  }
}
```

**Odpowiedzialność:**
- Walidacja nowego hasła (takie same wymagania jak przy rejestracji)
- Sprawdzenie zgodności hasła i potwierdzenia
- Wysłanie żądania POST do `/api/auth/reset-password`
- Przekierowanie do logowania po sukcesie

**Formularz zawiera:**
- Pole: Nowe hasło (ze wskaźnikiem siły)
- Pole: Potwierdź hasło
- Przycisk: "Ustaw nowe hasło"

#### Formularz Edycji Profilu
**Lokalizacja:** `src/components/profile/ProfileForm.tsx`

**Props:**
```typescript
interface ProfileFormProps {
  profile: {
    id: string
    name: string
    email: string
    travel_preferences?: TravelPreferences
  }
}
```

**Stan komponentu:**
```typescript
interface FormState {
  name: string
  travelPreferences: TravelPreferences
  isLoading: boolean
  successMessage?: string
  error?: string
}
```

**Odpowiedzialność:**
- Edycja imienia użytkownika
- Zarządzanie preferencjami turystycznymi (zgodnie z US-005)
- Wysłanie żądania PUT do `/api/profile`
- Wyświetlanie komunikatów sukcesu/błędu

**Preferencje turystyczne:**
```typescript
interface TravelPreferences {
  styles: string[] // ['Relaks', 'Zwiedzanie', 'Impreza']
  interests: string[] // ['Historia', 'Sztuka', 'Przyroda']
  cuisine: string[] // ['Lokalna', 'Międzynarodowa', 'Street food']
  pace: string[] // ['Wolne', 'Umiarkowane', 'Intensywne']
}
```

**Formularz zawiera:**
- Pole: Imię (edytowalne)
- Pole: Email (tylko do odczytu)
- Sekcja: Preferencje turystyczne (multi-select tagi)
- Przycisk: "Zapisz zmiany"

#### Formularz Zmiany Hasła
**Lokalizacja:** `src/components/profile/ChangePasswordForm.tsx`

**Stan komponentu:**
```typescript
interface FormState {
  currentPassword: string
  newPassword: string
  confirmPassword: string
  isLoading: boolean
  validationErrors: {
    currentPassword?: string
    newPassword?: string
    confirmPassword?: string
  }
}
```

**Odpowiedzialność:**
- Walidacja starego hasła
- Walidacja nowego hasła (wymagania bezpieczeństwa)
- Sprawdzenie zgodności nowego hasła i potwierdzenia
- Wysłanie żądania POST do `/api/auth/change-password`
- Wyświetlanie komunikatów sukcesu/błędu
- Czyszczenie formularza po sukcesie

**Formularz zawiera:**
- Pole: Aktualne hasło
- Pole: Nowe hasło (ze wskaźnikiem siły)
- Pole: Potwierdź nowe hasło
- Przycisk: "Zmień hasło"

#### Przycisk Usuwania Konta
**Lokalizacja:** `src/components/profile/DeleteAccountButton.tsx`

**Stan komponentu:**
```typescript
interface State {
  showConfirmDialog: boolean
  confirmationText: string
  isDeleting: boolean
}
```

**Odpowiedzialność:**
- Wyświetlenie modala z ostrzeżeniem
- Wymóg wpisania tekstu potwierdzającego (np. "USUŃ KONTO")
- Wysłanie żądania DELETE do `/api/auth/delete-account`
- Wylogowanie i przekierowanie po sukcesie

**Modal potwierdzenia zawiera:**
- Nagłówek: "Czy na pewno chcesz usunąć konto?"
- Tekst ostrzegawczy: "Ta operacja jest nieodwracalna. Wszystkie Twoje dane, notatki i plany zostaną trwale usunięte."
- Pole tekstowe: "Wpisz 'USUŃ KONTO' aby potwierdzić"
- Przycisk: "Anuluj" (secondary)
- Przycisk: "Usuń konto na zawsze" (destructive, aktywny tylko gdy tekst się zgadza)

#### Komponent Wylogowania
**Lokalizacja:** `src/components/auth/LogoutButton.tsx`

**Odpowiedzialność:**
- Wysłanie żądania POST do `/api/auth/logout`
- Przekierowanie do strony logowania po sukcesie
- Obsługa stanu ładowania

**Renderowanie:**
```tsx
<button onClick={handleLogout} disabled={isLoading}>
  {isLoading ? 'Wylogowywanie...' : 'Wyloguj'}
</button>
```

### 1.4 Komponenty UI Współdzielone

#### Wskaźnik Siły Hasła
**Lokalizacja:** `src/components/ui/PasswordStrengthIndicator.tsx`

**Props:**
```typescript
interface PasswordStrengthIndicatorProps {
  password: string
}
```

**Logika:**
- Ocena siły hasła na podstawie: długości, różnorodności znaków, obecności cyfr/symboli
- Zwracanie wartości: 'weak' | 'medium' | 'strong'
- Wizualizacja: pasek postępu z kolorami (czerwony/żółty/zielony)

#### Komponent Komunikatu Błędu
**Lokalizacja:** `src/components/ui/ErrorMessage.tsx`

**Props:**
```typescript
interface ErrorMessageProps {
  message?: string
}
```

**Renderowanie:**
- Wyświetlanie tylko gdy `message` jest niepusty
- Ikona błędu + tekst w kolorze czerwonym
- Animacja pojawienia się

#### Modal Potwierdzenia
**Lokalizacja:** `src/components/ui/ConfirmDialog.tsx`

**Props:**
```typescript
interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'destructive'
  onConfirm: () => void
  onCancel: () => void
}
```

**Wykorzystanie:**
- Shadcn/ui Dialog jako podstawa
- Overlay z backdrop-blur
- Animacje wejścia/wyjścia

### 1.5 Scenariusze i Walidacja

#### Scenariusz: Pomyślna rejestracja
1. Użytkownik wypełnia formularz rejestracji
2. Walidacja client-side: wszystkie pola poprawne
3. POST `/api/auth/register` → sukces
4. Automatyczne zalogowanie użytkownika
5. Utworzenie przykładowej notatki (onboarding)
6. Przekierowanie do `/onboarding` (modal z preferencjami)

#### Scenariusz: Błąd rejestracji - email zajęty
1. Użytkownik wypełnia formularz z emailem już w systemie
2. POST `/api/auth/register` → błąd 409
3. Wyświetlenie komunikatu: "Ten adres e-mail jest już zarejestrowany"
4. Link: "Zaloguj się" do formularza logowania

#### Scenariusz: Pomyślne logowanie
1. Użytkownik wypełnia formularz logowania
2. POST `/api/auth/login` → sukces
3. Ustawienie ciasteczek sesji
4. Przekierowanie do `/notes` (lub do `redirectTo` z parametru)

#### Scenariusz: Błąd logowania - złe dane
1. Użytkownik podaje błędne dane
2. POST `/api/auth/login` → błąd 401
3. Wyświetlenie komunikatu: "Nieprawidłowy email lub hasło"
4. Pola formularza pozostają wypełnione (z wyjątkiem hasła)

#### Scenariusz: Reset hasła - cały flow
1. Użytkownik klika "Nie pamiętasz hasła?"
2. Wypełnia formularz z emailem
3. POST `/api/auth/forgot-password` → sukces
4. Wyświetlenie: "Link do resetu został wysłany na {email}"
5. Użytkownik otrzymuje email z linkiem zawierającym token
6. Kliknięcie w link → `/reset-password?token={token}&type=recovery`
7. Walidacja tokenu server-side
8. Wyświetlenie formularza ustawienia nowego hasła
9. Użytkownik wprowadza nowe hasło
10. POST `/api/auth/reset-password` → sukces
11. Przekierowanie do `/login?message=password-reset-success`

#### Scenariusz: Reset hasła - wygasły token
1. Użytkownik klika w stary link resetu hasła
2. Weryfikacja tokenu server-side → błąd
3. Przekierowanie do `/login?error=expired-reset-link`
4. Wyświetlenie komunikatu: "Link do resetu hasła wygasł. Poproś o nowy."

#### Scenariusz: Zmiana hasła w profilu
1. Zalogowany użytkownik przechodzi do `/profile`
2. Otwiera sekcję zmiany hasła
3. Wypełnia: stare hasło, nowe hasło, potwierdzenie
4. POST `/api/auth/change-password` → sukces
5. Wyświetlenie komunikatu: "Hasło zostało zmienione"
6. Formularz jest czyszczony

#### Scenariusz: Usuwanie konta
1. Zalogowany użytkownik przechodzi do `/profile`
2. Klika "Usuń konto"
3. Modal potwierdzenia: ostrzeżenie + pole tekstowe
4. Użytkownik wpisuje "USUŃ KONTO"
5. DELETE `/api/auth/delete-account` → sukces
6. Wylogowanie użytkownika
7. Przekierowanie do `/login?message=account-deleted`

## 2. LOGIKA BACKENDOWA

### 2.1 Struktura Endpointów API

Wszystkie endpointy autentykacji znajdują się w katalogu `src/pages/api/auth/`.

#### Endpoint Rejestracji
**Lokalizacja:** `src/pages/api/auth/register.ts`  
**Metoda:** POST  
**Prerender:** `export const prerender = false`

**Request Body Schema (Zod):**
```typescript
const RegisterSchema = z.object({
  name: z.string()
    .min(2, 'Imię musi mieć co najmniej 2 znaki')
    .max(100, 'Imię może mieć maksymalnie 100 znaków'),
  email: z.string()
    .email('Nieprawidłowy format adresu e-mail')
    .toLowerCase()
    .trim(),
  password: z.string()
    .min(8, 'Hasło musi mieć co najmniej 8 znaków')
    .regex(/[a-z]/, 'Hasło musi zawierać małą literę')
    .regex(/[A-Z]/, 'Hasło musi zawierać wielką literę')
    .regex(/[0-9]/, 'Hasło musi zawierać cyfrę')
})
```

**Response:**
```typescript
// Sukces (201 Created)
{
  success: true,
  user: {
    id: string,
    email: string,
    name: string
  }
}

// Błąd (400 Bad Request / 409 Conflict / 500 Internal Server Error)
{
  success: false,
  error: string,
  details?: ZodError
}
```

**Proces:**
1. Walidacja danych wejściowych za pomocą Zod
2. Sprawdzenie czy email nie jest już zajęty
3. Utworzenie użytkownika w Supabase Auth: `supabase.auth.signUp()`
4. Utworzenie profilu w tabeli `profiles` z `name`
5. Utworzenie przykładowej notatki dla onboardingu (serwis `OnboardingService`)
6. Automatyczne zalogowanie użytkownika (ustawienie sesji)
7. Zwrócenie danych użytkownika

**Obsługa błędów:**
- Email zajęty → 409 Conflict
- Błąd walidacji → 400 Bad Request
- Błąd Supabase → 500 Internal Server Error

#### Endpoint Logowania
**Lokalizacja:** `src/pages/api/auth/login.ts`  
**Metoda:** POST  
**Prerender:** `export const prerender = false`

**Request Body Schema:**
```typescript
const LoginSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  password: z.string().min(1, 'Hasło jest wymagane')
})
```

**Response:**
```typescript
// Sukces (200 OK)
{
  success: true,
  user: {
    id: string,
    email: string
  }
}

// Błąd (401 Unauthorized / 400 Bad Request)
{
  success: false,
  error: string
}
```

**Proces:**
1. Walidacja danych wejściowych
2. Logowanie użytkownika: `supabase.auth.signInWithPassword()`
3. Ustawienie ciasteczek sesji
4. Zwrócenie danych użytkownika

**Obsługa błędów:**
- Złe dane → 401 Unauthorized
- Błąd walidacji → 400 Bad Request

#### Endpoint Wylogowania
**Lokalizacja:** `src/pages/api/auth/logout.ts`  
**Metoda:** POST  
**Prerender:** `export const prerender = false`

**Response:**
```typescript
// Sukces (200 OK)
{
  success: true
}
```

**Proces:**
1. Wywołanie `supabase.auth.signOut()`
2. Usunięcie ciasteczek sesji
3. Zwrócenie potwierdzenia

#### Endpoint Żądania Resetu Hasła
**Lokalizacja:** `src/pages/api/auth/forgot-password.ts`  
**Metoda:** POST  
**Prerender:** `export const prerender = false`

**Request Body Schema:**
```typescript
const ForgotPasswordSchema = z.object({
  email: z.string().email().toLowerCase().trim()
})
```

**Response:**
```typescript
// Sukces (200 OK)
{
  success: true,
  message: 'Link do resetu hasła został wysłany'
}

// Błąd (400 Bad Request)
{
  success: false,
  error: string
}
```

**Proces:**
1. Walidacja emaila
2. Wywołanie `supabase.auth.resetPasswordForEmail()`
3. Konfiguracja redirectUrl: `{APP_URL}/reset-password`
4. Zwrócenie potwierdzenia (zawsze sukces, nawet jeśli email nie istnieje - bezpieczeństwo)

**Uwaga:** Nie ujawniamy czy email istnieje w systemie (przeciwdziałanie enumeracji użytkowników).

#### Endpoint Ustawienia Nowego Hasła
**Lokalizacja:** `src/pages/api/auth/reset-password.ts`  
**Metoda:** POST  
**Prerender:** `export const prerender = false`

**Request Body Schema:**
```typescript
const ResetPasswordSchema = z.object({
  password: z.string()
    .min(8, 'Hasło musi mieć co najmniej 8 znaków')
    .regex(/[a-z]/, 'Hasło musi zawierać małą literę')
    .regex(/[A-Z]/, 'Hasło musi zawierać wielką literę')
    .regex(/[0-9]/, 'Hasło musi zawierać cyfrę')
})
```

**Response:**
```typescript
// Sukces (200 OK)
{
  success: true
}

// Błąd (400 Bad Request / 401 Unauthorized)
{
  success: false,
  error: string
}
```

**Proces:**
1. Walidacja nowego hasła
2. Sprawdzenie czy użytkownik ma aktywną sesję recovery
3. Wywołanie `supabase.auth.updateUser({ password })`
4. Zwrócenie potwierdzenia

**Obsługa błędów:**
- Brak sesji recovery → 401 Unauthorized
- Błąd walidacji → 400 Bad Request

#### Endpoint Zmiany Hasła
**Lokalizacja:** `src/pages/api/auth/change-password.ts`  
**Metoda:** POST  
**Prerender:** `export const prerender = false`

**Request Body Schema:**
```typescript
const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Aktualne hasło jest wymagane'),
  newPassword: z.string()
    .min(8, 'Hasło musi mieć co najmniej 8 znaków')
    .regex(/[a-z]/, 'Hasło musi zawierać małą literę')
    .regex(/[A-Z]/, 'Hasło musi zawierać wielką literę')
    .regex(/[0-9]/, 'Hasło musi zawierać cyfrę')
})
```

**Response:**
```typescript
// Sukces (200 OK)
{
  success: true
}

// Błąd (400 Bad Request / 401 Unauthorized)
{
  success: false,
  error: string
}
```

**Proces:**
1. Sprawdzenie autentykacji użytkownika
2. Walidacja danych wejściowych
3. Weryfikacja starego hasła: ponowne logowanie z `currentPassword`
4. Jeśli weryfikacja OK → `supabase.auth.updateUser({ password: newPassword })`
5. Zwrócenie potwierdzenia

**Obsługa błędów:**
- Niezalogowany → 401 Unauthorized
- Złe stare hasło → 401 Unauthorized
- Błąd walidacji → 400 Bad Request

#### Endpoint Usuwania Konta
**Lokalizacja:** `src/pages/api/auth/delete-account.ts`  
**Metoda:** DELETE  
**Prerender:** `export const prerender = false`

**Response:**
```typescript
// Sukces (200 OK)
{
  success: true
}

// Błąd (401 Unauthorized / 500 Internal Server Error)
{
  success: false,
  error: string
}
```

**Proces:**
1. Sprawdzenie autentykacji użytkownika
2. Pobranie ID użytkownika z sesji
3. Usunięcie profilu z tabeli `profiles` (kaskadowo usuwa notatki i plany)
4. Wywołanie Supabase Admin API do usunięcia użytkownika z Auth
5. Wylogowanie użytkownika
6. Zwrócenie potwierdzenia

**Obsługa błędów:**
- Niezalogowany → 401 Unauthorized
- Błąd usuwania → 500 Internal Server Error

**Uwaga:** Wymaga użycia Supabase Admin Client (service role key) do usunięcia użytkownika z Auth.

#### Endpoint Aktualizacji Profilu
**Lokalizacja:** `src/pages/api/profile.ts`  
**Metoda:** PUT  
**Prerender:** `export const prerender = false`

**Request Body Schema:**
```typescript
const UpdateProfileSchema = z.object({
  name: z.string()
    .min(2, 'Imię musi mieć co najmniej 2 znaki')
    .max(100, 'Imię może mieć maksymalnie 100 znaków')
    .optional(),
  travel_preferences: z.object({
    styles: z.array(z.string()).optional(),
    interests: z.array(z.string()).optional(),
    cuisine: z.array(z.string()).optional(),
    pace: z.array(z.string()).optional()
  }).optional()
})
```

**Response:**
```typescript
// Sukces (200 OK)
{
  success: true,
  profile: Profile
}

// Błąd (400 Bad Request / 401 Unauthorized)
{
  success: false,
  error: string
}
```

**Proces:**
1. Sprawdzenie autentykacji użytkownika
2. Walidacja danych wejściowych
3. Aktualizacja tabeli `profiles` dla danego użytkownika
4. Zwrócenie zaktualizowanego profilu

### 2.2 Modele Danych (Typy TypeScript)

**Lokalizacja:** `src/types.ts`

```typescript
// User (z Supabase Auth)
export interface User {
  id: string
  email: string
  created_at: string
  updated_at: string
}

// Profile (rozszerzenie User)
export interface Profile {
  id: string // FK do auth.users
  name: string
  email: string
  travel_preferences?: TravelPreferences
  created_at: string
  updated_at: string
}

export interface TravelPreferences {
  styles?: string[]
  interests?: string[]
  cuisine?: string[]
  pace?: string[]
}

// DTOs dla API
export interface RegisterDTO {
  name: string
  email: string
  password: string
}

export interface LoginDTO {
  email: string
  password: string
}

export interface ChangePasswordDTO {
  currentPassword: string
  newPassword: string
}

export interface UpdateProfileDTO {
  name?: string
  travel_preferences?: TravelPreferences
}
```

### 2.3 Schemat Bazy Danych (Supabase)

#### Tabela: profiles
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  travel_preferences JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index na email dla szybszego wyszukiwania
CREATE INDEX idx_profiles_email ON profiles(email);

-- RLS Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Użytkownik może czytać tylko swój profil
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Użytkownik może aktualizować tylko swój profil
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Trigger do automatycznego tworzenia profilu po rejestracji
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger do aktualizacji updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 2.4 Serwisy (Business Logic)

#### AuthService
**Lokalizacja:** `src/lib/services/auth.service.ts`

**Odpowiedzialność:**
- Enkapsulacja logiki autentykacji
- Komunikacja z Supabase Auth
- Mapowanie błędów na przyjazne komunikaty

**Metody:**
```typescript
class AuthService {
  constructor(private supabase: SupabaseClient)

  async register(data: RegisterDTO): Promise<User>
  async login(credentials: LoginDTO): Promise<User>
  async logout(): Promise<void>
  async requestPasswordReset(email: string): Promise<void>
  async resetPassword(newPassword: string): Promise<void>
  async changePassword(currentPassword: string, newPassword: string): Promise<void>
  async deleteAccount(userId: string): Promise<void>
  async getCurrentUser(): Promise<User | null>
}
```

#### ProfileService
**Lokalizacja:** `src/lib/services/profile.service.ts`

**Odpowiedzialność:**
- Zarządzanie profilem użytkownika
- CRUD operacje na tabeli `profiles`

**Metody:**
```typescript
class ProfileService {
  constructor(private supabase: SupabaseClient)

  async getProfile(userId: string): Promise<Profile | null>
  async updateProfile(userId: string, data: UpdateProfileDTO): Promise<Profile>
  async createProfile(userId: string, name: string, email: string): Promise<Profile>
}
```

#### OnboardingService
**Lokalizacja:** `src/lib/services/onboarding.service.ts`

**Odpowiedzialność:**
- Tworzenie przykładowej notatki dla nowych użytkowników
- Tworzenie przykładowego planu podróży

**Metody:**
```typescript
class OnboardingService {
  constructor(private supabase: SupabaseClient)

  async createExampleNote(userId: string): Promise<void>
}
```

**Przykładowa notatka:**
```typescript
const EXAMPLE_NOTE = {
  title: "Przykładowa podróż: Weekend w Krakowie",
  content: `
    Planujemy weekend w Krakowie. Chcielibyśmy zwiedzić Stare Miasto, 
    Wawel, Kazimierz. Interesuje nas historia i lokalna kuchnia. 
    Preferujemy spokojne tempo zwiedzania. Budżet: ok. 1000 PLN na osobę.
  `,
  has_plan: true
}
```

### 2.5 Walidacja i Obsługa Błędów

#### Centralna Walidacja (Middleware na poziomie endpointu)
**Lokalizacja:** `src/lib/validation/validate-request.ts`

```typescript
export async function validateRequest<T>(
  request: Request,
  schema: ZodSchema<T>
): Promise<{ data?: T; error?: { message: string; details: any } }> {
  try {
    const body = await request.json()
    const data = schema.parse(body)
    return { data }
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        error: {
          message: 'Błąd walidacji',
          details: error.errors
        }
      }
    }
    return {
      error: {
        message: 'Nieprawidłowe dane wejściowe',
        details: null
      }
    }
  }
}
```

#### Mapowanie Błędów Supabase
**Lokalizacja:** `src/lib/utils/error-mapper.ts`

```typescript
export function mapSupabaseError(error: any): string {
  const errorMap: Record<string, string> = {
    'User already registered': 'Ten adres e-mail jest już zarejestrowany',
    'Invalid login credentials': 'Nieprawidłowy email lub hasło',
    'Email not confirmed': 'Email nie został potwierdzony',
    'Password should be at least 8 characters': 'Hasło musi mieć co najmniej 8 znaków',
    'New password should be different from the old password': 'Nowe hasło musi różnić się od starego'
  }

  return errorMap[error.message] || 'Wystąpił nieoczekiwany błąd. Spróbuj ponownie.'
}
```

#### Standardowe Odpowiedzi API
**Lokalizacja:** `src/lib/utils/api-response.ts`

```typescript
export function successResponse(data: any, status = 200) {
  return new Response(
    JSON.stringify({ success: true, ...data }),
    {
      status,
      headers: { 'Content-Type': 'application/json' }
    }
  )
}

export function errorResponse(error: string, status = 400, details?: any) {
  return new Response(
    JSON.stringify({ success: false, error, details }),
    {
      status,
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
```

## 3. SYSTEM AUTENTYKACJI

### 3.1 Integracja Supabase Auth z Astro

#### Konfiguracja Klienta Supabase
**Lokalizacja:** `src/db/supabase.client.ts`

```typescript
import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

export type SupabaseClient = ReturnType<typeof createClient<Database>>

export function createSupabaseClient(
  supabaseUrl: string,
  supabaseKey: string
): SupabaseClient {
  return createClient<Database>(supabaseUrl, supabaseKey)
}
```

#### Klient Server-Side (dla Middleware i API Routes)
**Lokalizacja:** `src/db/supabase.server.ts`

```typescript
import { createServerClient } from '@supabase/ssr'
import type { AstroCookies } from 'astro'
import type { Database } from './database.types'

export function createSupabaseServerClient(
  cookies: AstroCookies,
  supabaseUrl: string,
  supabaseKey: string
) {
  return createServerClient<Database>(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        get: (key) => cookies.get(key)?.value,
        set: (key, value, options) => {
          cookies.set(key, value, {
            ...options,
            path: '/',
            sameSite: 'lax',
            secure: import.meta.env.PROD
          })
        },
        remove: (key, options) => {
          cookies.delete(key, {
            ...options,
            path: '/'
          })
        }
      }
    }
  )
}
```

#### Klient Admin (dla operacji administracyjnych)
**Lokalizacja:** `src/db/supabase.admin.ts`

```typescript
import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

// Używany TYLKO do operacji wymagających uprawnień serwisowych (np. usuwanie użytkownika)
export function createSupabaseAdminClient() {
  const supabaseUrl = import.meta.env.SUPABASE_URL
  const supabaseServiceKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseServiceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set')
  }

  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}
```

### 3.2 Middleware Autentykacji

**Lokalizacja:** `src/middleware/index.ts`

**Rozszerzenie istniejącego middleware:**

```typescript
import { defineMiddleware } from 'astro:middleware'
import { createSupabaseServerClient } from '../db/supabase.server'

export const onRequest = defineMiddleware(async (context, next) => {
  // Utworzenie klienta Supabase z ciasteczkami
  const supabase = createSupabaseServerClient(
    context.cookies,
    import.meta.env.SUPABASE_URL,
    import.meta.env.SUPABASE_ANON_KEY
  )

  // Udostępnienie klienta w context.locals
  context.locals.supabase = supabase

  // Odświeżenie sesji (jeśli istnieje)
  const { data: { session }, error } = await supabase.auth.getSession()

  if (error) {
    console.error('Error refreshing session:', error)
  }

  // Udostępnienie informacji o sesji
  context.locals.session = session
  context.locals.user = session?.user ?? null

  return next()
})
```

**Rozszerzenie typów Astro:**
**Lokalizacja:** `src/env.d.ts`

```typescript
/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    supabase: import('./db/supabase.client').SupabaseClient
    session: import('@supabase/supabase-js').Session | null
    user: import('@supabase/supabase-js').User | null
  }
}
```

### 3.3 Ochrona Stron Wymagających Autentykacji

#### Helper do Sprawdzania Autentykacji
**Lokalizacja:** `src/lib/utils/auth-guard.ts`

```typescript
import type { AstroGlobal } from 'astro'

export async function requireAuth(Astro: AstroGlobal) {
  const session = Astro.locals.session

  if (!session) {
    const currentPath = Astro.url.pathname
    return Astro.redirect(`/login?redirect=${encodeURIComponent(currentPath)}`)
  }

  return session
}

export async function requireNoAuth(Astro: AstroGlobal, redirectTo = '/notes') {
  const session = Astro.locals.session

  if (session) {
    return Astro.redirect(redirectTo)
  }
}
```

**Użycie w stronach:**

```typescript
// W /notes.astro
const session = await requireAuth(Astro)

// W /login.astro
await requireNoAuth(Astro)
```

### 3.4 Zarządzanie Sesjami

#### Czas Trwania Sesji
- Domyślnie: 1 godzina (Supabase default)
- Refresh token: 30 dni
- Automatyczne odświeżanie sesji przez middleware

#### Przechowywanie Tokenów
- Access token i refresh token w HTTP-only cookies
- Nazwy ciasteczek: `sb-access-token`, `sb-refresh-token` (zarządzane przez @supabase/ssr)
- SameSite: Lax
- Secure: true (tylko w produkcji)

#### Obsługa Wygasłych Sesji
1. Middleware próbuje odświeżyć sesję przy każdym żądaniu
2. Jeśli refresh token jest ważny → sesja zostaje odnowiona
3. Jeśli refresh token wygasł → użytkownik jest przekierowywany do `/login`

### 3.5 Konfiguracja Email Templates w Supabase

#### Reset Hasła
**Template Name:** Reset Password  
**Subject:** Zresetuj hasło do VibeTravels

**Body:**
```html
<h2>Witaj!</h2>
<p>Otrzymaliśmy prośbę o zresetowanie hasła do Twojego konta VibeTravels.</p>
<p>Kliknij poniższy link, aby ustawić nowe hasło:</p>
<p><a href="{{ .ConfirmationURL }}">Zresetuj hasło</a></p>
<p>Link jest ważny przez 1 godzinę.</p>
<p>Jeśli nie prosiłeś o reset hasła, zignoruj tę wiadomość.</p>
```

**Confirmation URL:** `{APP_URL}/reset-password`

#### Potwierdzenie Email (opcjonalne dla przyszłych wersji)
**Template Name:** Confirm Email  
**Subject:** Potwierdź swój adres email

**Body:**
```html
<h2>Witaj w VibeTravels!</h2>
<p>Kliknij poniższy link, aby potwierdzić swój adres email:</p>
<p><a href="{{ .ConfirmationURL }}">Potwierdź email</a></p>
```

### 3.6 Bezpieczeństwo

#### Ochrona przed CSRF
- Wszystkie endpointy POST/PUT/DELETE sprawdzają autentykację
- Tokeny sesji w HTTP-only cookies (niedostępne dla JavaScript)

#### Rate Limiting (do rozważenia w przyszłości)
- Ograniczenie liczby prób logowania
- Ograniczenie liczby żądań resetu hasła

#### Walidacja Siły Hasła
- Minimum 8 znaków
- Co najmniej jedna mała litera
- Co najmniej jedna wielka litera
- Co najmniej jedna cyfra
- Walidacja zarówno client-side jak i server-side

#### Ochrona przed Enumeracją Użytkowników
- Endpoint forgot-password zawsze zwraca sukces (nie ujawnia czy email istnieje)
- Błędy logowania są ogólne ("Nieprawidłowy email lub hasło")

#### RLS (Row Level Security) w Supabase
- Wszystkie tabele mają włączone RLS
- Użytkownik może odczytywać/modyfikować tylko swoje dane
- Polityki są zdefiniowane na poziomie bazy danych

## 4. FLOW DIAGRAMY

### 4.1 Flow Rejestracji
```
[Użytkownik] → [/register] → [RegisterForm]
                                    ↓
                           [Walidacja client-side]
                                    ↓
                          [POST /api/auth/register]
                                    ↓
                           [Walidacja server-side]
                                    ↓
                          [supabase.auth.signUp()]
                                    ↓
                          [Utworzenie profilu w DB]
                                    ↓
                       [Utworzenie przykładowej notatki]
                                    ↓
                          [Automatyczne zalogowanie]
                                    ↓
                         [Przekierowanie do /onboarding]
```

### 4.2 Flow Logowania
```
[Użytkownik] → [/login] → [LoginForm]
                                ↓
                      [POST /api/auth/login]
                                ↓
                   [supabase.auth.signInWithPassword()]
                                ↓
                       [Ustawienie sesji w cookies]
                                ↓
                      [Przekierowanie do /notes lub redirectTo]
```

### 4.3 Flow Resetu Hasła
```
[Użytkownik] → [/forgot-password] → [ForgotPasswordForm]
                                          ↓
                              [POST /api/auth/forgot-password]
                                          ↓
                            [supabase.auth.resetPasswordForEmail()]
                                          ↓
                              [Email z linkiem wysłany]
                                          ↓
                   [Użytkownik klika link] → [/reset-password?token=xxx]
                                          ↓
                               [Walidacja tokenu server-side]
                                          ↓
                                  [ResetPasswordForm]
                                          ↓
                              [POST /api/auth/reset-password]
                                          ↓
                             [supabase.auth.updateUser()]
                                          ↓
                           [Przekierowanie do /login?message=success]
```

## 5. CHECKLIST IMPLEMENTACJI

### Faza 1: Fundament
- [ ] Konfiguracja Supabase Auth w projekcie
- [ ] Utworzenie tabeli `profiles` w Supabase
- [ ] Konfiguracja RLS policies
- [ ] Implementacja middleware autentykacji
- [ ] Utworzenie typów TypeScript dla User i Profile
- [ ] Konfiguracja email templates w Supabase

### Faza 2: Backend
- [ ] Implementacja AuthService
- [ ] Implementacja ProfileService
- [ ] Endpoint: POST /api/auth/register
- [ ] Endpoint: POST /api/auth/login
- [ ] Endpoint: POST /api/auth/logout
- [ ] Endpoint: POST /api/auth/forgot-password
- [ ] Endpoint: POST /api/auth/reset-password
- [ ] Endpoint: POST /api/auth/change-password
- [ ] Endpoint: DELETE /api/auth/delete-account
- [ ] Endpoint: PUT /api/profile

### Faza 3: Frontend - Strony
- [ ] Strona: /register
- [ ] Strona: /login
- [ ] Strona: /forgot-password
- [ ] Strona: /reset-password
- [ ] Strona: /profile
- [ ] Layout: AuthLayout
- [ ] Aktualizacja: BaseLayout (warunkowa nawigacja)

### Faza 4: Frontend - Komponenty
- [ ] RegisterForm
- [ ] LoginForm
- [ ] ForgotPasswordForm
- [ ] ResetPasswordForm
- [ ] ProfileForm
- [ ] ChangePasswordForm
- [ ] DeleteAccountButton
- [ ] LogoutButton
- [ ] PasswordStrengthIndicator
- [ ] ErrorMessage
- [ ] ConfirmDialog

### Faza 5: Onboarding
- [ ] OnboardingService
- [ ] Tworzenie przykładowej notatki dla nowych użytkowników
- [ ] Modal z preferencjami po pierwszym zalogowaniu

### Faza 6: Ochrona Stron
- [ ] Implementacja auth-guard helpers
- [ ] Ochrona strony /notes
- [ ] Ochrona strony /profile
- [ ] Przekierowania dla niezalogowanych użytkowników

### Faza 7: Testy i Walidacja
- [ ] Testy walidacji formularzy
- [ ] Testy endpointów API
- [ ] Testy flow rejestracji
- [ ] Testy flow logowania
- [ ] Testy flow resetu hasła
- [ ] Testy usuwania konta
- [ ] Testy RLS policies

### Faza 8: UX i Komunikaty
- [ ] Wszystkie komunikaty błędów po polsku
- [ ] Komunikaty sukcesu
- [ ] Loading states
- [ ] Animacje przejść
- [ ] Responsywność wszystkich formularzy

## 6. ZMIENNE ŚRODOWISKOWE

Wymagane zmienne w pliku `.env`:

```bash
# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx... # Tylko dla operacji admin

# App
APP_URL=http://localhost:3000 # lub URL produkcyjny
```

## 7. POTENCJALNE ROZSZERZENIA (Poza MVP)

- OAuth providers (Google, Facebook)
- Two-Factor Authentication (2FA)
- Email confirmation required
- "Zapamiętaj mnie" (extended session)
- Account recovery przez pytania bezpieczeństwa
- Logowanie historii aktywności konta
- Możliwość zmiany adresu email
- Eksport danych użytkownika (RODO)
