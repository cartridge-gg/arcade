import { createCollection } from "@tanstack/react-db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { QueryClient } from "@tanstack/react-query";
import { graphqlClient } from "@/queries/graphql-client";
import { queryKeys } from "@/queries/keys";

export interface Metric {
  id: string;
  name: string;
  value: number;
  category: string;
  timestamp: string;
  project: string;
  metadata?: any;
}

export interface Playthrough {
  id: string;
  userId: string;
  gameId: string;
  startedAt: string;
  completedAt?: string;
  progress: number;
  score?: number;
  achievements?: string[];
  project: string;
}

interface MetricsResponse {
  metrics: {
    items: Array<{
      meta: {
        project: string;
      };
      metrics: Array<{
        id: string;
        name: string;
        value: number;
        category: string;
        timestamp: string;
        metadata?: any;
      }>;
    }>;
  };
}

interface PlaythroughsResponse {
  playthroughs: {
    edges: Array<{
      node: {
        id: string;
        userId: string;
        gameId: string;
        startedAt: string;
        completedAt?: string;
        progress: number;
        score?: number;
        achievements?: string[];
      };
    }>;
    pageInfo?: {
      hasNextPage: boolean;
      endCursor?: string;
    };
  };
}

const METRICS_QUERY = `
  query GetMetrics($projects: [String!]!, $category: String, $limit: Int) {
    metrics(projects: $projects, category: $category, limit: $limit) {
      items {
        meta {
          project
        }
        metrics {
          id
          name
          value
          category
          timestamp
          metadata
        }
      }
    }
  }
`;

const PLAYTHROUGHS_QUERY = `
  query GetPlaythroughs($userId: String, $gameId: String, $projects: [String!], $limit: Int, $offset: Int) {
    playthroughs(userId: $userId, gameId: $gameId, projects: $projects, limit: $limit, offset: $offset) {
      edges {
        node {
          id
          userId
          gameId
          startedAt
          completedAt
          progress
          score
          achievements
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

export const metricsCollection = createCollection(
  queryCollectionOptions({
    queryKey: (projects: string[], category?: string, limit: number = 100) => 
      queryKeys.discovery.metrics(projects, category, limit),
    queryFn: async ({ queryKey }) => {
      const [, , projects, category, limit] = queryKey as [unknown, unknown, string[], string | undefined, number];
      const data = await graphqlClient<MetricsResponse>(
        METRICS_QUERY,
        {
          projects,
          category,
          limit,
        }
      );
      
      const metrics: Metric[] = [];
      data.metrics?.items?.forEach((item) => {
        item.metrics?.forEach((metric) => {
          metrics.push({
            ...metric,
            project: item.meta.project,
          });
        });
      });
      
      return metrics;
    },
    queryClient: new QueryClient(),
    getKey: (item: Metric) => `${item.project}-${item.id}`,
    schema: {
      validate: (item: unknown): item is Metric => {
        const m = item as Metric;
        return typeof m.id === 'string' && 
               typeof m.name === 'string' &&
               typeof m.value === 'number' &&
               typeof m.category === 'string' &&
               typeof m.project === 'string';
      }
    }
  })
);

export const playthroughsCollection = createCollection(
  queryCollectionOptions({
    queryKey: (
      projects: string[], 
      userId?: string, 
      gameId?: string, 
      limit: number = 100, 
      offset: number = 0
    ) => 
      queryKeys.discovery.playthroughs(projects, userId, gameId, limit, offset),
    queryFn: async ({ queryKey }) => {
      const [, , projects, userId, gameId, limit, offset] = queryKey as [
        unknown, unknown, string[], string | undefined, string | undefined, number, number
      ];
      const data = await graphqlClient<PlaythroughsResponse>(
        PLAYTHROUGHS_QUERY,
        {
          projects,
          userId,
          gameId,
          limit,
          offset,
        }
      );
      
      const playthroughs: Playthrough[] = data.playthroughs?.edges?.map(edge => ({
        ...edge.node,
        project: projects[0] || 'default',
      })) || [];
      
      return playthroughs;
    },
    queryClient: new QueryClient(),
    getKey: (item: Playthrough) => item.id,
    schema: {
      validate: (item: unknown): item is Playthrough => {
        const p = item as Playthrough;
        return typeof p.id === 'string' && 
               typeof p.userId === 'string' &&
               typeof p.gameId === 'string' &&
               typeof p.progress === 'number' &&
               typeof p.project === 'string';
      }
    }
  })
);