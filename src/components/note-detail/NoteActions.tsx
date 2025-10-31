import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface NoteActionsProps {
  isReadyForPlanGeneration: boolean;
  hasTravelPlan: boolean;
  isCopying: boolean;
  onGenerateClick: () => void;
  onCopyClick: () => void;
  onDeleteClick: () => void;
}

/**
 * NoteActions component provides action buttons for note operations.
 * Includes generate/regenerate plan, copy, and delete buttons.
 * Handles button states and tooltips based on note readiness.
 */
export function NoteActions({
  isReadyForPlanGeneration,
  hasTravelPlan,
  isCopying,
  onGenerateClick,
  onCopyClick,
  onDeleteClick,
}: NoteActionsProps) {
  const generateButtonText = hasTravelPlan ? "Regeneruj plan" : "Generuj plan";
  const tooltipText = "Dodaj więcej szczegółów do notatki (min. 10 słów), aby wygenerować plan.";

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Generate Plan Button */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="flex-1">
              <Button
                onClick={onGenerateClick}
                disabled={!isReadyForPlanGeneration}
                className="w-full"
                variant={hasTravelPlan ? "outline" : "default"}
                aria-label={generateButtonText}
              >
                {generateButtonText}
              </Button>
            </span>
          </TooltipTrigger>
          {!isReadyForPlanGeneration && (
            <TooltipContent>
              <p>{tooltipText}</p>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>

      {/* Copy Button */}
      <Button
        onClick={onCopyClick}
        disabled={isCopying}
        variant="outline"
        className="flex-1"
        aria-label="Kopiuj notatkę"
      >
        {isCopying ? "Kopiowanie..." : "Kopiuj"}
      </Button>

      {/* Delete Button */}
      <Button onClick={onDeleteClick} variant="destructive" className="flex-1" aria-label="Usuń notatkę">
        Usuń
      </Button>
    </div>
  );
}
