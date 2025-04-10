import { createContext, useState, ReactNode, useMemo } from "react";
import {
  MetricsProject,
  useMetricsQuery,
} from "@cartridge/utils/api/cartridge";
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
  status: "success" | "error" | "idle" | "loading";
};

export const MetricsContext = createContext<MetricsContextType | null>(null);

export function MetricsProvider({ children }: { children: ReactNode }) {
  const { projects: slots } = useArcade();
  const [metrics, setMetrics] = useState<Metrics[]>([]);

  const projects: MetricsProject[] = useMemo(
    () =>
      slots.map((slot) => ({
        project: slot.project === "ryomainnet" ? "dopewarsbal" : slot.project,
      })),
    [slots],
  );

  const { status } = useMetricsQuery(
    {
      projects: projects,
    },
    {
      queryKey: ["Metricss", projects],
      enabled: projects.length > 0,
      onSuccess: ({ metrics }) => {
        const newMetrics: { [key: string]: Metrics } = {};
        metrics?.items.forEach((item) => {
          const project = item.meta.project;
          const data = item.metrics.map((metric) => {
            const date = new Date(metric.transactionDate);
            date.setHours(0, 0, 0, 0);
            return {
              date,
              transactionCount: metric.transactionCount,
              callerCount: metric.callerCount,
            };
          });
          if (data.length === 0) return;
          newMetrics[`${project}`] = { project, data };
        });
        setMetrics(Object.values(newMetrics));
      },
    },
  );

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
