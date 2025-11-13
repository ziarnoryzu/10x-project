import type { PlanActivity } from "@/types";
import { translatePriceCategory, getPriceCategoryColor } from "@/lib/utils/travel-plan.utils";

interface ActivityCardProps {
  activity: PlanActivity;
}

/**
 * ActivityCard displays a single activity with its details.
 * Used in travel plan views to show activity information including
 * name, description, price category, and logistics.
 */
export function ActivityCard({ activity }: ActivityCardProps) {
  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <h5 className="font-semibold text-gray-900 dark:text-gray-100">{activity.name}</h5>
        <span
          className={`text-xs px-2 py-1 rounded-full whitespace-nowrap font-medium ${getPriceCategoryColor(
            activity.priceCategory
          )}`}
        >
          {translatePriceCategory(activity.priceCategory)}
        </span>
      </div>

      <p className="text-sm text-gray-700 dark:text-gray-300">{activity.description}</p>

      {/* Logistics information */}
      {(activity.logistics.address || activity.logistics.estimatedTime || activity.logistics.mapLink) && (
        <div className="pt-2 mt-2 border-t border-gray-200 dark:border-gray-700 space-y-1">
          {activity.logistics.address && (
            <p className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-1">
              <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span>{activity.logistics.address}</span>
            </p>
          )}

          {activity.logistics.estimatedTime && (
            <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{activity.logistics.estimatedTime}</span>
            </p>
          )}

          {activity.logistics.mapLink && (
            <a
              href={activity.logistics.mapLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
              <span>Zobacz na mapie</span>
            </a>
          )}
        </div>
      )}
    </div>
  );
}
