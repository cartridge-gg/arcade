import { EditionModel } from "@cartridge/arcade";
import { and, createCollection, eq, gte, liveQueryCollectionOptions, lte, Query, useLiveQuery } from "@tanstack/react-db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { graphqlClient } from "@/queries/graphql-client";
import { Progress, RawProgress, Trophy, RawTrophy, getSelectorFromTag } from "@/models";
import { editionsQuery } from "./arcade";
import { PROGRESS, TROPHY } from "@/constants";
import { getChecksumAddress } from "starknet";
import { queryClient } from "@/queries";
import { poseidonHash } from "@dojoengine/torii-wasm";
import { cyrb64Hash } from "./utils";

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
export type AchievementDataFlat = {
  key: string;
  edition: string;
  playerId: string;
  achievementId: string;
  taskId: string;
  completion: boolean;
  timestamp: number;
  count: number;
  taskTotal: number;
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
  query GetTrophies($projects: [Project!]!) {
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


function convertedProjects(projects: EditionModel[], model: string) {
  return projects.map((p) => ({
    model: getSelectorFromTag(p.namespace, model),
    namespace: p.namespace,
    project: p.config.project,
  }));
}

export const progressionsCollection = createCollection(
  queryCollectionOptions({
    queryKey: (() => {
      const editions = editionsQuery.toArray;
      const projects = convertedProjects(editions, PROGRESS) || [];
      return ['achievements', 'progressions', { projectIds: projects.map(p => p.project).sort() }]
    })(),
    queryFn: async () => {
      const editions = await editionsQuery.toArrayWhenReady();
      const projects = convertedProjects(editions, PROGRESS);

      const data = await graphqlClient<{ playerAchievements: ProgressionResponse }>(
        PROGRESSIONS_QUERY,
        { projects }
      );

      let progressions: Progress[] = [];
      data.playerAchievements?.items?.forEach((item) => {
        const project = item.meta.project;
        const achievements = item.achievements
          .map((n) => Progress.parse({ ...n, edition: project }));
        progressions = [...progressions, ...achievements];
      });

      return progressions;
    },
    queryClient,
    getKey: (item: Progress) => item.key,
    schema: {
      validate: (item: unknown): item is Progress => {
        const p = item as Progress;
        return typeof p.achievementId === 'string' &&
          typeof p.key === 'string' &&
          typeof p.playerId === 'string';
      }
    },
  })
);

export const trophiesCollection = createCollection(
  queryCollectionOptions({
    queryKey: (() => {
      const editions = editionsQuery.toArray;
      const projects = convertedProjects(editions, TROPHY) || [];
      return ['achievements', 'trophies', { projectIds: projects.map(p => p.project).sort() }]
    })(),
    queryFn: async () => {
      const editions = await editionsQuery.toArrayWhenReady();
      const projects = convertedProjects(editions, TROPHY);
      const data = await graphqlClient<{ achievements: TrophyResponse }>(
        TROPHIES_QUERY,
        { projects }
      );

      let trophies: Trophy[] = [];
      data.achievements?.items?.forEach((item) => {
        const project = item.meta.project;
        const achievements = item.achievements
          .map(n => Trophy.parse({ ...n, edition: project }));
        trophies = [...trophies, ...achievements];
      });

      return trophies;
    },
    queryClient,
    getKey: (item: Trophy) => item.id,
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

export const achievementsCollection = createCollection(
  queryCollectionOptions({
    queryKey: (() => {
      const progressions = progressionsCollection.toArray;
      const trophies = trophiesCollection.toArray;
      return [
        'collection',
        'achievements',
        'stats',
        { progressions: cyrb64Hash(progressions.map(p => p.key).sort().join('///')), length: progressions.length },
        { trophies: cyrb64Hash(trophies.map(t => t.key).sort().join("///")), length: trophies.length }
      ]
    })(),
    queryFn: async () => {
      const progressions = await progressionsCollection.toArrayWhenReady();
      const trophies = await trophiesCollection.toArrayWhenReady();

      const achievementData: AchievementDataFlat[] = [];

      // Process each progression
      progressions.forEach((progress: Progress) => {
        // Find matching trophy by achievementId and edition
        const trophy = trophies.find((t: Trophy) =>
          t.id === progress.achievementId && t.edition === progress.edition
        );

        if (!trophy) return;

        // Create entry for this specific task progress
        achievementData.push({
          key: `${progress.edition}-${progress.playerId}-${progress.achievementId}-${progress.taskId}`,
          edition: progress.edition,
          playerId: getChecksumAddress(progress.playerId),
          achievementId: progress.achievementId,
          taskId: progress.taskId,
          completion: progress.total >= progress.taskTotal,
          timestamp: progress.timestamp,
          count: progress.total,
          taskTotal: progress.taskTotal,
        });
      });

      // Also ensure all tasks from trophies are represented with defaults
      trophies.forEach((trophy: Trophy) => {
        trophy.tasks.forEach((task) => {
          // Check if we already have progress for this task
          const existingKey = `${trophy.edition}-*-${trophy.id}-${task.id}`;
          const hasProgress = achievementData.some(item =>
            item.edition === trophy.edition &&
            item.achievementId === trophy.id &&
            item.taskId === task.id
          );

          if (!hasProgress) {
            // Add default entry for tasks without progress
            // This would need to be per player in a real implementation
            // For now, we'll skip as we don't have player context here
          }
        });
      });

      return achievementData;
    },
    queryClient,
    getKey: (item: AchievementDataFlat) => item.key,
  })
);

export const completedAchievements = createCollection(liveQueryCollectionOptions({
  query: q => q
    .from({ a: achievementsCollection })
    .where(({ a }) => eq(a.completion, true))
    .select(({ a }) => ({ ...a })),
  getKey: (item) => item.key,
}));

export function playerAchievementForGameQuery(edition: string, player: string, start: number, end: number) {
  const query = new Query().from({ achievements: achievementsCollection })
    .where(({ achievements }) => and(
      eq(achievements.edition, edition),
      eq(achievements.playerId, player),
      gte(achievements.timestamp, start),
      lte(achievements.timestamp, end)
    ));

  return query;
}

export function useProgressions() {
  const { data: progressions } = useLiveQuery(q => q.from({ progressions: progressionsCollection }));
  return progressions;
}
export function useTrophies() {
  const { data: trophies } = useLiveQuery(q => q.from({ trophies: trophiesCollection }));
  return trophies;
}
