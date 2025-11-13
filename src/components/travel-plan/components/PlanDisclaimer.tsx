interface PlanDisclaimerProps {
  disclaimer: string;
}

/**
 * PlanDisclaimer displays a disclaimer message for the travel plan.
 * Typically used to show AI-generated content warnings or important notes.
 */
export function PlanDisclaimer({ disclaimer }: PlanDisclaimerProps) {
  return (
    <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{disclaimer}</p>
    </div>
  );
}
