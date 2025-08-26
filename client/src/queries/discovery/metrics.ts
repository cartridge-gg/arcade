import { queryKeys } from "../keys";
import { queryConfigs } from "../queryClient";
import { useMetricsQuery as useCartridgeMetricsQuery } from "@cartridge/ui/utils/api/cartridge";

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

export function useMetricsQuery(projects: string[]) {
  // Use the Cartridge API hook directly
  const result = useCartridgeMetricsQuery(
    { projects },
    {
      queryKey: queryKeys.discovery.metrics(projects),
      enabled: projects.length > 0,
      staleTime: 1000 * 60 * 5, // 5 minutes for metrics
      refetchInterval: 1000 * 60 * 5, // Refresh every 5 minutes
    },
  );

  // Return with proper typing
  return {
    ...result,
    data: result.data as MetricsResponse | undefined,
  };
}
