# API Endpoint Implementation Plan: Generate Travel Plan

## 1. Endpoint Overview
This endpoint initiates the generation of a travel plan from a user’s travel note. It applies business rules (such as a minimum word count requirement) and optionally uses personalization options provided by the user.

## 2. Request Details
- **HTTP Method**: POST
- **URL Structure**: `/api/notes/{noteId}/generate-plan`
- **Parameters**:
  - **Path Parameter (Required)**: `noteId` (UUID of the note from which to generate the plan)
  - **Request Body (Optional)**: 
    ```json
    {
      "options": {
        "style": "adventure | leisure",
        "transport": "car | public | walking",
        "budget": "economy | standard | luxury"
      }
    }
    ```

## 3. Used Types
- **GenerateTravelPlanCommand**: Contains an optional `options` object with personalization details.
- **TravelPlanDTO**: Represents the travel plan record including `id`, `note_id`, `content`, `created_at`, and `updated_at`.

## 4. Response Details
- **Success Status Codes**:
  - `200 OK` for successful plan generation (if updating an existing plan)
  - `201 Created` for a newly created travel plan record
- **Response Body**:
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

## 5. Data Flow
1. Validate user authentication and authorization using JWT and Supabase row-level security policies.
2. Extract the `noteId` from the URL and retrieve the corresponding note record from the database.
3. Verify that the note belongs to the authenticated user.
4. Check that the note's content meets the minimum word count requirement (e.g., at least 10 words).
5. Parse the optional personalization options from the request payload (if provided) into a `GenerateTravelPlanCommand`.
6. Delegate the travel plan generation logic to a service (new or existing) responsible for:
   - Processing the note content
   - Applying business rules
   - Incorporating personalization options
7. Upon receiving the generated plan (as a structured JSON object), create or update the travel plan record in the database under the `travel_plans` table.
8. Return the travel plan data in the response.

## 6. Security Considerations
- **Authentication & Authorization**: Ensure the user is authenticated and authorized using Supabase policies.
- **Input Validation**: Validate the `noteId` and request payload, including the structure and allowed values of personalization options.
- **Row-Level Security**: Rely on Supabase RLS to prevent unauthorized data access.
- **SQL Injection & Data Sanitization**: Use parameterized queries and validate/sanitize all inputs.

## 7. Error Handling
- **400 Bad Request**: If the note content has less than 10 words or if the request payload is malformed.
- **401 Unauthorized**: If the user is not authenticated or does not have access to the note.
- **404 Not Found**: If the note with the provided `noteId` does not exist or is not associated with the user.
- **500 Internal Server Error**: For unexpected errors during processing, generating the travel plan, or database operations. Log errors with detailed context for further analysis.

## 8. Performance Considerations
- **Asynchronous Processing**: For complex generation logic, implement non-blocking processing with status tracking if the operation is long running.
- **Optimized Queries**: Ensure database queries are optimized and use indexes appropriately (as defined by the schema).

## 9. Implementation Steps
1. **Authentication & Authorization**: Ensure the endpoint validates the user from the request context (using Supabase authentication and RLS).
2. **Path and Payload Parsing**: Extract `noteId` from the URL and parse the optional `options` from the request body into a `GenerateTravelPlanCommand`.
3. **Note Retrieval and Validation**: Query the `notes` table to retrieve the note record and check that:
   - The note exists
   - The note belongs to the authenticated user
   - The note content contains at least 10 words
4. **Business Logic Service**: Create or update a service responsible for:
   - Applying business rules to the note content
   - Integrating optional personalization options
   - Generating the travel plan as structured JSON
5. **Database Operation**: Insert or update the generated plan into the `travel_plans` table ensuring the unique constraint on `note_id`.
6. **Response Construction**: Construct the response payload with the travel plan data and return it with the appropriate status code (`200` or `201`).
7. **Error Handling**: Handle error scenarios with proper HTTP status codes and log errors for monitoring and debugging.
8. **Testing**: Write unit and integration tests to cover all scenarios including successful generation, validation failures, unauthorized access, and unexpected errors.
