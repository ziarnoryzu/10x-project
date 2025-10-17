Doskonale. Skoro wszystkie rekomendacje zostały zaakceptowane, mamy kompletny i spójny obraz schematu bazy danych dla MVP VibeTravels.

Na podstawie naszych ustaleń, podsumujmy finalny projekt schematu. Posłuży on jako ostateczny plan do wygenerowania skryptów SQL i polityk RLS.

### Ostateczny schemat bazy danych VibeTravels (MVP)

#### **Tabela 1: `profiles`**
Przechowuje publiczne dane użytkowników, rozszerzając `auth.users` z Supabase.
*   **Kolumny:**
    *   `id` (UUID, Primary Key) - klucz obcy do `auth.users.id`.
    *   `full_name` (TEXT, NOT NULL) - imię użytkownika.
    *   `preferences` (JSONB) - przechowuje preferencje turystyczne (`{ "style": [...], "interests": [...] }`).
    *   `created_at` (TIMESTAMPTZ) - z wartością domyślną `now()`.
    *   `updated_at` (TIMESTAMPTZ) - automatycznie aktualizowany przez trigger.
*   **Relacje:**
    *   Jeden-do-jednego z `auth.users`. Relacja powinna mieć ustawione `ON DELETE CASCADE`, aby usunięcie użytkownika w `auth` automatycznie usuwało jego profil.
*   **RLS (Row Level Security):**
    *   Użytkownik może tworzyć (`INSERT`) swój własny profil.
    *   Użytkownik może odczytywać (`SELECT`) tylko swój własny profil.
    *   Użytkownik może aktualizować (`UPDATE`) tylko swój własny profil.

#### **Tabela 2: `notes`**
Przechowuje notatki podróżne tworzone przez użytkowników.
*   **Kolumny:**
    *   `id` (UUID, Primary Key) - z wartością domyślną `gen_random_uuid()`.
    *   `user_id` (UUID, Foreign Key) - klucz obcy do `auth.users.id`.
    *   `title` (TEXT) - opcjonalny tytuł notatki.
    *   `content` (TEXT, NOT NULL) - treść notatki.
    *   `created_at` (TIMESTAMPTZ) - z wartością domyślną `now()`.
    *   `updated_at` (TIMESTAMPTZ) - automatycznie aktualizowany przez trigger.
*   **Relacje:**
    *   Wiele-do-jednego z `auth.users`.
*   **Indeksy:**
    *   Należy utworzyć indeks na kolumnie `user_id` w celu przyspieszenia zapytań.
*   **RLS (Row Level Security):**
    *   Użytkownik może wykonywać wszystkie operacje (`SELECT`, `INSERT`, `UPDATE`, `DELETE`) tylko na swoich własnych notatkach (`user_id = auth.uid()`).

#### **Tabela 3: `travel_plans`**
Przechowuje wygenerowane przez AI plany podróży, powiązane z konkretną notatką.
*   **Kolumny:**
    *   `id` (UUID, Primary Key) - z wartością domyślną `gen_random_uuid()`.
    *   `note_id` (UUID, Foreign Key, UNIQUE) - klucz obcy do `notes.id`. Unikalność zapewnia relację jeden-do-jednego.
    *   `plan_content` (JSONB, NOT NULL) - treść planu podróży o zdefiniowanej strukturze.
    *   `generation_params` (JSONB) - parametry użyte do wygenerowania planu (np. styl, budżet).
    *   `created_at` (TIMESTAMPTZ) - z wartością domyślną `now()`.
*   **Relacje:**
    *   Jeden-do-jednego z `notes`. Relacja powinna mieć ustawione `ON DELETE CASCADE`, aby usunięcie notatki automatycznie usuwało powiązany z nią plan.
*   **Indeksy:**
    *   Należy utworzyć indeks na kolumnie `note_id`.
*   **RLS (Row Level Security):**
    *   Dostęp (do wszystkich operacji) jest dozwolony, jeśli użytkownik jest właścicielem notatki, z którą plan jest powiązany. Polityka będzie wymagała podzapytania do tabeli `notes` w celu weryfikacji `user_id`.

Czy ten podsumowany plan jest gotowy do przekształcenia w finalny skrypt SQL do utworzenia schematu?