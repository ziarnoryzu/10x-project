import React from "react";

/**
 * LoadingView component displays a loading state during plan generation.
 * Shows a spinner and informative message to the user.
 */
export function LoadingView() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      {/* Spinner animation */}
      <div className="relative w-16 h-16 mb-6">
        <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>

      {/* Loading message */}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Generowanie planu podróży</h3>
      <p className="text-sm text-gray-600 text-center max-w-md">
        Trwa tworzenie spersonalizowanego planu podróży. To może potrwać do minuty...
      </p>
    </div>
  );
}
