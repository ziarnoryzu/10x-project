# Plan implementacji: MainLayout z nawigacją boczną

## 1. Przegląd
Komponent `MainLayout` stanowi główny szkielet dla chronionych widoków aplikacji VibeTravels. Jego celem jest zapewnienie spójnej i intuicyjnej nawigacji, która adaptuje się do rozmiaru ekranu. Na urządzeniach stacjonarnych (desktop) wyświetlany jest stały, pionowy pasek nawigacyjny po lewej stronie. Na urządzeniach mobilnych nawigacja jest zwinięta do ikony "hamburgera", która po kliknięciu wysuwa menu z boku ekranu. Komponent zarządza również wyświetlaniem głównej treści strony i zapewnia dostęp do kluczowych funkcji, takich jak wylogowanie.

## 2. Struktura plików

### Nowe pliki
- `src/layouts/MainLayout.astro` - Główny komponent layoutu dla zalogowanych użytkowników.
- `src/components/layout/Sidebar.tsx` - Komponent React renderujący nawigację na desktopie.
- `src/components/layout/MobileNav.tsx` - Komponent React renderujący nawigację mobilną (hamburger i wysuwane menu).
- `src/components/layout/NavLink.tsx` - Komponent React dla pojedynczego linku w nawigacji.
- `src/components/hooks/use-lock-body-scroll.ts` - Custom hook do blokowania przewijania tła, gdy menu mobilne jest otwarte.

### Pliki do modyfikacji
- `src/pages/app/notes/index.astro` - Zmiana `Layout.astro` na `MainLayout.astro`.
- `src/pages/app/notes/[noteId].astro` - Zmiana `Layout.astro` na `MainLayout.astro`.
- `src/pages/app/profile/index.astro` - Zmiana `Layout.astro` na `MainLayout.astro`.

## 3. Struktura komponentów
Hierarchia komponentów została zaprojektowana w celu oddzielenia logiki renderowania w Astro od interaktywności zarządzanej przez React.

```
MainLayout.astro
├── Sidebar.tsx (client:load)
│   ├── NavLink.tsx
│   └── Button (Wyloguj)
├── MobileNav.tsx (client:load)
│   ├── Button (Hamburger)
│   └── Sheet (shadcn/ui)
│       ├── NavLink.tsx
│       └── Button (Wyloguj)
└── <slot /> (Treść strony)
```

## 4. Szczegóły komponentów

### `MainLayout.astro`
- **Opis:** Główny plik layoutu. Odpowiada za strukturę strony, przekazanie informacji o bieżącym adresie URL do komponentów nawigacyjnych oraz renderowanie treści strony w `<slot />`.
- **Główne elementy:**
  - `<div class="md:grid md:grid-cols-[240px_1fr]">` - główny kontener.
  - `<Sidebar />` - komponent nawigacji desktopowej, widoczny tylko na `md` i większych ekranach.
  - `<header class="md:hidden">` - nagłówek mobilny.
  - `<MobileNav />` - komponent nawigacji mobilnej, widoczny tylko na ekranach mniejszych niż `md`.
  - `<main>` - kontener na treść strony.
  - `<slot />` - miejsce na treść podstrony.
- **Props:** `title: string` (dla `<title>` strony).
- **Logika:** Pobiera aktualny `pathname` z `Astro.url.pathname` i przekazuje go jako prop `activePath` do komponentów `Sidebar` i `MobileNav`.

### `Sidebar.tsx` (React)
- **Opis:** Renderuje pionowy pasek nawigacyjny dla widoków desktopowych. Jest ukryty na urządzeniach mobilnych.
- **Główne elementy:**
  - `<aside>` z `aria-label="Główna nawigacja"`.
  - `<nav>` zawierający listę linków.
  - Komponenty `<NavLink>` dla każdego linku nawigacyjnego.
  - Przycisk `<Button>` do wylogowania.
- **Props:** `activePath: string`.
- **Logika:** Mapuje po predefiniowanej liście linków, renderując komponent `NavLink` dla każdego z nich i przekazując `isActive`. Obsługuje kliknięcie przycisku "Wyloguj" (mock).

### `MobileNav.tsx` (React)
- **Opis:** Zarządza nawigacją mobilną. Renderuje przycisk "hamburgera" i wysuwane z boku menu (`Sheet` z shadcn/ui).
- **Główne elementy:**
  - Przycisk `<Button variant="ghost">` z ikoną hamburgera.
  - Komponent `<Sheet>` z `shadcn/ui` do zarządzania wysuwanym panelem.
  - Wewnątrz `<SheetContent>`: lista linków (`<NavLink>`) i przycisk wylogowania.
- **Props:** `activePath: string`.
- **State:** `isOpen: boolean` - zarządza stanem otwarcia/zamknięcia menu.
- **Logika:**
  - Przełącza stan `isOpen` po kliknięciu hamburgera.
  - Używa custom hooka `useLockBodyScroll` do blokowania przewijania strony, gdy menu jest otwarte.
  - `Sheet` z `shadcn/ui` automatycznie zarządza focusem i zamykaniem po kliknięciu na zewnątrz.

### `NavLink.tsx` (React)
- **Opis:** Generyczny komponent do renderowania pojedynczego linku nawigacyjnego.
- **Główne elementy:**
  - `<a>` tag owinięty w `<li>` lub `<div>`.
- **Props:** `href: string`, `label: string`, `isActive: boolean`.
- **Logika:** Aplikuje odpowiednie klasy Tailwind i atrybut `aria-current="page"` w zależności od wartości propa `isActive`.

## 5. Typy i interfejsy

```typescript
// Typy dla propsów komponentów React
export interface NavComponentProps {
  activePath: string;
}

export interface NavLinkProps {
  href: string;
  label: string;
  isActive: boolean;
}

// Struktura obiektu linku nawigacyjnego
export interface NavItem {
  href: string;
  label: string;
}
```

## 6. Zarządzanie stanem
- **Stan otwarcia menu mobilnego:** Zarządzany lokalnie w komponencie `MobileNav.tsx` za pomocą hooka `useState<boolean>()`.
- **Wykrywanie aktywnej strony:** Realizowane po stronie serwera w `MainLayout.astro` (`Astro.url.pathname`) i przekazywane jako prop `activePath` do komponentów klienckich. Eliminuje to potrzebę synchronizacji stanu lub używania hooków Reacta do odczytu URL po stronie klienta.
- **Blokada przewijania:** Realizowana przez custom hook `useLockBodyScroll.ts`, który dynamicznie dodaje i usuwa klasę CSS (np. `overflow-hidden`) do elementu `<body>`.

```typescript
// src/components/hooks/use-lock-body-scroll.ts
import { useLayoutEffect } from 'react';

export function useLockBodyScroll(isLocked: boolean): void {
  useLayoutEffect(() => {
    if (isLocked) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isLocked]);
}
```

## 7. Stylowanie
- **Framework:** Tailwind CSS 4.
- **Podejście:** Użycie klas `utility-first`.
- **Responsywność:** Wykorzystanie breakpointu `md:` do przełączania między układem mobilnym a desktopowym.
  - `hidden md:block` dla `Sidebar`.
  - `md:hidden` dla `MobileNav`.
- **Aktywny link:** Stylowany za pomocą klas, np. `bg-muted font-semibold`, które są warunkowo dodawane w `NavLink.tsx`.
- **Dark Mode:** Komponenty `shadcn/ui` domyślnie wspierają tryb ciemny. Należy używać kolorów z palety Tailwind (np. `bg-background`, `text-foreground`) w celu zapewnienia spójności.

## 8. Interakcje użytkownika
- **Otwarcie menu mobilnego:** Kliknięcie przycisku hamburgera ustawia stan `isOpen` na `true`.
- **Zamknięcie menu mobilnego:**
  - Kliknięcie przycisku "X" wewnątrz `Sheet`.
  - Kliknięcie na zewnątrz menu (overlay).
  - Naciśnięcie klawisza `Escape`.
- **Nawigacja:** Kliknięcie w `NavLink` powoduje przejście do odpowiedniej strony.
- **Wylogowanie (mock):** Kliknięcie przycisku "Wyloguj" wywołuje funkcję, która przekierowuje użytkownika na stronę `/login` za pomocą `window.location.href = '/login'`.

## 9. Responsywność
- **Poniżej 768px (mobile):**
  - `Sidebar` jest ukryty (`display: none`).
  - W nagłówku strony widoczny jest przycisk hamburgera.
  - Menu nawigacyjne wysuwa się z lewej strony, przykrywając część ekranu i dodając ciemny overlay na resztę treści.
- **768px i więcej (desktop):**
  - Przycisk hamburgera jest ukryty.
  - `Sidebar` jest stale widoczny po lewej stronie, ma stałą szerokość `240px`.
  - Główna treść strony zajmuje pozostałą dostępną przestrzeń.

## 10. Dostępność
- **Landmarks:** `Sidebar` i `MobileNav` będą owinięte w tag `<nav>` z `aria-label`.
- **Focus Management:**
  - Po otwarciu menu mobilnego, `Sheet` z `shadcn/ui` automatycznie przenosi fokus na pierwszy interaktywny element wewnątrz.
  - Fokus jest "uwięziony" wewnątrz otwartego menu.
  - Po zamknięciu menu, fokus wraca do elementu, który je otworzył (przycisk hamburgera).
- **Nawigacja klawiaturą:**
  - Wszystkie linki i przyciski są osiągalne za pomocą klawisza `Tab`.
  - Klawisz `Escape` zamyka menu mobilne.
- **Atrybuty ARIA:**
  - `aria-current="page"` dla aktywnego linku w nawigacji.
  - Przycisk hamburgera będzie miał `aria-controls` wskazujący na ID wysuwanego menu oraz `aria-expanded` dynamicznie ustawiany na `true` lub `false`.

## 11. Integracja z istniejącymi stronami
Wszystkie strony w katalogu `src/pages/app/` muszą zostać zaktualizowane, aby korzystały z nowego layoutu. Zmiana polega na zastąpieniu importu i użycia `Layout.astro` na `MainLayout.astro`.

**Przykład (`src/pages/app/notes/index.astro`):**
```astro
---
// Zmiana z: import Layout from '~/layouts/Layout.astro';
import MainLayout from '~/layouts/MainLayout.astro';
// ... reszta logiki
---
// Zmiana z: <Layout title="Moje notatki">
<MainLayout title="Moje notatki">
  <!-- Treść strony -->
</MainLayout>
```

## 12. Obsługa błędów i edge cases
- **Brak JavaScript:** W środowisku bez JS, nawigacja mobilna nie będzie działać. Jest to akceptowalne dla MVP, ponieważ aplikacja jest SPA i wymaga JS do kluczowych funkcjonalności. Nawigacja desktopowa oparta na linkach `<a>` będzie degradować się poprawnie.
- **Szybkie przełączanie rozmiaru ekranu:** Należy upewnić się, że stan `isOpen` jest resetowany lub menu jest ukrywane przy przejściu z widoku mobilnego na desktopowy, aby uniknąć wizualnych błędów.

## 13. Kroki implementacji
1.  **(Priorytet: Wysoki)** Stworzyć plik `src/layouts/MainLayout.astro` z podstawową strukturą (grid, slot).
2.  **(Priorytet: Wysoki)** Stworzyć komponent `src/components/layout/NavLink.tsx` do renderowania linków.
3.  **(Priorytet: Wysoki)** Stworzyć komponent `src/components/layout/Sidebar.tsx`, zhardkodować listę linków i zintegrować go z `MainLayout.astro` (z `client:load`).
4.  **(Priorytet: Średni)** Zaimplementować `useLockBodyScroll` hook.
5.  **(Priorytet: Średni)** Stworzyć komponent `src/components/layout/MobileNav.tsx` używając `Sheet` z `shadcn/ui` i zintegrować go z `MainLayout.astro`.
6.  **(Priorytet: Średni)** Zaimplementować logikę przekazywania `activePath` z `MainLayout.astro` do komponentów nawigacyjnych i warunkowego stylowania aktywnego linku.
7.  **(Priorytet: Niski)** Zaktualizować istniejące strony (`/app/*`) aby używały `MainLayout.astro` zamiast `Layout.astro`.
8.  **(Priorytet: Niski)** Przeprowadzić testy manualne responsywności i dostępności na różnych urządzeniach i przeglądarkach.
