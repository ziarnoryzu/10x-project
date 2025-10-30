import { useState, useEffect, useCallback } from "react";
import type { NoteWithPlan } from "@/types";

interface UseNoteWithPlanReturn {
  note: NoteWithPlan | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook for fetching a note with its optional travel plan.
 * Used in views that need both note and plan information (e.g., GeneratePlanModal).
 *
 * @param noteId - The ID of the note to fetch
 */
export function useNoteWithPlan(noteId: string): UseNoteWithPlanReturn {
  const [note, setNote] = useState<NoteWithPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNoteWithPlan = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch note details
      const noteResponse = await fetch(`/api/notes/${noteId}`);

      if (!noteResponse.ok) {
        if (noteResponse.status === 404) {
          throw new Error("Notatka nie została znaleziona");
        }
        throw new Error("Nie udało się pobrać notatki");
      }

      const noteData = await noteResponse.json();

      // Try to fetch travel plan (it may not exist)
      let travelPlan = null;
      const planResponse = await fetch(`/api/notes/${noteId}/travel-plan`);

      // Only parse travel plan if it exists (200 status)
      if (planResponse.ok) {
        travelPlan = await planResponse.json();
      }

      // Combine note and travel plan
      setNote({
        ...noteData,
        travel_plan: travelPlan,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Wystąpił nieoczekiwany błąd";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [noteId]);

  useEffect(() => {
    fetchNoteWithPlan();
  }, [fetchNoteWithPlan]);

  return {
    note,
    isLoading,
    error,
    refetch: fetchNoteWithPlan,
  };
}

