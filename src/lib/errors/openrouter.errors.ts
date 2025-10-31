// src/lib/errors/openrouter.errors.ts

/**
 * Base error class for all OpenRouter-related errors.
 * Extends the native Error class with a specific name for better error identification.
 */
export class OpenRouterError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OpenRouterError";
  }
}

/**
 * AuthenticationError is thrown when the API key is invalid or missing.
 * This typically corresponds to a 401 HTTP status code from the API.
 */
export class AuthenticationError extends OpenRouterError {
  constructor() {
    super("Nieprawidłowy lub brakujący klucz API OpenRouter.");
    this.name = "AuthenticationError";
  }
}

/**
 * BadRequestError is thrown when the request payload is malformed or invalid.
 * This typically corresponds to a 400 HTTP status code from the API.
 */
export class BadRequestError extends OpenRouterError {
  constructor(details: string) {
    super(`Nieprawidłowe żądanie: ${details}`);
    this.name = "BadRequestError";
  }
}

/**
 * RateLimitError is thrown when the API rate limit has been exceeded.
 * This typically corresponds to a 429 HTTP status code from the API.
 */
export class RateLimitError extends OpenRouterError {
  constructor() {
    super("Przekroczono limit zapytań API. Spróbuj ponownie później.");
    this.name = "RateLimitError";
  }
}

/**
 * ServerError is thrown when the API returns a 5xx error.
 * This indicates that the OpenRouter service is experiencing issues.
 */
export class ServerError extends OpenRouterError {
  constructor() {
    super("API OpenRouter jest obecnie niedostępne.");
    this.name = "ServerError";
  }
}

/**
 * InvalidJSONResponseError is thrown when the model returns a response
 * that cannot be parsed as valid JSON.
 */
export class InvalidJSONResponseError extends OpenRouterError {
  public malformedJson: string;

  constructor(malformedJson: string) {
    super("Model zwrócił odpowiedź, która nie jest prawidłowym formatem JSON.");
    this.name = "InvalidJSONResponseError";
    this.malformedJson = malformedJson;
  }
}

/**
 * SchemaValidationError is thrown when the model returns valid JSON,
 * but it doesn't match the required Zod schema.
 */
export class SchemaValidationError extends OpenRouterError {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public validationErrors: any;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(validationErrors: any) {
    super("Model zwrócił JSON, który nie zgadza się z wymaganym schematem.");
    this.name = "SchemaValidationError";
    this.validationErrors = validationErrors;
  }
}
