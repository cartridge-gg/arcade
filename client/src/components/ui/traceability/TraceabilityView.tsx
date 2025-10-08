import { cn, Empty } from "@cartridge/ui";

interface TraceabilityViewProps {
  className?: string;
  title?: string;
  icon?:
    | "activity"
    | "achievement"
    | "guild"
    | "inventory"
    | "discover"
    | "leaderboard"
    | "claim";
}

export const TraceabilityView = ({
  className,
  title,
  icon,
}: TraceabilityViewProps) => {
  return (
    <Empty
      title={title}
      icon={icon}
      className={cn("h-full py-3 lg:py-6", className)}
    />
  );
};
