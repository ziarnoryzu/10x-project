import type { PlanActivity } from "@/types";
import { ActivityCard } from "./ActivityCard";

interface TimeSectionProps {
  title: string;
  activities?: PlanActivity[];
}

/**
 * TimeSection displays activities for a specific time of day.
 * Handles optional activities arrays (for partial days like arrival/departure).
 */
export function TimeSection({ title, activities }: TimeSectionProps) {
  // Don't render if no activities for this time of day
  if (!activities || activities.length === 0) return null;

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">{title}</h4>
      <div className="space-y-3">
        {activities.map((activity, index) => (
          <ActivityCard key={`${title}-${index}`} activity={activity} />
        ))}
      </div>
    </div>
  );
}
