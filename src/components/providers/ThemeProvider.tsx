import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { PropsWithChildren } from "react";

/**
 * Theme provider component that wraps the application with next-themes context
 * Enables theme switching and persistence across the application
 */
export function ThemeProvider({ children }: PropsWithChildren) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      {children}
    </NextThemesProvider>
  );
}
