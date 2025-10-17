/// <reference types="astro/client" />
/// <reference types="astro/env" />

import type { SupabaseClient } from "./db/supabase.client";

declare namespace App {
  interface Locals {
    supabase: SupabaseClient;
  }
}
