import type { NavComponentProps, NavItem } from "@/types";
import { Button } from "@/components/ui/button";
import { NavLink } from "./NavLink";

const navItems: NavItem[] = [
  { href: "/app/notes", label: "Notatki" },
  { href: "/app/profile", label: "Profil" },
];

export function Sidebar({ activePath }: NavComponentProps) {
  const handleLogout = () => {
    // Mock logout - przekierowanie na stronę logowania
    window.location.href = "/login";
  };

  return (
    <aside className="hidden h-screen border-r bg-background md:block">
      <div className="flex h-full flex-col">
        <div className="flex h-14 items-center border-b px-4">
          <h1 className="text-lg font-semibold">VibeTravels</h1>
        </div>

        <nav aria-label="Główna nawigacja" className="flex-1 p-4">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                label={item.label}
                isActive={activePath.startsWith(item.href)}
              />
            ))}
          </ul>
        </nav>

        <div className="border-t p-4">
          <Button onClick={handleLogout} variant="outline" className="w-full">
            Wyloguj
          </Button>
        </div>
      </div>
    </aside>
  );
}
