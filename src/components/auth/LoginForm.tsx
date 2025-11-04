import { useState, useCallback, useId } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FormError } from "@/components/ui/form-error";

interface LoginFormProps {
  redirectTo?: string;
  successMessage?: string | null;
}

export function LoginForm({ redirectTo = "/app", successMessage = null }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emailId = useId();
  const passwordId = useId();
  const errorId = useId();

  const canSubmit = email.length > 0 && password.length > 0 && !isSubmitting;

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!canSubmit) return;

      setError(null);
      setIsSubmitting(true);

      try {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            password,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.message || "Nieprawidłowy email lub hasło");
          setIsSubmitting(false);
          return;
        }

        // Redirect to target page
        window.location.href = redirectTo;
      } catch {
        setError("Wystąpił błąd połączenia. Spróbuj ponownie.");
        setIsSubmitting(false);
      }
    },
    [canSubmit, email, password, redirectTo]
  );

  const handleEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setError(null);
  }, []);

  const handlePasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setError(null);
  }, []);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Zaloguj się</h2>
        <p className="text-sm text-muted-foreground">Wpisz swoje dane, aby kontynuować</p>
      </div>

      {successMessage && <div className="rounded-md bg-primary/10 p-3 text-sm text-primary">{successMessage}</div>}

      {error && <FormError message={error} id={errorId} />}

      <div className="space-y-4">
        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor={emailId}>Email</Label>
          <Input
            id={emailId}
            type="email"
            value={email}
            onChange={handleEmailChange}
            placeholder="jan@example.com"
            disabled={isSubmitting}
            autoComplete="email"
            required
          />
        </div>

        {/* Password */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor={passwordId}>Hasło</Label>
            <a
              href="/forgot-password"
              className="text-sm text-primary hover:underline"
              tabIndex={isSubmitting ? -1 : 0}
            >
              Zapomniałeś hasła?
            </a>
          </div>
          <Input
            id={passwordId}
            type="password"
            value={password}
            onChange={handlePasswordChange}
            placeholder="••••••••"
            disabled={isSubmitting}
            autoComplete="current-password"
            required
          />
        </div>
      </div>

      <Button type="submit" disabled={!canSubmit} className="w-full">
        {isSubmitting ? "Logowanie..." : "Zaloguj się"}
      </Button>
    </form>
  );
}
