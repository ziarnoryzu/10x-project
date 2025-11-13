import { useEffect } from "react";
import type { NoteWithPlanViewModel, AutosaveStatusViewModel, UpdateNoteDTO } from "@/types";
import { useNoteFetch } from "./useNoteFetch";
import { useNoteAutosave } from "./useNoteAutosave";
import { useNoteActions } from "./useNoteActions";

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
 * Custom hook for managing note detail view state and operations.
 * Handles note fetching, autosave, actions (delete, copy), and plan management.
 *
 * This hook composes three specialized hooks:
 * - useNoteFetch: handles data fetching and plan refetching
 * - useNoteAutosave: handles autosave with debouncing
 * - useNoteActions: handles delete and copy operations
 */
export function useNoteDetail(noteId: string): UseNoteDetailReturn {
  // Fetch note and travel plan
  const { note, isLoading, error: fetchError, refetchPlan, setNote } = useNoteFetch(noteId);

  // Autosave functionality
  const {
    autosaveStatus,
    error: autosaveError,
    updateNote,
    setError: setAutosaveError,
  } = useNoteAutosave({ noteId, setNote });

  // Note actions (delete, copy)
  const {
    isDeleting,
    isCopying,
    isDeleteDialogOpen,
    deleteNote,
    copyNote,
    setIsDeleteDialogOpen,
    error: actionsError,
    setError: setActionsError,
  } = useNoteActions(noteId);

  // Merge errors from different hooks
  const error = fetchError || autosaveError || actionsError;

  // Sync errors across hooks
  useEffect(() => {
    if (fetchError) {
      setAutosaveError(fetchError);
      setActionsError(fetchError);
    }
  }, [fetchError, setAutosaveError, setActionsError]);

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
