import { ColumnLabels } from "./column-labels";
import { PositionCard } from "./position-card";

export function Positions() {
  return (
    <div className="flex flex-col gap-3 py-3 lg:py-6">
      <ColumnLabels />
      {Array.from([1, 2, 3]).map(() => (
        <PositionCard />
      ))}
    </div>
  );
}
