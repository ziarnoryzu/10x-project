import { memo } from "react";
import type { NoteListItemViewModel } from "../types";

interface NoteListItemProps {
  note: NoteListItemViewModel;
  currentPage: number;
  onClick?: () => void;
}

/**
 * NoteListItem - Component for displaying a single note in the list
 * Implements full accessibility with ARIA attributes and keyboard navigation
 * Receives pre-formatted data from the ViewModel
 * Memoized to prevent unnecessary re-renders
 */
export const NoteListItem = memo<NoteListItemProps>(function NoteListItem({ note, currentPage, onClick }) {
  // Generate href with returnPage parameter
  const href = `${note.href}?returnPage=${currentPage}`;

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      window.location.href = href;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div
      className="cursor-pointer rounded-lg border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:p-6"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="link"
      tabIndex={0}
      aria-label={`Otwórz notatkę: ${note.title}`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-0">
        <div className="flex-1 min-w-0">
          <h3 className="mb-2 text-lg font-semibold text-gray-900 break-words">{note.title}</h3>
          <p className="text-sm text-gray-500">Zaktualizowano: {note.lastModified}</p>
        </div>
        {note.hasTravelPlan && (
          <div className="flex w-fit items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800 sm:ml-4 sm:shrink-0">
            <svg className="mr-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            Plan
          </div>
        )}
      </div>
    </div>
  );
});
