import type { Page, Locator } from "@playwright/test";

/**
 * NoteEditorPage - Page Object Model for the note editor view
 * Handles interactions with note creation and editing including title, content, and navigation
 */
export class NoteEditorPage {
  readonly page: Page;
  readonly titleInput: Locator;
  readonly contentTextarea: Locator;
  readonly backToListButton: Locator;
  readonly pageTitle: Locator;
  readonly saveStatusIndicator: Locator;
  readonly wordCountText: Locator;

  constructor(page: Page) {
    this.page = page;
    // Użyj bardziej elastycznych selektorów
    this.titleInput = page.locator('[data-test-id="note-title-input"], input[placeholder*="tytuł"]').first();
    this.contentTextarea = page
      .locator('[data-test-id="note-content-textarea"], textarea[placeholder*="treść"]')
      .first();
    this.backToListButton = page
      .locator('[data-test-id="back-to-list-button"], button:has-text("Powrót do listy")')
      .first();
    this.pageTitle = page.getByRole("heading", { name: "Edytuj notatkę" });
    this.saveStatusIndicator = page.locator('[role="status"]');
    this.wordCountText = page.locator("text=/Liczba słów:/");
  }

  /**
   * Navigate to a specific note editor page
   */
  async goto(noteId: string) {
    await this.page.goto(`/app/notes/${noteId}`);
  }

  /**
   * Fill in the note title
   */
  async fillTitle(title: string) {
    await this.titleInput.fill(title);
  }

  /**
   * Fill in the note content
   */
  async fillContent(content: string) {
    await this.contentTextarea.fill(content);
  }

  /**
   * Fill both title and content
   */
  async fillNote(title: string, content: string) {
    await this.fillTitle(title);
    await this.fillContent(content);
  }

  /**
   * Click the back to list button
   */
  async clickBackToList() {
    await this.backToListButton.click();
  }

  /**
   * Wait for the page to be loaded
   */
  async waitForPageLoad() {
    await this.pageTitle.waitFor({ state: "visible" });
  }

  /**
   * Wait for the note to be saved (status indicator shows "Zapisano")
   */
  async waitForSave() {
    await this.page.locator("text=Zapisano").waitFor({ state: "visible", timeout: 5000 });
  }

  /**
   * Wait for autosave to complete after making changes
   * Waits for "Zapisywanie..." to appear and then "Zapisano" to appear
   */
  async waitForAutosave() {
    // Wait a bit for the autosave debounce
    await this.page.waitForTimeout(1500);
    // Wait for the saved status
    await this.waitForSave();
  }

  /**
   * Get the current word count
   */
  async getWordCount(): Promise<number> {
    const text = await this.wordCountText.textContent();
    const match = text?.match(/Liczba słów:\s*(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  }

  /**
   * Check if the save status shows "Zapisano"
   */
  async isSaved(): Promise<boolean> {
    return await this.page.locator("text=Zapisano").isVisible();
  }

  /**
   * Check if the save status shows "Zapisywanie..."
   */
  async isSaving(): Promise<boolean> {
    return await this.page.locator("text=Zapisywanie...").isVisible();
  }
}
