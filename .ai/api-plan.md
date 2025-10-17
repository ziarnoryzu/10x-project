# REST API Plan

This document outlines a comprehensive REST API design for VibeTravels based on the provided database schema, Product Requirements Document (PRD), and technology stack.

---

## 1. Resources

- **Profiles**: Mapped to the `profiles` table. Stores public user information with columns such as `id`, `name`, `preferences`, `created_at`, and `updated_at`.
- **Notes**: Mapped to the `notes` table. Represents travel notes with columns including `id`, `user_id`, `title`, `content`, `created_at`, and `updated_at`.
- **Travel Plans**: Mapped to the `travel_plans` table. Contains AI-generated travel plan data associated with a note. Fields include `id`, `note_id`, `content` (in JSONB format), `created_at`, and `updated_at`.
- **Users** (Managed by Supabase Auth): Although user authentication is handled externally, endpoints may reference authenticated user information. Relationships:
  - `auth.users` <-> `profiles` (one-to-one, via `profiles.id` referencing `auth.users(id)`).
  - `auth.users` <-> `notes` (one-to-many, via `notes.user_id` referencing `auth.users(id)`).
  - `notes` <-> `travel_plans` (one-to-one, via `travel_plans.note_id` referencing `notes(id)`).

---

## 2. Endpoints

### Profiles

1. **Get Own Profile**
   - **Method**: GET
   - **URL Path**: `/api/profiles/me`
   - **Description**: Retrieves the authenticated user's profile.
   - **Response Payload**:
     ```json
     {
       "id": "uuid",
       "name": "string",
       "preferences": { },
       "created_at": "timestamp",
       "updated_at": "timestamp"
     }
     ```
   - **Success Codes**: 200 OK
   - **Error Codes**: 401 Unauthorized, 404 Not Found

2. **Update Own Profile**
   - **Method**: PUT
   - **URL Path**: `/api/profiles/me`
   - **Description**: Updates the authenticated user's profile data.
   - **Request Payload**:
     ```json
     {
       "name": "string (required)",
       "preferences": { }  
     }
     ```
   - **Response Payload**: Updated profile object
   - **Success Codes**: 200 OK
   - **Error Codes**: 400 Bad Request, 401 Unauthorized

### Notes

1. **List Notes**
   - **Method**: GET
   - **URL Path**: `/api/notes`
   - **Description**: Retrieves a paginated list of travel notes for the authenticated user.
   - **Query Parameters**:
     - `page`: number (optional, default 1)
     - `limit`: number (optional, default 10)
     - `sort`: field name (optional, e.g., `created_at`)
     - `order`: `asc` or `desc`
   - **Response Payload**:
     ```json
     {
       "notes": [
         {
           "id": "uuid",
           "user_id": "uuid",
           "title": "string",
           "content": "string",
           "created_at": "timestamp",
           "updated_at": "timestamp"
         }
       ],
       "pagination": {
         "page": 1,
         "limit": 10,
         "total": 100
       }
     }
     ```
   - **Success Codes**: 200 OK
   - **Error Codes**: 401 Unauthorized

2. **Create a Note**
   - **Method**: POST
   - **URL Path**: `/api/notes`
   - **Description**: Creates a new travel note for the authenticated user.
   - **Request Payload**:
     ```json
     {
       "title": "string (required)",
       "content": "string"
     }
     ```
   - **Response Payload**: Created note object
   - **Success Codes**: 201 Created
   - **Error Codes**: 400 Bad Request, 401 Unauthorized

3. **Get Note Details**
   - **Method**: GET
   - **URL Path**: `/api/notes/{noteId}`
   - **Description**: Retrieves the full detail of a specific note.
   - **Response Payload**:
     ```json
     {
       "id": "uuid",
       "user_id": "uuid",
       "title": "string",
       "content": "string",
       "created_at": "timestamp",
       "updated_at": "timestamp"
     }
     ```
   - **Success Codes**: 200 OK
   - **Error Codes**: 401 Unauthorized, 404 Not Found

4. **Update a Note**
   - **Method**: PUT
   - **URL Path**: `/api/notes/{noteId}`
   - **Description**: Updates the note's title and content.
   - **Request Payload**:
     ```json
     {
       "title": "string",
       "content": "string"
     }
     ```
   - **Response Payload**: Updated note object
   - **Success Codes**: 200 OK
   - **Error Codes**: 400 Bad Request, 401 Unauthorized, 404 Not Found

5. **Delete a Note**
   - **Method**: DELETE
   - **URL Path**: `/api/notes/{noteId}`
   - **Description**: Deletes the note. On deletion, the related travel plan (if exists) is also cascaded.
   - **Success Codes**: 200 OK, 204 No Content
   - **Error Codes**: 401 Unauthorized, 404 Not Found

6. **Copy a Note**
   - **Method**: POST
   - **URL Path**: `/api/notes/{noteId}/copy`
   - **Description**: Creates a duplicate of the note allowing for variant plan creation.
   - **Response Payload**: New note object with a new `id` and no linked travel plan
   - **Success Codes**: 201 Created
   - **Error Codes**: 401 Unauthorized, 404 Not Found

### Travel Plans

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

2. **Get Travel Plan Details**
   - **Method**: GET
   - **URL Path**: `/api/notes/{noteId}/travel-plan`
   - **Description**: Retrieves the travel plan linked to the note.
   - **Response Payload**:
     ```json
     {
       "id": "uuid",
       "note_id": "uuid",
       "content": { },
       "created_at": "timestamp",
       "updated_at": "timestamp"
     }
     ```
   - **Success Codes**: 200 OK
   - **Error Codes**: 401 Unauthorized, 404 Not Found

3. **Update a Travel Plan**
   - **Method**: PUT
   - **URL Path**: `/api/notes/{noteId}/travel-plan`
   - **Description**: Allows the user to re-generate or update the travel plan for the note. Requires confirmation to overwrite the previous plan.
   - **Request Payload** (similar to generation options):
     ```json
     {
       "confirm": true,
       "options": { /* personalization options */ }
     }
     ```
   - **Response Payload**: Updated travel plan object
   - **Success Codes**: 200 OK
   - **Error Codes**: 400 Bad Request, 401 Unauthorized, 404 Not Found

---

## 3. Authentication and Authorization

- **Authentication**: Utilize Supabase Auth with JSON Web Tokens (JWT). Endpoints expect a valid JWT in the `Authorization` header using the Bearer scheme.
- **Authorization**: 
  - Profiles, Notes, and Travel Plans are tied to the authenticated user. SQL policies (RLS) in Supabase enforce that users can only access their own records.
  - API endpoints also verify that the token belongs to the user referenced in any request (e.g., note ownership).
- **Security Measures**: Rate limiting should be applied at the API gateway level to prevent abuse.

---

## 4. Validation and Business Logic

### Validation Conditions

- **Profiles**: 
  - `name` must be provided in updates.
  - `preferences` field defaults to `{}` if not provided.
- **Notes**:
  - `title` is required and cannot be null.
  - `content` is optional, but when generating a travel plan the note content must have at least 10 words.
- **Travel Plans**:
  - Must be linked to an existing note via `note_id` with a UNIQUE constraint.
  - `content` field is JSONB and should be validated on the server side.

### Business Logic Implementation

- **User-Specific Data**: All endpoints check that the authenticated user's ID matches the owner (`user_id`) of the note or profile.
- **Cascade Deletion**: When a note is deleted, any linked travel plan is automatically removed (as defined by the database cascade rule).
- **Plan Generation Logic**: 
  - Endpoint `/api/notes/{noteId}/generate-plan` ensures that the note has sufficient content (at least 10 words) and applies personalization options.
  - A confirmation step is required when overwriting an existing travel plan.
- **Copying a Note**: The endpoint `/api/notes/{noteId}/copy` creates a new note with identical content but with no associated travel plan, allowing the user to generate a variant plan later.

---

*Assumptions*:
- It is assumed that user management (registration, login, password reset, etc.) is handled externally by Supabase Auth and is integrated into the overall solution.
- Endpoints are built using an Astro API routes structure and are secured by the Supabase RLS policies at the database level.

This API plan provides a comprehensive blueprint to design, develop, and secure the service endpoints required for VibeTravels.
