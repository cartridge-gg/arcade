import { useContext, useMemo } from "react";
import { MetricsContext } from "../context/metrics";
import { useProject } from "./project";

/**
 * Custom hook to access the Metric context and account information.
 * Must be used within a MetricProvider component.
 *
 * @returns An object containing:
 * - metrics: The registered metrics
 * - status: The status of the metrics
 * @throws {Error} If used outside of a MetricProvider context
 */
export const useMetrics = () => {
  const context = useContext(MetricsContext);
  const { project } = useProject();

  if (!context) {
    throw new Error(
      "The `useMetrics` hook must be used within a `MetricProvider`",
    );
  }

  const { metrics: allMetrics, status } = context;

  const metrics = useMemo(() => {
    if (!project) return allMetrics;
    return allMetrics.filter((metric) =>
      project === "ryomainnet"
        ? metric.project === "dopewarsbal"
        : metric.project === project,
    );
  }, [project, allMetrics]);

  return { metrics, status };
};
