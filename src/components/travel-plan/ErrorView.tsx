import { Button } from "@/components/ui/button";

interface ErrorViewProps {
  errorMessage: string;
  onRetry: () => void;
}

/**
 * ErrorView component displays error state with retry option.
 * Shows an error icon, message, and action button to retry generation.
 */
export function ErrorView({ errorMessage, onRetry }: ErrorViewProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      {/* Error icon */}
      <div className="w-16 h-16 mb-6 rounded-full bg-red-100 flex items-center justify-center">
        <svg
          className="w-8 h-8 text-red-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>

      {/* Error message */}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Wystąpił błąd</h3>
      <p className="text-sm text-gray-600 text-center max-w-md mb-6">{errorMessage}</p>

      {/* Retry button */}
      <Button onClick={onRetry} variant="default">
        Spróbuj ponownie
      </Button>
    </div>
  );
}
