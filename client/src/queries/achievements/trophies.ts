import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../keys";
import { queryConfigs } from "../queryClient";
import { graphqlClient } from "../graphql-client";
import { RawTrophy, Trophy } from "@/models";
import { AchievementModelParserCallback } from ".";
import { Trophies } from "@/helpers/achievements";

export interface Project {
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

interface GraphQLAchievementsResponse {
  achievements: TrophyResponse;
}

const ACHIEVEMENTS_QUERY = `
  query GetAchievements($projects: [Project!]!) {
    achievements(projects: $projects) {
      items {
        meta {
          project
        }
        achievements {
          id
          achievementGroup
          title
          description
          points
          hidden
          page
          start
          end
          icon
          taskId
          taskTotal
          taskDescription
          data
        }
      }
    }
  }
`;

export function useTrophiesQuery(
  projects: Project[],
  parser: AchievementModelParserCallback<RawTrophy, Trophy>,
) {
  const result = useQuery({
    queryKey: queryKeys.achievements.trophies(projects),
    queryFn: async () => {
      const data = await graphqlClient<GraphQLAchievementsResponse>(
        ACHIEVEMENTS_QUERY,
        { projects }
      );
      return data;
    },
    enabled: projects.length > 0,
    ...queryConfigs.achievements,
  });

  // Transform the data to match our interface
  return {
    ...result,
    data: transformData(result.data?.achievements as TrophyResponse, parser),
  };
}

function transformData(
  achievements: TrophyResponse,
  parser: AchievementModelParserCallback<RawTrophy, Trophy>,
): Trophies {
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
          if (!trophies[game][trophy.id].tasks.find((t) => t.id === task.id)) {
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
