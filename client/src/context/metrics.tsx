import { createContext, type ReactNode, useMemo } from "react";
import { useAtomValue } from "@effect-atom/atom-react";
import { createMetricsAtom, unwrap, type MetricsData } from "@/effect";
import type { MetricsProject } from "@cartridge/ui/utils/api/cartridge";
import { useArcade } from "@/hooks/arcade";

export type Metrics = MetricsData;

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

  const metricsAtom = useMemo(() => createMetricsAtom(projects), [projects]);
  const result = useAtomValue(metricsAtom);
  const { value: metrics, status } = unwrap(result, [] as Metrics[]);

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
