import PredictCard from "./PredictCard";
import type { PredictViewModel } from "@/features/predict/usePredictViewModel";

export const PredictView = ({ predictions }: PredictViewModel) => {
  if (predictions.length === 0) return null;

  return (
    <div className="py-3 lg:py-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {predictions.map((prediction, index) => (
        <PredictCard key={index} {...prediction} />
      ))}
    </div>
  );
};
