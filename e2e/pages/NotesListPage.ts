import type { Page, Locator } from "@playwright/test";

/**
 * NotesListPage - Page Object Model for the notes list view
 * Handles interactions with the notes list page including creating new notes
 */
export class NotesListPage {
  readonly page: Page;
  readonly createNoteButton: Locator;
  readonly createFirstNoteButton: Locator;
  readonly pageTitle: Locator;
  readonly notesList: Locator;
  readonly emptyState: Locator;

  constructor(page: Page) {
    this.page = page;
    // Użyj bardziej elastycznych selektorów - najpierw testid, potem fallback na text
    this.createNoteButton = page
      .locator('[data-test-id="create-note-button"], button:has-text("Nowa notatka")')
      .first();
    this.createFirstNoteButton = page
      .locator('[data-test-id="create-first-note-button"], button:has-text("Stwórz pierwszą notatkę")')
      .first();
    this.pageTitle = page.getByRole("heading", { name: "Moje notatki" });
    this.notesList = page.locator('[data-test-id^="note-item-"]');
    this.emptyState = page.locator("text=Nie masz jeszcze żadnych notatek");
  }

  /**
   * Navigate to the notes list page
   */
  async goto() {
    await this.page.goto("/app/notes");
  }

  /**
   * Click the "Create Note" button (when notes exist)
   */
  async clickCreateNote() {
    await this.createNoteButton.click();
  }

  /**
   * Click the "Create First Note" button (when no notes exist)
   */
  async clickCreateFirstNote() {
    await this.createFirstNoteButton.click();
  }

  /**
   * Wait for the page to be loaded
   */
  async waitForPageLoad() {
    await this.pageTitle.waitFor({ state: "visible" });
  }

  /**
   * Check if the empty state is visible
   */
  async isEmptyStateVisible() {
    return await this.emptyState.isVisible();
  }

  /**
   * Get the count of notes in the list
   */
  async getNotesCount() {
    // Szukaj linków notatek w głównej liście
    const listLocator = this.page.getByRole("list", { name: /notatek/i });
    const links = listLocator.getByRole("link");
    return await links.count();
  }
}
