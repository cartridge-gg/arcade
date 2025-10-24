import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "./keys";
import { graphqlClient } from "./graphql-client";
import type { Metrics } from "@/context/metrics";

const METRICS_QUERY = `query Metrics($projects: [MetricsProject!]!) {
  metrics(projects: $projects) {
    items {
      meta {
        project
        error
        count
      }
      metrics {
        transactionDate
        transactionCount
        callerCount
      }
    }
  }
}
`;
type Meta = {
  project: string;
  error: string;
  count: number;
};
type Item = {
  transactionDate: string;
  transactionCount: number;
  callerCount: number;
};
type Response = {
  items: {
    meta: Meta;
    metrics: Item[];
  }[];
};

export function useMetricsQuery(projects: { project: string }[]) {
  return useQuery({
    queryKey: queryKeys.metrics.projects(projects.map((p) => p.project)),
    enabled: projects.length > 0,
    queryFn: async () => {
      const metrics: Response = await graphqlClient(METRICS_QUERY, {
        projects,
      });

      const newMetrics: { [key: string]: Metrics } = {};
      for (const item of metrics.items) {
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
      }

      return Object.values(newMetrics);
    },
  });
}
