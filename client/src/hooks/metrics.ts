import { useMemo } from "react";
import { useAtomValue } from "@effect-atom/atom-react";
import { editionsAtom, metricsAtom, type MetricsData } from "@/effect/atoms";
import { unwrap } from "@/effect/utils/result";
import { useProject } from "./project";
import type { MetricsProject } from "@cartridge/ui/utils/api/cartridge";

export type Metrics = MetricsData;

export const useMetrics = () => {
  const { edition } = useProject();
  const editionsResult = useAtomValue(editionsAtom);
  const { value: editions } = unwrap(editionsResult, []);

  const projects: MetricsProject[] = useMemo(() => {
    return editions.map((edition) => ({
      project: edition.config.project,
    }));
  }, [editions]);

  const metricsResult = useAtomValue(metricsAtom(projects));
  const { value: allMetrics, status } = unwrap(metricsResult, [] as Metrics[]);

  const metrics = useMemo(() => {
    if (!edition) return allMetrics;
    return allMetrics.filter(
      (metric) => metric.project === edition.config.project,
    );
  }, [edition, allMetrics]);

  return { metrics, status };
};
