import { TraceabilityView } from "@/components/ui/traceability/TraceabilityView";
import { useTraceabilityViewModel } from "./useTraceabilityViewModel";

export const TraceabilityContainer = () => {
  const viewModel = useTraceabilityViewModel();
  return <TraceabilityView {...viewModel} />;
};
