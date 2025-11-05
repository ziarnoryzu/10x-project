import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useGeneratePlan } from "@/components/hooks/useGeneratePlan";
import { GenerationOptionsForm } from "./GenerationOptionsForm";
import { LoadingView } from "./LoadingView";
import { GeneratedPlanView } from "./GeneratedPlanView";
import { ErrorView } from "./ErrorView";
import type { NoteWithPlan, GenerationOptions } from "@/types";

interface GeneratePlanModalProps {
  note: NoteWithPlan;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSuccess: () => void;
}

/**
 * GeneratePlanModal is the main container component for travel plan generation workflow.
 * Manages the complete flow from options selection through generation to saving.
 * Uses Shadcn Dialog component with conditional rendering based on generation state.
 */
export function GeneratePlanModal({ note, isOpen, onOpenChange, onSuccess }: GeneratePlanModalProps) {
  const { status, generatedPlan, error, generatePlan, savePlan, reset } = useGeneratePlan(
    note.id,
    note.travel_plan,
    onSuccess
  );

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
            <GenerationOptionsForm existingPlan={note.travel_plan} isSubmitting={false} onSubmit={handleGenerate} />
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
