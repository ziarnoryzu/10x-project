import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { AlertTriangle } from "lucide-react";

interface DeleteAccountSectionProps {
  userEmail: string;
  onDelete: () => Promise<void>;
  isSaving?: boolean;
}

export function DeleteAccountSection({ userEmail, onDelete, isSaving = false }: DeleteAccountSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [emailConfirmation, setEmailConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);

  const isEmailValid = emailConfirmation === userEmail;
  const canDelete = isEmailValid && !isSaving;

  const handleDelete = useCallback(async () => {
    if (!canDelete) return;

    setError(null);

    try {
      await onDelete();
      // The onDelete function should handle redirect to /login
    } catch {
      setError("Nie udało się usunąć konta. Spróbuj ponownie.");
    }
  }, [canDelete, onDelete]);

  const handleOpenModal = useCallback(() => {
    setIsModalOpen(true);
    setEmailConfirmation("");
    setError(null);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEmailConfirmation("");
    setError(null);
  }, []);

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950">
        <div className="flex gap-3">
          <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" aria-hidden="true" />
          <div className="space-y-2">
            <h3 className="font-medium text-red-900 dark:text-red-100">Strefa niebezpieczna</h3>
            <p className="text-sm text-red-800 dark:text-red-200">
              Usunięcie konta jest nieodwracalne. Wszystkie Twoje dane, notatki i plany podróży zostaną trwale usunięte.
            </p>
          </div>
        </div>
      </div>

      <Button type="button" onClick={handleOpenModal} disabled={isSaving} variant="destructive">
        Usuń konto
      </Button>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Czy na pewno chcesz usunąć konto?</DialogTitle>
            <DialogDescription>
              Ta akcja jest nieodwracalna. Wszystkie Twoje dane, notatki i plany podróży zostaną trwale usunięte i nie
              będzie możliwości ich odzyskania.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="email-confirmation" className="text-sm font-medium">
                Aby potwierdzić, wpisz swój adres e-mail:{" "}
                <span className="font-mono text-muted-foreground">{userEmail}</span>
              </label>
              <Input
                id="email-confirmation"
                type="email"
                value={emailConfirmation}
                onChange={(e) => {
                  setEmailConfirmation(e.target.value);
                  setError(null);
                }}
                placeholder="twoj@email.com"
                disabled={isSaving}
                aria-required="true"
                aria-invalid={error ? "true" : "false"}
                aria-describedby={error ? "delete-error" : undefined}
              />
              {error && (
                <p id="delete-error" className="text-sm text-red-600" role="alert">
                  {error}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" onClick={handleCloseModal} disabled={isSaving} variant="outline">
              Anuluj
            </Button>
            <Button type="button" onClick={handleDelete} disabled={!canDelete} variant="destructive">
              {isSaving ? "Usuwanie..." : "Potwierdź usunięcie"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
