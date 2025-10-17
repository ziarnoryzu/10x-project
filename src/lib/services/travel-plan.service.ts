// src/lib/services/travel-plan.service.ts

import type { Json } from "../../db/database.types";
import type { TravelPlanOptions } from "../../types";

/**
 * Service responsible for generating travel plans from notes
 */
export class TravelPlanService {
  /**
   * Validates that the note content meets minimum requirements
   * @param content - The note content to validate
   * @returns true if valid, false otherwise
   */
  validateNoteContent(content: string | null): boolean {
    if (!content) {
      return false;
    }

    // Count words (split by whitespace and filter empty strings)
    const words = content
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0);
    return words.length >= 10;
  }

  /**
   * Generates a travel plan based on note content and optional personalization options
   * @param noteContent - The content of the travel note
   * @param options - Optional personalization options
   * @returns Generated travel plan as structured JSON
   */
  async generatePlan(noteContent: string, options?: TravelPlanOptions): Promise<Json> {
    // TODO: Implement actual AI-based plan generation
    // For now, return a structured mock response

    const plan = {
      version: "1.0",
      generated_at: new Date().toISOString(),
      personalization: options || null,
      itinerary: {
        overview: `Travel plan generated from note content`,
        days: [],
        recommendations: [],
      },
      metadata: {
        source_length: noteContent.length,
        word_count: noteContent.trim().split(/\s+/).length,
      },
    };

    return plan as Json;
  }
}

// Export a singleton instance
export const travelPlanService = new TravelPlanService();
