import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../keys';
import { queryConfigs } from '../queryClient';

export interface Playthrough {
  id: string;
  playerAddress: string;
  gameId: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  achievementsEarned: string[];
  score?: number;
  metadata?: any;
}

export interface PlaythroughsResponse {
  playthroughs: {
    items: Array<{
      meta: {
        project: string;
      };
      sessions: Playthrough[];
    }>;
  };
}

async function fetchPlaythroughs(
  projects: string[],
  limit: number = 1000
): Promise<PlaythroughsResponse> {
  // TODO: Replace with actual Cartridge API call
  // This should use @cartridge/ui/utils/api/cartridge usePlaythroughsQuery
  throw new Error('TODO: implement me at discovery/playthroughs.ts - Need to integrate Cartridge API for fetching gameplay sessions');
}

export function usePlaythroughsQuery(projects: string[], limit?: number) {
  return useQuery({
    queryKey: queryKeys.discovery.playthroughs(projects, limit),
    queryFn: () => fetchPlaythroughs(projects, limit),
    enabled: projects.length > 0,
    ...queryConfigs.discovery,
  });
}

// Query for user-specific playthroughs
export function useUserPlaythroughsQuery(
  address: string,
  projects: string[],
  limit?: number
) {
  return useQuery({
    queryKey: [...queryKeys.discovery.playthroughs(projects, limit), address],
    queryFn: async () => {
      const data = await fetchPlaythroughs(projects, limit);
      // Filter for specific user
      return {
        playthroughs: {
          items: data.playthroughs.items.map(item => ({
            ...item,
            sessions: item.sessions.filter(
              s => s.playerAddress.toLowerCase() === address.toLowerCase()
            ),
          })),
        },
      };
    },
    enabled: !!address && projects.length > 0,
    ...queryConfigs.discovery,
  });
}