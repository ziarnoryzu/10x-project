import { useState, useCallback, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { TRAVEL_PREFERENCES } from "@/types/auth.types";

interface TravelPreferencesFormProps {
  initialPreferences: string[];
}

export function TravelPreferencesForm({ initialPreferences }: TravelPreferencesFormProps) {
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>(initialPreferences);
  const [isSaving, setIsSaving] = useState(false);

  // Auto-save when preferences change (debounced)
  useEffect(() => {
    // Don't auto-save on initial mount - check if arrays are deeply equal
    const areEqual =
      selectedPreferences.length === initialPreferences.length &&
      selectedPreferences.every((pref) => initialPreferences.includes(pref));

    if (areEqual) {
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsSaving(true);
      try {
        const response = await fetch("/api/profiles/me", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ preferences: selectedPreferences }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || "Nie udało się zapisać preferencji");
        }

        toast.success("Preferencje zostały zapisane");
      } catch (error) {
        toast.error("Nie udało się zapisać preferencji");
        // eslint-disable-next-line no-console
        console.error("Error saving preferences:", error);
      } finally {
        setIsSaving(false);
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [selectedPreferences, initialPreferences]);

  const togglePreference = useCallback((preference: string) => {
    setSelectedPreferences((prev) =>
      prev.includes(preference) ? prev.filter((p) => p !== preference) : [...prev, preference]
    );
  }, []);

  const isSelected = useCallback(
    (preference: string) => {
      return selectedPreferences.includes(preference);
    },
    [selectedPreferences]
  );

  return (
    <div className="space-y-8">
      {/* Selected preferences count */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Wybrano {selectedPreferences.length} preferencji
            {isSaving && <span className="ml-2 text-primary">• Zapisywanie...</span>}
          </p>
        </div>
      </div>

      {/* Categories */}
      {Object.entries(TRAVEL_PREFERENCES).map(([categoryKey, category]) => (
        <div key={categoryKey} className="space-y-3">
          <div>
            <h3 className="text-base font-semibold">{category.label}</h3>
            <p className="text-sm text-muted-foreground">{category.description}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {category.tags.map((tag) => (
              <Badge
                key={tag}
                variant={isSelected(tag) ? "default" : "outline"}
                className={`cursor-pointer transition-colors ${
                  isSelected(tag) ? "bg-primary text-primary-foreground hover:bg-primary/90" : "hover:bg-muted"
                }`}
                onClick={() => togglePreference(tag)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    togglePreference(tag);
                  }
                }}
                aria-pressed={isSelected(tag)}
                aria-label={`${isSelected(tag) ? "Usuń" : "Dodaj"} preferencję ${tag}`}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      ))}

      {/* Info banner */}
      {selectedPreferences.length === 0 && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/20">
          <div className="flex items-start gap-3">
            <svg
              className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Dodaj swoje preferencje turystyczne
              </p>
              <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                AI wykorzysta Twoje preferencje, aby generować plany podróży lepiej dopasowane do Twoich zainteresowań i
                potrzeb.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Benefits banner (if preferences selected) */}
      {selectedPreferences.length > 0 && selectedPreferences.length < 5 && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950/20">
          <div className="flex items-start gap-3">
            <svg
              className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <div>
              <p className="text-sm font-medium text-green-900 dark:text-green-100">Świetnie!</p>
              <p className="mt-1 text-sm text-green-700 dark:text-green-300">
                Im więcej preferencji dodasz, tym lepiej AI dopasuje plan podróży do Twoich potrzeb.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
