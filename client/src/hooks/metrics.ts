import { MetricsQuery, useMetricsQuery } from "@cartridge/utils/api/cartridge";
import { UseQueryOptions } from "react-query";

export const useMetrics = (projectName: string, options?: UseQueryOptions<MetricsQuery>) => {

  const { data: _data, isLoading, isError } = useMetricsQuery({ projects: { project: projectName } }, options);

  const data = _data?.metrics.items || [];

  return {
    data,
    isLoading,
    isError,
  }
}
