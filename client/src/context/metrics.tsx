import { createContext, type ReactNode, useMemo } from "react";
import { useMetricsQuery } from "@/queries";
import type { MetricsProject } from "@cartridge/ui/utils/api/cartridge";
import { useArcade } from "@/hooks/arcade";

export type Metrics = {
  project: string;
  data: {
    date: Date;
    transactionCount: number;
    callerCount: number;
  }[];
};

export type MetricsContextType = {
  metrics: Metrics[];
  status: "success" | "error" | "pending";
};

export const MetricsContext = createContext<MetricsContextType | null>(null);

export function MetricsProvider({ children }: { children: ReactNode }) {
  const { editions } = useArcade();

  const projects: MetricsProject[] = useMemo(() => {
    return editions.map((edition) => ({
      project: edition.config.project,
    }));
  }, [editions]);

  const { data: metrics = [], status } = useMetricsQuery(projects);

  return (
    <MetricsContext.Provider
      value={{
        metrics,
        status,
      }}
    >
      {children}
    </MetricsContext.Provider>
  );
}
