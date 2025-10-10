import { PredictView } from "@/components/ui/predict/PredictView";
import { usePredictViewModel } from "./usePredictViewModel";

export const PredictContainer = () => {
  const viewModel = usePredictViewModel();
  return <PredictView {...viewModel} />;
};
