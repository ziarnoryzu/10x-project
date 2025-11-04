import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";

interface LogoutButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  children?: React.ReactNode;
}

export function LogoutButton({
  variant = "ghost",
  size = "default",
  className,
  children = "Wyloguj",
}: LogoutButtonProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = useCallback(async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        window.location.href = "/auth/login";
      } else {
        setIsLoggingOut(false);
      }
    } catch {
      setIsLoggingOut(false);
    }
  }, [isLoggingOut]);

  return (
    <Button onClick={handleLogout} disabled={isLoggingOut} variant={variant} size={size} className={className}>
      {isLoggingOut ? "Wylogowywanie..." : children}
    </Button>
  );
}
