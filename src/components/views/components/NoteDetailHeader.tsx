import { Button } from "@/components/ui/button";

interface NoteDetailHeaderProps {
  createdAt: string;
  updatedAt: string;
  onBackClick: () => void;
}

/**
 * Header component for the note detail view.
 * Displays back button and metadata (creation/modification dates).
 */
export function NoteDetailHeader({ createdAt, updatedAt, onBackClick }: NoteDetailHeaderProps) {
  return (
    <>
      {/* Back button */}
      <div>
        <Button
          variant="ghost"
          onClick={onBackClick}
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
          <span>Utworzono: {createdAt}</span>
          <span className="hidden sm:inline">•</span>
          <span>Ostatnia modyfikacja: {updatedAt}</span>
        </p>
      </div>
    </>
  );
}
