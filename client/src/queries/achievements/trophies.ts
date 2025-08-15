import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../keys';
import { queryConfigs } from '../queryClient';

export interface TrophyProject {
  model: string;
  namespace: string;
  project: string;
}

export interface TrophyResponse {
  items: {
    meta: { project: string };
    achievements: any[]; // Raw trophy data
  }[];
}

async function fetchTrophies(projects: TrophyProject[]): Promise<TrophyResponse> {
  // TODO: Replace with actual Cartridge API call
  // This should use @cartridge/ui/utils/api/cartridge useAchievementsQuery
  throw new Error('TODO: implement me at achievements/trophies.ts - Need to integrate Cartridge API for fetching achievements');
}

export function useTrophiesQuery(projects: TrophyProject[]) {
  return useQuery({
    queryKey: queryKeys.achievements.trophies(projects),
    queryFn: () => fetchTrophies(projects),
    enabled: projects.length > 0,
    ...queryConfigs.achievements,
  });
}

// Batch query for multiple games
export function useTrophiesQueries(projectGroups: TrophyProject[][]) {
  return projectGroups.map(projects => 
    useQuery({
      queryKey: queryKeys.achievements.trophies(projects),
      queryFn: () => fetchTrophies(projects),
      enabled: projects.length > 0,
      ...queryConfigs.achievements,
    })
  );
}