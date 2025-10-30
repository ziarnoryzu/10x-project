import { useState, useEffect, useCallback, useRef } from "react";
import type {
  NoteWithPlanViewModel,
  AutosaveStatusViewModel,
  UpdateNoteDTO,
  NoteDTO,
  TravelPlanDTO,
  TypedTravelPlan,
  TravelPlanContent,
  GenerationOptions,
} from "@/types";

interface UseNoteDetailReturn {
  note: NoteWithPlanViewModel | null;
  isLoading: boolean;
  error: string | null;
  autosaveStatus: AutosaveStatusViewModel;
  isDeleting: boolean;
  isCopying: boolean;
  isDeleteDialogOpen: boolean;
  updateNote: (changes: UpdateNoteDTO) => Promise<void>;
  deleteNote: () => Promise<boolean>;
  copyNote: () => Promise<string | null>;
  setIsDeleteDialogOpen: (open: boolean) => void;
  refetchPlan: () => Promise<void>;
}

/**
 * Format relative time from a date string
 */
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMinutes < 1) return "przed chwilą";
  if (diffMinutes === 1) return "minutę temu";
  if (diffMinutes < 60) return `${diffMinutes} minut temu`;
  if (diffHours === 1) return "godzinę temu";
  if (diffHours < 24) return `${diffHours} godzin temu`;
  if (diffDays === 1) return "wczoraj";
  if (diffDays < 7) return `${diffDays} dni temu`;

  return date.toLocaleDateString("pl-PL");
}

/**
 * Count words in text content
 */
function countWords(content: string | null): number {
  if (!content) return 0;
  return content
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length;
}

/**
 * Custom hook for managing note detail view state and operations.
 * Handles note fetching, autosave, actions (delete, copy), and plan management.
 */
export function useNoteDetail(noteId: string): UseNoteDetailReturn {
  // Main state
  const [note, setNote] = useState<NoteWithPlanViewModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autosaveStatus, setAutosaveStatus] = useState<AutosaveStatusViewModel>("idle");

  // Action states
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCopying, setIsCopying] = useState(false);

  // Modal states
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Refs
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedRef = useRef<string>("");

  /**
   * Fetch note and travel plan data
   */
  const fetchNoteData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch note
      const noteResponse = await fetch(`/api/notes/${noteId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!noteResponse.ok) {
        if (noteResponse.status === 404) {
          throw new Error("Note not found");
        }
        throw new Error("Failed to fetch note");
      }

      const noteData: NoteDTO = await noteResponse.json();

      // Fetch travel plan (may not exist)
      let travelPlan: TypedTravelPlan | null = null;
      try {
        const planResponse = await fetch(`/api/notes/${noteId}/travel-plan`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (planResponse.ok) {
          const planData: TravelPlanDTO = await planResponse.json();
          travelPlan = {
            ...planData,
            content: planData.content as TravelPlanContent,
          };
        }
      } catch {
        // Plan doesn't exist, which is fine
      }

      // Calculate computed properties
      const wordCount = countWords(noteData.content);
      const isReadyForPlanGeneration = wordCount >= 10;

      // Build view model
      const viewModel: NoteWithPlanViewModel = {
        id: noteData.id,
        title: noteData.title,
        content: noteData.content,
        createdAt: formatRelativeTime(noteData.created_at),
        updatedAt: formatRelativeTime(noteData.updated_at),
        travelPlan,
        wordCount,
        isReadyForPlanGeneration,
      };

      setNote(viewModel);
      lastSavedRef.current = noteData.updated_at;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [noteId]);

  /**
   * Refetch only the travel plan (after generation)
   */
  const refetchPlan = useCallback(async () => {
    if (!note) return;

    try {
      const planResponse = await fetch(`/api/notes/${noteId}/travel-plan`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      let travelPlan: TypedTravelPlan | null = null;
      if (planResponse.ok) {
        const planData: TravelPlanDTO = await planResponse.json();
        travelPlan = {
          ...planData,
          content: planData.content as TravelPlanContent,
        };
      }

      setNote((prev) => (prev ? { ...prev, travelPlan } : null));
    } catch {
      // Silently fail - plan might not exist yet
    }
  }, [noteId, note]);

  /**
   * Update note with debounced autosave
   */
  const updateNote = useCallback(
    async (changes: UpdateNoteDTO) => {
      if (!note) return;

      // Optimistic update
      setNote((prev) => {
        if (!prev) return null;
        const updatedContent = changes.content !== undefined ? changes.content : prev.content;
        const wordCount = countWords(updatedContent);
        return {
          ...prev,
          ...changes,
          wordCount,
          isReadyForPlanGeneration: wordCount >= 10,
        };
      });

      // Clear pending save
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      // Debounced save
      saveTimeoutRef.current = setTimeout(async () => {
        setAutosaveStatus("saving");
        setError(null);

        try {
          const response = await fetch(`/api/notes/${noteId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(changes),
          });

          if (!response.ok) {
            throw new Error("Failed to update note");
          }

          const updatedNote: NoteDTO = await response.json();
          lastSavedRef.current = updatedNote.updated_at;

          setAutosaveStatus("success");

          // Update updatedAt timestamp
          setNote((prev) =>
            prev
              ? {
                  ...prev,
                  updatedAt: formatRelativeTime(updatedNote.updated_at),
                }
              : null
          );

          // Reset to idle after showing success
          setTimeout(() => setAutosaveStatus("idle"), 2000);
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : "Failed to save";
          setError(errorMessage);
          setAutosaveStatus("error");
        }
      }, 1500); // 1.5 second debounce as per spec
    },
    [note, noteId]
  );

  /**
   * Delete note
   */
  const deleteNote = useCallback(async (): Promise<boolean> => {
    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Failed to delete note");
      }

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete note";
      setError(errorMessage);
      return false;
    } finally {
      setIsDeleting(false);
    }
  }, [noteId]);

  /**
   * Copy note
   */
  const copyNote = useCallback(async (): Promise<string | null> => {
    setIsCopying(true);
    setError(null);

    try {
      const response = await fetch(`/api/notes/${noteId}/copy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Failed to copy note");
      }

      const newNote: NoteDTO = await response.json();
      return newNote.id;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to copy note";
      setError(errorMessage);
      return null;
    } finally {
      setIsCopying(false);
    }
  }, [noteId]);

  // Fetch on mount
  useEffect(() => {
    fetchNoteData();
  }, [fetchNoteData]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    note,
    isLoading,
    error,
    autosaveStatus,
    isDeleting,
    isCopying,
    isDeleteDialogOpen,
    updateNote,
    deleteNote,
    copyNote,
    setIsDeleteDialogOpen,
    refetchPlan,
  };
}

