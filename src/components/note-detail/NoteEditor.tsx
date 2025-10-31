import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { NoteEditorViewModel } from "@/types";

interface NoteEditorProps {
  note: NoteEditorViewModel;
  wordCount: number;
  onNoteChange: (field: "title" | "content", value: string) => void;
}

/**
 * NoteEditor component handles the note editing form.
 * Displays title input, content textarea, and autosave status indicator.
 * Implements optimistic updates by immediately reflecting user changes.
 */
export function NoteEditor({ note, wordCount, onNoteChange }: NoteEditorProps) {
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onNoteChange("title", e.target.value);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onNoteChange("content", e.target.value);
  };

  return (
    <div className="space-y-6 transition-all duration-200">
      {/* Title input */}
      <div className="space-y-2">
        <label
          htmlFor="title"
          className="text-sm font-medium leading-none text-gray-700 dark:text-gray-300 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Tytuł
        </label>
        <Input
          id="title"
          type="text"
          value={note.title}
          onChange={handleTitleChange}
          placeholder="Wprowadź tytuł notatki..."
          className="text-lg"
        />
      </div>

      {/* Content textarea */}
      <div className="space-y-2">
        <label
          htmlFor="content"
          className="text-sm font-medium leading-none text-gray-700 dark:text-gray-300 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Treść
        </label>
        <Textarea
          id="content"
          value={note.content || ""}
          onChange={handleContentChange}
          placeholder="Wprowadź treść notatki..."
          className="min-h-[400px] resize-y"
        />

        {/* Word count and status */}
        <div className="flex items-center justify-between text-sm">
          <p className="text-gray-600 dark:text-gray-400">
            Liczba słów:{" "}
            <span className={wordCount >= 10 ? "text-green-600 dark:text-green-400 font-medium" : ""}>{wordCount}</span>
            {wordCount < 10 && <span className="text-gray-500"> (minimum 10 do generowania planu)</span>}
          </p>

          {/* Autosave status indicator */}
          <div className="flex items-center gap-2" role="status" aria-live="polite">
            {note.status === "saving" && (
              <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1.5 animate-fadeIn">
                <span className="inline-block h-2 w-2 rounded-full bg-yellow-500 animate-pulse"></span>
                Zapisywanie...
              </span>
            )}
            {note.status === "success" && (
              <span className="text-green-600 dark:text-green-400 flex items-center gap-1.5 animate-fadeIn">
                <span className="inline-block h-2 w-2 rounded-full bg-green-500"></span>
                Zapisano
              </span>
            )}
            {note.status === "error" && (
              <span className="text-red-600 dark:text-red-400 flex items-center gap-1.5 animate-fadeIn">
                <span className="inline-block h-2 w-2 rounded-full bg-red-500"></span>
                Błąd zapisu
              </span>
            )}
            {note.status === "idle" && note.lastSavedTimestamp && (
              <span className="text-gray-500 dark:text-gray-500 text-xs">
                Ostatnio zapisano: {note.lastSavedTimestamp}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
