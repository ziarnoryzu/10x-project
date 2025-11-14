/* eslint-disable react-hooks/rules-of-hooks */
import { test as base } from "@playwright/test";
import type { Page } from "@playwright/test";
import { login } from "../helpers/AuthHelper";
import { createClient } from "@supabase/supabase-js";

// Extend basic test with cleanup functionality
interface TestFixtures {
  authenticatedPage: Page;
  createdNoteIds: string[];
}

/**
 * Extended Playwright test with automatic cleanup of test data
 */
export const test = base.extend<TestFixtures>({
  // Track created notes for cleanup
  // eslint-disable-next-line no-empty-pattern
  createdNoteIds: async ({}, use) => {
    const noteIds: string[] = [];
    await use(noteIds);

    // Cleanup after test
    if (noteIds.length > 0) {
      const supabaseUrl = process.env.SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) {
        console.error("Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables");
        return;
      }

      const supabase = createClient(supabaseUrl, supabaseKey);

      // Delete all notes created during test
      const { error } = await supabase.from("notes").delete().in("id", noteIds);

      if (error) {
        console.error("Failed to cleanup notes:", error);
      }
    }
  },

  // Authenticated page with automatic login
  authenticatedPage: async ({ page }, use) => {
    await login(page);
    await use(page);
  },
});

export { expect } from "@playwright/test";
