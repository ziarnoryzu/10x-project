import type { TravelDay } from "@/types";

/**
 * Price category configuration with translations and styling.
 */
export const PRICE_CATEGORIES = {
  free: {
    pl: "Bezpłatne",
    color:
      "bg-green-100 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800",
  },
  budget: {
    pl: "Ekonomiczne",
    color:
      "bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
  },
  moderate: {
    pl: "Umiarkowane",
    color:
      "bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800",
  },
  expensive: {
    pl: "Drogie",
    color:
      "bg-purple-100 text-purple-700 border border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800",
  },
} as const;

/**
 * Translate price category from English (used by AI) to Polish (displayed to user).
 */
export function translatePriceCategory(category: string): string {
  const lowerCategory = category.toLowerCase() as keyof typeof PRICE_CATEGORIES;

  if (lowerCategory in PRICE_CATEGORIES) {
    return PRICE_CATEGORIES[lowerCategory].pl;
  }

  return category; // Fallback to original if unknown
}

/**
 * Get color classes for price category badge based on price range.
 */
export function getPriceCategoryColor(category: string): string {
  const lowerCategory = category.toLowerCase() as keyof typeof PRICE_CATEGORIES;

  if (lowerCategory in PRICE_CATEGORIES) {
    return PRICE_CATEGORIES[lowerCategory].color;
  }

  // Default to moderate if category not recognized
  return PRICE_CATEGORIES.moderate.color;
}

/**
 * Format day header with date and day of week if available.
 * Falls back to "Dzień X" format if dates are not specified.
 */
export function formatDayHeader(day: TravelDay): string {
  if (day.date && day.dayOfWeek) {
    // Format: "Piątek, 15 listopada 2025"
    const dateObj = new Date(day.date + "T00:00:00"); // Add time to avoid timezone issues
    const formatted = dateObj.toLocaleDateString("pl-PL", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    return `${day.dayOfWeek}, ${formatted}`;
  }
  // Fallback: "Dzień 1", "Dzień 2", etc.
  return `Dzień ${day.day}`;
}
