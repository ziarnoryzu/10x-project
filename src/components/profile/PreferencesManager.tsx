import { useState, useCallback, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Plus } from "lucide-react";

interface PreferencesManagerProps {
  initialPreferences: string[];
  onUpdate: (preferences: string[]) => Promise<void>;
  isSaving?: boolean;
}

export function PreferencesManager({ initialPreferences, onUpdate, isSaving = false }: PreferencesManagerProps) {
  const [preferences, setPreferences] = useState<string[]>(initialPreferences);
  const [isAdding, setIsAdding] = useState(false);
  const [newPreference, setNewPreference] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Debounced auto-save
  useEffect(() => {
    // Don't auto-save on initial mount
    if (JSON.stringify(preferences) === JSON.stringify(initialPreferences)) {
      return;
    }

    const timeoutId = setTimeout(() => {
      onUpdate(preferences).catch(() => {
        setError("Nie udało się zapisać preferencji.");
      });
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [preferences, initialPreferences, onUpdate]);

  const handleAddPreference = useCallback(() => {
    const trimmedPreference = newPreference.trim();

    // Validation
    if (!trimmedPreference) {
      setError("Preferencja nie może być pusta");
      return;
    }

    if (preferences.includes(trimmedPreference)) {
      setError("Ta preferencja już istnieje");
      return;
    }

    if (preferences.length >= 10) {
      setError("Maksymalnie 10 preferencji");
      return;
    }

    setPreferences([...preferences, trimmedPreference]);
    setNewPreference("");
    setIsAdding(false);
    setError(null);
  }, [newPreference, preferences]);

  const handleRemovePreference = useCallback(
    (preferenceToRemove: string) => {
      setPreferences(preferences.filter((pref) => pref !== preferenceToRemove));
      setError(null);
    },
    [preferences]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleAddPreference();
      } else if (e.key === "Escape") {
        setIsAdding(false);
        setNewPreference("");
        setError(null);
      }
    },
    [handleAddPreference]
  );

  const canAddMore = preferences.length < 10;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {preferences.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nie dodano jeszcze żadnych preferencji</p>
        ) : (
          preferences.map((preference) => (
            <Badge key={preference} variant="secondary" className="gap-1 pr-1">
              <span>{preference}</span>
              <button
                type="button"
                onClick={() => handleRemovePreference(preference)}
                disabled={isSaving}
                className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                aria-label={`Usuń preferencję ${preference}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))
        )}
      </div>

      {isAdding ? (
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              type="text"
              value={newPreference}
              onChange={(e) => {
                setNewPreference(e.target.value);
                setError(null);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Wpisz nową preferencję"
              disabled={isSaving}
              aria-label="Nowa preferencja"
              aria-describedby={error ? "preference-error" : undefined}
            />
            <Button type="button" onClick={handleAddPreference} disabled={isSaving} size="sm">
              Dodaj
            </Button>
            <Button
              type="button"
              onClick={() => {
                setIsAdding(false);
                setNewPreference("");
                setError(null);
              }}
              disabled={isSaving}
              variant="ghost"
              size="sm"
            >
              Anuluj
            </Button>
          </div>
          {error && (
            <p id="preference-error" className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
        </div>
      ) : (
        <Button
          type="button"
          onClick={() => setIsAdding(true)}
          disabled={!canAddMore || isSaving}
          variant="outline"
          size="sm"
          className="gap-1"
        >
          <Plus className="h-4 w-4" />
          Dodaj preferencję
        </Button>
      )}

      {!canAddMore && <p className="text-sm text-muted-foreground">Osiągnięto maksymalną liczbę preferencji (10)</p>}

      {isSaving && <p className="text-sm text-muted-foreground">Zapisywanie...</p>}
    </div>
  );
}
