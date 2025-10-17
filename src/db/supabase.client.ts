// src/db/supabase.client.ts

import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export type SupabaseClient = typeof supabase;

// Default user ID for development (no auth)
export const DEFAULT_USER_ID = import.meta.env.DEFAULT_USER_ID;

if (!DEFAULT_USER_ID) {
  throw new Error("Missing DEFAULT_USER_ID environment variable");
}
