import { useState, useCallback } from "react";
import type { NoteDTO } from "@/types";

interface UseNoteActionsReturn {
  isDeleting: boolean;
  isCopying: boolean;
  isDeleteDialogOpen: boolean;
  deleteNote: () => Promise<boolean>;
  copyNote: () => Promise<string | null>;
  setIsDeleteDialogOpen: (open: boolean) => void;
  error: string | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
}

/**
 * Custom hook for note actions (delete, copy).
 * Manages action states and error handling.
 */
export function useNoteActions(noteId: string): UseNoteActionsReturn {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  return {
    isDeleting,
    isCopying,
    isDeleteDialogOpen,
    deleteNote,
    copyNote,
    setIsDeleteDialogOpen,
    error,
    setError,
  };
}
