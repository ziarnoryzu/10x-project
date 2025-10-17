I'll analyze the implementation plan and start implementing the endpoint. Let me first explore the existing codebase structure to understand the patterns used.

[6 tools called]

I can see the endpoint is already implemented! Let me check if the service it depends on exists and verify the implementation:

[3 tools called]

Let me check the import paths and verify the middleware setup:

[2 tools called]

I can see the endpoint is already implemented! However, there's a small issue with the import path. According to the workspace rules, we should use `SupabaseClient` type from `src/db/supabase.client.ts`. Let me fix this:

[1 tool called]

Now let me check if there are any linter errors and also verify the request body parsing handles empty bodies correctly:

[2 tools called]

I notice a potential issue with the request body parsing. The body is optional according to the plan, but the current implementation will fail if no body is sent. Let me fix this:

[4 tools called]

Let me check the upsert logic more carefully and improve it:

[3 tools called]

Let me verify the complete implementation by reading the final file:

[1 tool called]

## Podsumowanie zrealizowanych kroków (1-3 z planu implementacji)

Endpoint **POST `/api/notes/{noteId}/generate-plan`** jest już w pełni zaimplementowany! Wprowadziłem kilka ulepszeń do istniejącej implementacji:

### ✅ Co zostało zrobione:

#### **Krok 1: Autentykacja i autoryzacja**
- Endpoint waliduje użytkownika za pomocą `context.locals.supabase`
- Zwraca `401 Unauthorized` gdy użytkownik nie jest zalogowany
- Wykorzystuje Supabase Row-Level Security dla bezpieczeństwa na poziomie bazy danych

#### **Krok 2: Parsowanie parametrów ścieżki i body**
- Waliduje `noteId` jako UUID za pomocą Zod schema
- Parsuje opcjonalne body z personalizacją (style, transport, budget)
- **POPRAWKA**: Ulepszyłem obsługę opcjonalnego body - sprawdzam `Content-Type` przed parsowaniem JSON
- Zwraca `400 Bad Request` dla nieprawidłowych danych wejściowych

#### **Krok 3: Pobieranie i walidacja notatki**
- Pobiera notatkę z bazy i weryfikuje własność (RLS + ręczna walidacja)
- Sprawdza minimalną liczbę słów (minimum 10) za pomocą `travelPlanService.validateNoteContent()`
- Zwraca `404 Not Found` gdy notatka nie istnieje lub użytkownik nie ma dostępu
- Zwraca `400 Bad Request` gdy treść jest za krótka

### 🔧 Dodatkowe poprawki:

1. **Poprawiony import SupabaseClient** - zgodnie z regułami workspace, teraz importuje z `src/db/supabase.client.ts` zamiast `src/env.d.ts`

2. **Lepsza logika statusu HTTP** - Sprawdzam czy plan już istnieje przed generowaniem, aby niezawodnie zwrócić `201 Created` lub `200 OK`

3. **Uproszczone zarządzanie `updated_at`** - Usunąłem ręczne ustawianie `updated_at`, pozwalając bazodanowym triggerom automatycznie zarządzać tym polem

4. **Obsługa błędów** - Wszystkie scenariusze błędów mają odpowiednie kody HTTP i komunikaty

### 📋 Plan na kolejne 3 kroki:

#### **Krok 4-6: Implementacja właściwa (już zakończona)**
✅ Serwis biznesowy istnieje w `src/lib/services/travel-plan.service.ts`  
✅ Operacja bazodanowa (upsert) jest zaimplementowana  
✅ Konstrukcja odpowiedzi jest kompletna  

#### **Następne sugerowane kroki:**

7. **Testy jednostkowe i integracyjne** - Napisanie testów dla:
   - Scenariuszy sukcesu (nowy plan, aktualizacja planu)
   - Walidacji (błędny UUID, za krótka treść, brak body)
   - Autoryzacji (brak tokena, cudzą notatka)
   - Edge cases (pusta treść, nieprawidłowe opcje)

8. **Ulepszenie logiki generowania planu AI** - Obecnie `travelPlanService.generatePlan()` zwraca mockowe dane. Należy zaimplementować:
   - Integrację z OpenRouter API (klucz już jest w `env.d.ts`)
   - Logikę prompt engineering uwzględniającą opcje personalizacji
   - Parsowanie i strukturyzację odpowiedzi AI

9. **Dokumentacja API** - Dodanie dokumentacji OpenAPI/Swagger dla endpointa

---

**Status**: Endpoint jest w pełni funkcjonalny i gotowy do testowania. Brak błędów lintera. 

Czy mam kontynuować z implementacją testów lub ulepszyć logikę generowania AI?