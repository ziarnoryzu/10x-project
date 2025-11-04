// src/lib/utils/auth-guard.ts

import type { AstroGlobal } from "astro";

/**
 * Requires user to be authenticated. Redirects to login if not.
 * Use in protected pages.
 *
 * @param Astro - Astro global object
 * @param redirectTo - Optional URL to redirect to after login (defaults to current page)
 * @returns User object if authenticated, redirects otherwise
 */
export function requireAuth(Astro: Readonly<AstroGlobal>, redirectTo?: string) {
  const { user } = Astro.locals;

  if (!user) {
    const targetRedirect = redirectTo || Astro.url.pathname;
    return Astro.redirect(`/auth/login?redirect=${encodeURIComponent(targetRedirect)}`);
  }

  return user;
}

/**
 * Requires user to NOT be authenticated. Redirects to app if authenticated.
 * Use in auth pages (login, register, etc.)
 *
 * @param Astro - Astro global object
 * @param redirectTo - Optional URL to redirect to if already authenticated (defaults to /app/notes)
 */
export function requireNoAuth(Astro: Readonly<AstroGlobal>, redirectTo = "/app/notes") {
  const { user } = Astro.locals;

  if (user) {
    return Astro.redirect(redirectTo);
  }

  return null;
}

