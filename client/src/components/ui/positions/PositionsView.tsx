import { ColumnLabels } from "./ColumnLabels";
import { PositionCard } from "./PositionCard";
import type { PositionsViewModel } from "@/features/positions/usePositionsViewModel";

export const PositionsView = ({ positions }: PositionsViewModel) => {
  if (positions.length === 0) return null;

  return (
    <div className="flex flex-col gap-3 py-3 lg:py-6">
      <ColumnLabels />
      {positions.map((position, index) => (
        <PositionCard key={index} {...position} />
      ))}
    </div>
  );
};
