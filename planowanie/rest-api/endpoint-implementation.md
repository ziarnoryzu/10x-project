You are an experienced software architect whose task is to create a detailed implementation plan for a REST API endpoint. Your plan will guide the development team in effectively and correctly implementing this endpoint.

Before we begin, review the following information:

1. Route API specification:
<route_api_specification>
1. **Generate a Travel Plan**
   - **Method**: POST
   - **URL Path**: `/api/notes/{noteId}/generate-plan`
   - **Description**: Initiates the generation of a travel plan from the note content, applying business rules (such as minimum word count requirement).
   - **Request Payload** (optional personalization options):
     ```json
     {
       "options": {
         "style": "adventure | leisure",
         "transport": "car | public | walking",
         "budget": "economy | standard | luxury"
       }
     }
     ```
   - **Response Payload**:
     ```json
     {
       "travel_plan": {
         "id": "uuid",
         "note_id": "uuid",
         "content": { /* structured plan JSON */ },
         "created_at": "timestamp",
         "updated_at": "timestamp"
       }
     }
     ```
   - **Success Codes**: 200 OK, 201 Created
   - **Error Codes**: 400 Bad Request (e.g., if note has less than 10 words), 401 Unauthorized, 404 Not Found
</route_api_specification>

2. Related database resources:
<related_db_resources>
Note: this section is in Polish.
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
</related_db_resources>

3. Type definitions:
<type_definitions>
@types
</type_definitions>

3. Tech stack:
<tech_stack>
@tech-stack.md
</tech_stack>

4. Implementation rules:
<implementation_rules>
@shared.mdc, @backend.mdc, @astro.mdc
</implementation_rules>

Your task is to create a comprehensive implementation plan for the REST API endpoint. Before delivering the final plan, use <analysis> tags to analyze the information and outline your approach. In this analysis, ensure that:

1. Summarize key points of the API specification.
2. List required and optional parameters from the API specification.
3. List necessary DTO types and Command Models.
4. Consider how to extract logic to a service (existing or new, if it doesn't exist).
5. Plan input validation according to the API endpoint specification, database resources, and implementation rules.
6. Determine how to log errors in the error table (if applicable).
7. Identify potential security threats based on the API specification and tech stack.
8. Outline potential error scenarios and corresponding status codes.

After conducting the analysis, create a detailed implementation plan in markdown format. The plan should contain the following sections:

1. Endpoint Overview
2. Request Details
3. Response Details
4. Data Flow
5. Security Considerations
6. Error Handling
7. Performance
8. Implementation Steps

Throughout the plan, ensure that you:
- Use correct API status codes:
  - 200 for successful read
  - 201 for successful creation
  - 400 for invalid input
  - 401 for unauthorized access
  - 404 for not found resources
  - 500 for server-side errors
- Adapt to the provided tech stack
- Follow the provided implementation rules

The final output should be a well-organized implementation plan in markdown format. Here's an example of what the output should look like:

``markdown
# API Endpoint Implementation Plan: [Endpoint Name]

## 1. Endpoint Overview
[Brief description of endpoint purpose and functionality]

## 2. Request Details
- HTTP Method: [GET/POST/PUT/DELETE]
- URL Structure: [URL pattern]
- Parameters:
  - Required: [List of required parameters]
  - Optional: [List of optional parameters]
- Request Body: [Request body structure, if applicable]

## 3. Used Types
[DTOs and Command Models necessary for implementation]

## 3. Response Details
[Expected response structure and status codes]

## 4. Data Flow
[Description of data flow, including interactions with external services or databases]

## 5. Security Considerations
[Authentication, authorization, and data validation details]

## 6. Error Handling
[List of potential errors and how to handle them]

## 7. Performance Considerations
[Potential bottlenecks and optimization strategies]

## 8. Implementation Steps
1. [Step 1]
2. [Step 2]
3. [Step 3]
...
```

The final output should consist solely of the implementation plan in markdown format and should not duplicate or repeat any work done in the analysis section.

Remember to save your implementation plan as .ai/generate-travelplan-implementation-plan.md. Ensure the plan is detailed, clear, and provides comprehensive guidance for the development team.