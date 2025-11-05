# Plan Testów Aplikacji

## 1. Wprowadzenie i cele testowania

### 1.1. Wprowadzenie

Niniejszy dokument opisuje plan testów dla aplikacji, która jest platformą do tworzenia i zarządzania notatkami oraz planami podróży, z wykorzystaniem sztucznej inteligencji do generowania treści. Plan ten obejmuje wszystkie etapy testowania, od testów jednostkowych po testy akceptacyjne, i jest dostosowany do specyfiki stosu technologicznego projektu, obejmującego Astro, React, Supabase i OpenRouter.

### 1.2. Cele testowania

Główne cele procesu testowania to:

*   Zapewnienie wysokiej jakości i niezawodności aplikacji.
*   Weryfikacja, czy wszystkie funkcjonalności działają zgodnie z wymaganiami.
*   Identyfikacja i eliminacja błędów przed wdrożeniem produkcyjnym.
*   Zapewnienie bezpieczeństwa danych użytkowników i stabilności systemu.
*   Weryfikacja wydajności i responsywności aplikacji pod różnym obciążeniem.
*   Zapewnienie pozytywnego doświadczenia użytkownika (UX).

## 2. Zakres testów

Testy obejmą następujące obszary funkcjonalne i niefunkcjonalne:

### 2.1. Funkcjonalności w zakresie testów

*   **Moduł uwierzytelniania:** Rejestracja, logowanie, wylogowywanie, resetowanie hasła.
*   **Zarządzanie profilem użytkownika:** Edycja danych profilowych.
*   **Moduł notatek (CRUD):** Tworzenie, odczyt, aktualizacja i usuwanie notatek.
*   **Listowanie i paginacja notatek:** Poprawne wyświetlanie listy notatek i nawigacja między stronami.
*   **Moduł planów podróży:** Generowanie, wyświetlanie i zarządzanie planami podróży.
*   **Integracja z AI (OpenRouter):** Poprawność generowania treści przez modele językowe.
*   **Responsywność interfejsu użytkownika (RWD):** Prawidłowe wyświetlanie na różnych urządzeniach i rozdzielczościach.

### 2.2. Funkcjonalności poza zakresem testów

*   Testy penetracyjne (w tej fazie projektu).
*   Testy związane z infrastrukturą DigitalOcean (poza konfiguracją aplikacji).
*   Bezpośrednie testy wewnętrznych mechanizmów Supabase i OpenRouter (skupiamy się na integracji).

## 3. Typy testów do przeprowadzenia

### 3.1. Testy jednostkowe (Unit Tests)

*   **Cel:** Weryfikacja poprawności działania pojedynczych komponentów, funkcji i usług w izolacji.
*   **Zakres:**
    *   Komponenty React (`.tsx`) w components.
    *   Funkcje pomocnicze w utils.
    *   Logika biznesowa w services.
    *   Schematy walidacji Zod w schemas.
*   **Narzędzia:** Vitest, React Testing Library.

### 3.2. Testy integracyjne (Integration Tests)

*   **Cel:** Weryfikacja poprawnej współpracy między różnymi częściami systemu.
*   **Zakres:**
    *   Integracja komponentów React z logiką biznesową (np. formularz logowania z usługą autentykacji).
    *   Integracja frontendu z API Astro (np. pobieranie listy notatek).
    *   Integracja API Astro z bazą danych Supabase.
    *   Integracja z usługą OpenRouter (`openrouter.service.ts`).
*   **Narzędzia:** Vitest, React Testing Library, Supertest (dla API).

### 3.3. Testy End-to-End (E2E)

*   **Cel:** Symulacja rzeczywistych scenariuszy użytkowania aplikacji z perspektywy użytkownika końcowego.
*   **Zakres:** Pełne ścieżki użytkownika, np.:
    *   Rejestracja -> Logowanie -> Stworzenie notatki -> Wylogowanie.
    *   Logowanie -> Wygenerowanie planu podróży -> Zapisanie planu.
*   **Narzędzia:** Playwright.

### 3.4. Testy API

*   **Cel:** Weryfikacja poprawności działania endpointów API w api.
*   **Zakres:** Sprawdzanie kodów odpowiedzi HTTP, formatu danych (JSON), obsługi błędów, autoryzacji.
*   **Narzędzia:** Postman (testy manualne), Supertest lub Playwright (testy automatyczne).

### 3.5. Testy wydajnościowe

*   **Cel:** Ocena wydajności i stabilności aplikacji pod obciążeniem.
*   **Zakres:**
    *   Czas ładowania stron (szczególnie z dużą ilością danych).
    *   Czas odpowiedzi API pod obciążeniem.
    *   Wydajność generowania treści przez AI.
*   **Narzędzia:** Lighthouse, `k6`.

### 3.6. Testy bezpieczeństwa

*   **Cel:** Identyfikacja potencjalnych luk w zabezpieczeniach.
*   **Zakres:**
    *   Ochrona przed atakami XSS i CSRF.
    *   Zabezpieczenie endpointów API (autoryzacja).
    *   Poprawność implementacji polityk RLS w Supabase.
*   **Narzędzia:** OWASP ZAP (podstawowy skan), manualna weryfikacja kodu.

## 4. Scenariusze testowe dla kluczowych funkcjonalności

### 4.1. Uwierzytelnianie

| ID    | Scenariusz                                    | Oczekiwany rezultat                                                              | Priorytet |
| :---- | :-------------------------------------------- | :------------------------------------------------------------------------------- | :-------- |
| AUTH-01 | Użytkownik rejestruje się z poprawnymi danymi | Konto zostaje utworzone, użytkownik jest zalogowany i przekierowany na stronę główną. | Wysoki    |
| AUTH-02 | Użytkownik próbuje się zarejestrować z zajętym e-mailem | Wyświetlany jest komunikat o błędzie.                                            | Wysoki    |
| AUTH-03 | Użytkownik loguje się z poprawnymi danymi     | Użytkownik jest zalogowany i przekierowany na stronę główną.                      | Wysoki    |
| AUTH-04 | Użytkownik loguje się z niepoprawnym hasłem   | Wyświetlany jest komunikat o błędzie.                                            | Wysoki    |
| AUTH-05 | Zalogowany użytkownik próbuje uzyskać dostęp do strony logowania | Użytkownik jest przekierowany na stronę główną.                                  | Średni    |
| AUTH-06 | Niezalogowany użytkownik próbuje uzyskać dostęp do strony profilu | Użytkownik jest przekierowany na stronę logowania.                               | Wysoki    |

### 4.2. Zarządzanie notatkami (CRUD)

| ID    | Scenariusz                                    | Oczekiwany rezultat                                                              | Priorytet |
| :---- | :-------------------------------------------- | :------------------------------------------------------------------------------- | :-------- |
| NOTE-01 | Użytkownik tworzy nową notatkę z poprawnymi danymi | Notatka zostaje zapisana w bazie danych i pojawia się na liście notatek.         | Wysoki    |
| NOTE-02 | Użytkownik próbuje utworzyć notatkę z pustym tytułem | Wyświetlany jest błąd walidacji, notatka nie jest tworzona.                       | Wysoki    |
| NOTE-03 | Użytkownik edytuje istniejącą notatkę         | Zmiany są zapisywane w bazie danych i widoczne po ponownym otwarciu notatki.      | Wysoki    |
| NOTE-04 | Użytkownik usuwa notatkę                      | Notatka jest usuwana z bazy danych i znika z listy notatek.                      | Wysoki    |
| NOTE-05 | Użytkownik widzi tylko swoje notatki          | Na liście notatek wyświetlane są tylko notatki należące do zalogowanego użytkownika. | Krytyczny |

### 4.3. Generowanie planu podróży (AI)

| ID    | Scenariusz                                    | Oczekiwany rezultat                                                              | Priorytet |
| :---- | :-------------------------------------------- | :------------------------------------------------------------------------------- | :-------- |
| AI-01 | Użytkownik generuje plan podróży z poprawnym promptem | Plan podróży jest generowany i wyświetlany użytkownikowi.                        | Wysoki    |
| AI-02 | Użytkownik próbuje wygenerować plan z pustym promptem | Wyświetlany jest błąd walidacji.                                                 | Średni    |
| AI-03 | Występuje błąd podczas komunikacji z API OpenRouter | Użytkownik otrzymuje czytelny komunikat o błędzie.                               | Wysoki    |
| AI-04 | Czas generowania planu jest zbyt długi        | Użytkownik widzi wskaźnik ładowania; system obsługuje timeout.                   | Średni    |

## 5. Środowisko testowe

*   **Środowisko lokalne:** Do developmentu i uruchamiania testów jednostkowych oraz integracyjnych.
*   **Środowisko stagingowe:** Oddzielna instancja aplikacji i bazy danych Supabase, odzwierciedlająca środowisko produkcyjne. Na tym środowisku będą przeprowadzane testy E2E i akceptacyjne.
*   **Baza danych:** Dedykowana baza danych Supabase dla środowiska stagingowego, regularnie czyszczona i wypełniana danymi testowymi.

## 6. Narzędzia do testowania

| Narzędzie             | Zastosowanie                               |
| :-------------------- | :----------------------------------------- |
| **Vitest**            | Testy jednostkowe i integracyjne           |
| **React Testing Library** | Testowanie komponentów React               |
| **Playwright**        | Testy End-to-End (E2E)                     |
| **Postman**           | Manualne testy API                         |
| **Supertest**         | Automatyczne testy API                     |
| **Lighthouse**        | Testy wydajności frontendu                 |
| **k6**                | Testy obciążeniowe API                     |
| **OWASP ZAP**         | Skanowanie pod kątem luk w zabezpieczeniach |
| **GitHub Actions**    | Automatyzacja uruchamiania testów (CI)     |

## 7. Harmonogram testów

Proces testowania będzie prowadzony równolegle z procesem deweloperskim, zgodnie z poniższym harmonogramem:

*   **Sprint (cykl 2-tygodniowy):**
    *   **Tydzień 1:** Deweloperzy piszą testy jednostkowe i integracyjne dla nowych funkcjonalności.
    *   **Tydzień 2:** Inżynier QA tworzy i automatyzuje testy E2E dla ukończonych funkcjonalności.
    *   **Koniec sprintu:** Regresja i testy akceptacyjne na środowisku stagingowym.
*   **Przed wdrożeniem:** Pełny cykl testów regresji, testy wydajnościowe i podstawowe testy bezpieczeństwa.

## 8. Kryteria akceptacji testów

### 8.1. Kryteria wejścia

*   Kod źródłowy został wdrożony na środowisku testowym.
*   Wszystkie testy jednostkowe i integracyjne przechodzą pomyślnie.
*   Dostępna jest dokumentacja dla testowanych funkcjonalności.

### 8.2. Kryteria wyjścia

*   **100%** testów E2E dla krytycznych ścieżek użytkownika przechodzi pomyślnie.
*   **95%** wszystkich zdefiniowanych testów przechodzi pomyślnie.
*   Brak otwartych błędów o priorytecie `Krytyczny` lub `Wysoki`.
*   Pokrycie kodu testami jednostkowymi na poziomie co najmniej **80%**.
*   Wyniki testów wydajnościowych mieszczą się w zdefiniowanych limitach (np. czas ładowania strony < 3s).

## 9. Role i odpowiedzialności w procesie testowania

*   **Deweloperzy:**
    *   Pisanie testów jednostkowych i integracyjnych.
    *   Naprawianie błędów zgłoszonych przez QA.
    *   Utrzymywanie środowiska deweloperskiego i lokalnego.
*   **Inżynier QA:**
    *   Tworzenie i utrzymanie planu testów.
    *   Projektowanie i automatyzacja scenariuszy testowych (E2E, API).
    *   Przeprowadzanie testów manualnych i eksploracyjnych.
    *   Raportowanie i weryfikacja błędów.
    *   Zarządzanie środowiskiem stagingowym.
*   **Product Owner:**
    *   Definiowanie kryteriów akceptacji dla funkcjonalności.
    *   Udział w testach akceptacyjnych użytkownika (UAT).

## 10. Procedury raportowania błędów

Wszystkie znalezione błędy będą raportowane w systemie do śledzenia zadań (np. GitHub Issues) i powinny zawierać następujące informacje:

*   **Tytuł:** Krótki, zwięzły opis błędu.
*   **Opis:** Szczegółowy opis problemu.
*   **Kroki do odtworzenia:** Numerowana lista kroków potrzebnych do wywołania błędu.
*   **Oczekiwany rezultat:** Co powinno się stać.
*   **Rzeczywisty rezultat:** Co faktycznie się stało.
*   **Środowisko:** Wersja aplikacji, przeglądarka, system operacyjny.
*   **Priorytet:** (Krytyczny, Wysoki, Średni, Niski).
*   **Załączniki:** Zrzuty ekranu, nagrania wideo, logi konsoli.
