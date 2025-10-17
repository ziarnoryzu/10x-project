### 1. Lista tabel z ich kolumnami, typami danych i ograniczeniami

#### Tabela: `profiles`

Tabela przechowująca publiczne dane użytkownika.

| Nazwa kolumny | Typ danych | Ograniczenia                               | Opis                                                                 |
| :------------ | :--------- | :----------------------------------------- | :------------------------------------------------------------------- |
| `id`          | `uuid`     | `PRIMARY KEY`, `REFERENCES auth.users(id)` | Klucz podstawowy, powiązany z tabelą `auth.users`.                   |
| `name`        | `text`     | `NOT NULL`                                 | Imię użytkownika.                                                    |
| `preferences` | `jsonb`    | `NOT NULL`, `DEFAULT '{}'::jsonb`          | Preferencje turystyczne użytkownika (np. styl, zainteresowania).     |
| `created_at`  | `timestamptz` | `NOT NULL`, `DEFAULT now()`                | Czas utworzenia profilu.                                             |
| `updated_at`  | `timestamptz` | `NOT NULL`, `DEFAULT now()`                | Czas ostatniej aktualizacji profilu.                                 |

#### Tabela: `notes`

Tabela przechowująca notatki podróżne użytkowników.

| Nazwa kolumny | Typ danych | Ograniczenia                               | Opis                                                                 |
| :------------ | :--------- | :----------------------------------------- | :------------------------------------------------------------------- |
| `id`          | `uuid`     | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | Unikalny identyfikator notatki.                                      |
| `user_id`     | `uuid`     | `NOT NULL`, `REFERENCES auth.users(id)`    | Klucz obcy wskazujący na właściciela notatki.                        |
| `title`       | `text`     | `NOT NULL`                                 | Tytuł notatki.                                                       |
| `content`     | `text`     |                                            | Treść notatki.                                                       |
| `created_at`  | `timestamptz` | `NOT NULL`, `DEFAULT now()`                | Czas utworzenia notatki.                                             |
| `updated_at`  | `timestamptz` | `NOT NULL`, `DEFAULT now()`                | Czas ostatniej aktualizacji notatki.                                 |

#### Tabela: `travel_plans`

Tabela przechowująca wygenerowane plany podróży.

| Nazwa kolumny | Typ danych | Ograniczenia                               | Opis                                                                 |
| :------------ | :--------- | :----------------------------------------- | :------------------------------------------------------------------- |
| `id`          | `uuid`     | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | Unikalny identyfikator planu podróży.                                |
| `note_id`     | `uuid`     | `NOT NULL`, `UNIQUE`, `REFERENCES notes(id)` | Klucz obcy wskazujący na notatkę, z której wygenerowano plan.        |
| `content`     | `jsonb`    | `NOT NULL`, `DEFAULT '{}'::jsonb`          | Treść wygenerowanego planu podróży.                                  |
| `created_at`  | `timestamptz` | `NOT NULL`, `DEFAULT now()`                | Czas utworzenia planu.                                               |
| `updated_at`  | `timestamptz` | `NOT NULL`, `DEFAULT now()`                | Czas ostatniej aktualizacji planu.                                   |

### 2. Relacje między tabelami

-   **`auth.users` <-> `profiles` (Jeden-do-jednego)**
    -   Każdy użytkownik w `auth.users` może mieć dokładnie jeden profil w `profiles`.
    -   Relacja jest realizowana poprzez klucz `profiles.id`, który jest jednocześnie kluczem podstawowym i obcym do `auth.users.id`.
-   **`auth.users` <-> `notes` (Jeden-do-wielu)**
    -   Każdy użytkownik może mieć wiele notatek, ale każda notatka należy do jednego użytkownika.
    -   Relacja jest realizowana przez klucz obcy `notes.user_id`.
-   **`notes` <-> `travel_plans` (Jeden-do-jednego)**
    -   Każda notatka może mieć co najwyżej jeden plan podróży.
    -   Relacja jest realizowana przez klucz obcy `travel_plans.note_id` z ograniczeniem `UNIQUE`.

### 3. Indeksy

-   **`profiles`**:
    -   Indeks na `id` (automatycznie utworzony przez `PRIMARY KEY`).
-   **`notes`**:
    -   Indeks na `id` (automatycznie utworzony przez `PRIMARY KEY`).
    -   Indeks na `user_id` w celu przyspieszenia zapytań o notatki danego użytkownika.
-   **`travel_plans`**:
    -   Indeks na `id` (automatycznie utworzony przez `PRIMARY KEY`).
    -   Indeks na `note_id` (automatycznie utworzony przez `UNIQUE constraint`).

### 4. Zasady PostgreSQL (Row Level Security)

#### Tabela: `profiles`

-   **Włączenie RLS**: `ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;`
-   **Zasada `SELECT`**: Użytkownicy mogą odczytywać tylko swój własny profil.
    -   `CREATE POLICY "Users can view their own profile." ON profiles FOR SELECT USING (auth.uid() = id);`
-   **Zasada `UPDATE`**: Użytkownicy mogą aktualizować tylko swój własny profil.
    -   `CREATE POLICY "Users can update their own profile." ON profiles FOR UPDATE USING (auth.uid() = id);`

#### Tabela: `notes`

-   **Włączenie RLS**: `ALTER TABLE notes ENABLE ROW LEVEL SECURITY;`
-   **Zasada `SELECT`**: Użytkownicy mogą odczytywać tylko swoje własne notatki.
    -   `CREATE POLICY "Users can view their own notes." ON notes FOR SELECT USING (auth.uid() = user_id);`
-   **Zasada `INSERT`**: Użytkownicy mogą tworzyć notatki we własnym imieniu.
    -   `CREATE POLICY "Users can create their own notes." ON notes FOR INSERT WITH CHECK (auth.uid() = user_id);`
-   **Zasada `UPDATE`**: Użytkownicy mogą aktualizować tylko swoje własne notatki.
    -   `CREATE POLICY "Users can update their own notes." ON notes FOR UPDATE USING (auth.uid() = user_id);`
-   **Zasada `DELETE`**: Użytkownicy mogą usuwać tylko swoje własne notatki.
    -   `CREATE POLICY "Users can delete their own notes." ON notes FOR DELETE USING (auth.uid() = user_id);`

#### Tabela: `travel_plans`

-   **Włączenie RLS**: `ALTER TABLE travel_plans ENABLE ROW LEVEL SECURITY;`
-   **Zasada `SELECT`**: Użytkownicy mogą odczytywać plany podróży powiązane z ich notatkami.
    -   `CREATE POLICY "Users can view plans of their own notes." ON travel_plans FOR SELECT USING (exists(select 1 from notes where notes.id = travel_plans.note_id and notes.user_id = auth.uid()));`
-   **Zasada `INSERT`**: Użytkownicy mogą tworzyć plany podróży dla swoich notatek.
    -   `CREATE POLICY "Users can create plans for their own notes." ON travel_plans FOR INSERT WITH CHECK (exists(select 1 from notes where notes.id = travel_plans.note_id and notes.user_id = auth.uid()));`
-   **Zasada `UPDATE`**: Użytkownicy mogą aktualizować plany podróży powiązane z ich notatkami.
    -   `CREATE POLICY "Users can update plans of their own notes." ON travel_plans FOR UPDATE USING (exists(select 1 from notes where notes.id = travel_plans.note_id and notes.user_id = auth.uid()));`
-   **Zasada `DELETE`**: Użytkownicy mogą usuwać plany podróży powiązane z ich notatkami.
    -   `CREATE POLICY "Users can delete plans of their own notes." ON travel_plans FOR DELETE USING (exists(select 1 from notes where notes.id = travel_plans.note_id and notes.user_id = auth.uid()));`

### 5. Dodatkowe uwagi

-   **Kaskadowe usuwanie**:
    -   Relacja między `auth.users` a `profiles` powinna mieć zdefiniowane `ON DELETE CASCADE`, aby usunięcie użytkownika automatycznie usuwało jego profil.
    -   Relacja między `auth.users` a `notes` powinna mieć zdefiniowane `ON DELETE CASCADE`, aby usunięcie użytkownika automatycznie usuwało wszystkie jego notatki.
    -   Relacja między `notes` a `travel_plans` powinna mieć zdefiniowane `ON DELETE CASCADE`, aby usunięcie notatki automatycznie usuwało powiązany z nią plan podróży.
-   **Automatyczna aktualizacja `updated_at`**:
    -   Zaleca się utworzenie funkcji i triggera w PostgreSQL, które automatycznie aktualizują kolumnę `updated_at` przy każdej modyfikacji wiersza.
-   **JSONB**:
    -   Użycie `jsonb` dla `preferences` i `content` w `travel_plans` zapewnia elastyczność i wydajność, ale wymaga walidacji danych po stronie aplikacji.
