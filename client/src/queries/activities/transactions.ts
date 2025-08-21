import { queryKeys } from '../keys';
import { queryConfigs } from '../queryClient';
import { useActivitiesQuery as useCartridgeActivitiesQuery } from '@cartridge/ui/utils/api/cartridge';

export interface ActivityProject {
  project: string;
  address: string;
  limit?: number;
}

export interface Activity {
  transactionHash: string;
  executedAt: string;
  eventId: string;
  type: string;
  data: any;
  metadata?: any;
}

export interface ActivitiesResponse {
  activities: {
    items: {
      meta: { project: string };
      activities: Activity[];
    }[];
  };
}

export function useActivitiesQuery(address: string, projects: ActivityProject[], limit?: number) {
  // Use the Cartridge API hook directly
  const result = useCartridgeActivitiesQuery(
    { projects },
    {
      queryKey: queryKeys.activities.transactions(address, projects, limit),
      enabled: !!address && projects.length > 0,
      ...queryConfigs.activities,
    }
  );

  // Return with proper typing
  return {
    ...result,
    data: result.data as ActivitiesResponse | undefined,
  };
}