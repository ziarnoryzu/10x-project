import type { TravelDay } from "@/types";
import { formatDayHeader } from "@/lib/utils/travel-plan.utils";
import { TimeSection } from "./TimeSection";

interface DayCardProps {
  day: TravelDay;
}

/**
 * DayCard displays a complete day in a travel plan.
 * Shows the day number, title, and all activities organized by time of day.
 */
export function DayCard({ day }: DayCardProps) {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 space-y-6">
      {/* Day header */}
      <div className="pb-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-2">
          <span className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-bold">
            {day.day}
          </span>
          <div className="flex flex-col">
            {/* Primary header: date with day of week OR "Dzień X" */}
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{formatDayHeader(day)}</h3>
            {/* Secondary: day title */}
            <p className="text-sm text-gray-600 dark:text-gray-400">{day.title}</p>
          </div>
        </div>
      </div>

      {/* Activities by time of day */}
      <div className="space-y-6">
        <TimeSection title="Ranek" activities={day.activities.morning} />
        <TimeSection title="Popołudnie" activities={day.activities.afternoon} />
        <TimeSection title="Wieczór" activities={day.activities.evening} />
      </div>
    </div>
  );
}
