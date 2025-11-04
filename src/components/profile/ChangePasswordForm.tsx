import { useState, useCallback, useId } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FormError } from "@/components/ui/form-error";
import { PasswordStrength, validatePassword } from "@/components/ui/password-strength";

export function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const currentPasswordId = useId();
  const newPasswordId = useId();
  const confirmPasswordId = useId();
  const errorId = useId();

  const isNewPasswordValid = validatePassword(newPassword);
  const doPasswordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;

  const canSubmit = currentPassword.length > 0 && isNewPasswordValid && doPasswordsMatch && !isSubmitting;

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!canSubmit) return;

      setError(null);
      setSuccess(false);
      setIsSubmitting(true);

      try {
        const response = await fetch("/api/auth/change-password", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            current_password: currentPassword,
            new_password: newPassword,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.message || "Wystąpił błąd podczas zmiany hasła");
          setIsSubmitting(false);
          return;
        }

        // Success
        setSuccess(true);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setIsSubmitting(false);
      } catch {
        setError("Wystąpił błąd połączenia. Spróbuj ponownie.");
        setIsSubmitting(false);
      }
    },
    [canSubmit, currentPassword, newPassword]
  );

  const handleCurrentPasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentPassword(e.target.value);
    setError(null);
    setSuccess(false);
  }, []);

  const handleNewPasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setNewPassword(e.target.value);
    setError(null);
    setSuccess(false);
  }, []);

  const handleConfirmPasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
    setError(null);
    setSuccess(false);
  }, []);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Zmień hasło</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Zaktualizuj hasło swojego konta. Upewnij się, że spełnia wszystkie wymagania bezpieczeństwa.
        </p>
      </div>

      {success && <div className="rounded-md bg-primary/10 p-3 text-sm text-primary">Hasło zostało zmienione</div>}

      {error && <FormError message={error} id={errorId} />}

      <div className="space-y-4">
        {/* Current Password */}
        <div className="space-y-2">
          <Label htmlFor={currentPasswordId}>Obecne hasło</Label>
          <Input
            id={currentPasswordId}
            type="password"
            value={currentPassword}
            onChange={handleCurrentPasswordChange}
            placeholder="••••••••"
            disabled={isSubmitting}
            autoComplete="current-password"
            required
          />
        </div>

        {/* New Password */}
        <div className="space-y-2">
          <Label htmlFor={newPasswordId}>Nowe hasło</Label>
          <Input
            id={newPasswordId}
            type="password"
            value={newPassword}
            onChange={handleNewPasswordChange}
            placeholder="••••••••"
            aria-invalid={!isNewPasswordValid && newPassword.length > 0}
            disabled={isSubmitting}
            autoComplete="new-password"
            required
          />
          <PasswordStrength password={newPassword} />
        </div>

        {/* Confirm New Password */}
        <div className="space-y-2">
          <Label htmlFor={confirmPasswordId}>Potwierdź nowe hasło</Label>
          <Input
            id={confirmPasswordId}
            type="password"
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
            placeholder="••••••••"
            aria-invalid={!doPasswordsMatch && confirmPassword.length > 0}
            aria-describedby={
              !doPasswordsMatch && confirmPassword.length > 0 ? `${confirmPasswordId}-error` : undefined
            }
            disabled={isSubmitting}
            autoComplete="new-password"
            required
          />
          {!doPasswordsMatch && confirmPassword.length > 0 && (
            <p id={`${confirmPasswordId}-error`} className="text-sm text-destructive">
              Hasła nie są identyczne
            </p>
          )}
        </div>
      </div>

      <Button type="submit" disabled={!canSubmit}>
        {isSubmitting ? "Zapisywanie..." : "Zmień hasło"}
      </Button>
    </form>
  );
}
