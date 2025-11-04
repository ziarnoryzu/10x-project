// src/lib/utils/locals.ts
import type { AstroGlobal } from "astro";
import type { SupabaseClient } from "../../db/supabase.client";

/**
 * Type-safe access to Astro.locals
 */
interface AppLocals {
  supabase: SupabaseClient;
  user?: {
    id: string;
    email: string;
  };
}

/**
 * Get typed locals from Astro context
 */
export function getLocals(Astro: Readonly<AstroGlobal>): AppLocals {
  return Astro.locals as AppLocals;
}
