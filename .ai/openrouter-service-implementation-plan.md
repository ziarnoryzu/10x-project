# Plan Implementacji Usługi OpenRouter

Ten dokument stanowi kompleksowy przewodnik po implementacji serwerowej usługi `OpenRouterService` dla aplikacji VibeTravels. Usługa ta będzie działać jako scentralizowany, bezpieczny interfejs do interakcji z API OpenRouter w celu generowania uzupełnień czatów opartych na LLM oraz danych strukturalnych.

## 1. Opis Usługi

`OpenRouterService` to klasa TypeScript przeznaczona do działania po stronie serwera (w ramach Astro API routes). Jej główne zadania to:
- Bezpieczne zarządzanie kluczem API OpenRouter.
- Konstruowanie prawidłowych ładunków żądań dla API OpenRouter Chat Completions.
- Obsługa zarówno standardowych wiadomości czatu, jak i żądań o ustrukturyzowane dane wyjściowe JSON w oparciu o predefiniowany schemat.
- Wysyłanie żądań do API i parsowanie odpowiedzi.
- Implementacja solidnej obsługi błędów dla problemów związanych z API, siecią i walidacją danych.

## 2. Opis Konstruktora

Usługa zostanie zaprojektowana jako singleton lub klasa, która jest instancjonowana raz na cykl życia aplikacji, aby zapewnić jednorazowe załadowanie konfiguracji.

```typescript
// Lokalizacja: src/lib/services/OpenRouterService.ts

class OpenRouterService {
  private readonly apiKey: string;
  private readonly defaultModel: string;

  constructor() {
    this.apiKey = import.meta.env.OPENROUTER_API_KEY;
    this.defaultModel = 'mistralai/mistral-7b-instruct'; // Rozsądny domyślny model

    if (!this.apiKey) {
      // Spowoduje to awarię serwera przy starcie, jeśli klucz nie zostanie znaleziony,
      // co jest dobrą strategią "fail-fast".
      throw new Error("Zmienna środowiskowa OPENROUTER_API_KEY nie jest ustawiona.");
    }
  }
}
```

## 3. Metody i Pola Publiczne

Publiczny interfejs powinien być prosty i abstrahować od złożoności API OpenRouter.

| Metoda/Pole          | Typ            | Opis                                                                                                                                                                    |
| -------------------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `getChatCompletion`  | `async Method` | Przyjmuje prompt systemowy, prompt użytkownika i opcjonalne parametry, aby zwrócić prostą, tekstową odpowiedź czatu z modelu.                                              |
| `getStructuredData`  | `async Method` | Przyjmuje prompty i schemat Zod, aby zażądać od modelu ustrukturyzowanego obiektu JSON zgodnego ze schematem. Zwraca zwalidowany, otypowany obiekt.                         |

### Sygnatury Metod

```typescript
// W src/types.ts
import { z } from 'zod';

export interface ChatCompletionParams {
  systemPrompt: string;
  userPrompt: string;
  model?: string;
  temperature?: number;
  max_tokens?: number;
}

export interface StructuredDataParams<T extends z.ZodTypeAny> extends ChatCompletionParams {
  schemaName: string;
  schemaDescription: string;
  schema: T;
}

// W OpenRouterService.ts
public async getChatCompletion(params: ChatCompletionParams): Promise<string> {
  // ... implementacja
}

public async getStructuredData<T extends z.ZodTypeAny>(params: StructuredDataParams<T>): Promise<z.infer<T>> {
  // ... implementacja
}
```

## 4. Metody i Pola Prywatne

Metody prywatne będą hermetyzować wewnętrzną logikę usługi.

| Metoda/Pole    | Typ            | Opis                                                                                                           |
| -------------- | -------------- | -------------------------------------------------------------------------------------------------------------- |
| `apiKey`       | `private`      | Przechowuje klucz API OpenRouter załadowany ze zmiennych środowiskowych.                                        |
| `defaultModel` | `private`      | Przechowuje domyślną nazwę modelu do użycia, jeśli nie zostanie określona w wywołaniu metody.                      |
| `fetchFromApi` | `async Method` | Generyczna metoda prywatna do obsługi rzeczywistego wywołania `fetch`, w tym ustawiania nagłówków i ciała żądania. |

### Sygnatury Metod

```typescript
// W OpenRouterService.ts
private async fetchFromApi(body: Record<string, any>): Promise<any> {
  // ... implementacja
}
```

## 5. Obsługa Błędów

Należy zdefiniować solidny zestaw niestandardowych klas błędów do obsługi specyficznych scenariuszy awarii. Pozwoli to kodowi wywołującemu (API route) na przechwytywanie konkretnych błędów i zwracanie odpowiednich kodów statusu HTTP.

```typescript
// Lokalizacja: src/lib/errors/OpenRouterErrors.ts

export class OpenRouterError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OpenRouterError';
  }
}

export class AuthenticationError extends OpenRouterError {
  constructor() { super("Nieprawidłowy lub brakujący klucz API OpenRouter."); this.name = "AuthenticationError"; }
}

export class BadRequestError extends OpenRouterError {
  constructor(details: string) { super(`Nieprawidłowe żądanie: ${details}`); this.name = "BadRequestError"; }
}

export class RateLimitError extends OpenRouterError {
  constructor() { super("Przekroczono limit zapytań API. Spróbuj ponownie później."); this.name = "RateLimitError"; }
}

export class ServerError extends OpenRouterError {
  constructor() { super("API OpenRouter jest obecnie niedostępne."); this.name = "ServerError"; }
}

export class InvalidJSONResponseError extends OpenRouterError {
  public malformedJson: string;
  constructor(malformedJson: string) {
    super("Model zwrócił odpowiedź, która nie jest prawidłowym formatem JSON.");
    this.name = "InvalidJSONResponseError";
    this.malformedJson = malformedJson;
  }
}

export class SchemaValidationError extends OpenRouterError {
  public validationErrors: any;
  constructor(validationErrors: any) {
    super("Model zwrócił JSON, który не zgadza się z wymaganym schematem.");
    this.name = "SchemaValidationError";
    this.validationErrors = validationErrors;
  }
}
```

Metoda `fetchFromApi` będzie odpowiedzialna za przechwytywanie błędów HTTP i rzucanie tych niestandardowych typów.

## 6. Kwestie Bezpieczeństwa

- **Zarządzanie Kluczem API**: `OPENROUTER_API_KEY` **musi** być przechowywany jako zmienna środowiskowa i dostępny **wyłącznie** po stronie serwera (`import.meta.env`). Nigdy nie powinien być ujawniany klientowi. Plik `.env` musi być dodany do `.gitignore`.
- **Wykonywanie po Stronie Serwera**: Wszystkie interakcje z API OpenRouter muszą pochodzić z serwera (np. Astro API route). Frontend powinien wywoływać tę wewnętrzną trasę API, a nie bezpośrednio OpenRouter.
- **Sanityzacja Danych Wejściowych**: Chociaż LLM przetworzy dane wejściowe, wszelkie dane od użytkownika, które są przechowywane w bazie danych lub odzwierciedlane w interfejsie użytkownika, powinny być nadal traktowane jako niezaufane. Należy sanityzować dane wejściowe, aby zapobiec atakom typu injection, jeśli dane są używane w innych kontekstach.

## 7. Plan Implementacji Krok po Kroku

### Krok 1: Konfiguracja

1.  **Zainstaluj Zależności**: Zainstaluj `zod` do walidacji schematów i `zod-to-json-schema` do konwersji schematów Zod na format JSON Schema wymagany przez API.
    ```bash
    npm install zod zod-to-json-schema
    ```
2.  **Ustaw Zmienną Środowiskową**: Utwórz plik `.env` w głównym katalogu projektu (jeśli nie istnieje) i dodaj swój klucz API OpenRouter.
    ```
    # .env
    OPENROUTER_API_KEY="your_api_key_here"
    ```
3.  **Zaktualizuj `.gitignore`**: Upewnij się, że plik `.env` jest wymieniony w pliku `.gitignore`.

### Krok 2: Zdefiniuj Typy i Schematy

1.  Utwórz plik `src/types.ts` (jeśli nie istnieje) i dodaj interfejsy parametrów metod (`ChatCompletionParams`, `StructuredDataParams`).
2.  Dla każdych potrzebnych danych strukturalnych zdefiniuj schemat Zod. Na przykład dla planu podróży:

    ```typescript
    // src/lib/schemas/TravelPlanSchema.ts
    import { z } from 'zod';

    export const TravelPlanSchema = z.object({
      destination: z.string().describe("Miasto lub kraj podróży."),
      duration_days: z.number().int().positive().describe("Całkowita liczba dni wycieczki."),
      daily_plan: z.array(z.object({
        day: z.number().int().positive(),
        activities: z.array(z.string()).describe("Lista aktywności na dany dzień."),
      })).describe("Plan podróży dzień po dniu.")
    });

    export type TravelPlan = z.infer<typeof TravelPlanSchema>;
    ```

### Krok 3: Zaimplementuj Klasę Usługi

1.  Utwórz plik `src/lib/services/OpenRouterService.ts`.
2.  Utwórz niestandardowe klasy błędów w `src/lib/errors/OpenRouterErrors.ts`, jak opisano w sekcji 5.
3.  Zaimplementuj strukturę klasy `OpenRouterService` wraz z konstruktorem.
4.  Zaimplementuj prywatną metodę `fetchFromApi`. Metoda ta będzie zawierać podstawową logikę `fetch`.

    ```typescript
    // W OpenRouterService.ts
    private async fetchFromApi(body: Record<string, any>): Promise<any> {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            switch (response.status) {
                case 401: throw new AuthenticationError();
                case 400: throw new BadRequestError(await response.text());
                case 429: throw new RateLimitError();
                default: throw new ServerError();
            }
        }
        return response.json();
    }
    ```

5.  Zaimplementuj publiczną metodę `getChatCompletion`.

    ```typescript
    // W OpenRouterService.ts
    public async getChatCompletion(params: ChatCompletionParams): Promise<string> {
        const body = {
            model: params.model || this.defaultModel,
            messages: [
                { role: 'system', content: params.systemPrompt },
                { role: 'user', content: params.userPrompt }
            ],
            temperature: params.temperature,
            max_tokens: params.max_tokens,
        };

        const responseJson = await this.fetchFromApi(body);
        return responseJson.choices[0].message.content;
    }
    ```
6.  Zaimplementuj publiczną metodę `getStructuredData`. To tutaj `zod-to-json-schema` jest używane do tworzenia definicji narzędzia dla wywołania API.

    ```typescript
    // W OpenRouterService.ts
    import { zodToJsonSchema } from 'zod-to-json-schema';
    import { z } from 'zod';
    // ... inne importy

    public async getStructuredData<T extends z.ZodTypeAny>(params: StructuredDataParams<T>): Promise<z.infer<T>> {
        const jsonSchema = zodToJsonSchema(params.schema, params.schemaName);

        const body = {
            model: params.model || this.defaultModel,
            messages: [
                { role: 'system', content: params.systemPrompt },
                { role: 'user', content: params.userPrompt }
            ],
            tools: [{
                type: 'function',
                function: {
                    name: params.schemaName,
                    description: params.schemaDescription,
                    parameters: jsonSchema,
                }
            }],
            tool_choice: { type: 'function', function: { name: params.schemaName } },
            temperature: params.temperature,
        };

        const responseJson = await this.fetchFromApi(body);
        
        const toolCall = responseJson.choices[0].message.tool_calls[0];
        if (toolCall.type !== 'function') {
          throw new Error('Oczekiwano wywołania narzędzia typu "function" z API.');
        }

        const rawJson = toolCall.function.arguments;

        let parsedJson: any;
        try {
            parsedJson = JSON.parse(rawJson);
        } catch (error) {
            throw new InvalidJSONResponseError(rawJson);
        }

        const validationResult = params.schema.safeParse(parsedJson);
        if (!validationResult.success) {
            throw new SchemaValidationError(validationResult.error);
        }

        return validationResult.data;
    }
    ```

### Krok 4: Utwórz Trasę API do Korzystania z Usługi

1.  Utwórz trasę API, na przykład `src/pages/api/generate-plan.ts`.
2.  Zainstancjonuj usługę i użyj jej wewnątrz handlera trasy. Ta trasa API będzie obsługiwać żądania z Twojego frontendu.

    ```typescript
    // src/pages/api/generate-plan.ts
    import type { APIRoute } from 'astro';
    import { OpenRouterService } from '../../lib/services/OpenRouterService';
    import { TravelPlanSchema } from '../../lib/schemas/TravelPlanSchema';
    import { OpenRouterError } from '../../lib/errors/OpenRouterErrors';

    // Dobrą praktyką jest jednorazowe zainstancjonowanie usługi.
    const openRouterService = new OpenRouterService();

    export const POST: APIRoute = async ({ request }) => {
        try {
            const body = await request.json();
            const userNotes = body.notes;

            if (!userNotes) {
                return new Response(JSON.stringify({ error: 'Notatki użytkownika są wymagane.' }), { status: 400 });
            }

            const travelPlan = await openRouterService.getStructuredData({
                systemPrompt: "Jesteś światowej klasy agentem turystycznym. Twoim zadaniem jest przekształcenie nieustrukturyzowanych notatek użytkownika w szczegółowy, ustrukturyzowany obiekt JSON z planem podróży.",
                userPrompt: `Oto notatki podróżne użytkownika: "${userNotes}"`,
                schema: TravelPlanSchema,
                schemaName: 'create_travel_plan',
                schemaDescription: 'Tworzy ustrukturyzowany plan podróży z nieustrukturyzowanych notatek.',
                model: 'openai/gpt-4o' // Użyj potężnego modelu do danych strukturalnych
            });

            return new Response(JSON.stringify(travelPlan), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });

        } catch (error) {
            console.error(error); // Do logowania po stronie serwera

            if (error instanceof OpenRouterError) {
                // Możesz mapować swoje niestandardowe błędy na konkretne kody statusu
                const statusCode = error.name === 'BadRequestError' ? 400 : 500;
                return new Response(JSON.stringify({ error: error.message }), { status: statusCode });
            }

            return new Response(JSON.stringify({ error: 'Wystąpił nieoczekiwany błąd.' }), { status: 500 });
        }
    };
    ```

Ten plan zapewnia solidne, bezpieczne i łatwe w utrzymaniu podstawy do integracji OpenRouter z aplikacją VibeTravels, zgodnie z ustalonymi praktykami kodowania i strukturą projektu.
