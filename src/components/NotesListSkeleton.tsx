import { memo } from "react";
import { Skeleton } from "./ui/skeleton";

interface NotesListSkeletonProps {
  count?: number;
}

/**
 * NotesListSkeleton - Loading skeleton for the notes list
 * Displays placeholder elements while notes are being fetched
 * Prevents layout shift and provides better UX during loading
 */
export const NotesListSkeleton = memo(function NotesListSkeleton({ count = 5 }: NotesListSkeletonProps) {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
        <Skeleton className="h-8 w-40 sm:h-10 sm:w-48" />
        <Skeleton className="h-10 w-full sm:w-32" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: count }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
});
