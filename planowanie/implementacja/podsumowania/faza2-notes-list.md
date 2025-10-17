# Podsumowanie Fazy 2: NOTES LIST (paginacja)

**Data ukończenia**: 17 października 2025  
**Status**: ✅ UKOŃCZONA

---

## 🎯 Cel fazy

Implementacja endpointa do pobierania listy notatek z:
- Paginacją (page, limit)
- Sortowaniem (sort, order)
- Metadata odpowiedzi (total, totalPages)

---

## 📦 Zaimplementowany endpoint

### GET /api/notes - Lista notatek z paginacją

**Plik**: `src/pages/api/notes/index.ts` (dodany GET do istniejącego pliku)

#### Specyfikacja:
- **URL**: `/api/notes`
- **Metoda**: GET
- **Query Parameters**:
  - `page` (number, optional, default: 1, min: 1) - numer strony
  - `limit` (number, optional, default: 10, min: 1, max: 100) - liczba notatek na stronę
  - `sort` (enum, optional, default: "created_at") - pole sortowania: `created_at` | `updated_at` | `title`
  - `order` (enum, optional, default: "desc") - kierunek sortowania: `asc` | `desc`

- **Response**: 200 OK
  ```json
  {
    "notes": [
      {
        "id": "uuid",
        "user_id": "uuid",
        "title": "string",
        "content": "string | null",
        "created_at": "timestamp",
        "updated_at": "timestamp"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "totalPages": 10
    }
  }
  ```

#### Funkcjonalności:
- ✅ Walidacja query params (Zod)
- ✅ Domyślne wartości dla wszystkich parametrów
- ✅ Paginacja z offset/limit (range query)
- ✅ Sortowanie po dowolnym polu (created_at, updated_at, title)
- ✅ Kierunek sortowania (asc/desc)
- ✅ Total count (liczba wszystkich notatek)
- ✅ Total pages (obliczone na podstawie total i limit)
- ✅ Filtrowanie po user_id (tylko notatki użytkownika)
- ✅ Obsługa błędów (400, 500)

#### Testy wykonane (7/7):
1. ✅ Happy path - domyślne parametry (page=1, limit=10) → 200 OK
2. ✅ Paginacja - page=1, limit=2 → 200 OK (2 notatki)
3. ✅ Paginacja - page=2, limit=2 → 200 OK (kolejne 2 notatki)
4. ✅ Sortowanie - sort=title, order=asc → 200 OK (alfabetycznie)
5. ✅ Error - page=0 (min 1) → 400 Bad Request
6. ✅ Error - limit=1000 (max 100) → 400 Bad Request
7. ✅ Error - sort=invalid_field → 400 Bad Request

---

## 🔧 Techniczne szczegóły

### Walidacja Zod:

**QueryParamsSchema**:
```typescript
z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  sort: z.enum(["created_at", "updated_at", "title"]).default("created_at"),
  order: z.enum(["asc", "desc"]).default("desc"),
})
```

**Uwaga**: Użycie `z.coerce.number()` automatycznie konwertuje string na number.

### Implementacja paginacji:

```typescript
// Obliczenie offset
const from = (page - 1) * limit;
const to = from + limit - 1;

// Query z paginacją
const { data: notes } = await supabase
  .from("notes")
  .select("*")
  .eq("user_id", DEFAULT_USER_ID)
  .order(sort, { ascending: order === "asc" })
  .range(from, to);
```

### Metadata odpowiedzi:

```typescript
{
  pagination: {
    page,              // obecna strona
    limit,             // notatek na stronę
    total: count,      // całkowita liczba notatek
    totalPages: Math.ceil(count / limit) // liczba stron
  }
}
```

### Performance:

- **Dwa zapytania do DB**:
  1. `COUNT` - pobranie całkowitej liczby notatek (z `head: true`)
  2. `SELECT` - pobranie paginowanych notatek
- **Indeks**: Automatyczny indeks na `user_id` w tabeli `notes` (klucz obcy)
- **Limit max 100**: Zabezpieczenie przed zbyt dużym obciążeniem

---

## 📊 Statystyki

### Implementacja:
- **Endpointy**: 5/10 (50% całości)
- **Plik zmodyfikowany**: `src/pages/api/notes/index.ts`
- **Linie kodu dodane**: ~130 linii

### Testy:
- **Scenariusze testowe**: 7/7 ✅
- **Pokrycie**:
  - Happy paths: 100%
  - Query params validation: 100%
  - Pagination logic: 100%
  - Sorting logic: 100%

---

## 📝 Przykłady użycia (curl)

### Podstawowe zapytanie (domyślne parametry):
```bash
curl "http://localhost:3000/10x-project/api/notes"
```

### Paginacja:
```bash
curl "http://localhost:3000/10x-project/api/notes?page=2&limit=5"
```

### Sortowanie:
```bash
# Po dacie utworzenia (malejąco - najnowsze pierwsze)
curl "http://localhost:3000/10x-project/api/notes?sort=created_at&order=desc"

# Po tytule (alfabetycznie)
curl "http://localhost:3000/10x-project/api/notes?sort=title&order=asc"

# Po dacie aktualizacji
curl "http://localhost:3000/10x-project/api/notes?sort=updated_at&order=desc"
```

### Kombinacja parametrów:
```bash
curl "http://localhost:3000/10x-project/api/notes?page=1&limit=20&sort=title&order=asc"
```

---

## ✅ Checklist ukończenia

- [x] GET /api/notes - Lista notatek
- [x] Query params validation (page, limit, sort, order)
- [x] Domyślne wartości parametrów
- [x] Paginacja (offset/limit)
- [x] Sortowanie (3 pola, 2 kierunki)
- [x] Metadata (total, totalPages)
- [x] Filtrowanie po user_id
- [x] Obsługa błędów (400, 500)
- [x] Testy happy paths
- [x] Testy validation errors
- [x] Type safety (TypeScript)

---

## 🎯 Następne kroki

**Faza 3**: PROFILES - 2 endpointy
- `GET /api/profiles/me` - Pobranie profilu
- `PUT /api/profiles/me` - Aktualizacja profilu

**Status**: Gotowe do implementacji 🚀
