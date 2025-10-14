import { PositionsView } from "@/components/ui/positions/PositionsView";
import { usePositionsViewModel } from "./usePositionsViewModel";

export const PositionsContainer = () => {
  const viewModel = usePositionsViewModel();
  return <PositionsView {...viewModel} />;
};
