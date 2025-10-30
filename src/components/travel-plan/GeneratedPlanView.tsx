import React from "react";
import { Button } from "@/components/ui/button";
import type { TypedTravelPlan, PlanActivity } from "@/types";

interface GeneratedPlanViewProps {
  plan: TypedTravelPlan;
  onSave: () => void;
}

/**
 * Get color classes for price category badge based on price range.
 */
function getPriceCategoryColor(category: string): string {
  const lowerCategory = category.toLowerCase();
  
  // Free activities
  if (lowerCategory.includes('bezpłatne') || lowerCategory.includes('free')) {
    return 'bg-green-100 text-green-700 border border-green-200';
  }
  
  // Luxury/Premium activities (high prices or luxury keywords)
  if (
    lowerCategory.includes('luksus') || 
    lowerCategory.includes('luxury') || 
    lowerCategory.includes('premium') ||
    lowerCategory.includes('150') ||
    lowerCategory.includes('200') ||
    lowerCategory.includes('100-150') ||
    lowerCategory.includes('80-120')
  ) {
    return 'bg-purple-100 text-purple-700 border border-purple-200';
  }
  
  // Economy/Budget activities (low prices)
  if (
    lowerCategory.includes('ekonomi') || 
    lowerCategory.includes('economy') ||
    lowerCategory.includes('5-10') ||
    lowerCategory.includes('10-20') ||
    lowerCategory.includes('15-25') ||
    lowerCategory.includes('ulgowy')
  ) {
    return 'bg-blue-100 text-blue-700 border border-blue-200';
  }
  
  // Standard/Mid-range (default)
  return 'bg-amber-100 text-amber-700 border border-amber-200';
}

/**
 * ActivityCard displays a single activity with its details.
 */
function ActivityCard({ activity }: { activity: PlanActivity }) {
  return (
    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <h5 className="font-semibold text-gray-900">{activity.name}</h5>
        <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap font-medium ${getPriceCategoryColor(activity.priceCategory)}`}>
          {activity.priceCategory}
        </span>
      </div>

      <p className="text-sm text-gray-700">{activity.description}</p>

      {/* Logistics information */}
      {(activity.logistics.address || activity.logistics.estimatedTime || activity.logistics.mapLink) && (
        <div className="pt-2 mt-2 border-t border-gray-200 space-y-1">
          {activity.logistics.address && (
            <p className="text-xs text-gray-600 flex items-start gap-1">
              <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{activity.logistics.address}</span>
            </p>
          )}

          {activity.logistics.estimatedTime && (
            <p className="text-xs text-gray-600 flex items-center gap-1">
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

/**
 * TimeSection displays activities for a specific time of day.
 */
function TimeSection({ title, activities }: { title: string; activities: PlanActivity[] }) {
  if (activities.length === 0) return null;

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-gray-700 uppercase tracking-wide">{title}</h4>
      <div className="space-y-3">
        {activities.map((activity, index) => (
          <ActivityCard key={`${title}-${index}`} activity={activity} />
        ))}
      </div>
    </div>
  );
}

/**
 * GeneratedPlanView displays the complete generated travel plan.
 * Shows structured itinerary with days, times, and activities.
 */
export function GeneratedPlanView({ plan, onSave }: GeneratedPlanViewProps) {
  return (
    <div className="space-y-6">
      {/* Success message */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-green-900 mb-1">Plan podróży został wygenerowany!</h3>
            <p className="text-sm text-green-700">
              Poniżej znajdziesz szczegółowy plan podróży. Możesz go zapisać, aby mieć do niego dostęp później.
            </p>
          </div>
        </div>
      </div>

      {/* Plan content */}
      <div className="space-y-8 max-h-[60vh] overflow-y-auto pr-2">
        {plan.content.days.map((day) => (
          <div key={day.day} className="border border-gray-200 rounded-lg p-6 space-y-6">
            {/* Day header */}
            <div className="pb-4 border-b border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <span className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-bold">
                  {day.day}
                </span>
                <h3 className="text-xl font-bold text-gray-900">{day.title}</h3>
              </div>
            </div>

            {/* Activities by time of day */}
            <div className="space-y-6">
              <TimeSection title="Ranek" activities={day.activities.morning} />
              <TimeSection title="Popołudnie" activities={day.activities.afternoon} />
              <TimeSection title="Wieczór" activities={day.activities.evening} />
            </div>
          </div>
        ))}

        {/* Disclaimer */}
        {plan.content.disclaimer && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-xs text-gray-600 leading-relaxed">{plan.content.disclaimer}</p>
          </div>
        )}
      </div>

      {/* Save button */}
      <div className="pt-4 border-t border-gray-200">
        <Button onClick={onSave} className="w-full" size="lg">
          Zapisz do moich podróży
        </Button>
      </div>
    </div>
  );
}

