import type { NavComponentProps, NavItem } from "@/types";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { NavLink } from "./NavLink";

const navItems: NavItem[] = [
  { href: "/app/notes", label: "Notatki" },
  { href: "/app/profile", label: "Profil" },
];

export function Sidebar({ activePath }: NavComponentProps) {
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
          <LogoutButton variant="outline" className="w-full" />
        </div>
      </div>
    </aside>
  );
}
