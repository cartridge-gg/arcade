import { Atom } from "@effect-atom/atom-react";
import { Effect } from "effect";
import { CartridgeInternalGqlClient, graphqlLayer } from "../layers/graphql";

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
}`;

export type MetricsMeta = {
  project: string;
  error: string;
  count: number;
};

export type MetricsItem = {
  transactionDate: string;
  transactionCount: number;
  callerCount: number;
};

export type MetricsData = {
  project: string;
  data: {
    date: Date;
    transactionCount: number;
    callerCount: number;
  }[];
};

type MetricsResponse = {
  metrics: {
    items: {
      meta: MetricsMeta;
      metrics: MetricsItem[];
    }[];
  };
};

const fetchMetricsEffect = (projects: { project: string }[]) =>
  Effect.gen(function* () {
    if (projects.length === 0) {
      return [] as MetricsData[];
    }
    const client = yield* CartridgeInternalGqlClient;
    const response = yield* client.query<MetricsResponse>(METRICS_QUERY, {
      projects,
    });

    const metricsMap: { [key: string]: MetricsData } = {};
    for (const item of response.metrics.items) {
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
      if (data.length > 0) {
        metricsMap[project] = { project, data };
      }
    }

    return Object.values(metricsMap);
  });

const metricsRuntime = Atom.runtime(graphqlLayer);

const metricsFamily = Atom.family((key: string) => {
  const projects: { project: string }[] = JSON.parse(key);
  return metricsRuntime.atom(fetchMetricsEffect(projects)).pipe(Atom.keepAlive);
});

export const metricsAtom = (projects: { project: string }[]) => {
  const sortedKey = JSON.stringify(
    [...projects].sort((a, b) => a.project.localeCompare(b.project)),
  );
  return metricsFamily(sortedKey);
};
