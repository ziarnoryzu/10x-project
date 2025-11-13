import { Button } from "@/components/ui/button";

interface NoteDetailErrorStateProps {
  error: string;
  onRetry: () => void;
  onBack: () => void;
}

/**
 * Error state component for the note detail view.
 * Displays an error message with retry and back navigation options.
 */
export function NoteDetailErrorState({ error, onRetry, onBack }: NoteDetailErrorStateProps) {
  return (
    <div className="container mx-auto max-w-4xl p-6">
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="w-16 h-16 mb-6 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
          <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <Button onClick={onRetry} variant="default">
            Spróbuj ponownie
          </Button>
          <Button onClick={onBack} variant="outline">
            Powrót do listy
          </Button>
        </div>
      </div>
    </div>
  );
}
