import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function DeleteAccountButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = useCallback(async () => {
    if (isDeleting) return;

    setError(null);
    setIsDeleting(true);

    try {
      const response = await fetch("/api/auth/delete-account", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Wystąpił błąd podczas usuwania konta");
        setIsDeleting(false);
        return;
      }

      // Redirect to home page after successful deletion
      window.location.href = "/";
    } catch {
      setError("Wystąpił błąd połączenia. Spróbuj ponownie.");
      setIsDeleting(false);
    }
  }, [isDeleting]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive">Usuń konto</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Czy na pewno chcesz usunąć konto?</DialogTitle>
          <DialogDescription className="space-y-2">
            <p>Ta operacja jest nieodwracalna. Wszystkie Twoje dane zostaną trwale usunięte, w tym:</p>
            <ul className="list-inside list-disc space-y-1 text-sm">
              <li>Profil użytkownika</li>
              <li>Wszystkie notatki podróżnicze</li>
              <li>Wygenerowane plany podróży</li>
              <li>Preferencje i ustawienia</li>
            </ul>
            <p className="font-medium">Tej akcji nie można cofnąć.</p>
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive" role="alert">
            {error}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isDeleting}>
            Anuluj
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? "Usuwanie..." : "Usuń konto"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
