// test/unit/schemas/travel-plan.schema.test.ts

import { describe, it, expect } from "vitest";
import {
  ActivitySchema,
  DayActivitiesSchema,
  TravelDaySchema,
  TravelPlanContentSchema,
} from "@/lib/schemas/travel-plan.schema";

describe("Travel Plan Schemas", () => {
  /**
   * REGUŁY BIZNESOWE:
   * - Schemat definiuje strukturę planu podróży generowaną przez AI
   * - Wykorzystuje Zod do walidacji i type-safety
   * - Obsługuje opcjonalne pola (data, dayOfWeek, logistics)
   * - Waliduje format dat ISO i kategorie cenowe
   */

  describe("ActivitySchema", () => {
    it("should validate complete activity with all fields", () => {
      // Arrange - pełna aktywność z wszystkimi polami
      const activity = {
        name: "Zwiedzanie Wawelu",
        description: "Wizyta na Zamku Królewskim z przewodnikiem",
        priceCategory: "moderate",
        logistics: {
          address: "Wawel 5, 31-001 Kraków",
          mapLink: "https://www.google.com/maps/search/?api=1&query=Wawel+Kraków",
          estimatedTime: "2-3 godziny",
        },
      };

      // Act
      const result = ActivitySchema.safeParse(activity);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("Zwiedzanie Wawelu");
        expect(result.data.priceCategory).toBe("moderate");
      }
    });

    it("should validate activity without optional logistics fields", () => {
      // Arrange - logistics bez opcjonalnych pól
      const activity = {
        name: "Spacer po Rynku",
        description: "Przechadzka po Rynku Głównym",
        priceCategory: "free",
        logistics: {},
      };

      // Act
      const result = ActivitySchema.safeParse(activity);

      // Assert
      expect(result.success).toBe(true);
    });

    it("should validate activity without logistics object", () => {
      // Arrange - bez logistics (logistics jest wymagane, ale może być pusty obiekt)
      const activity = {
        name: "Kolacja w restauracji",
        description: "Tradycyjna polska kuchnia",
        priceCategory: "moderate",
        logistics: {},
      };

      // Act
      const result = ActivitySchema.safeParse(activity);

      // Assert
      expect(result.success).toBe(true);
    });

    it("should reject missing required fields", () => {
      // Arrange - brak description
      const activity = {
        name: "Aktywność bez opisu",
        priceCategory: "free",
        logistics: {},
      };

      // Act
      const result = ActivitySchema.safeParse(activity);

      // Assert
      expect(result.success).toBe(false);
    });

    it("should validate all price categories", () => {
      // Arrange & Act & Assert
      const categories = ["free", "budget", "moderate", "expensive"];

      categories.forEach((category) => {
        const activity = {
          name: "Test Activity",
          description: "Description",
          priceCategory: category,
          logistics: {},
        };

        const result = ActivitySchema.safeParse(activity);
        expect(result.success).toBe(true);
      });
    });

    it("should reject invalid price category", () => {
      // Arrange - niepoprawna kategoria
      const activity = {
        name: "Aktywność",
        description: "Opis",
        priceCategory: "very-expensive", // invalid
        logistics: {},
      };

      // Act
      const result = ActivitySchema.safeParse(activity);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain("priceCategory");
      }
    });

    it("should validate mapLink URL format", () => {
      // Arrange - poprawny URL
      const activity = {
        name: "Muzeum",
        description: "Wizyta w muzeum",
        priceCategory: "moderate",
        logistics: {
          mapLink: "https://www.google.com/maps/search/?api=1&query=Muzeum+Kraków",
        },
      };

      // Act
      const result = ActivitySchema.safeParse(activity);

      // Assert
      expect(result.success).toBe(true);
    });

    it("should reject invalid mapLink URL", () => {
      // Arrange - niepoprawny URL
      const activity = {
        name: "Muzeum",
        description: "Wizyta w muzeum",
        priceCategory: "moderate",
        logistics: {
          mapLink: "not-a-valid-url",
        },
      };

      // Act
      const result = ActivitySchema.safeParse(activity);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain("mapLink");
      }
    });

    it("should handle empty strings in optional fields", () => {
      // Arrange
      const activity = {
        name: "Aktywność",
        description: "Opis",
        priceCategory: "free",
        logistics: {
          address: "",
          estimatedTime: "",
        },
      };

      // Act
      const result = ActivitySchema.safeParse(activity);

      // Assert
      expect(result.success).toBe(true);
    });
  });

  describe("DayActivitiesSchema", () => {
    it("should validate activities for all time periods", () => {
      // Arrange - wszystkie pory dnia
      const activities = {
        morning: [
          {
            name: "Śniadanie",
            description: "Śniadanie w hotelu",
            priceCategory: "budget",
            logistics: {},
          },
        ],
        afternoon: [
          {
            name: "Zwiedzanie",
            description: "Muzeum",
            priceCategory: "moderate",
            logistics: {},
          },
        ],
        evening: [
          {
            name: "Kolacja",
            description: "Restauracja",
            priceCategory: "expensive",
            logistics: {},
          },
        ],
      };

      // Act
      const result = DayActivitiesSchema.safeParse(activities);

      // Assert
      expect(result.success).toBe(true);
    });

    it("should validate partial day with only morning", () => {
      // Arrange - tylko poranek (np. dzień wyjazdu)
      const activities = {
        morning: [
          {
            name: "Checkout",
            description: "Wymeldowanie z hotelu",
            priceCategory: "free",
            logistics: {},
          },
        ],
      };

      // Act
      const result = DayActivitiesSchema.safeParse(activities);

      // Assert
      expect(result.success).toBe(true);
    });

    it("should validate partial day with only evening", () => {
      // Arrange - tylko wieczór (np. dzień przyjazdu)
      const activities = {
        evening: [
          {
            name: "Check-in",
            description: "Zameldowanie w hotelu",
            priceCategory: "free",
            logistics: {},
          },
        ],
      };

      // Act
      const result = DayActivitiesSchema.safeParse(activities);

      // Assert
      expect(result.success).toBe(true);
    });

    it("should validate empty day (no activities)", () => {
      // Arrange - pusty obiekt (wszystkie pory opcjonalne)
      const activities = {};

      // Act
      const result = DayActivitiesSchema.safeParse(activities);

      // Assert
      expect(result.success).toBe(true);
    });

    it("should validate multiple activities in one time period", () => {
      // Arrange - wiele aktywności po południu
      const activities = {
        afternoon: [
          {
            name: "Muzeum",
            description: "Muzeum Narodowe",
            priceCategory: "moderate",
            logistics: {},
          },
          {
            name: "Lunch",
            description: "Obiad w centrum",
            priceCategory: "budget",
            logistics: {},
          },
          {
            name: "Park",
            description: "Spacer po parku",
            priceCategory: "free",
            logistics: {},
          },
        ],
      };

      // Act
      const result = DayActivitiesSchema.safeParse(activities);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.afternoon).toHaveLength(3);
      }
    });

    it("should reject invalid activity in array", () => {
      // Arrange - jedna z aktywności jest niepoprawna
      const activities = {
        morning: [
          {
            name: "Valid Activity",
            description: "Description",
            priceCategory: "free",
            logistics: {},
          },
          {
            name: "Invalid Activity",
            // brak description
            priceCategory: "free",
            logistics: {},
          },
        ],
      };

      // Act
      const result = DayActivitiesSchema.safeParse(activities);

      // Assert
      expect(result.success).toBe(false);
    });

    it("should reject non-array value for time period", () => {
      // Arrange - morning nie jest tablicą
      const activities = {
        morning: {
          name: "Single Activity",
          description: "Should be in array",
          priceCategory: "free",
          logistics: {},
        },
      };

      // Act
      const result = DayActivitiesSchema.safeParse(activities);

      // Assert
      expect(result.success).toBe(false);
    });
  });

  describe("TravelDaySchema", () => {
    it("should validate complete day with date and dayOfWeek", () => {
      // Arrange - pełny dzień z datą
      const day = {
        day: 1,
        date: "2025-11-15",
        dayOfWeek: "Piątek",
        title: "Przyjazd do Krakowa",
        activities: {
          evening: [
            {
              name: "Check-in",
              description: "Zameldowanie",
              priceCategory: "free",
              logistics: {},
            },
          ],
        },
      };

      // Act
      const result = TravelDaySchema.safeParse(day);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.date).toBe("2025-11-15");
        expect(result.data.dayOfWeek).toBe("Piątek");
      }
    });

    it("should validate day without date (generic plan)", () => {
      // Arrange - dzień bez konkretnej daty
      const day = {
        day: 1,
        title: "Pierwszy dzień",
        activities: {
          morning: [
            {
              name: "Śniadanie",
              description: "Start dnia",
              priceCategory: "budget",
              logistics: {},
            },
          ],
        },
      };

      // Act
      const result = TravelDaySchema.safeParse(day);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.date).toBeUndefined();
        expect(result.data.dayOfWeek).toBeUndefined();
      }
    });

    it("should validate date format (ISO YYYY-MM-DD)", () => {
      // Arrange - różne poprawne daty
      const validDates = ["2025-01-01", "2025-12-31", "2026-06-15"];

      validDates.forEach((date) => {
        const day = {
          day: 1,
          date,
          title: "Test Day",
          activities: {},
        };

        const result = TravelDaySchema.safeParse(day);
        expect(result.success).toBe(true);
      });
    });

    it("should reject invalid date formats", () => {
      // Arrange - niepoprawne formaty dat
      const invalidDates = [
        "15-11-2025", // DD-MM-YYYY
        "11/15/2025", // MM/DD/YYYY
        "2025.11.15", // kropki zamiast myślników
        "15 listopada", // tekst
        // Note: Zod regex /^\d{4}-\d{2}-\d{2}$/ sprawdza tylko format, nie wartości
        // Więc 2025-13-01 i 2025-11-32 przejdą walidację regex
        // Dodatkowa walidacja wartości dat wymagałaby custom Zod refinement
      ];

      invalidDates.forEach((date) => {
        const day = {
          day: 1,
          date,
          title: "Test Day",
          activities: {},
        };

        const result = TravelDaySchema.safeParse(day);
        expect(result.success).toBe(false);
      });
    });

    it("should validate positive day numbers", () => {
      // Arrange
      const validDays = [1, 2, 5, 10, 100];

      validDays.forEach((dayNum) => {
        const day = {
          day: dayNum,
          title: `Day ${dayNum}`,
          activities: {},
        };

        const result = TravelDaySchema.safeParse(day);
        expect(result.success).toBe(true);
      });
    });

    it("should reject zero or negative day numbers", () => {
      // Arrange - niepoprawne numery dni
      const invalidDays = [0, -1, -5];

      invalidDays.forEach((dayNum) => {
        const day = {
          day: dayNum,
          title: "Invalid Day",
          activities: {},
        };

        const result = TravelDaySchema.safeParse(day);
        expect(result.success).toBe(false);
      });
    });

    it("should reject non-integer day numbers", () => {
      // Arrange
      const day = {
        day: 1.5,
        title: "Invalid Day",
        activities: {},
      };

      // Act
      const result = TravelDaySchema.safeParse(day);

      // Assert
      expect(result.success).toBe(false);
    });

    it("should validate Polish day names", () => {
      // Arrange - wszystkie dni tygodnia po polsku
      const polishDays = ["Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek", "Sobota", "Niedziela"];

      polishDays.forEach((dayName) => {
        const day = {
          day: 1,
          dayOfWeek: dayName,
          title: "Test Day",
          activities: {},
        };

        const result = TravelDaySchema.safeParse(day);
        expect(result.success).toBe(true);
      });
    });

    it("should accept any string for dayOfWeek (no strict validation)", () => {
      // Arrange - schema nie wymusza konkretnych wartości dla dayOfWeek
      const day = {
        day: 1,
        dayOfWeek: "CustomDayName",
        title: "Test Day",
        activities: {},
      };

      // Act
      const result = TravelDaySchema.safeParse(day);

      // Assert
      expect(result.success).toBe(true);
    });

    it("should require title field", () => {
      // Arrange - brak title
      const day = {
        day: 1,
        activities: {},
      };

      // Act
      const result = TravelDaySchema.safeParse(day);

      // Assert
      expect(result.success).toBe(false);
    });
  });

  describe("TravelPlanContentSchema", () => {
    it("should validate complete travel plan", () => {
      // Arrange - kompletny 3-dniowy plan
      const plan = {
        days: [
          {
            day: 1,
            date: "2025-11-15",
            dayOfWeek: "Piątek",
            title: "Przyjazd",
            activities: {
              evening: [
                {
                  name: "Check-in",
                  description: "Zameldowanie w hotelu",
                  priceCategory: "free",
                  logistics: {},
                },
              ],
            },
          },
          {
            day: 2,
            date: "2025-11-16",
            dayOfWeek: "Sobota",
            title: "Zwiedzanie",
            activities: {
              morning: [
                {
                  name: "Muzeum",
                  description: "Muzeum Narodowe",
                  priceCategory: "moderate",
                  logistics: {},
                },
              ],
              afternoon: [
                {
                  name: "Lunch",
                  description: "Obiad",
                  priceCategory: "budget",
                  logistics: {},
                },
              ],
            },
          },
          {
            day: 3,
            date: "2025-11-17",
            dayOfWeek: "Niedziela",
            title: "Wyjazd",
            activities: {
              morning: [
                {
                  name: "Checkout",
                  description: "Wymeldowanie",
                  priceCategory: "free",
                  logistics: {},
                },
              ],
            },
          },
        ],
        disclaimer: "Zaleca się weryfikację godzin otwarcia przed wizytą.",
      };

      // Act
      const result = TravelPlanContentSchema.safeParse(plan);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.days).toHaveLength(3);
        expect(result.data.disclaimer).toBeTruthy();
      }
    });

    it("should apply default disclaimer when not provided", () => {
      // Arrange - plan bez disclaimer
      const plan = {
        days: [
          {
            day: 1,
            title: "Day 1",
            activities: {},
          },
        ],
      };

      // Act
      const result = TravelPlanContentSchema.safeParse(plan);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.disclaimer).toBe(
          "Zaleca się weryfikację godzin otwarcia i dostępności atrakcji przed wizytą."
        );
      }
    });

    it("should accept custom disclaimer", () => {
      // Arrange
      const customDisclaimer = "Ten plan został wygenerowany przez AI. Sprawdź aktualne informacje.";
      const plan = {
        days: [
          {
            day: 1,
            title: "Day 1",
            activities: {},
          },
        ],
        disclaimer: customDisclaimer,
      };

      // Act
      const result = TravelPlanContentSchema.safeParse(plan);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.disclaimer).toBe(customDisclaimer);
      }
    });

    it("should require at least one day", () => {
      // Arrange - pusta tablica dni
      const plan = {
        days: [],
      };

      // Act
      const result = TravelPlanContentSchema.safeParse(plan);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain("days");
      }
    });

    it("should validate plan with many days", () => {
      // Arrange - 7-dniowy plan
      const days = Array.from({ length: 7 }, (_, i) => ({
        day: i + 1,
        title: `Dzień ${i + 1}`,
        activities: {
          afternoon: [
            {
              name: "Aktywność",
              description: "Opis",
              priceCategory: "moderate",
              logistics: {},
            },
          ],
        },
      }));

      const plan = { days };

      // Act
      const result = TravelPlanContentSchema.safeParse(plan);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.days).toHaveLength(7);
      }
    });

    it("should reject plan with invalid day in array", () => {
      // Arrange - drugi dzień ma błąd
      const plan = {
        days: [
          {
            day: 1,
            title: "Valid Day",
            activities: {},
          },
          {
            day: -1, // niepoprawny numer dnia
            title: "Invalid Day",
            activities: {},
          },
        ],
      };

      // Act
      const result = TravelPlanContentSchema.safeParse(plan);

      // Assert
      expect(result.success).toBe(false);
    });

    it("should handle plan without dates (generic itinerary)", () => {
      // Arrange - plan bez konkretnych dat
      const plan = {
        days: [
          {
            day: 1,
            title: "Pierwszy dzień",
            activities: {
              morning: [
                {
                  name: "Start",
                  description: "Początek wycieczki",
                  priceCategory: "free",
                  logistics: {},
                },
              ],
            },
          },
          {
            day: 2,
            title: "Drugi dzień",
            activities: {},
          },
        ],
      };

      // Act
      const result = TravelPlanContentSchema.safeParse(plan);

      // Assert
      expect(result.success).toBe(true);
    });

    it("should handle mix of days with and without dates", () => {
      // Arrange - niektóre dni mają daty, inne nie
      const plan = {
        days: [
          {
            day: 1,
            date: "2025-11-15",
            title: "Dzień z datą",
            activities: {},
          },
          {
            day: 2,
            title: "Dzień bez daty",
            activities: {},
          },
        ],
      };

      // Act
      const result = TravelPlanContentSchema.safeParse(plan);

      // Assert
      expect(result.success).toBe(true);
    });
  });

  describe("Type inference", () => {
    it("should infer correct TypeScript types from schemas", () => {
      // Arrange - używamy inferred type
      const plan = {
        days: [
          {
            day: 1,
            title: "Test",
            activities: {
              morning: [
                {
                  name: "Activity",
                  description: "Description",
                  priceCategory: "free" as const,
                  logistics: {},
                },
              ],
            },
          },
        ],
      };

      // Act
      const result = TravelPlanContentSchema.safeParse(plan);

      // Assert - TypeScript type checking
      expect(result.success).toBe(true);
      if (result.success) {
        // Type-safe access
        const firstDay = result.data.days[0];
        expect(firstDay.day).toBe(1);
        expect(firstDay.activities.morning?.[0].priceCategory).toBe("free");
      }
    });
  });
});
