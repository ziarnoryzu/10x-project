import type { NavLinkProps } from "@/types";
import { cn } from "@/lib/utils";

export function NavLink({ href, label, isActive }: NavLinkProps) {
  return (
    <li>
      <a
        href={href}
        aria-current={isActive ? "page" : undefined}
        className={cn(
          "block rounded-lg px-4 py-2 text-sm font-medium transition-colors",
          isActive
            ? "bg-muted font-semibold text-foreground"
            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
        )}
      >
        {label}
      </a>
    </li>
  );
}
