import { expect } from "@playwright/test";
import { test } from "./fixtures/testContext";
import { NotesListPage } from "./pages/NotesListPage";
import { NoteEditorPage } from "./pages/NoteEditorPage";
import { extractNoteIdFromUrl } from "./helpers/cleanupHelper";

test.describe("Notes Management", () => {
  test("should create a new note with title and content", async ({ authenticatedPage, createdNoteIds }) => {
    const page = authenticatedPage;
    const notesListPage = new NotesListPage(page);
    const noteEditorPage = new NoteEditorPage(page);

    // Po zalogowaniu user jest już gdzieś w /app/**, upewnijmy się że jesteśmy na liście notatek
    await page.goto("/app/notes");
    await notesListPage.waitForPageLoad();

    // Krok 2: Kliknij przycisk "Nowa notatka"
    await notesListPage.clickCreateNote();

    // Krok 3: Wpisz tytuł i treść notatki
    await noteEditorPage.waitForPageLoad();

    const testTitle = "Wycieczka do Paryża";
    const testContent =
      "Planujemy odwiedzić Wieżę Eiffla, Luwr i Montmartre. " +
      "Pobyt na 5 dni w czerwcu. Chcemy zobaczyć Łuk Triumfalny.";

    await noteEditorPage.fillTitle(testTitle);
    await noteEditorPage.fillContent(testContent);

    // Krok 4: Odczekaj chwilę aż notatka zapisze się w bazie
    await noteEditorPage.waitForAutosave();

    // Sprawdź czy notatka została zapisana
    expect(await noteEditorPage.isSaved()).toBe(true);

    // Śledź ID notatki do późniejszego czyszczenia
    const noteId = await extractNoteIdFromUrl(page);
    if (noteId) {
      createdNoteIds.push(noteId);
    }

    // Sprawdź liczbę słów (powinno być >= 10)
    const wordCount = await noteEditorPage.getWordCount();
    expect(wordCount).toBeGreaterThanOrEqual(10);

    // Krok 5: Kliknij przycisk "Powrót do listy notatek"
    await noteEditorPage.clickBackToList();

    // Sprawdź czy jesteśmy z powrotem na liście
    await notesListPage.waitForPageLoad();

    // Sprawdź czy notatka została dodana do listy
    const notesCount = await notesListPage.getNotesCount();
    expect(notesCount).toBeGreaterThan(0);
  });

  test("should create first note when list is empty", async ({ authenticatedPage, createdNoteIds }) => {
    const page = authenticatedPage;
    const notesListPage = new NotesListPage(page);
    const noteEditorPage = new NoteEditorPage(page);

    // Po zalogowaniu user jest już gdzieś w /app/**, upewnijmy się że jesteśmy na liście notatek
    await page.goto("/app/notes");
    await notesListPage.waitForPageLoad();

    // Jeśli lista jest pusta, użyj przycisku "Stwórz pierwszą notatkę"
    const isEmpty = await notesListPage.isEmptyStateVisible();

    if (isEmpty) {
      await notesListPage.clickCreateFirstNote();
    } else {
      await notesListPage.clickCreateNote();
    }

    // Wypełnij notatkę
    await noteEditorPage.waitForPageLoad();
    await noteEditorPage.fillNote(
      "Pierwsza notatka",
      "To jest moja pierwsza notatka podróżna z wieloma słowami do testowania."
    );

    // Poczekaj na zapis
    await noteEditorPage.waitForAutosave();
    expect(await noteEditorPage.isSaved()).toBe(true);

    // Śledź ID notatki do późniejszego czyszczenia
    const noteId = await extractNoteIdFromUrl(page);
    if (noteId) {
      createdNoteIds.push(noteId);
    }

    // Wróć do listy
    await noteEditorPage.clickBackToList();
    await notesListPage.waitForPageLoad();
  });
});
