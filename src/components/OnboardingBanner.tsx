import { useState, useEffect } from "react";

interface OnboardingBannerProps {
  onDismiss?: () => void;
}

const STORAGE_KEY = "onboarding_banner_dismissed";

/**
 * OnboardingBanner - Informational banner for new users
 * Encourages users to complete their travel preferences
 * Can be dismissed and won't show again using localStorage
 */
export function OnboardingBanner({ onDismiss }: OnboardingBannerProps) {
  const [isVisible, setIsVisible] = useState(false);

  // Check localStorage on mount to see if banner was dismissed
  useEffect(() => {
    const isDismissed = localStorage.getItem(STORAGE_KEY);
    if (!isDismissed) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem(STORAGE_KEY, "true");
    onDismiss?.();
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
      <div className="flex items-start justify-between">
        <p className="flex-1 text-sm text-blue-900">
          💡 <strong>Wskazówka:</strong> Uzupełnij swoje preferencje turystyczne, aby plany były lepiej dopasowane.{" "}
          <a href="/app/profile" className="font-semibold underline hover:no-underline">
            Przejdź do profilu
          </a>
        </p>
        <button
          onClick={handleDismiss}
          className="ml-4 rounded-md p-1 text-blue-900 hover:bg-blue-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          aria-label="Zamknij baner"
          type="button"
        >
          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
