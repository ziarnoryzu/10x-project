import type { TypedTravelPlan } from "@/types";
import { TravelPlanDisplay } from "./TravelPlanDisplay";

interface GeneratedPlanViewProps {
  plan: TypedTravelPlan;
  onSave: () => void;
}

/**
 * GeneratedPlanView displays a newly generated travel plan.
 * This is a lightweight wrapper around TravelPlanDisplay with "preview" variant.
 */
export function GeneratedPlanView({ plan, onSave }: GeneratedPlanViewProps) {
  return <TravelPlanDisplay plan={plan} variant="preview" onSave={onSave} />;
}
