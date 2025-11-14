// src/lib/utils/auth-api.ts

import type { AstroGlobal } from "astro";

/**
 * Checks if the user is authenticated in API routes.
 * Returns the user if authenticated, or a Response if not.
 *
 * @param locals - Astro.locals object
 * @returns User object or Response with 401 status
 */
export function requireAuthApi(locals: AstroGlobal["locals"]) {
  if (!locals.user) {
    return new Response(
      JSON.stringify({
        error: "Unauthorized",
        message: "Authentication required",
      }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  return locals.user;
}
