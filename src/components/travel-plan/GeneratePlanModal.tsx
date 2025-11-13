import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useGeneratePlan } from "@/components/hooks/useGeneratePlan";
import { GenerationOptionsForm } from "./GenerationOptionsForm";
import { LoadingView } from "./LoadingView";
import { GeneratedPlanView } from "./GeneratedPlanView";
import { ErrorView } from "./ErrorView";
import type { TravelPlanDTO, TypedTravelPlan, GenerationOptions } from "@/types";
import type { Json } from "@/db/database.types";

interface GeneratePlanModalProps {
  noteId: string;
  existingPlan: TravelPlanDTO | TypedTravelPlan | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSuccess: () => void;
}

/**
 * GeneratePlanModal is the main container component for travel plan generation workflow.
 * Manages the complete flow from options selection through generation to saving.
 * Uses Shadcn Dialog component with conditional rendering based on generation state.
 */
export function GeneratePlanModal({ noteId, existingPlan, isOpen, onOpenChange, onSuccess }: GeneratePlanModalProps) {
  // Handle both TravelPlanDTO and TypedTravelPlan
  // TypedTravelPlan has content: TravelPlanContent, but useGeneratePlan expects TravelPlanDTO with content: Json
  // We can safely pass it as the hook will handle the conversion internally
  const planDTO: TravelPlanDTO | null = existingPlan
    ? ({
        id: existingPlan.id,
        note_id: existingPlan.note_id,
        content: existingPlan.content as Json,
        created_at: existingPlan.created_at,
        updated_at: existingPlan.updated_at,
      } as TravelPlanDTO)
    : null;

  const { status, generatedPlan, error, generatePlan, savePlan, reset } = useGeneratePlan(noteId, planDTO, onSuccess);

  const handleGenerate = async (options: GenerationOptions) => {
    try {
      await generatePlan(options);
    } catch {
      // Error is handled by the hook and displayed in ErrorView
    }
  };

  const handleSave = () => {
    savePlan();
    onOpenChange(false);
  };

  const handleRetry = () => {
    reset();
  };

  // Prevent closing during loading
  const handleOpenChange = (newOpen: boolean) => {
    if (status === "loading") {
      return;
    }
    onOpenChange(newOpen);
  };

  // Reset state when modal is closed
  React.useEffect(() => {
    if (!isOpen && status !== "idle") {
      // Small delay to avoid jarring transition
      const timeoutId = setTimeout(() => {
        reset();
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [isOpen, status, reset]);

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {status === "idle" && "Wygeneruj plan podróży"}
            {status === "loading" && "Generowanie planu"}
            {status === "success" && "Twój plan podróży"}
            {status === "error" && "Błąd generowania"}
          </DialogTitle>
          <DialogDescription>
            {status === "idle" && "Dostosuj parametry, aby AI wygenerowało spersonalizowany plan podróży."}
            {status === "loading" && "Proszę czekać, trwa generowanie Twojego planu podróży..."}
            {status === "success" && "Plan został pomyślnie wygenerowany. Możesz go teraz zapisać."}
            {status === "error" && "Wystąpił problem podczas generowania planu. Spróbuj ponownie."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          {/* Idle state: Show options form */}
          {status === "idle" && (
            <GenerationOptionsForm existingPlan={planDTO} isSubmitting={false} onSubmit={handleGenerate} />
          )}

          {/* Loading state: Show spinner */}
          {status === "loading" && <LoadingView />}

          {/* Success state: Show generated plan */}
          {status === "success" && generatedPlan && <GeneratedPlanView plan={generatedPlan} onSave={handleSave} />}

          {/* Error state: Show error message */}
          {status === "error" && error && <ErrorView errorMessage={error} onRetry={handleRetry} />}
        </div>
      </DialogContent>
    </Dialog>
  );
}
