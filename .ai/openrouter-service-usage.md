# OpenRouter Service - Dokumentacja Użycia

## Przegląd

`OpenRouterService` to serwis po stronie serwera do integracji z API OpenRouter, umożliwiający generowanie odpowiedzi z modeli LLM oraz danych strukturalnych zgodnych ze schematami Zod.

## Wymagania

### Zmienne Środowiskowe

Dodaj następującą zmienną do pliku `.env`:

```env
OPENROUTER_API_KEY=sk-or-v1-your-api-key-here
```

**Ważne:** Upewnij się, że plik `.env` jest w `.gitignore` i nigdy nie commituj klucza API do repozytorium!

### Zależności

Wymagane pakiety (już zainstalowane):
- `zod` - walidacja schematów
- `zod-to-json-schema` - konwersja schematów Zod na JSON Schema

## Architektura

### Struktura Plików

```
src/
├── lib/
│   ├── openrouter.service.ts        # Główna klasa serwisu
│   ├── errors/
│   │   ├── openrouter.errors.ts     # Niestandardowe klasy błędów
│   │   └── index.ts                 # Barrel export błędów
│   ├── schemas/
│   │   ├── travel-plan.schema.ts    # Schemat planu podróży
│   │   └── index.ts                 # Barrel export schematów
│   └── services/
│       └── travel-plan.service.ts   # Serwis biznesowy używający OpenRouter
├── pages/api/notes/[noteId]/
│   ├── generate-plan.ts             # API endpoint do generowania planów
│   └── travel-plan.ts               # API endpoint do zarządzania planami
└── types.ts                         # Typy i interfejsy
```

## Klasy Błędów

Serwis definiuje następujące klasy błędów:

| Klasa | Opis | Kod HTTP |
|-------|------|----------|
| `OpenRouterError` | Bazowa klasa błędu | - |
| `AuthenticationError` | Nieprawidłowy klucz API (401) | 500 |
| `BadRequestError` | Błędne żądanie (400) | 400 |
| `RateLimitError` | Przekroczony limit (429) | 429 |
| `ServerError` | Błąd serwera OpenRouter (5xx) | 503 |
| `InvalidJSONResponseError` | Nieprawidłowy JSON z modelu | 500 |
| `SchemaValidationError` | JSON niezgodny ze schematem | 500 |

## Użycie

### 1. Podstawowe Użycie - Chat Completion

Generowanie prostej odpowiedzi tekstowej z modelu:

```typescript
import { OpenRouterService } from '../lib/openrouter.service';

const service = new OpenRouterService();

const response = await service.getChatCompletion({
  systemPrompt: "Jesteś pomocnym asystentem podróży.",
  userPrompt: "Podaj 3 najlepsze atrakcje w Krakowie.",
  model: "openai/gpt-4o-mini",  // Opcjonalnie
  temperature: 0.7,               // Opcjonalnie
  max_tokens: 500                 // Opcjonalnie
});

console.log(response); // String z odpowiedzią
```

### 2. Zaawansowane Użycie - Structured Data

Generowanie danych strukturalnych zgodnych ze schematem Zod:

```typescript
import { OpenRouterService } from '../lib/openrouter.service';
import { TravelPlanContentSchema } from '../lib/schemas';

const service = new OpenRouterService();

const travelPlan = await service.getStructuredData({
  systemPrompt: "Jesteś ekspertem w planowaniu podróży.",
  userPrompt: "Utwórz 3-dniowy plan wycieczki do Warszawy.",
  schema: TravelPlanContentSchema,
  schemaName: "create_travel_plan",
  schemaDescription: "Tworzy strukturalny plan podróży",
  model: "openai/gpt-4o",
  temperature: 0.7
});

// travelPlan jest w pełni typowany zgodnie ze schematem!
console.log(travelPlan.days[0].title);
console.log(travelPlan.disclaimer);
```

### 3. Integracja w Serwisie Biznesowym

Przykład z `TravelPlanService`:

```typescript
import { OpenRouterService } from '../openrouter.service';
import { TravelPlanContentSchema } from '../schemas';

export class TravelPlanService {
  private openRouterService: OpenRouterService;

  constructor() {
    this.openRouterService = new OpenRouterService();
  }

  async generatePlan(noteContent: string, options?: TravelPlanOptions) {
    const systemPrompt = `Jesteś ekspertem...`;
    const userPrompt = `Stwórz plan na podstawie: ${noteContent}`;

    const plan = await this.openRouterService.getStructuredData({
      systemPrompt,
      userPrompt,
      schema: TravelPlanContentSchema,
      schemaName: "create_travel_plan",
      schemaDescription: "Tworzy plan podróży",
      model: "openai/gpt-4o"
    });

    return plan;
  }
}
```

### 4. Obsługa Błędów w API Route

Przykład z `generate-plan.ts`:

```typescript
import type { APIRoute } from 'astro';
import { travelPlanService } from '../../../../lib/services/travel-plan.service';
import {
  AuthenticationError,
  RateLimitError,
  ServerError,
  InvalidJSONResponseError,
  SchemaValidationError
} from '../../../../lib/errors';

export const POST: APIRoute = async ({ params, request, locals }) => {
  try {
    // ... logika biznesowa
    const plan = await travelPlanService.generatePlan(noteContent, options);
    
    return new Response(JSON.stringify({ travel_plan: plan }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("Error:", error);

    if (error instanceof AuthenticationError) {
      return new Response(
        JSON.stringify({ 
          error: "Configuration Error",
          message: "AI service configuration error." 
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (error instanceof RateLimitError) {
      return new Response(
        JSON.stringify({ 
          error: "Rate Limit Exceeded",
          message: "Too many requests. Please try again later." 
        }),
        { 
          status: 429, 
          headers: { 
            'Content-Type': 'application/json',
            'Retry-After': '60'
          } 
        }
      );
    }

    // ... inne błędy
    
    return new Response(
      JSON.stringify({ 
        error: "Internal Server Error",
        message: "An unexpected error occurred" 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
```

## Tworzenie Własnych Schematów

### Przykład Schematu Zod

```typescript
import { z } from 'zod';

export const RestaurantRecommendationSchema = z.object({
  name: z.string().describe("Nazwa restauracji"),
  cuisine: z.string().describe("Rodzaj kuchni"),
  priceRange: z.enum(["$", "$$", "$$$", "$$$$"]).describe("Przedział cenowy"),
  rating: z.number().min(1).max(5).describe("Ocena (1-5)"),
  address: z.string().describe("Adres restauracji"),
  specialties: z.array(z.string()).describe("Specjalności"),
  vegetarianOptions: z.boolean().describe("Czy ma opcje wegetariańskie")
});

export type RestaurantRecommendation = z.infer<typeof RestaurantRecommendationSchema>;
```

### Użycie Niestandardowego Schematu

```typescript
const recommendations = await openRouterService.getStructuredData({
  systemPrompt: "Jesteś ekspertem kulinarnym w Krakowie.",
  userPrompt: "Polecić 3 najlepsze restauracje włoskie.",
  schema: z.array(RestaurantRecommendationSchema),
  schemaName: "recommend_restaurants",
  schemaDescription: "Zwraca listę rekomendowanych restauracji",
  model: "openai/gpt-4o"
});

// recommendations jest typowane jako RestaurantRecommendation[]
recommendations.forEach(r => {
  console.log(`${r.name} - ${r.cuisine} - ${r.priceRange}`);
});
```

## Wybór Modelu

### Dostępne Modele

Popularne modele dostępne przez OpenRouter:

| Model | Identyfikator | Zalecane Użycie | Cena |
|-------|---------------|-----------------|------|
| GPT-4o | `openai/gpt-4o` | Structured data, złożone zadania | Wyższa |
| GPT-4o Mini | `openai/gpt-4o-mini` | Proste zadania, szybkie odpowiedzi | Niższa |
| Mistral 7B | `mistralai/mistral-7b-instruct` | Ekonomiczne, proste zadania | Najniższa |
| Claude 3.5 Sonnet | `anthropic/claude-3.5-sonnet` | Wysokiej jakości odpowiedzi | Wyższa |

### Rekomendacje

- **Structured Data (TravelPlanContentSchema)**: Użyj `openai/gpt-4o` lub `anthropic/claude-3.5-sonnet`
- **Proste Chat Completions**: Użyj `openai/gpt-4o-mini` lub `mistralai/mistral-7b-instruct`
- **Budżet ograniczony**: Użyj `mistralai/mistral-7b-instruct` (ustawiony jako domyślny)

## Parametry Konfiguracyjne

### Temperature

Kontroluje losowość odpowiedzi:
- `0.0` - Deterministyczne, powtarzalne odpowiedzi
- `0.7` - Balans między kreatywnością a spójnością (zalecane)
- `1.0+` - Bardziej kreatywne, mniej przewidywalne

### Max Tokens

Maksymalna długość odpowiedzi:
- Standardowe konwersacje: `500-1000`
- Długie dokumenty: `2000-4000`
- Nie ustawiaj dla structured data (model sam określi długość)

## Best Practices

### 1. Obsługa Błędów

Zawsze owijaj wywołania serwisu w try-catch i obsługuj konkretne typy błędów:

```typescript
try {
  const result = await service.getChatCompletion({...});
} catch (error) {
  if (error instanceof RateLimitError) {
    // Poczekaj i spróbuj ponownie
  } else if (error instanceof ServerError) {
    // Użyj fallback lub pokaż error użytkownikowi
  }
}
```

### 2. Prompt Engineering

**System Prompt:**
- Zdefiniuj jasno rolę AI
- Określ format oczekiwanej odpowiedzi
- Uwzględnij ograniczenia i wymagania

**User Prompt:**
- Bądź konkretny i jasny
- Podaj kontekst i przykłady
- Używaj instrukcji krok-po-kroku dla złożonych zadań

### 3. Walidacja Schematów

Zawsze używaj `.describe()` dla pól w schematach Zod - pomaga to modelowi zrozumieć oczekiwania:

```typescript
const schema = z.object({
  title: z.string().describe("Krótki, chwytliwy tytuł (max 50 znaków)"),
  description: z.string().describe("Szczegółowy opis (2-3 zdania)")
});
```

### 4. Bezpieczeństwo

- ✅ Nigdy nie commituj klucza API
- ✅ Używaj serwisu tylko po stronie serwera
- ✅ Waliduj wszystkie dane wejściowe
- ✅ Sanityzuj dane od użytkownika przed wysłaniem do AI
- ✅ Loguj błędy, ale nie ujawniaj szczegółów użytkownikom

## Monitoring i Debugowanie

### Logowanie

```typescript
try {
  const result = await service.getStructuredData({...});
} catch (error) {
  console.error("OpenRouter Error:", {
    type: error.constructor.name,
    message: error.message,
    timestamp: new Date().toISOString()
  });
  throw error;
}
```

### Sprawdzanie Kosztów

OpenRouter dostarcza nagłówki z informacjami o kosztach:
- Sprawdź dashboard OpenRouter dla szczegółowych statystyk
- Monitoruj użycie API key
- Ustaw limity budżetu w panelu OpenRouter

## Troubleshooting

### Problem: "OPENROUTER_API_KEY nie jest ustawiona"

**Rozwiązanie:**
1. Sprawdź czy plik `.env` istnieje w głównym katalogu projektu
2. Upewnij się, że klucz ma prawidłowy format: `OPENROUTER_API_KEY=sk-or-v1-...`
3. Zrestartuj serwer Astro po dodaniu/modyfikacji `.env`

### Problem: Rate Limit Error (429)

**Rozwiązanie:**
1. Sprawdź limity w panelu OpenRouter
2. Zaimplementuj exponential backoff
3. Użyj cache dla powtarzających się zapytań
4. Rozważ upgrade planu OpenRouter

### Problem: Invalid JSON Response

**Rozwiązanie:**
1. Użyj mocniejszego modelu (np. GPT-4o zamiast Mistral-7B)
2. Uprość schemat - mniejsze schematy są łatwiejsze do wygenerowania
3. Dodaj więcej szczegółów w `.describe()` pól schematu
4. Zwiększ temperature dla większej kreatywności (jeśli model jest zbyt sztywny)

### Problem: Schema Validation Error

**Rozwiązanie:**
1. Sprawdź logi aby zobaczyć jaki JSON model zwrócił
2. Upewnij się, że wszystkie pola wymagane mają `.describe()`
3. Rozważ użycie `.optional()` dla pól, które model może pominąć
4. Dodaj przykłady w system prompt pokazujące oczekiwaną strukturę

## Kontakt i Wsparcie

W razie problemów:
1. Sprawdź logi serwera
2. Przejrzyj dokumentację OpenRouter: https://openrouter.ai/docs
3. Sprawdź status API OpenRouter: https://status.openrouter.ai/

