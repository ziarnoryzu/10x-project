import { useState, useCallback, useId } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FormError } from "@/components/ui/form-error";

interface ForgotPasswordFormProps {
  sentConfirmation?: boolean;
}

export function ForgotPasswordForm({ sentConfirmation = false }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(sentConfirmation);

  const emailId = useId();
  const errorId = useId();

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const canSubmit = isEmailValid && !isSubmitting;

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!canSubmit) return;

      setError(null);
      setIsSubmitting(true);

      try {
        const response = await fetch("/api/auth/forgot-password", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.message || "Wystąpił błąd. Spróbuj ponownie.");
          setIsSubmitting(false);
          return;
        }

        // Always show success to prevent user enumeration
        setSent(true);
        setIsSubmitting(false);
      } catch {
        setError("Wystąpił błąd połączenia. Spróbuj ponownie.");
        setIsSubmitting(false);
      }
    },
    [canSubmit, email]
  );

  const handleEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setError(null);
  }, []);

  if (sent) {
    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Sprawdź swoją skrzynkę</h2>
          <p className="text-sm text-muted-foreground">
            Jeśli konto z tym adresem email istnieje, wysłaliśmy link do resetowania hasła. Sprawdź swoją skrzynkę
            pocztową i postępuj zgodnie z instrukcjami.
          </p>
        </div>

        <div className="rounded-md bg-primary/10 p-4 text-sm text-primary">
          <p className="font-medium">Nie otrzymałeś wiadomości?</p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>Sprawdź folder spam</li>
            <li>Upewnij się, że podałeś prawidłowy adres email</li>
            <li>Poczekaj kilka minut - dostarczenie może zająć chwilę</li>
          </ul>
        </div>

        <Button asChild variant="outline" className="w-full">
          <a href="/login">Powrót do logowania</a>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Zresetuj hasło</h2>
        <p className="text-sm text-muted-foreground">Podaj swój adres email, a wyślemy Ci link do resetowania hasła</p>
      </div>

      {error && <FormError message={error} id={errorId} />}

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor={emailId}>Email</Label>
          <Input
            id={emailId}
            type="email"
            value={email}
            onChange={handleEmailChange}
            placeholder="jan@example.com"
            aria-invalid={!isEmailValid && email.length > 0}
            disabled={isSubmitting}
            autoComplete="email"
            autoFocus
            required
          />
          {!isEmailValid && email.length > 0 && (
            <p className="text-sm text-muted-foreground">Wprowadź poprawny adres email</p>
          )}
        </div>
      </div>

      <Button type="submit" disabled={!canSubmit} className="w-full">
        {isSubmitting ? "Wysyłanie..." : "Wyślij link resetujący"}
      </Button>
    </form>
  );
}
