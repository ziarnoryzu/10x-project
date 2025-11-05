import type { Page } from "@playwright/test";

/**
 * Helper to extract note ID from URL after navigation
 */
export async function extractNoteIdFromUrl(page: Page): Promise<string | null> {
  const url = page.url();
  const match = url.match(/\/app\/notes\/([a-f0-9-]+)/);
  return match ? match[1] : null;
}

/**
 * Helper to cleanup all notes created by test user
 * Use this in test cleanup if you want to delete ALL notes for test user
 */
export async function cleanupAllUserNotes(userId: string) {
  const { createClient } = await import("@supabase/supabase-js");

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    throw new Error("SUPABASE_URL and SUPABASE_ANON_KEY must be set");
  }

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

  const { error } = await supabase.from("notes").delete().eq("user_id", userId);

  if (error) {
    throw new Error(`Failed to cleanup notes: ${error.message}`);
  }
}
