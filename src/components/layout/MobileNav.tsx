import { useState } from "react";
import type { NavComponentProps, NavItem } from "@/types";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { NavLink } from "./NavLink";
import { useLockBodyScroll } from "@/components/hooks/use-lock-body-scroll";

const navItems: NavItem[] = [
  { href: "/app/notes", label: "Notatki" },
  { href: "/app/profile", label: "Profil" },
];

export function MobileNav({ activePath }: NavComponentProps) {
  const [isOpen, setIsOpen] = useState(false);

  useLockBodyScroll(isOpen);

  return (
    <div className="md:hidden">
      <Button
        onClick={() => setIsOpen(true)}
        variant="ghost"
        size="icon"
        aria-controls="mobile-nav"
        aria-expanded={isOpen}
        aria-label="Otwórz menu"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="4" x2="20" y1="12" y2="12" />
          <line x1="4" x2="20" y1="6" y2="6" />
          <line x1="4" x2="20" y1="18" y2="18" />
        </svg>
      </Button>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="left" id="mobile-nav">
          <SheetHeader>
            <SheetTitle>VibeTravels</SheetTitle>
          </SheetHeader>

          <nav aria-label="Główna nawigacja" className="mt-8">
            <ul className="space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  isActive={activePath.startsWith(item.href)}
                  onNavigate={() => setIsOpen(false)}
                />
              ))}
            </ul>
          </nav>

          <div className="absolute bottom-8 left-6 right-6">
            <LogoutButton variant="outline" className="w-full" />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
