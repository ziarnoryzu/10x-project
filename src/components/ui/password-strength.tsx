import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface PasswordStrengthProps {
  password: string;
  className?: string;
}

interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
}

const requirements: PasswordRequirement[] = [
  {
    label: "Co najmniej 8 znaków",
    test: (pwd) => pwd.length >= 8,
  },
  {
    label: "Zawiera małą literę",
    test: (pwd) => /[a-z]/.test(pwd),
  },
  {
    label: "Zawiera wielką literę",
    test: (pwd) => /[A-Z]/.test(pwd),
  },
  {
    label: "Zawiera cyfrę",
    test: (pwd) => /\d/.test(pwd),
  },
];

export function PasswordStrength({ password, className }: PasswordStrengthProps) {
  const results = useMemo(() => {
    return requirements.map((req) => ({
      label: req.label,
      met: req.test(password),
    }));
  }, [password]);

  const metCount = results.filter((r) => r.met).length;
  const allMet = metCount === requirements.length;

  if (!password) return null;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex gap-1">
        {requirements.map((_, index) => (
          <div
            key={index}
            className={cn("h-1 flex-1 rounded-full transition-colors", results[index].met ? "bg-primary" : "bg-muted")}
          />
        ))}
      </div>
      <ul className="space-y-1 text-sm">
        {results.map((result, index) => (
          <li
            key={index}
            className={cn("flex items-center gap-2", result.met ? "text-primary" : "text-muted-foreground")}
          >
            <span className="text-xs">{result.met ? "✓" : "○"}</span>
            {result.label}
          </li>
        ))}
      </ul>
      {allMet && <p className="text-sm font-medium text-primary">Hasło spełnia wszystkie wymagania</p>}
    </div>
  );
}

/**
 * Validates if password meets all requirements
 */
export function validatePassword(password: string): boolean {
  return requirements.every((req) => req.test(password));
}
