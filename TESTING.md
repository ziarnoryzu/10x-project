# Testing Documentation

This project uses **Vitest** for unit testing and **Playwright** for E2E testing.

## Unit Testing with Vitest

### Configuration

- Configuration file: `vitest.config.ts`
- Setup file: `test/setup.ts`
- Test files: `**/*.{test,spec}.{ts,tsx}`

### Running Tests

```bash
# Run all unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

### Writing Tests

Place unit tests next to the files they test or in the `test/unit` directory:

```typescript
import { describe, it, expect } from "vitest";

describe("Component Name", () => {
  it("should do something", () => {
    expect(true).toBe(true);
  });
});
```

### Testing React Components

```typescript
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MyComponent } from "./MyComponent";

describe("MyComponent", () => {
  it("renders correctly", () => {
    render(<MyComponent />);
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });
});
```

## E2E Testing with Playwright

### Configuration

- Configuration file: `playwright.config.ts`
- Test directory: `e2e/`
- Browser: Chromium (Desktop Chrome)
- Database: Cloud Supabase (with automatic cleanup)

### Running Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run tests with UI mode
npm run test:e2e:ui

# Run tests in debug mode
npm run test:e2e:debug

# Generate tests with codegen
npm run test:e2e:codegen
```

### Test Data Cleanup

E2E tests use cloud Supabase database with automatic cleanup mechanism:

```typescript
import { test } from "./fixtures/testContext";
import { extractNoteIdFromUrl } from "./helpers/cleanupHelper";

test("should create note", async ({ authenticatedPage, createdNoteIds }) => {
  const page = authenticatedPage; // Auto-authenticated
  
  // ... create note ...
  
  // Track note ID for cleanup
  const noteId = await extractNoteIdFromUrl(page);
  if (noteId) {
    createdNoteIds.push(noteId);
  }
  // Notes are automatically deleted after test completes
});
```

**Available Fixtures:**
- `authenticatedPage` - Pre-authenticated page with user login
- `createdNoteIds` - Array for tracking created notes (auto-cleanup)

See [e2e/README.md](e2e/README.md) for detailed documentation.

### Writing E2E Tests

Place E2E tests in the `e2e/` directory:

```typescript
import { test, expect } from "@playwright/test";

test.describe("Feature Name", () => {
  test("should perform action", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Expected Title/);
  });
});
```

### Page Object Model

For better maintainability, use the Page Object Model pattern:

```typescript
// e2e/pages/HomePage.ts
import { Page } from "@playwright/test";

export class HomePage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto("/");
  }

  async clickLogin() {
    await this.page.click("text=Login");
  }
}

// e2e/home.spec.ts
import { test, expect } from "@playwright/test";
import { HomePage } from "./pages/HomePage";

test("should navigate to login", async ({ page }) => {
  const homePage = new HomePage(page);
  await homePage.goto();
  await homePage.clickLogin();
  await expect(page).toHaveURL(/login/);
});
```

## Accessibility Testing

Playwright is configured with `@axe-core/playwright` for accessibility testing:

```typescript
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("should not have accessibility violations", async ({ page }) => {
  await page.goto("/");
  const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
  expect(accessibilityScanResults.violations).toEqual([]);
});
```

## Best Practices

### Unit Tests

- Follow the Arrange-Act-Assert pattern
- Use descriptive test names
- Mock external dependencies
- Test one thing per test
- Keep tests focused and fast

### E2E Tests

- Use browser contexts for test isolation
- Implement the Page Object Model
- Use specific locators (prefer data-testid)
- Handle async operations properly
- Take screenshots/videos on failure
- Run tests in parallel when possible

## CI/CD Integration

Tests are configured to run in CI with:
- Retries enabled (2 retries on CI)
- GitHub reporter for better CI output
- Trace collection on first retry
- Screenshots and videos on failure
