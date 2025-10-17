# Prompt: Implementacja brakujących endpointów REST API

## Kontekst projektu

Pracujesz nad projektem **VibeTravels** - aplikacją do planowania podróży z wykorzystaniem AI. Projekt wykorzystuje:
- **Astro 5** (SSR mode)
- **TypeScript 5**
- **Supabase** (PostgreSQL + Auth)
- **Zod** (walidacja)
- **React 19** (komponenty klienckie)

## Stan obecny

### ✅ Już zaimplementowane:
- Schemat bazy danych w Supabase (tabele: `profiles`, `notes`, `travel_plans`)
- Row Level Security (RLS) - obecnie **wyłączone dla development**
- Supabase client (`src/db/supabase.client.ts`)
- Middleware Astro (`src/middleware/index.ts`)
- Service layer (`src/lib/services/travel-plan.service.ts`)
- Typy i DTOs (`src/types.ts`)
- **Endpoint**: `POST /api/notes/{noteId}/generate-plan` - w pełni funkcjonalny, przetestowany (8 scenariuszy testowych ✅)

### ❌ Do zaimplementowania:

Poniżej lista **10 brakujących endpointów** z planu API (`.ai/api-plan.md`):

#### **PROFILES (2 endpointy)**
1. `GET /api/profiles/me` - Pobranie profilu zalogowanego użytkownika
2. `PUT /api/profiles/me` - Aktualizacja profilu

#### **NOTES (6 endpointów)**
3. `POST /api/notes` - Utworzenie nowej notatki
4. `GET /api/notes/{noteId}` - Pobranie szczegółów notatki
5. `PUT /api/notes/{noteId}` - Aktualizacja notatki
6. `DELETE /api/notes/{noteId}` - Usunięcie notatki
7. `GET /api/notes` - Lista notatek użytkownika (z paginacją, sortowaniem, filtrowaniem)
8. `POST /api/notes/{noteId}/copy` - Skopiowanie notatki

#### **TRAVEL PLANS (2 endpointy)**
9. `GET /api/notes/{noteId}/travel-plan` - Pobranie planu podróży
10. `PUT /api/notes/{noteId}/travel-plan` - Aktualizacja/regeneracja planu

---

## Twoje zadanie

Będziemy implementować te endpointy **krok po kroku**. Dla każdego endpointa:

### Proces implementacji (3x3 approach):

1. **Analiza** (analiza specyfikacji z `.ai/api-plan.md`)
   - Metoda HTTP, URL, parametry
   - Request/Response payload
   - Status codes (200, 201, 400, 401, 404, 500)
   - Walidacja i business logic

2. **Implementacja** (maksymalnie 3 kroki na raz)
   - Utworzenie pliku endpointa w `src/pages/api/`
   - Implementacja walidacji (Zod schemas)
   - Implementacja logiki biznesowej
   - Obsługa błędów

3. **Testowanie** (wszystkie scenariusze)
   - Happy path (201/200)
   - Edge cases (400, 404)
   - Error handling (500)
   - Potwierdzenie curl/Postman

### Po każdej iteracji:
- **Podsumowanie** co zostało zrobione
- **Plan** na następne 3 kroki
- **Czekanie na feedback** przed kontynuacją

---

## Zasady implementacji

### Struktura plików:
```
src/pages/api/
├── profiles/
│   └── me.ts              # GET, PUT /api/profiles/me
├── notes/
│   ├── index.ts           # GET, POST /api/notes
│   └── [noteId]/
│       ├── index.ts       # GET, PUT, DELETE /api/notes/{noteId}
│       ├── copy.ts        # POST /api/notes/{noteId}/copy
│       ├── generate-plan.ts  # ✅ już zaimplementowany
│       └── travel-plan.ts    # GET, PUT /api/notes/{noteId}/travel-plan
```

### Konwencje kodowania:

1. **Astro API routes**:
   ```typescript
   export const prerender = false; // SSR mode
   export async function GET(context: APIContext) { }
   export async function POST(context: APIContext) { }
   export async function PUT(context: APIContext) { }
   export async function DELETE(context: APIContext) { }
   ```

2. **Dostęp do Supabase**:
   ```typescript
   const supabase = context.locals.supabase; // z middleware
   ```

3. **Walidacja UUID**:
   ```typescript
   import { z } from "zod";
   const UUIDSchema = z.string().uuid();
   ```

4. **Error handling**:
   ```typescript
   return new Response(
     JSON.stringify({ error: "Bad Request", message: "..." }),
     { status: 400, headers: { "Content-Type": "application/json" } }
   );
   ```

5. **Użycie DEFAULT_USER_ID** (brak autentykacji w dev):
   ```typescript
   import { DEFAULT_USER_ID } from "../../../db/supabase.client";
   const userId = DEFAULT_USER_ID; // zamiast auth.uid()
   ```

6. **Typy z database.types.ts**:
   ```typescript
   import type { Database } from "../../../db/database.types";
   ```

---

## Dokumenty referencyjne

### Musisz przeczytać przed implementacją:

1. **Plan API**: `.ai/api-plan.md` - pełna specyfikacja wszystkich endpointów
2. **Schemat DB**: `.ai/db-plan.md` - struktura tabel, relacje, RLS
3. **Typy**: `src/types.ts` - DTOs i Command Models
4. **Przykład**: `src/pages/api/notes/[noteId]/generate-plan.ts` - wzorzec implementacji

### Zasady z copilot-instructions:

- **Early returns** dla error conditions
- **Guard clauses** na początku funkcji
- **Zod validation** dla wszystkich inputów
- **Proper HTTP status codes**
- **Comprehensive error messages**
- **Type safety** wszędzie

---

## Kolejność implementacji (propozycja)
Przed każdą implementacją zajrzyj do planowanie/rest-api/endpoint-implementation.md, które było podstawą do wygenerowania endpointu do tworzenia travelplans. Bazuj na tym dokumencie, podmieniając w <route_api_specification> specyfikacje poszczególnych endpointów znajdujące się na liście @api-plan.md.

### Faza 1: NOTES CRUD (podstawa) - 4 endpointy
1. `POST /api/notes` - Create
2. `GET /api/notes/{noteId}` - Read
3. `PUT /api/notes/{noteId}` - Update
4. `DELETE /api/notes/{noteId}` - Delete

### Faza 2: NOTES LIST - 1 endpoint
5. `GET /api/notes` - List z paginacją

### Faza 3: PROFILES - 2 endpointy
6. `GET /api/profiles/me` - Get profile
7. `PUT /api/profiles/me` - Update profile

### Faza 4: TRAVEL PLANS - 2 endpointy
8. `GET /api/notes/{noteId}/travel-plan` - Get plan
9. `PUT /api/notes/{noteId}/travel-plan` - Update plan

### Faza 5: ADVANCED - 1 endpoint
10. `POST /api/notes/{noteId}/copy` - Copy note

---

## Format odpowiedzi

### Dla każdego endpointa podaj:

1. **Analiza specyfikacji** (z `.ai/api-plan.md`)
2. **Plan implementacji** (3 kroki maksymalnie)
3. **Kod implementacji** (z pełną walidacją i error handling)
4. **Scenariusze testowe** (curl commands)
5. **Podsumowanie** (co zrobiono + plan na kolejne 3 kroki)

### Przykład struktury odpowiedzi:

```markdown
## Implementacja: POST /api/notes

### 1. Analiza specyfikacji
- Metoda: POST
- URL: /api/notes
- Request body: { title: string, content?: string }
- Response: 201 Created z utworzoną notatką
- Errors: 400 (bad request), 401 (unauthorized)

### 2. Plan implementacji (3 kroki)
1. Utworzenie pliku src/pages/api/notes/index.ts z metodą POST
2. Implementacja Zod validation dla request body
3. Utworzenie notatki w Supabase + obsługa błędów

### 3. Implementacja
[KOD]

### 4. Testy
[CURL COMMANDS]

### 5. Podsumowanie
✅ Zrobione: [...]
🎯 Następne 3 kroki: [...]
```

---

## Rozpocznij od:

**`POST /api/notes`** - utworzenie nowej notatki

Przeanalizuj specyfikację z `.ai/api-plan.md`, zaproponuj plan implementacji (3 kroki) i poczekaj na moje potwierdzenie przed rozpoczęciem kodowania.

**Pytania przed startem:**
1. Czy zgadzasz się z kolejnością implementacji?
2. Czy potrzebujesz dodatkowych informacji o projekcie?
3. Od którego endpointa chcesz zacząć?

---

## Uwagi końcowe

- **RLS jest wyłączone** w development - używamy `DEFAULT_USER_ID` zamiast `auth.uid()`
- **Wszystkie testy** muszą być wykonane przez curl lub Postman przed zatwierdzeniem
- **Czekaj na mój feedback** po każdych 3 krokach
- **Nie rób założeń** - pytaj jeśli coś jest niejasne

Gotowy? Zacznijmy! 🚀
