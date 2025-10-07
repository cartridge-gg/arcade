import type { ComponentProps } from "react";
import { cn, Empty } from "@cartridge/ui";

interface TraceabilityViewProps {
  className?: string;
  title: ComponentProps<typeof Empty>["title"];
  icon: ComponentProps<typeof Empty>["icon"];
}

export const TraceabilityView = ({ className, title, icon }: TraceabilityViewProps) => {
  return (
    <Empty
      title={title}
      icon={icon}
      className={cn("h-full py-3 lg:py-6", className)}
    />
  );
};
