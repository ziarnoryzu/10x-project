# Architektura UI dla VibeTravels

## 1. Przegląd struktury UI

Architektura interfejsu użytkownika (UI) dla VibeTravels została zaprojektowana jako aplikacja jednostronicowa (SPA) z renderowaniem po stronie klienta, zbudowana w oparciu o Astro i React. Główny układ aplikacji opiera się na stałym, pionowym pasku nawigacyjnym na urządzeniach stacjonarnych, który na urządzeniach mobilnych zmienia się w wysuwane menu (hamburger). Taka struktura zapewnia spójny i intuicyjny dostęp do kluczowych sekcji: listy notatek i profilu użytkownika.

Centralnym punktem aplikacji jest zarządzanie notatkami i generowanie na ich podstawie planów podróży. Przepływy użytkownika są zoptymalizowane pod kątem prostoty, od onboardingu, przez codzienne użytkowanie, aż po zarządzanie kontem. Architektura kładzie silny nacisk na responsywność, dostępność oraz jasne komunikowanie stanu aplikacji (ładowanie, błędy, sukces) za pomocą dedykowanych komponentów, takich jak szkielety (skeletons), spinnery i powiadomienia (toasty). Wszystkie akcje destrukcyjne są zabezpieczone dodatkowymi potwierdzeniami, aby chronić użytkownika przed utratą danych.

## 2. Lista widoków

### Widoki Uwierzytelniania

-   **Nazwa widoku:** Rejestracja
-   **Ścieżka widoku:** `/register`
-   **Główny cel:** Umożliwienie nowym użytkownikom założenia konta.
-   **Kluczowe informacje do wyświetlenia:** Formularz z polami na imię, adres e-mail i hasło.
-   **Kluczowe komponenty widoku:** `AuthLayout`, `RegisterForm`, `Input`, `Button`, `ErrorMessage`.
-   **UX, dostępność i względy bezpieczeństwa:** Walidacja pól formularza w czasie rzeczywistym z komunikatami ARIA. Wymagania dotyczące siły hasła są jasno określone.

-   **Nazwa widoku:** Logowanie
-   **Ścieżka widoku:** `/login`
-   **Główny cel:** Umożliwienie zarejestrowanym użytkownikom dostępu do aplikacji.
-   **Kluczowe informacje do wyświetlenia:** Formularz z polami na e-mail i hasło, link do odzyskiwania hasła.
-   **Kluczowe komponenty widoku:** `AuthLayout`, `LoginForm`, `Input`, `Button`, `Link`, `ErrorMessage`.
-   **UX, dostępność i względy bezpieczeństwa:** Komunikaty o błędach logowania są ogólne, aby nie ujawniać, czy konto istnieje.

-   **Nazwa widoku:** Odzyskiwanie Hasła
-   **Ścieżka widoku:** `/forgot-password`
-   **Główny cel:** Inicjowanie procesu resetowania hasła.
-   **Kluczowe informacje do wyświetlenia:** Formularz z polem na adres e-mail.
-   **Kluczowe komponenty widoku:** `AuthLayout`, `ForgotPasswordForm`, `Input`, `Button`.
-   **UX, dostępność i względy bezpieczeństwa:** Informacja zwrotna po wysłaniu linku jest ogólna, aby nie potwierdzać istnienia adresu e-mail w bazie.

-   **Nazwa widoku:** Resetowanie Hasła
-   **Ścieżka widoku:** `/reset-password`
-   **Główny cel:** Umożliwienie użytkownikowi ustawienia nowego hasła.
-   **Kluczowe informacje do wyświetlenia:** Formularz z polem na nowe hasło i jego potwierdzenie.
-   **Kluczowe komponenty widoku:** `AuthLayout`, `ResetPasswordForm`, `Input`, `Button`, `ErrorMessage`.
-   **UX, dostępność i względy bezpieczeństwa:** Walidacja siły nowego hasła. Widok dostępny tylko poprzez unikalny, ograniczony czasowo link wysłany na e-mail.

### Główne Widoki Aplikacji

-   **Nazwa widoku:** Lista Notatek (Dashboard)
-   **Ścieżka widoku:** `/app/notes`
-   **Główny cel:** Wyświetlanie wszystkich notatek użytkownika i umożliwienie tworzenia nowych.
-   **Kluczowe informacje do wyświetlenia:** Lista notatek (tytuł, data modyfikacji), wskaźnik planu podróży, przycisk "Nowa notatka". W przypadku braku notatek, wyświetlany jest stan pusty z zachętą do działania.
-   **Kluczowe komponenty widoku:** `MainLayout`, `NoteListItem`, `Button`, `Skeleton`, `Pagination`, `EmptyState`, `OnboardingBanner`.
-   **UX, dostępność i względy bezpieczeństwa:** Stany ładowania są obsługiwane przez komponenty szkieletowe. Lista jest paginowana. Elementy listy są klikalne i dostępne z klawiatury.

-   **Nazwa widoku:** Szczegóły i Edytor Notatki
-   **Ścieżka widoku:** `/app/notes/[noteId]`
-   **Główny cel:** Umożliwienie przeglądania, edycji i zarządzania pojedynczą notatką oraz powiązanym z nią planem podróży.
-   **Kluczowe informacje do wyświetlenia:** Tytuł i treść notatki, daty utworzenia/modyfikacji, zapisany plan podróży (jeśli istnieje), przyciski akcji (Generuj plan, Kopiuj, Usuń).
-   **Kluczowe komponenty widoku:** `MainLayout`, `NoteEditor` (z autozapisem), `TravelPlanView`, `ConfirmationModal`, `Button`, `Toast`.
-   **UX, dostępność i względy bezpieczeństwa:** Autozapis z wizualnym wskaźnikiem statusu. Akcje destrukcyjne (usunięcie, nadpisanie planu) wymagają potwierdzenia w modalu. Walidacja (min. 10 słów) przed generowaniem planu z jasnym komunikatem.

-   **Nazwa widoku:** Profil Użytkownika
-   **Ścieżka widoku:** `/app/profile`
-   **Główny cel:** Zarządzanie danymi profilowymi, preferencjami turystycznymi i kontem.
-   **Kluczowe informacje do wyświetlenia:** Formularz edycji imienia, formularz zmiany hasła, interfejs zarządzania preferencjami, opcja usunięcia konta.
-   **Kluczowe komponenty widoku:** `MainLayout`, `ProfileForm`, `PasswordChangeForm`, `PreferencesManager`, `ConfirmationModal`, `Button`, `Toast`.
-   **UX, dostępność i względy bezpieczeństwa:** Zarządzanie preferencjami obsługuje przeciąganie i upuszczanie oraz alternatywne kliknięcie. Usunięcie konta jest zabezpieczone modalem z koniecznością wpisania e-maila.

### Widoki Modalne/Nakładki (bez dedykowanej ścieżki URL)

-   **Nazwa widoku:** Generowanie Planu Podróży (Modal)
-   **Ścieżka widoku:** Brak (wyświetlany nad `/app/notes/[noteId]`)
-   **Główny cel:** Zebranie od użytkownika opcji personalizacji i zainicjowanie procesu generowania planu.
-   **Kluczowe informacje do wyświetlenia:** Formularz z opcjami (Styl, Transport, Budżet), stan ładowania (spinner), podgląd wygenerowanego planu, przyciski akcji ("Generuj", "Zapisz", "Anuluj").
-   **Kluczowe komponenty widoku:** `GeneratePlanModal`, `Select`, `Input`, `Checkbox` (dla potwierdzenia nadpisania), `Spinner`, `TravelPlanView`.
-   **UX, dostępność i względy bezpieczeństwa:** Modal jest w pełni dostępny z klawiatury. Wymaga potwierdzenia (checkbox) przed nadpisaniem istniejącego planu. Jasno komunikuje stany ładowania i błędu.

## 3. Mapa podróży użytkownika

1.  **Rejestracja i Onboarding:**
    *   Nowy użytkownik przechodzi do `/register`, wypełnia formularz i tworzy konto.
    *   Po pomyślnej rejestracji jest automatycznie logowany i przekierowywany do `/app/notes`.
    *   Na liście notatek widzi przykładową notatkę z gotowym planem oraz baner zachęcający do uzupełnienia preferencji w profilu.

2.  **Główny przepływ pracy (tworzenie i generowanie planu):**
    *   Użytkownik klika "Nowa notatka", co przekierowuje go do `/app/notes/new`.
    *   Wprowadza tytuł i treść notatki. Zmiany są zapisywane automatycznie.
    *   Gdy notatka ma co najmniej 10 słów, przycisk "Wygeneruj plan podróży" staje się aktywny.
    *   Użytkownik klika przycisk, co otwiera `GeneratePlanModal`.
    *   W modalu wybiera opcje personalizacji (styl, budżet etc.) i klika "Generuj".
    *   W trakcie generowania widoczny jest spinner. Po zakończeniu, wygenerowany plan jest wyświetlany w modalu.
    *   Użytkownik klika "Zapisz do moich podróży". Plan zostaje powiązany z notatką i jest widoczny w widoku `/app/notes/[noteId]`.
    *   Na liście notatek (`/app/notes`) przy tej notatce pojawia się ikona oznaczająca zapisany plan.

3.  **Zarządzanie profilem:**
    *   Użytkownik klika swoje imię w nawigacji i przechodzi do `/app/profile`.
    *   Może zmienić swoje imię, hasło lub zarządzać preferencjami turystycznymi.
    *   Zmiany są zapisywane, a informacja zwrotna jest wyświetlana za pomocą powiadomień (toastów).

## 4. Układ i struktura nawigacji

-   **Nawigacja główna (MainLayout):**
    *   **Desktop:** Pionowy pasek nawigacyjny po lewej stronie, zawsze widoczny. Zawiera linki do "Moje notatki" (`/app/notes`) i "Profil" (`/app/profile`) oraz przycisk "Wyloguj".
    *   **Mobile:** Pasek nawigacyjny zwija się do ikony hamburgera w nagłówku. Kliknięcie otwiera wysuwane z boku menu z tymi samymi opcjami.
-   **Nawigacja w kontekście uwierzytelniania (AuthLayout):**
    *   Prosty, wyśrodkowany układ bez głównej nawigacji aplikacji.
    *   Zawiera linki umożliwiające przełączanie się między widokami logowania i rejestracji.
-   **Struktura ścieżek:**
    *   `/` - Przekierowuje do `/login` (jeśli niezalogowany) lub `/app/notes` (jeśli zalogowany).
    *   `/login`, `/register`, `/forgot-password`, `/reset-password` - Publiczne ścieżki uwierzytelniania.
    *   `/app/*` - Chronione ścieżki dostępne tylko dla zalogowanych użytkowników.

## 5. Kluczowe komponenty

-   **`MainLayout`:** Główny szkielet aplikacji z nawigacją boczną/mobilną i obszarem na treść widoku.
-   **`AuthLayout`:** Układ dla stron logowania/rejestracji, centrujący zawartość.
-   **`NoteListItem`:** Element listy notatek, wyświetlający tytuł, datę i wskaźnik zapisanego planu.
-   **`NoteEditor`:** Edytor tekstu dla treści notatki z logiką autozapisu.
-   **`TravelPlanView`:** Komponent do wyświetlania ustrukturyzowanego planu podróży (w formie akordeonu).
-   **`GeneratePlanModal`:** Modal z formularzem opcji personalizacji do generowania planu.
-   **`ConfirmationModal`:** Generyczny modal używany do potwierdzania akcji destrukcyjnych (np. usuwanie notatki, usuwanie konta, nadpisywanie planu).
-   **`Skeleton`:** Komponent zastępczy (placeholder) z animacją "shimmer", używany podczas ładowania danych (np. listy notatek).
-   **`Toast`:** Komponent powiadomień do wyświetlania komunikatów o sukcesie, błędzie lub informacyjnych.
-   **`PreferencesManager`:** Interaktywny komponent do zarządzania tagami preferencji w profilu użytkownika.
-   **`OfflineIndicator`:** Globalny baner informujący użytkownika o utracie połączenia z internetem.



