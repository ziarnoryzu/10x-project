import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ProfileFormProps {
  initialName: string;
  onUpdate: (name: string) => Promise<void>;
  isSaving?: boolean;
}

export function ProfileForm({ initialName, onUpdate, isSaving = false }: ProfileFormProps) {
  const [name, setName] = useState(initialName);
  const [error, setError] = useState<string | null>(null);

  // Validate name
  const isNameValid = name.trim().length >= 2;
  const hasChanges = name !== initialName;
  const canSave = isNameValid && hasChanges && !isSaving;

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!canSave) return;

      setError(null);

      try {
        await onUpdate(name.trim());
      } catch {
        setError("Nie udało się zapisać zmian. Spróbuj ponownie.");
      }
    },
    [canSave, name, onUpdate]
  );

  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    setError(null);
  }, []);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium">
          Imię
        </label>
        <Input
          id="name"
          type="text"
          value={name}
          onChange={handleNameChange}
          placeholder="Wpisz swoje imię"
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? "name-error" : undefined}
          disabled={isSaving}
        />
        {error && (
          <p id="name-error" className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
        {!isNameValid && name.length > 0 && (
          <p className="text-sm text-muted-foreground">Imię musi mieć co najmniej 2 znaki</p>
        )}
      </div>

      <Button type="submit" disabled={!canSave} className="w-full sm:w-auto">
        {isSaving ? "Zapisywanie..." : "Zapisz zmiany"}
      </Button>
    </form>
  );
}
