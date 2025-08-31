import { useQuery } from "@tanstack/react-query";
import { Progress, RawProgress } from "@/models";
import { queryKeys } from "../keys";
import { queryConfigs } from "../queryClient";
import { graphqlClient } from "../graphql-client";
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

interface GraphQLProgressionsResponse {
  playerAchievements: ProgressionResponse;
}

const PROGRESSIONS_QUERY = `
  query GetProgressions($projects: [ProgressionProject!]!) {
    playerAchievements(projects: $projects) {
      items {
        meta {
          project
        }
        achievements {
          id
          key
          value
          completedAt
          updatedAt
        }
      }
    }
  }
`;

export function useProgressionsQuery(
  projects: ProgressionProject[],
  parser: AchievementModelParserCallback<RawProgress, Progress>,
) {
  const result = useQuery({
    queryKey: queryKeys.achievements.progressions(projects),
    queryFn: async () => {
      const data = await graphqlClient<GraphQLProgressionsResponse>(
        PROGRESSIONS_QUERY,
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
