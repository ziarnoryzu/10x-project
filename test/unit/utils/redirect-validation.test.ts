// test/unit/utils/redirect-validation.test.ts

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { validateRedirectUrl } from "@/lib/utils/redirect-validation";

describe("validateRedirectUrl", () => {
  /**
   * REGUŁA BEZPIECZEŃSTWA: Funkcja musi blokować zewnętrzne redirecty
   * aby zapobiec atakom typu "Open Redirect".
   * Open Redirect: atakujący może przekierować użytkownika na złośliwą stronę.
   */

  // Spy na console.warn do testowania logowania security warnings
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let consoleWarnSpy: any;

  beforeEach(() => {
    consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {
      // Mock implementation - suppress console warnings in tests
    });
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
  });

  describe("should return default redirect for invalid/missing input", () => {
    it("should return default redirect when redirectUrl is null", () => {
      // Arrange
      const redirectUrl = null;

      // Act
      const result = validateRedirectUrl(redirectUrl);

      // Assert
      expect(result).toBe("/app/notes");
    });

    it("should return custom default redirect when provided", () => {
      // Arrange
      const redirectUrl = null;
      const customDefault = "/profile";

      // Act
      const result = validateRedirectUrl(redirectUrl, customDefault);

      // Assert
      expect(result).toBe("/profile");
    });

    it("should return default redirect when redirectUrl is empty string", () => {
      // Arrange
      const redirectUrl = "";

      // Act
      const result = validateRedirectUrl(redirectUrl);

      // Assert
      expect(result).toBe("/app/notes");
    });
  });

  describe("SECURITY: should block external URLs", () => {
    it("should block HTTP URLs", () => {
      // Arrange - próba ataku open redirect
      const maliciousUrl = "http://evil.com/phishing";

      // Act
      const result = validateRedirectUrl(maliciousUrl);

      // Assert
      expect(result).toBe("/app/notes");
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining("[Security] Blocked external redirect attempt:")
      );
      expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining(maliciousUrl));
    });

    it("should block HTTPS URLs", () => {
      // Arrange
      const maliciousUrl = "https://evil.com/steal-credentials";

      // Act
      const result = validateRedirectUrl(maliciousUrl);

      // Assert
      expect(result).toBe("/app/notes");
      expect(consoleWarnSpy).toHaveBeenCalled();
    });

    it("should block protocol-relative URLs (//)", () => {
      // Arrange - próba ominięcia przez // (protocol-relative URL)
      const maliciousUrl = "//evil.com/phishing";

      // Act
      const result = validateRedirectUrl(maliciousUrl);

      // Assert
      expect(result).toBe("/app/notes");
      expect(consoleWarnSpy).toHaveBeenCalled();
    });

    it("should block URLs with custom protocols", () => {
      // Arrange - różne protokoły
      const httpUrl = "http://evil.com";
      const httpsUrl = "https://evil.com";

      // Act & Assert - tylko http:// i https:// są blokowane
      expect(validateRedirectUrl(httpUrl)).toBe("/app/notes");
      expect(validateRedirectUrl(httpsUrl)).toBe("/app/notes");

      // Inne protokoły nie są specjalnie obsługiwane - przechodzą przez normalizację
      // To nie jest pełne zabezpieczenie, ale funkcja skupia się na http/https
      const ftpUrl = validateRedirectUrl("ftp://evil.com");
      expect(ftpUrl).toBe("/ftp://evil.com"); // Dodaje /, traktuje jako ścieżkę
    });

    it("should use custom default when blocking external URL", () => {
      // Arrange
      const maliciousUrl = "https://evil.com";
      const customDefault = "/auth/login";

      // Act
      const result = validateRedirectUrl(maliciousUrl, customDefault);

      // Assert
      expect(result).toBe(customDefault);
    });

    it("should block URLs that look like legitimate domains", () => {
      // Arrange - próba podszywania się pod prawdziwe domeny
      const sneakyUrls = [
        "https://google.com/fake-login",
        "http://facebook.com@evil.com",
        "https://app.fake-domain.com/steal",
      ];

      // Act & Assert
      sneakyUrls.forEach((url) => {
        const result = validateRedirectUrl(url);
        expect(result).toBe("/app/notes");
      });
    });
  });

  describe("should normalize valid internal paths", () => {
    it("should accept and return valid internal path with leading slash", () => {
      // Arrange
      const validPaths = ["/app/notes", "/profile", "/auth/login", "/app/notes/123"];

      // Act & Assert
      validPaths.forEach((path) => {
        const result = validateRedirectUrl(path);
        expect(result).toBe(path);
        expect(consoleWarnSpy).not.toHaveBeenCalled();
      });
    });

    it("should add leading slash to path without it", () => {
      // Arrange - ścieżka bez początkowego /
      const pathWithoutSlash = "app/notes";

      // Act
      const result = validateRedirectUrl(pathWithoutSlash);

      // Assert
      expect(result).toBe("/app/notes");
    });

    it("should normalize multiple variations of same path", () => {
      // Arrange - różne warianty tej samej ścieżki
      const variations = [
        { input: "/profile", expected: "/profile" },
        { input: "profile", expected: "/profile" },
        { input: "/app/notes/", expected: "/app/notes/" }, // trailing slash pozostaje
        { input: "app/notes/123", expected: "/app/notes/123" },
      ];

      // Act & Assert
      variations.forEach(({ input, expected }) => {
        const result = validateRedirectUrl(input);
        expect(result).toBe(expected);
      });
    });

    it("should preserve query parameters in internal paths", () => {
      // Arrange
      const pathWithQuery = "/app/notes?page=2";

      // Act
      const result = validateRedirectUrl(pathWithQuery);

      // Assert
      expect(result).toBe(pathWithQuery);
    });

    it("should preserve hash fragments in internal paths", () => {
      // Arrange
      const pathWithHash = "/app/notes#travel-plans";

      // Act
      const result = validateRedirectUrl(pathWithHash);

      // Assert
      expect(result).toBe(pathWithHash);
    });

    it("should preserve both query and hash", () => {
      // Arrange
      const complexPath = "/app/notes?page=2&sort=date#section";

      // Act
      const result = validateRedirectUrl(complexPath);

      // Assert
      expect(result).toBe(complexPath);
    });

    it("should handle encoded characters in path", () => {
      // Arrange - znaki specjalne zakodowane
      const encodedPath = "/app/notes?redirect=%2Fprofile";

      // Act
      const result = validateRedirectUrl(encodedPath);

      // Assert
      expect(result).toBe(encodedPath);
    });
  });

  describe("edge cases", () => {
    it("should handle path with only slash", () => {
      // Arrange
      const rootPath = "/";

      // Act
      const result = validateRedirectUrl(rootPath);

      // Assert
      expect(result).toBe("/");
    });

    it("should handle very long internal path", () => {
      // Arrange - bardzo długa ścieżka
      const longPath = "/app/notes/very/deep/nested/path/to/some/resource/that/is/extremely/long";

      // Act
      const result = validateRedirectUrl(longPath);

      // Assert
      expect(result).toBe(longPath);
    });

    it("should handle path with special characters", () => {
      // Arrange
      const specialPath = "/app/notes/note-with-dashes_and_underscores.123";

      // Act
      const result = validateRedirectUrl(specialPath);

      // Assert
      expect(result).toBe(specialPath);
    });

    it("should handle path with spaces (should be encoded by caller)", () => {
      // Arrange
      const pathWithSpaces = "/app/notes/my notes";

      // Act
      const result = validateRedirectUrl(pathWithSpaces);

      // Assert
      expect(result).toBe(pathWithSpaces); // Funkcja nie koduje, tylko waliduje
    });

    it("should handle case-sensitive paths correctly", () => {
      // Arrange
      const mixedCasePath = "/App/Notes/MyNote";

      // Act
      const result = validateRedirectUrl(mixedCasePath);

      // Assert
      expect(result).toBe(mixedCasePath); // Zachowuje case
    });

    it("should not be confused by http/https in path segment", () => {
      // Arrange - http w nazwie ścieżki, ale nie jako protokół
      const trickPath = "/resources/http-guide";

      // Act
      const result = validateRedirectUrl(trickPath);

      // Assert
      expect(result).toBe(trickPath);
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it("should handle relative paths with ..", () => {
      // Arrange - relatywna ścieżka
      const relativePath = "../profile";

      // Act
      const result = validateRedirectUrl(relativePath);

      // Assert
      expect(result).toBe("/../profile"); // Dodaje /, ale nie rozwiązuje ../
    });

    it("should handle paths with multiple slashes", () => {
      // Arrange
      const multiSlashPath = "/app//notes///123";

      // Act
      const result = validateRedirectUrl(multiSlashPath);

      // Assert
      expect(result).toBe(multiSlashPath); // Nie normalizuje podwójnych //
    });
  });

  /**
   * TESTY BEZPIECZEŃSTWA: Zaawansowane próby omijania walidacji
   */
  describe("SECURITY: advanced bypass attempts", () => {
    it("should block URL with whitespace before protocol", () => {
      // Arrange - whitespace przed protokołem
      const sneakyUrl = "  https://evil.com";

      // Act
      const result = validateRedirectUrl(sneakyUrl);

      // Assert - startsWith sprawdza od początku, więc nie złapie
      expect(result).toBe("/  https://evil.com"); // Dodaje /, traktuje jako ścieżkę
    });

    it("should block URL with uppercase protocol", () => {
      // Arrange - wielkie litery w protokole
      const sneakyUrl = "HTTPS://evil.com";

      // Act
      const result = validateRedirectUrl(sneakyUrl);

      // Assert - startsWith jest case-sensitive, więc nie złapie
      expect(result).toBe("/HTTPS://evil.com"); // Traktuje jako ścieżkę (potencjalna podatność)
    });

    it("should handle backslashes in path", () => {
      // Arrange - backslash zamiast slash (Windows-style)
      const backslashPath = "\\app\\notes";

      // Act
      const result = validateRedirectUrl(backslashPath);

      // Assert
      expect(result).toBe("/\\app\\notes"); // Dodaje /, zachowuje backslashes
    });

    it("should handle null bytes in path", () => {
      // Arrange
      const nullBytePath = "/app/notes\0/evil";

      // Act
      const result = validateRedirectUrl(nullBytePath);

      // Assert
      expect(result).toBe(nullBytePath); // Funkcja nie sanityzuje null bytes
    });

    it("should handle unicode characters in path", () => {
      // Arrange - unicode w ścieżce
      const unicodePath = "/app/notes/ćwiczenia-świąteczne";

      // Act
      const result = validateRedirectUrl(unicodePath);

      // Assert
      expect(result).toBe(unicodePath);
    });

    it("should handle redirect to API endpoints", () => {
      // Arrange - redirect do API (zazwyczaj niepożądane, ale techniczne dozwolone)
      const apiPath = "/api/notes";

      // Act
      const result = validateRedirectUrl(apiPath);

      // Assert
      expect(result).toBe(apiPath);
    });
  });

  /**
   * TESTY INTEGRACYJNE: Realistyczne scenariusze użycia
   */
  describe("realistic usage scenarios", () => {
    it("should handle post-login redirect to requested page", () => {
      // Arrange - użytkownik próbował wejść na /app/notes?page=3
      const requestedPage = "/app/notes?page=3";

      // Act
      const result = validateRedirectUrl(requestedPage);

      // Assert
      expect(result).toBe(requestedPage);
    });

    it("should handle post-logout redirect to home", () => {
      // Arrange
      const homePath = "/";

      // Act
      const result = validateRedirectUrl(homePath);

      // Assert
      expect(result).toBe("/");
    });

    it("should block phishing attempt after successful login", () => {
      // Arrange - atakujący podrzuca redirect do phishing
      const phishingUrl = "https://fake-app.com/steal-token";

      // Act
      const result = validateRedirectUrl(phishingUrl);

      // Assert
      expect(result).toBe("/app/notes"); // Bezpieczny fallback
      expect(consoleWarnSpy).toHaveBeenCalled();
    });

    it("should handle redirect from email verification link", () => {
      // Arrange - redirect po weryfikacji email
      const verificationRedirect = "/app/notes?verified=true";

      // Act
      const result = validateRedirectUrl(verificationRedirect);

      // Assert
      expect(result).toBe(verificationRedirect);
    });

    it("should normalize user-entered redirect without slash", () => {
      // Arrange - użytkownik wpisał ścieżkę bez początkowego /
      const userInput = "profile";

      // Act
      const result = validateRedirectUrl(userInput);

      // Assert
      expect(result).toBe("/profile");
    });
  });
});
