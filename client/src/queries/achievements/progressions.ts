import { Progress, RawProgress } from "@/models";
import { queryKeys } from "../keys";
import { queryConfigs } from "../queryClient";
import { useProgressionsQuery as useCartridgeProgressionsQuery } from "@cartridge/ui/utils/api/cartridge";
import { AchievementModelParserCallback } from ".";
import { Progressions } from "@/helpers/achievements";

export interface ProgressionProject {
  model: string;
  namespace: string;
  project: string;
}

export interface ProgressionResponse {
  items: {
    meta: { project: string };
    achievements: RawProgress[]; // Raw progress data
  }[];
}

export function useProgressionsQuery(
  projects: ProgressionProject[],
  parser: AchievementModelParserCallback<RawProgress, Progress>,
) {
  // Use the Cartridge API hook directly
  const result = useCartridgeProgressionsQuery(
    { projects },
    {
      queryKey: queryKeys.achievements.progressions(projects),
      enabled: projects.length > 0,
      ...queryConfigs.achievements,
    },
  );

  // Transform the data to match our interface
  return {
    ...result,
    data: transformData(
      result.data?.playerAchievements as ProgressionResponse,
      parser,
    ),
  };
}

function transformData(
  playerAchievements: ProgressionResponse,
  parser: AchievementModelParserCallback<RawProgress, Progress>,
): Progressions {
  if (!playerAchievements?.items) return {};
  const progressions: { [key: string]: { [key: string]: Progress } } = {};
  playerAchievements.items.forEach((item) => {
    const project = item.meta.project;
    const achievements = item.achievements
      .map(parser)
      .reduce((acc: { [key: string]: Progress }, achievement: Progress) => {
        acc[achievement.key] = achievement;
        return acc;
      }, {});
    progressions[project] = achievements;
  });
  return progressions;
}
