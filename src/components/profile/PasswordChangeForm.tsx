import { useState, useCallback, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { ChangePasswordDTO } from "@/types";

interface PasswordChangeFormProps {
  onPasswordChange: (data: ChangePasswordDTO) => Promise<void>;
  isSaving?: boolean;
}

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
}

export function PasswordChangeForm({ onPasswordChange, isSaving = false }: PasswordChangeFormProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Calculate password strength
  const passwordStrength = useMemo((): PasswordStrength => {
    if (newPassword.length === 0) {
      return { score: 0, label: "", color: "" };
    }

    let score = 0;
    const hasMinLength = newPassword.length >= 8;
    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasLowerCase = /[a-z]/.test(newPassword);
    const hasNumber = /\d/.test(newPassword);

    if (hasMinLength) score += 25;
    if (hasUpperCase) score += 25;
    if (hasLowerCase) score += 25;
    if (hasNumber) score += 25;

    let label = "";
    let color = "";

    if (score <= 25) {
      label = "Słabe";
      color = "bg-red-500";
    } else if (score <= 50) {
      label = "Średnie";
      color = "bg-yellow-500";
    } else if (score <= 75) {
      label = "Dobre";
      color = "bg-blue-500";
    } else {
      label = "Mocne";
      color = "bg-green-500";
    }

    return { score, label, color };
  }, [newPassword]);

  // Validation
  const isCurrentPasswordValid = currentPassword.length > 0;
  const isNewPasswordValid = useMemo(() => {
    if (newPassword.length === 0) return false;
    const hasMinLength = newPassword.length >= 8;
    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasLowerCase = /[a-z]/.test(newPassword);
    const hasNumber = /\d/.test(newPassword);
    return hasMinLength && hasUpperCase && hasLowerCase && hasNumber;
  }, [newPassword]);

  const isConfirmPasswordValid = confirmPassword === newPassword && confirmPassword.length > 0;
  const canSubmit = isCurrentPasswordValid && isNewPasswordValid && isConfirmPasswordValid && !isSaving;

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!canSubmit) return;

      setError(null);

      try {
        await onPasswordChange({
          current_password: currentPassword,
          new_password: newPassword,
        });

        // Clear form on success
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } catch {
        setError("Nie udało się zmienić hasła. Spróbuj ponownie.");
      }
    },
    [canSubmit, currentPassword, newPassword, onPasswordChange]
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="current-password" className="text-sm font-medium">
          Obecne hasło
        </label>
        <Input
          id="current-password"
          type="password"
          value={currentPassword}
          onChange={(e) => {
            setCurrentPassword(e.target.value);
            setError(null);
          }}
          placeholder="Wpisz obecne hasło"
          disabled={isSaving}
          aria-required="true"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="new-password" className="text-sm font-medium">
          Nowe hasło
        </label>
        <Input
          id="new-password"
          type="password"
          value={newPassword}
          onChange={(e) => {
            setNewPassword(e.target.value);
            setError(null);
          }}
          placeholder="Wpisz nowe hasło"
          disabled={isSaving}
          aria-required="true"
          aria-describedby="password-requirements"
        />
        {newPassword.length > 0 && (
          <div className="space-y-2" aria-live="polite">
            <div className="flex items-center gap-2">
              <Progress value={passwordStrength.score} className="h-2" />
              <span className="text-sm font-medium">{passwordStrength.label}</span>
            </div>
          </div>
        )}
        <p id="password-requirements" className="text-sm text-muted-foreground">
          Min. 8 znaków, 1 wielka litera, 1 mała litera, 1 cyfra
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="confirm-password" className="text-sm font-medium">
          Potwierdzenie nowego hasła
        </label>
        <Input
          id="confirm-password"
          type="password"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            setError(null);
          }}
          placeholder="Powtórz nowe hasło"
          disabled={isSaving}
          aria-required="true"
          aria-invalid={confirmPassword.length > 0 && !isConfirmPasswordValid ? "true" : "false"}
          aria-describedby={confirmPassword.length > 0 && !isConfirmPasswordValid ? "confirm-error" : undefined}
        />
        {confirmPassword.length > 0 && !isConfirmPasswordValid && (
          <p id="confirm-error" className="text-sm text-red-600" role="alert">
            Hasła nie są identyczne
          </p>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      <Button type="submit" disabled={!canSubmit} className="w-full sm:w-auto">
        {isSaving ? "Zmiana hasła..." : "Zmień hasło"}
      </Button>
    </form>
  );
}
