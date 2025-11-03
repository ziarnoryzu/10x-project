/// <reference types="astro/client" />
/// <reference types="astro/env" />

import type { SupabaseClient } from "./db/supabase.client";

declare namespace App {
  interface Locals {
    supabase: SupabaseClient;
  }
}

interface ImportMetaEnv {
  readonly OPENROUTER_API_KEY: string;
  readonly OPENROUTER_MODEL?: string;
  readonly SUPABASE_URL: string;
  readonly SUPABASE_ANON_KEY: string;
  readonly DEFAULT_USER_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
