# Implementacja: Uwzględnianie preferencji użytkownika przy generowaniu planu podróży

## 📅 Data implementacji
**2025-10-31**

## 🎯 Cel implementacji
Zapewnienie, że preferencje użytkownika z profilu (takie jak zainteresowania, preferencje kulinarne, tempo podróży) są uwzględniane przez AI podczas generowania planów podróży.

## 📋 Wymagania z PRD

### US-005 - Kriterium 4
> "Moje zmiany w preferencjach są zapisywane i **uwzględniane przy kolejnym generowaniu planu podróży**."

### US-012 - Kriterium 3
> "Po kliknięciu przycisku 'Generuj', AI przetwarza treść notatki, **moje preferencje z profilu** oraz opcje z formularza."

## 🔧 Wprowadzone zmiany

### 1. Serwis TravelPlanService (`src/lib/services/travel-plan.service.ts`)

#### Dodany parametr `userPreferences`
```typescript
async generatePlan(
  noteContent: string, 
  options?: TravelPlanOptions, 
  userPreferences?: string[]  // ✅ NOWY PARAMETR
): Promise<Json>
```

#### Rozszerzony system prompt
System prompt AI został wzbogacony o sekcję dynamiczną, która uwzględnia preferencje użytkownika jako **ważne wskazówki**:

```typescript
${userPreferences && userPreferences.length > 0
  ? `
PREFERENCJE UŻYTKOWNIKA Z PROFILU:
${userPreferences.map((pref) => \`• \${pref}\`).join("\n")}

Uwzględnij te preferencje przy planowaniu - traktuj je jako ważne wskazówki, ale nie sztywne wymagania.
Staraj się, aby w całym planie pojawiła się przynajmniej jedna atrakcja lub restauracja dla każdej preferencji.

• Preferencje kulinarne (np. "włoska kuchnia", "japońska kuchnia"):
  - Zaproponuj kilka restauracji tego typu (niekoniecznie wszystkie posiłki)
  - W opisach wyraźnie zaznacz typ kuchni (np. "włoska restauracja", "pizzeria")
  - Połącz z lokalnymi specjałami - dobrze jest mieć mix preferencji użytkownika i lokalnej kuchni

• Zainteresowania tematyczne (np. "geografia", "biologia", "historia", "sztuka"):
  - Włącz do planu przynajmniej jedną-dwie atrakcje związane z każdym zainteresowaniem
  - "geografia" → punkty widokowe, wzgórza, terasy widokowe, ciekawe krajobrazy
  - "biologia" → ogrody botaniczne, akwaria, zoo, rezerwaty przyrody, parki z ciekawą florą
  - "historia" → muzea historyczne, zabytki, zamki, starówki
  - "sztuka" → galerie, muzea sztuki, street art, wystawy
  - W opisach można naturalnie wspomnieć związek z zainteresowaniem`
  : ""
}
```

**Logika:**
- Preferencje traktowane jako **ważne wskazówki**, nie sztywne wymagania
- AI stara się uwzględnić **minimum jedną atrakcję dla każdej preferencji**
- Plan pozostaje **zbalansowany** - mix preferencji użytkownika i lokalnych atrakcji
- Jeśli użytkownik nie ma preferencji → prompt działa jak poprzednio (bez dodatkowej sekcji)

### 2. Endpoint API (`src/pages/api/notes/[noteId]/generate-plan.ts`)

#### Dodany Step 6: Pobieranie profilu użytkownika
```typescript
// Step 6: Retrieve user profile with preferences
const { data: userProfile } = await supabase
  .from("profiles")
  .select("preferences")
  .eq("id", DEFAULT_USER_ID)
  .single();

// Parse preferences from Json to string[]
let userPreferences: string[] = [];
if (userProfile?.preferences) {
  if (typeof userProfile.preferences === "object" && !Array.isArray(userProfile.preferences)) {
    // If preferences is an object (Record<string, string[]>), flatten all values
    userPreferences = Object.values(userProfile.preferences as Record<string, unknown>)
      .flat()
      .filter((item): item is string => typeof item === "string");
  } else if (Array.isArray(userProfile.preferences)) {
    // If preferences is already an array, use it directly
    userPreferences = userProfile.preferences.filter((item): item is string => typeof item === "string");
  }
}
```

**Logika parsowania:**
- Wspiera dwie struktury danych:
  - `Record<string, string[]>` - zgrupowane preferencje (np. `{style: ["Relaks"], interests: ["Historia", "Sztuka"]}`)
  - `string[]` - płaska lista preferencji
- Automatycznie spłaszcza hierarchię i wyciąga wszystkie wartości typu string

#### Zaktualizowane wywołanie generatePlan
```typescript
// Step 8: Generate travel plan with user preferences
const planContent = await travelPlanService.generatePlan(
  noteContent, 
  command.options, 
  userPreferences  // ✅ Przekazanie preferencji
);
```

### 3. Endpoint API PUT (`src/pages/api/notes/[noteId]/travel-plan.ts`)

#### Dodany Step 7: Pobieranie profilu użytkownika dla regeneracji planu
Endpoint `PUT /api/notes/{noteId}/travel-plan` (używany do **regeneracji** istniejącego planu) również został zaktualizowany, aby pobierać i przekazywać preferencje użytkownika.

```typescript
// Step 7: Retrieve user profile with preferences
const { data: userProfile } = await supabase
  .from("profiles")
  .select("preferences")
  .eq("id", DEFAULT_USER_ID)
  .single();

// Parse preferences (ta sama logika jak w generate-plan.ts)
let userPreferences: string[] = [];
// ... parsowanie ...
```

#### Zaktualizowane wywołanie generatePlan w PUT
```typescript
// Step 9: Regenerate travel plan with user preferences
const planContent = await travelPlanService.generatePlan(
  noteContent, 
  options, 
  userPreferences  // ✅ Przekazanie preferencji
);
```

**Dlaczego to ważne:**
- Użytkownik może **regenerować** plan po zmianie preferencji
- Każda regeneracja uwzględnia **aktualne** preferencje z profilu
- Spójność między pierwszym generowaniem (POST) a regeneracją (PUT)

## ✅ Zgodność z istniejącym kodem

| Komponent | Wymaga zmian | Status |
|-----------|--------------|--------|
| `useGeneratePlan.ts` | ❌ NIE | Bez zmian - hook nie musi wiedzieć o preferencjach |
| `GeneratePlanModal.tsx` | ❌ NIE | Bez zmian - UI pozostaje takie samo |
| `generate-plan.ts` (POST API) | ✅ TAK | ✅ Zaktualizowany |
| `travel-plan.ts` (PUT API) | ✅ TAK | ✅ Zaktualizowany |
| `travel-plan.service.ts` | ✅ TAK | ✅ Zaktualizowany |
| `types.ts` | ❌ NIE | Bez zmian - istniejące typy wystarczają |

## 🧪 Testowanie

### Skrypt testowy
Utworzono skrypt `test-preferences.sh` do weryfikacji integracji:

```bash
chmod +x test-preferences.sh
./test-preferences.sh
```

Skrypt:
1. Ustawia preferencje użytkownika (Historia, Sztuka, Muzea, Galerie, Kuchnia włoska, Tempo relaksacyjne)
2. Weryfikuje, że zostały zapisane
3. Informuje, że teraz generowanie planu uwzględni te preferencje

### Test manualny

#### Krok 1: Ustaw preferencje w profilu
```bash
curl -X PUT http://localhost:3000/api/profiles/me \
  -H "Content-Type: application/json" \
  -d '{
    "preferences": ["geografia", "biologia", "włoska kuchnia"]
  }'
```

**Możesz także testować z innymi kombinacjami:**
```bash
# Przykład 1: Zainteresowania kulturalne + preferencje kulinarne
{
  "preferences": ["Historia", "Sztuka", "Muzea", "Kuchnia włoska", "Tempo relaksacyjne"]
}

# Przykład 2: Aktywności przyrodnicze + różne kuchnie
{
  "preferences": ["Przyroda", "Biologia", "Geografia", "Kuchnia japońska", "Wegetariańska"]
}

# Przykład 3: Mix tematyczny
{
  "preferences": ["Historia", "Architektura", "Street art", "Lokalne smaki", "Intensywne zwiedzanie"]
}
```

#### Krok 2: Wygeneruj plan podróży
```bash
curl -X POST http://localhost:3000/api/notes/{noteId}/generate-plan \
  -H "Content-Type: application/json" \
  -d '{
    "options": {
      "style": "leisure",
      "transport": "walking",
      "budget": "standard"
    }
  }'
```

#### Oczekiwany rezultat
Plan powinien zawierać **zbalansowany mix**:
- ✅ Kilka aktywności związanych z zainteresowaniami (np. 1-2 dla każdego zainteresowania)
- ✅ Kilka restauracji zgodnych z preferencjami kulinarnymi (np. 1-2 restauracje wybranego typu)
- ✅ Lokalne atrakcje i specjały (plan nie powinien ignorować lokalności)
- ✅ Dostosowanie tempa do preferencji (jeśli podano "Tempo relaksacyjne" → 2-4 aktywności/dzień, "Intensywne" → 5-7 aktywności/dzień)
- ✅ W opisach wyraźne zaznaczenie związku z preferencjami (np. "ogród botaniczny - różnorodność roślin", "włoska restauracja - autentyczna pizza")

**Przykłady dobrych wyników:**

**Dla preferencji: "włoska kuchnia", "biologia", "geografia"**
- Dzień 1: Lunch w pizzerii (włoska kuchnia) ✅, Punkt widokowy (geografia) ✅
- Dzień 2: Ogród Botaniczny (biologia) ✅, Kolacja z lokalnymi specjałami (lokalność) ✅
- Dzień 3: Muzeum Narodowe (lokalność), Kolacja w włoskiej restauracji ✅

**Dla preferencji: "Historia", "Sztuka", "Kuchnia włoska", "Tempo relaksacyjne"**
- Dzień 1: Muzeum Historyczne (historia) ✅, 2-3 aktywności (tempo relaksacyjne) ✅
- Dzień 2: Galeria Sztuki (sztuka) ✅, Lunch w trattorii (kuchnia włoska) ✅
- Dzień 3: Starówka (lokalność), Kolacja we włoskiej restauracji ✅

## 📊 Struktura preferencji

### Wspierane formaty w bazie danych

**Format 1: Płaska lista** (obecnie używany w API `/profiles/me`)
```json
["Historia", "Sztuka", "Muzea", "Kuchnia włoska", "Tempo relaksacyjne"]
```

**Format 2: Zgrupowane kategorie** (planowane w US-005)
```json
{
  "style": ["Relaks", "Zwiedzanie"],
  "interests": ["Historia", "Sztuka", "Przyroda"],
  "cuisine": ["Kuchnia włoska", "Wegetariańska"],
  "pace": ["Relaksacyjne"]
}
```

Implementacja **wspiera oba formaty** - automatyczne spłaszczanie do `string[]`.

## 🎯 Kategorie preferencji (zgodnie z PRD US-005)

1. **Styl podróży**: Relaks, Zwiedzanie, Impreza
2. **Zainteresowania**: Historia, Sztuka, Przyroda
3. **Kuchnia**: różne preferencje kulinarne
4. **Tempo**: tempo zwiedzania

## 🔄 Workflow generowania planu z preferencjami

```
User clicks "Generuj plan"
         ↓
Modal: wybór opcji (style, transport, budget)
         ↓
POST /api/notes/{noteId}/generate-plan
         ↓
Endpoint pobiera:
  - Notatkę użytkownika
  - Profil użytkownika z preferencjami
         ↓
Wywołanie TravelPlanService.generatePlan():
  - noteContent
  - options (z formularza)
  - userPreferences (z profilu)
         ↓
AI generuje plan uwzględniając:
  ✓ Treść notatki
  ✓ Opcje z formularza (styl, transport, budżet)
  ✓ Preferencje z profilu (zainteresowania, kuchnia, tempo)
         ↓
Plan zapisany w bazie
         ↓
Wyświetlenie w GeneratedPlanView
```

## 🐛 Obsługa edge cases

### 1. Użytkownik bez preferencji
- **Zachowanie**: Prompt AI nie zawiera dodatkowej sekcji o preferencjach
- **Plan**: Generowany tylko na podstawie treści notatki i opcji z formularza
- **Brak błędów**: Kod obsługuje `undefined` i puste tablice

### 2. Preferencje w różnych formatach
- **Rozwiązanie**: Automatyczne parsowanie i normalizacja do `string[]`
- **Wspierane**: obiekty, tablice, mieszane struktury

### 3. Błąd pobierania profilu
- **Zachowanie**: `userProfile` będzie `null/undefined`
- **Obsługa**: Bezpieczne sprawdzenie `if (userProfile?.preferences)`
- **Rezultat**: Generowanie planu bez preferencji (graceful degradation)

## 📈 Metryki sukcesu

### Wskaźnik pomocniczy z PRD:
> 90% aktywnych użytkowników posiada wypełnione co najmniej 3 preferencje turystyczne w swoim profilu.

**Po implementacji:**
- Preferencje mają **realną wartość biznesową** - wpływają na jakość generowanych planów
- Użytkownicy będą **motywowani** do uzupełniania profilu
- Spersonalizowane plany zwiększą **zadowolenie użytkowników**

## ✨ Podsumowanie

### Co zostało zaimplementowane ✅
- ✅ Pobieranie preferencji użytkownika z profilu w endpointach (POST i PUT)
- ✅ Przekazywanie preferencji do serwisu generowania planów
- ✅ Uwzględnianie preferencji w prompcie AI jako **ważnych wskazówek**
- ✅ Zbalansowany prompt - minimum 1 atrakcja na preferencję, ale bez forsowania
- ✅ Parsowanie różnych formatów preferencji (obiekt/tablica)
- ✅ Graceful degradation gdy preferencje nie istnieją
- ✅ Backward compatibility - istniejący kod działa bez zmian
- ✅ Spójność między POST (generate-plan) i PUT (travel-plan)

### Zgodność z wymaganiami ✅
- ✅ **US-005 Kriterium 4**: Preferencje są uwzględniane przy generowaniu
- ✅ **US-012 Kriterium 3**: AI przetwarza treść, preferencje profilu i opcje z formularza

### Brak breaking changes ✅
- ✅ UI (modal, hook) działa bez modyfikacji
- ✅ Istniejące wywołania API działają (parametr opcjonalny)
- ✅ Kompatybilność wstecz zachowana

## 🚀 Status: IMPLEMENTACJA ZAKOŃCZONA

**Data zakończenia:** 2025-10-31  
**Błędy kompilacji:** 0  
**Błędy lintowania:** 0  
**Gotowość do testów:** ✅ TAK

---

**Następny krok:** Manualne testy z różnymi zestawami preferencji użytkownika
