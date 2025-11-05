import { memo } from "react";
import { Button } from "./ui/button";

interface EmptyStateProps {
  onCreateNote: () => void;
  isCreating?: boolean;
}

/**
 * EmptyState - Component displayed when user has no notes yet
 * Encourages user to create their first note
 * Memoized for performance optimization
 */
export const EmptyState = memo(function EmptyState({ onCreateNote, isCreating = false }: EmptyStateProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center sm:p-12">
      <svg
        className="mx-auto mb-4 h-20 w-20 text-gray-400 sm:h-24 sm:w-24"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
      <h2 className="mb-2 text-lg font-semibold text-gray-900 sm:text-xl">Nie masz jeszcze żadnych notatek</h2>
      <p className="mb-6 text-sm text-gray-600 sm:text-base">
        Stwórz swoją pierwszą notatkę podróży, aby rozpocząć planowanie
      </p>
      <Button
        onClick={onCreateNote}
        disabled={isCreating}
        size="lg"
        className="w-full sm:w-auto"
        data-test-id="create-first-note-button"
      >
        {isCreating ? "Tworzenie..." : "Stwórz pierwszą notatkę"}
      </Button>
    </div>
  );
});
