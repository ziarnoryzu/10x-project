import type { NoteWithPlanViewModel, NoteDTO, TravelPlanDTO, TypedTravelPlan, TravelPlanContent } from "@/types";

/**
 * Format relative time from a date string
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMinutes < 1) return "przed chwilą";
  if (diffMinutes === 1) return "minutę temu";
  if (diffMinutes < 60) return `${diffMinutes} minut temu`;
  if (diffHours === 1) return "godzinę temu";
  if (diffHours < 24) return `${diffHours} godzin temu`;
  if (diffDays === 1) return "wczoraj";
  if (diffDays < 7) return `${diffDays} dni temu`;

  return date.toLocaleDateString("pl-PL");
}

/**
 * Count words in text content
 */
export function countWords(content: string | null): number {
  if (!content) return 0;
  return content
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length;
}

/**
 * Build note view model from DTO objects
 */
export function buildNoteViewModel(note: NoteDTO, plan?: TravelPlanDTO | null): NoteWithPlanViewModel {
  const wordCount = countWords(note.content);
  const isReadyForPlanGeneration = wordCount >= 10;

  let travelPlan: TypedTravelPlan | null = null;
  if (plan) {
    travelPlan = {
      ...plan,
      content: plan.content as unknown as TravelPlanContent,
    };
  }

  return {
    id: note.id,
    title: note.title,
    content: note.content,
    createdAt: formatRelativeTime(note.created_at),
    updatedAt: formatRelativeTime(note.updated_at),
    travelPlan,
    wordCount,
    isReadyForPlanGeneration,
  };
}
