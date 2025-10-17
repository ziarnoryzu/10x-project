// src/db/supabase.client.ts

import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON_KEY, DEFAULT_USER_ID } from "astro:env/server";
import type { Database } from "./database.types";

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);

export type SupabaseClient = typeof supabase;

// Default user ID for development (no auth)
if (!DEFAULT_USER_ID) {
  throw new Error("Missing DEFAULT_USER_ID environment variable");
}

export { DEFAULT_USER_ID };
