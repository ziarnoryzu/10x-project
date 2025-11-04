import { cn } from "@/lib/utils";

interface FormErrorProps {
  message: string;
  id?: string;
  className?: string;
}

export function FormError({ message, id, className }: FormErrorProps) {
  return (
    <p id={id} className={cn("text-sm text-destructive", className)} role="alert">
      {message}
    </p>
  );
}
