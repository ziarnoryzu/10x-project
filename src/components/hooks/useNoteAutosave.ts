import { useState, useCallback, useRef, useEffect } from "react";
import type { AutosaveStatusViewModel, UpdateNoteDTO, NoteWithPlanViewModel, NoteDTO } from "@/types";
import { formatRelativeTime, countWords } from "@/lib/utils/note.utils";

interface UseNoteAutosaveProps {
  noteId: string;
  setNote: React.Dispatch<React.SetStateAction<NoteWithPlanViewModel | null>>;
}

interface UseNoteAutosaveReturn {
  autosaveStatus: AutosaveStatusViewModel;
  error: string | null;
  updateNote: (changes: UpdateNoteDTO) => Promise<void>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
}

/**
 * Custom hook for note autosave with debouncing.
 * Accumulates changes and saves them after a delay.
 */
export function useNoteAutosave({ noteId, setNote }: UseNoteAutosaveProps): UseNoteAutosaveReturn {
  const [autosaveStatus, setAutosaveStatus] = useState<AutosaveStatusViewModel>("idle");
  const [error, setError] = useState<string | null>(null);

  // Refs
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedRef = useRef<string>("");
  const pendingChangesRef = useRef<UpdateNoteDTO>({});

  /**
   * Update note with debounced autosave
   * Accumulates changes when multiple edits happen in quick succession
   */
  const updateNote = useCallback(
    async (changes: UpdateNoteDTO) => {
      // Accumulate changes in ref (merge with pending changes)
      pendingChangesRef.current = {
        ...pendingChangesRef.current,
        ...changes,
      };

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

      // Clear pending save timeout (but keep accumulated changes in ref)
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      // Debounced save
      saveTimeoutRef.current = setTimeout(async () => {
        // Capture all accumulated changes
        const changesToSave = { ...pendingChangesRef.current };

        // Clear pending changes since we're saving them now
        pendingChangesRef.current = {};

        setAutosaveStatus("saving");
        setError(null);

        try {
          const response = await fetch(`/api/notes/${noteId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(changesToSave),
          });

          if (!response.ok) {
            throw new Error("Failed to update note");
          }

          const updatedNote: NoteDTO = await response.json();
          lastSavedRef.current = updatedNote.updated_at;

          setAutosaveStatus("success");

          // Sync with server response to ensure consistency (preserve travelPlan)
          setNote((prev) => {
            if (!prev) return null;
            const wordCount = countWords(updatedNote.content);
            return {
              ...prev,
              title: updatedNote.title,
              content: updatedNote.content,
              updatedAt: formatRelativeTime(updatedNote.updated_at),
              wordCount,
              isReadyForPlanGeneration: wordCount >= 10,
              // Preserve travelPlan as it's not part of the note update
              travelPlan: prev.travelPlan,
            };
          });

          // Reset to idle after showing success
          setTimeout(() => setAutosaveStatus("idle"), 2000);
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : "Failed to save";
          setError(errorMessage);
          setAutosaveStatus("error");
        }
      }, 1500); // 1.5 second debounce as per spec
    },
    [noteId, setNote]
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    autosaveStatus,
    error,
    updateNote,
    setError,
  };
}
