import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../keys';
import { queryConfigs } from '../queryClient';
import { useAchievementsQuery as useCartridgeAchievementsQuery } from '@cartridge/ui/utils/api/cartridge';
import { RawTrophy, Trophy } from '@/models';
import { AchievementModelParserCallback } from '.';
import { Trophies } from '@/helpers/achievements';

export interface TrophyProject {
  model: string;
  namespace: string;
  project: string;
}

export interface TrophyResponse {
  items: {
    meta: { project: string };
    achievements: RawTrophy[]; // Raw trophy data
  }[];
}

export function useTrophiesQuery(projects: TrophyProject[], parser: AchievementModelParserCallback<RawTrophy, Trophy>) {
  // Use the Cartridge API hook directly
  const result = useCartridgeAchievementsQuery(
    { projects },
    {
      queryKey: queryKeys.achievements.trophies(projects),
      enabled: projects.length > 0,
      ...queryConfigs.achievements,
    }
  );
  // Transform the data to match our interface
  return {
    ...result,
    data: transformData(result.data?.achievements as TrophyResponse, parser),
  };
}

function transformData(achievements: TrophyResponse, parser: AchievementModelParserCallback<RawTrophy, Trophy>): Trophies {
  if (!achievements?.items) return {};
  const raws: { [key: string]: { [key: string]: Trophy } } = {};
  achievements.items.forEach((item) => {
    const project = item.meta.project;
    const achievements = item.achievements
      .map(parser)
      .reduce((acc: { [key: string]: Trophy }, achievement: Trophy) => {
        acc[achievement.key] = achievement;
        return acc;
      }, {});
    raws[project] = achievements;
  });
  const trophies: { [game: string]: { [id: string]: Trophy } } = {};
  Object.keys(raws).forEach((game) => {
    trophies[game] = {};
    Object.values(raws[game]).forEach((trophy) => {
      if (Object.keys(trophies[game] || {}).includes(trophy.id)) {
        trophy.tasks.forEach((task) => {
          if (
            !trophies[game][trophy.id].tasks.find((t) => t.id === task.id)
          ) {
            trophies[game][trophy.id].tasks.push(task);
          }
        });
      } else {
        trophies[game][trophy.id] = trophy;
      }
    });
  });

  return trophies;
}
