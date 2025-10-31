import { memo } from "react";
import type { NoteListItemViewModel } from "../types";
import { NoteListItem } from "./NoteListItem";

interface NotesListProps {
  notes: NoteListItemViewModel[];
  currentPage: number;
}

/**
 * NotesList - Presentation component for rendering a list of notes
 * Receives pre-formatted note data and renders individual NoteListItem components
 * Memoized to prevent unnecessary re-renders when parent state changes
 */
export const NotesList = memo<NotesListProps>(function NotesList({ notes, currentPage }) {
  return (
    <div className="space-y-4" role="list" aria-label="Lista notatek podróżniczych">
      {notes.map((note) => (
        <NoteListItem key={note.id} note={note} currentPage={currentPage} />
      ))}
    </div>
  );
});
