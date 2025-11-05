import { useState } from "react";
import type { GenerationOptions, TravelPlanDTO, TypedTravelPlan, TravelPlanContent, UpdatePlanRequest } from "@/types";

type GeneratePlanStatus = "idle" | "loading" | "success" | "error";

interface UseGeneratePlanReturn {
  status: GeneratePlanStatus;
  generatedPlan: TypedTravelPlan | null;
  error: string | null;
  generatePlan: (options: GenerationOptions) => Promise<void>;
  savePlan: () => void;
  reset: () => void;
}

const API_TIMEOUT = 60000; // 60 seconds

/**
 * Custom hook for managing travel plan generation workflow.
 * Handles API communication, state management, and error handling for the GeneratePlanModal.
 *
 * @param noteId - The ID of the note to generate a plan for
 * @param existingPlan - The existing travel plan (if any)
 * @param onSuccess - Callback function called after successful plan save
 */
export function useGeneratePlan(
  noteId: string,
  existingPlan: TravelPlanDTO | null,
  onSuccess: () => void
): UseGeneratePlanReturn {
  const [status, setStatus] = useState<GeneratePlanStatus>("idle");
  const [generatedPlan, setGeneratedPlan] = useState<TypedTravelPlan | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Creates a fetch request with timeout support.
   */
  const fetchWithTimeout = async (url: string, options: RequestInit, timeout: number): Promise<Response> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (err) {
      clearTimeout(timeoutId);
      if (err instanceof Error && err.name === "AbortError") {
        throw new Error("Przekroczono limit czasu oczekiwania. Spróbuj ponownie.");
      }
      throw err;
    }
  };

  /**
   * Validates and parses the travel plan content to ensure type safety.
   */
  const validatePlanContent = (content: unknown): TravelPlanContent => {
    try {
      const parsed = typeof content === "string" ? JSON.parse(content) : content;

      // Basic validation of required structure
      if (!parsed || typeof parsed !== "object") {
        throw new Error("Invalid plan structure");
      }

      if (!Array.isArray(parsed.days)) {
        throw new Error("Plan must contain days array");
      }

      if (typeof parsed.disclaimer !== "string") {
        throw new Error("Plan must contain disclaimer");
      }

      // Validate each day structure
      for (const day of parsed.days) {
        if (typeof day.day !== "number" || typeof day.title !== "string" || !day.activities) {
          throw new Error("Invalid day structure in plan");
        }

        // Optional date fields validation
        if (day.date !== undefined && typeof day.date !== "string") {
          throw new Error("Invalid date format in plan");
        }
        if (day.dayOfWeek !== undefined && typeof day.dayOfWeek !== "string") {
          throw new Error("Invalid dayOfWeek format in plan");
        }

        // Validate activities structure - fields are optional (for partial days)
        // but if present, must be arrays
        const { morning, afternoon, evening } = day.activities;
        if (morning !== undefined && !Array.isArray(morning)) {
          throw new Error("Invalid morning activities in plan");
        }
        if (afternoon !== undefined && !Array.isArray(afternoon)) {
          throw new Error("Invalid afternoon activities in plan");
        }
        if (evening !== undefined && !Array.isArray(evening)) {
          throw new Error("Invalid evening activities in plan");
        }
      }

      return parsed as TravelPlanContent;
    } catch {
      throw new Error("Otrzymano plan w nieprawidłowym formacie");
    }
  };

  /**
   * Generates or regenerates a travel plan with the given options.
   * Automatically determines whether to use POST (new) or PUT (update) based on existingPlan.
   */
  const generatePlan = async (options: GenerationOptions): Promise<void> => {
    try {
      setStatus("loading");
      setError(null);

      // Determine endpoint and method
      const isUpdate = existingPlan !== null;
      const endpoint = isUpdate ? `/api/notes/${noteId}/travel-plan` : `/api/notes/${noteId}/generate-plan`;
      const method = isUpdate ? "PUT" : "POST";

      // Prepare request body
      const body = isUpdate ? ({ confirm: true, options } satisfies UpdatePlanRequest) : { options };

      // Make API request with timeout
      const response = await fetchWithTimeout(
        endpoint,
        {
          method,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        },
        API_TIMEOUT
      );

      // Handle non-OK responses
      if (!response.ok) {
        let errorMessage = "Nie udało się wygenerować planu podróży.";

        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch {
          // If we can't parse error JSON, use default message
        }

        throw new Error(errorMessage);
      }

      // Parse and validate response
      const responseData = await response.json();

      // Extract travel plan from response (handle both wrapped and direct responses)
      const planData: TravelPlanDTO = responseData.travel_plan || responseData;

      // Validate content structure
      const validatedContent = validatePlanContent(planData.content);

      // Create typed plan
      const typedPlan: TypedTravelPlan = {
        ...planData,
        content: validatedContent,
      };

      setGeneratedPlan(typedPlan);
      setStatus("success");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Wystąpił nieoczekiwany błąd. Spróbuj ponownie.";
      setError(errorMessage);
      setStatus("error");
      throw err;
    }
  };

  /**
   * Saves the generated plan and calls the success callback.
   * This is called when user clicks "Save to my trips" button.
   */
  const savePlan = (): void => {
    // Call success callback to refresh parent component
    onSuccess();

    // Reset state
    setStatus("idle");
    setGeneratedPlan(null);
    setError(null);
  };

  /**
   * Resets the hook state back to idle.
   * Used when user wants to retry after an error.
   */
  const reset = (): void => {
    setStatus("idle");
    setGeneratedPlan(null);
    setError(null);
  };

  return {
    status,
    generatedPlan,
    error,
    generatePlan,
    savePlan,
    reset,
  };
}
