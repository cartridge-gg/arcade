import { constants } from "starknet";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../keys";
import { graphqlClient } from "../graphql-client";
import { useEditionsQuery } from "../games";
import { useMemo } from "react";
import { Metrics } from "@/context/metrics";

export interface MetricsProject {
  project: string;
}

export interface Metric {
  date: string;
  transactionCount: number;
  uniqueCallers: number;
  volume?: string;
}

export interface MetricsResponse {
  metrics: {
    items: Array<{
      meta: {
        project: string;
      };
      metrics: Metric[];
    }>;
  };
}

export function useMetricsQuery(game: string | undefined) {
  const { data: editions = [] } = useEditionsQuery(
    constants.StarknetChainId.SN_MAIN,
  );
  const projects: MetricsProject[] = useMemo(() => {
    if (editions.length === 0) return [];
    const uniqueProjects = new Set<string>();

    if (game) {
      return editions.filter(e => e.attributes.preset === game).map(e => ({ project: e.config.project }));
    }

    for (const edition of editions) {
      uniqueProjects.add(edition.config.project);
    }

    return Array.from(uniqueProjects);
  }, [editions, game]);

  const METRICS_QUERY = `
    query GetMetrics($projects: [MetricsProject!]!) {
      metrics(projects: $projects) {
        items {
          meta {
            project
          }
          metrics {
            date
            transactionDate
            transactionCount
            uniqueCallers
            callerCount
            volume
          }
        }
      }
    }
  `;

  const result = useQuery({
    queryKey: queryKeys.discovery.metrics(projects),
    queryFn: async () => {
      const data = await graphqlClient<MetricsResponse>(
        METRICS_QUERY,
        { projects }
      );
      return data;
    },
    enabled: projects.length > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes for metrics
    refetchInterval: 1000 * 60 * 5, // Refresh every 5 minutes
  });

  const metrics = useMemo(() => {
    const items = result.data?.metrics.items;
    if (!items || items.length === 0) return {};

    const newMetrics: { [key: string]: Metrics } = {};
    const dateCache = new Map<string, Date>();

    for (const item of items) {
      const project = item.meta.project;
      const metricsData = item.metrics;

      if (!metricsData || metricsData.length === 0) continue;

      const data = new Array(metricsData.length);

      for (let i = 0; i < metricsData.length; i++) {
        const metric = metricsData[i];
        const dateStr = metric.date || metric.transactionDate;

        let date = dateCache.get(dateStr);
        if (!date) {
          date = new Date(dateStr);
          date.setHours(0, 0, 0, 0);
          dateCache.set(dateStr, date);
        }

        data[i] = {
          date,
          transactionCount: metric.transactionCount || 0,
          callerCount: metric.uniqueCallers || metric.callerCount || 0,
        };
      }

      newMetrics[project] = { project, data };
    }

    return newMetrics;
  }, [result.data])

  return {
    ...result,
    data: Object.values(metrics),
  };
}
