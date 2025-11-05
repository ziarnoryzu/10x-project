// test/unit/services/travel-plan.service.test.ts

import { describe, it, expect, beforeEach, vi } from "vitest";
import { TravelPlanService } from "@/lib/services/travel-plan.service";

// Mock OpenRouterService to avoid needing API key
vi.mock("@/lib/openrouter.service", () => {
  const OpenRouterService = vi.fn();
  OpenRouterService.prototype.getStructuredData = vi.fn();
  return { OpenRouterService };
});

describe("TravelPlanService", () => {
  let service: TravelPlanService;

  beforeEach(() => {
    service = new TravelPlanService();
  });

  describe("validateNoteContent", () => {
    /**
     * REGUŁA BIZNESOWA: Notatka musi zawierać minimum 10 słów
     * aby umożliwić sensowne wygenerowanie planu podróży przez AI.
     */

    describe("should return false for invalid content", () => {
      it("should reject null content", () => {
        // Arrange & Act
        const result = service.validateNoteContent(null);

        // Assert
        expect(result).toBe(false);
      });

      it("should reject empty string", () => {
        // Arrange
        const content = "";

        // Act
        const result = service.validateNoteContent(content);

        // Assert
        expect(result).toBe(false);
      });

      it("should reject whitespace-only content", () => {
        // Arrange - różne kombinacje whitespace
        const contents = ["   ", "\n\n\n", "\t\t\t", "  \n  \t  ", "     \r\n     "];

        // Act & Assert
        contents.forEach((content) => {
          expect(service.validateNoteContent(content)).toBe(false);
        });
      });

      it("should reject content with fewer than 10 words", () => {
        // Arrange - dokładnie 9 słów
        const content = "Jadę do Paryża na trzy dni w przyszłym tygodniu";

        // Act
        const result = service.validateNoteContent(content);

        // Assert
        expect(result).toBe(false);
      });

      it("should reject content with 9 words and extra whitespace", () => {
        // Arrange - 9 słów z wieloma spacjami i enterami
        const content = "Jadę   do    Paryża\n\nna   trzy   dni\tw   przyszłym";

        // Act
        const result = service.validateNoteContent(content);

        // Assert
        expect(result).toBe(false);
      });

      it("should reject very short travel note", () => {
        // Arrange - krótka notatka (5 słów)
        const content = "Warszawa weekend dwa dni";

        // Act
        const result = service.validateNoteContent(content);

        // Assert
        expect(result).toBe(false);
      });
    });

    describe("should return true for valid content", () => {
      it("should accept content with exactly 10 words", () => {
        // Arrange - dokładnie 10 słów (przypadek brzegowy)
        const content = "Jadę do Paryża na trzy dni w przyszłym tygodniu koniecznie";

        // Act
        const result = service.validateNoteContent(content);

        // Assert
        expect(result).toBe(true);
      });

      it("should accept content with 10 words and extra whitespace", () => {
        // Arrange - 10 słów z wieloma spacjami, tabulatorami i enterami
        const content = "Jadę   do    Paryża\n\nna   trzy   dni\tw   przyszłym   tygodniu   koniecznie";

        // Act
        const result = service.validateNoteContent(content);

        // Assert
        expect(result).toBe(true);
      });

      it("should accept realistic short travel note", () => {
        // Arrange - realistyczna krótka notatka (15 słów)
        const content =
          "Weekend w Krakowie. Chcę zobaczyć Wawel, Kazimierz i zjeść w dobrej restauracji. Nocleg w centrum.";

        // Act
        const result = service.validateNoteContent(content);

        // Assert
        expect(result).toBe(true);
      });

      it("should accept longer travel note with details", () => {
        // Arrange - dłuższa notatka z detalami (40+ słów)
        const content = `Planujemy rodzinną wycieczkę do Gdańska na długi weekend od 15 do 18 listopada.
        Chcemy zobaczyć Starówkę, Muzeum II Wojny Światowej, przejść się Molo w Sopocie.
        Interesuje nas lokalna kuchnia, szczególnie pierogi i ryby. Mamy samochód.
        Budżet standardowy. Nocleg już mamy zarezerwowany w centrum.`;

        // Act
        const result = service.validateNoteContent(content);

        // Assert
        expect(result).toBe(true);
      });

      it("should accept content with special characters and emojis", () => {
        // Arrange - notatka ze znakami specjalnymi
        const content =
          "Wakacje 🌴 w Barcelonie! Sagrada Família, Park Güell, Las Ramblas - to wszystko chcę odwiedzić! :)";

        // Act
        const result = service.validateNoteContent(content);

        // Assert
        expect(result).toBe(true);
      });

      it("should accept content with numbers and dates", () => {
        // Arrange - notatka z datami i liczbami
        const content =
          "Wyjazd 20-23.12.2025 do Zakopanego. 4 osoby, 3 noclegi, budżet 2000 zł. Chcemy pojeździć na nartach.";

        // Act
        const result = service.validateNoteContent(content);

        // Assert
        expect(result).toBe(true);
      });

      it("should handle content with leading and trailing whitespace", () => {
        // Arrange - 10 słów z whitespace na początku i końcu
        const content = "   Jadę do Paryża na trzy dni w przyszłym tygodniu koniecznie   \n\n";

        // Act
        const result = service.validateNoteContent(content);

        // Assert
        expect(result).toBe(true);
      });

      it("should handle multiline formatted content", () => {
        // Arrange - sformatowana notatka z listą
        const content = `
          Wycieczka do Wrocławia:
          - Zwiedzanie Ostrowa Tumskiego
          - Spacer po Rynku
          - Wizyta w ZOO
          - Obiad w restauracji regionalnej
        `;

        // Act
        const result = service.validateNoteContent(content);

        // Assert
        expect(result).toBe(true);
      });
    });

    /**
     * EDGE CASES: Nietypowe sytuacje, które mogą wystąpić
     */
    describe("edge cases", () => {
      it("should handle content with only punctuation between words", () => {
        // Arrange - 10 "słów" to znaki interpunkcyjne
        const content = "! @ # $ % ^ & * ( ) +";

        // Act
        const result = service.validateNoteContent(content);

        // Assert
        expect(result).toBe(true); // 11 "słów" oddzielonych spacjami
      });

      it("should count URLs as single words", () => {
        // Arrange - URL liczy się jako jedno słowo
        const content =
          "Rezerwacja https://booking.com/hotel nocleg trzy dni Kraków centrum czerwiec lipiec sierpień wakacje";

        // Act
        const result = service.validateNoteContent(content);

        // Assert
        expect(result).toBe(true); // 10 słów
      });

      it("should handle very long single word", () => {
        // Arrange - jedno bardzo długie "słowo"
        const content = "abcdefghijklmnopqrstuvwxyz0123456789 and nine more words to make ten total count here yes";

        // Act
        const result = service.validateNoteContent(content);

        // Assert
        expect(result).toBe(true);
      });

      it("should handle mixed language content", () => {
        // Arrange - mieszanka języków
        const content = "Trip to Paris avec mes amis for three days next week absolutely amazing";

        // Act
        const result = service.validateNoteContent(content);

        // Assert
        expect(result).toBe(true); // 12 słów
      });
    });
  });
});
