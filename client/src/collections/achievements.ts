import { createCollection } from "@tanstack/react-db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { QueryClient } from "@tanstack/react-query";
import { graphqlClient } from "@/queries/graphql-client";
import { Progress, RawProgress, Trophy, RawTrophy } from "@/models";
import { queryKeys } from "@/queries/keys";

export interface Project {
  model: string;
  namespace: string;
  project: string;
}

export interface ProgressionResponse {
  items: {
    meta: { project: string };
    achievements: RawProgress[];
  }[];
}

export interface TrophyResponse {
  items: {
    meta: { project: string };
    trophies: RawTrophy[];
  }[];
}

const PROGRESSIONS_QUERY = `
  query GetProgressions($projects: [Project!]!) {
    playerAchievements(projects: $projects) {
      items {
        meta {
          project
        }
        achievements {
          achievementId
          playerId
          points
          taskId
          taskTotal
          total
          completionTime
        }
      }
    }
  }
`;

const TROPHIES_QUERY = `
  query GetTrophies($projects: [String!]!) {
    trophies(projects: $projects) {
      items {
        meta {
          project
        }
        trophies {
          key
          value
          id
          title
          description
          imagePath
          unlocked
          points
          xp
          rank
          metadata
        }
      }
    }
  }
`;

export const progressionsCollection = createCollection(
  queryCollectionOptions({
    queryKey: (projects: Project[]) => 
      queryKeys.achievements.progressions(projects),
    queryFn: async ({ queryKey }) => {
      const projects = queryKey[queryKey.length - 1] as Project[];
      const data = await graphqlClient<{ playerAchievements: ProgressionResponse }>(
        PROGRESSIONS_QUERY,
        { projects }
      );
      
      const progressions: Progress[] = [];
      data.playerAchievements?.items?.forEach((item) => {
        item.achievements?.forEach((achievement) => {
          const progress = Progress.parse(achievement as RawProgress);
          progressions.push(progress);
        });
      });
      
      return progressions;
    },
    queryClient: new QueryClient(),
    getKey: (item: Progress) => item.key,
    schema: {
      validate: (item: unknown): item is Progress => {
        const p = item as Progress;
        return typeof p.achievementId === 'string' && 
               typeof p.key === 'string' &&
               typeof p.playerId === 'string';
      }
    }
  })
);

export const trophiesCollection = createCollection(
  queryCollectionOptions({
    queryKey: (projects: string[]) => 
      queryKeys.achievements.trophies(projects),
    queryFn: async ({ queryKey }) => {
      const projects = queryKey[queryKey.length - 1] as string[];
      const data = await graphqlClient<{ trophies: TrophyResponse }>(
        TROPHIES_QUERY,
        { projects }
      );
      
      const trophies: Trophy[] = [];
      data.trophies?.items?.forEach((item) => {
        item.trophies?.forEach((trophy) => {
          const parsedTrophy = Trophy.parse(trophy as RawTrophy);
          trophies.push(parsedTrophy);
        });
      });
      
      return trophies;
    },
    queryClient: new QueryClient(),
    getKey: (item: Trophy) => `${item.key}-${item.id}`,
    schema: {
      validate: (item: unknown): item is Trophy => {
        const t = item as Trophy;
        return typeof t.id === 'string' && 
               typeof t.key === 'string' &&
               typeof t.title === 'string';
      }
    }
  })
);