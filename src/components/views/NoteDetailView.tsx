import { useEffect, useState } from "react";
import { useNoteDetail } from "@/components/hooks/useNoteDetail";
import { useNoteWithPlan } from "@/components/hooks/useNoteWithPlan";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GeneratePlanModal } from "@/components/travel-plan/GeneratePlanModal";
import { NoteEditor } from "@/components/note-detail/NoteEditor";
import { NoteActions } from "@/components/note-detail/NoteActions";
import { TravelPlanView } from "@/components/note-detail/TravelPlanView";
import { toast } from "sonner";
import { navigate, reload, Routes, getReturnUrl, getQueryParam } from "@/lib/services/navigation.service";
import type { NoteEditorViewModel, UpdateNoteDTO } from "@/types";

interface NoteDetailViewProps {
  noteId: string;
}

export default function NoteDetailView({ noteId }: NoteDetailViewProps) {
  // Use the new unified hook
  const {
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
  } = useNoteDetail(noteId);

  // Still need noteWithPlan for GeneratePlanModal
  const { note: noteWithPlan, refetch: refetchNoteWithPlan } = useNoteWithPlan(noteId);
  const [showGeneratePlanModal, setShowGeneratePlanModal] = useState(false);

  // Get return URL using navigation service
  const returnUrl = getReturnUrl();

  // Handle note not found or error
  useEffect(() => {
    if (error === "Note not found") {
      toast.error("Nie znaleziono notatki");
      navigate(returnUrl, { delay: 2000 });
    } else if (error && autosaveStatus !== "error") {
      // Show toast for errors other than autosave errors (which are shown inline)
      toast.error(error);
    }
  }, [error, autosaveStatus, returnUrl]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="container mx-auto max-w-4xl p-6">
        <div className="animate-pulse space-y-6">
          <div className="flex items-center justify-between">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
            <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
          <div className="flex gap-3">
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state with retry option
  if (error && !note) {
    return (
      <div className="container mx-auto max-w-4xl p-6">
        <div className="flex flex-col items-center justify-center py-12 px-4">
          <div className="w-16 h-16 mb-6 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-red-600 dark:text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Wystąpił błąd</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center max-w-md mb-6">
            {error === "Failed to fetch note"
              ? "Nie udało się pobrać notatki. Sprawdź połączenie z internetem i spróbuj ponownie."
              : error}
          </p>

          <div className="flex gap-3">
            <Button onClick={() => reload()} variant="default">
              Spróbuj ponownie
            </Button>
            <Button onClick={() => navigate(returnUrl)} variant="outline">
              Powrót do listy
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!note) {
    return null;
  }

  // Handle note field changes
  const handleNoteChange = (field: "title" | "content", value: string) => {
    const updates: UpdateNoteDTO = { [field]: value };
    updateNote(updates);
  };

  // Handle copy
  const handleCopy = async () => {
    const newNoteId = await copyNote();

    if (newNoteId) {
      toast.success("Notatka została skopiowana");

      // Preserve returnPage parameter when navigating to the copied note
      const returnPage = getQueryParam("returnPage");
      const newNoteUrl = Routes.notes.detail(newNoteId, returnPage ? parseInt(returnPage, 10) : undefined);

      await navigate(newNoteUrl, { delay: 1000 });
    } else {
      toast.error("Nie udało się skopiować notatki");
    }
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    const success = await deleteNote();

    if (success) {
      toast.success("Notatka została usunięta");
      setIsDeleteDialogOpen(false);
      await navigate(returnUrl, { delay: 1000 });
    } else {
      toast.error("Nie udało się usunąć notatki");
    }
  };

  // Handle generate plan
  const handleGeneratePlan = () => {
    setShowGeneratePlanModal(true);
  };

  // Handle successful plan generation
  const handlePlanGenerationSuccess = () => {
    // Refetch plan in both hooks
    refetchPlan();
    refetchNoteWithPlan();
    toast.success("Plan podróży został zapisany");
  };

  // Build NoteEditorViewModel
  const editorViewModel: NoteEditorViewModel = {
    title: note.title,
    content: note.content,
    status: autosaveStatus,
    lastSavedTimestamp: note.updatedAt,
  };

  return (
    <div className="container mx-auto max-w-4xl p-4 md:p-6">
      <div className="space-y-6">
        {/* Back button */}
        <div>
          <Button
            variant="ghost"
            onClick={() => navigate(returnUrl)}
            className="mb-2"
            aria-label="Powrót do listy notatek"
            data-test-id="back-to-list-button"
          >
            ← Powrót do listy notatek
          </Button>
        </div>

        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100">Edytuj notatkę</h1>
          <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mt-1 flex flex-col sm:flex-row sm:gap-2">
            <span>Utworzono: {note.createdAt}</span>
            <span className="hidden sm:inline">•</span>
            <span>Ostatnia modyfikacja: {note.updatedAt}</span>
          </p>
        </div>

        {/* Note Editor */}
        <NoteEditor note={editorViewModel} wordCount={note.wordCount} onNoteChange={handleNoteChange} />

        {/* Action Buttons */}
        <NoteActions
          isReadyForPlanGeneration={note.isReadyForPlanGeneration}
          hasTravelPlan={note.travelPlan !== null}
          isCopying={isCopying}
          onGenerateClick={handleGeneratePlan}
          onCopyClick={handleCopy}
          onDeleteClick={() => setIsDeleteDialogOpen(true)}
        />

        {/* Travel Plan View (if exists) */}
        {note.travelPlan && (
          <div className="mt-8">
            <TravelPlanView plan={note.travelPlan} />
          </div>
        )}
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Czy na pewno chcesz usunąć tę notatkę?</DialogTitle>
            <DialogDescription>Ta akcja jest nieodwracalna. Notatka zostanie trwale usunięta.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isDeleting}>
              Anuluj
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={isDeleting}>
              {isDeleting ? "Usuwanie..." : "Usuń"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Generate plan modal */}
      {noteWithPlan && (
        <GeneratePlanModal
          note={noteWithPlan}
          isOpen={showGeneratePlanModal}
          onOpenChange={setShowGeneratePlanModal}
          onSuccess={handlePlanGenerationSuccess}
        />
      )}
    </div>
  );
}
