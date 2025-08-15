import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../keys';
import { queryConfigs } from '../queryClient';

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

async function fetchMetrics(projects: string[]): Promise<MetricsResponse> {
  // TODO: Replace with actual Cartridge API call
  // This should use @cartridge/ui/utils/api/cartridge useMetricsQuery
  throw new Error('TODO: implement me at discovery/metrics.ts - Need to integrate Cartridge API for fetching project analytics');
}

export function useMetricsQuery(projects: string[]) {
  return useQuery({
    queryKey: queryKeys.discovery.metrics(projects),
    queryFn: () => fetchMetrics(projects),
    enabled: projects.length > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes for metrics
    refetchInterval: 1000 * 60 * 5, // Refresh every 5 minutes
  });
}

// Query for specific project analytics with time range
export function useProjectAnalyticsQuery(
  projectId: string,
  timeRange: 'day' | 'week' | 'month' | 'year' = 'week'
) {
  return useQuery({
    queryKey: queryKeys.discovery.analytics(projectId, timeRange),
    queryFn: async () => {
      // TODO: Fetch and aggregate analytics for specific time range
      throw new Error('TODO: implement me at discovery/metrics.ts - Need to fetch project analytics for time range');
    },
    enabled: !!projectId,
    staleTime: 1000 * 60 * 15, // 15 minutes for analytics
  });
}