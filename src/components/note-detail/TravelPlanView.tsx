import type { TypedTravelPlan } from "@/types";
import { TravelPlanDisplay } from "@/components/travel-plan/TravelPlanDisplay";

interface TravelPlanViewProps {
  plan: TypedTravelPlan;
}

/**
 * TravelPlanView component displays a saved travel plan in a read-only format.
 * This is a lightweight wrapper around TravelPlanDisplay with "saved" variant.
 * Used on the note detail page to show an existing plan.
 */
export function TravelPlanView({ plan }: TravelPlanViewProps) {
  return <TravelPlanDisplay plan={plan} variant="saved" showGeneratedDate={true} />;
}
