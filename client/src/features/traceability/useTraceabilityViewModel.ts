import type { ComponentProps } from "react";
import type { Empty } from "@cartridge/ui";

export interface TraceabilityViewModel {
  title: string;
  icon: ComponentProps<typeof Empty>["icon"];
}

export function useTraceabilityViewModel(): TraceabilityViewModel {
  return {
    title: "Coming soon",
    icon: "guild",
  };
}
