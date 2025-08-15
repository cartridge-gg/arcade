import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../keys';
import { queryConfigs } from '../queryClient';

export interface ProgressionProject {
  model: string;
  namespace: string;
  project: string;
}

export interface ProgressionResponse {
  items: {
    meta: { project: string };
    achievements: any[]; // Raw progress data
  }[];
}

async function fetchProgressions(projects: ProgressionProject[], address?: string): Promise<ProgressionResponse> {
  // TODO: Replace with actual Cartridge API call
  // This should use @cartridge/ui/utils/api/cartridge useProgressionsQuery
  // May need to filter by player address if provided
  throw new Error('TODO: implement me at achievements/progressions.ts - Need to integrate Cartridge API for fetching player progressions');
}

export function useProgressionsQuery(projects: ProgressionProject[], address?: string) {
  return useQuery({
    queryKey: queryKeys.achievements.progressions(projects, address),
    queryFn: () => fetchProgressions(projects, address),
    enabled: projects.length > 0,
    ...queryConfigs.achievements,
  });
}

// Combined achievements stats query
export function useAchievementStatsQuery(projects: ProgressionProject[], address?: string) {
  return useQuery({
    queryKey: queryKeys.achievements.stats(projects, address),
    queryFn: async () => {
      // This would combine trophies and progressions to compute stats
      // Including rankings, completion rates, etc.
      throw new Error('TODO: implement me at achievements/progressions.ts - Need to compute achievement stats from trophies and progressions');
    },
    enabled: projects.length > 0 && !!address,
    ...queryConfigs.achievements,
  });
}