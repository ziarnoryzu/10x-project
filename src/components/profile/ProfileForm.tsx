import { useState, useCallback } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ProfileFormProps {
  initialName: string;
}

export function ProfileForm({ initialName }: ProfileFormProps) {
  const [name, setName] = useState(initialName);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Validate name
  const isNameValid = name.trim().length >= 2;
  const hasChanges = name !== initialName;
  const canSave = isNameValid && hasChanges && !isSaving;

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!canSave) return;

      setError(null);
      setIsSaving(true);

      try {
        const response = await fetch("/api/profiles/me", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ name: name.trim() }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || "Nie udało się zapisać zmian");
        }

        // Success - show toast and reload to update UI
        toast.success("Imię zostało zaktualizowane");

        // Reload after a short delay to show the toast
        setTimeout(() => {
          window.location.reload();
        }, 500);
      } catch {
        setError("Nie udało się zapisać zmian. Spróbuj ponownie.");
      } finally {
        setIsSaving(false);
      }
    },
    [canSave, name]
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
