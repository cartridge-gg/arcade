import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../keys';
import { queryConfigs } from '../queryClient';

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

async function fetchActivities(projects: ActivityProject[]): Promise<ActivitiesResponse> {
  // TODO: Replace with actual Cartridge API call
  // This should use @cartridge/ui/utils/api/cartridge useActivitiesQuery
  throw new Error('TODO: implement me at activities/transactions.ts - Need to integrate Cartridge API for fetching game activities');
}

export function useActivitiesQuery(address: string, projects: ActivityProject[], limit?: number) {
  return useQuery({
    queryKey: queryKeys.activities.transactions(address, projects, limit),
    queryFn: () => fetchActivities(projects),
    enabled: !!address && projects.length > 0,
    ...queryConfigs.activities,
  });
}

// Combined activities query (transfers + transactions)
export function useCombinedActivitiesQuery(address: string, projects: any[]) {
  return useQuery({
    queryKey: queryKeys.activities.combined(address, projects),
    queryFn: async () => {
      // This would combine transfers and activities into a unified feed
      // Sorted by timestamp and formatted for display
      throw new Error('TODO: implement me at activities/transactions.ts - Need to combine transfers and activities into unified feed');
    },
    enabled: !!address && projects.length > 0,
    ...queryConfigs.activities,
  });
}