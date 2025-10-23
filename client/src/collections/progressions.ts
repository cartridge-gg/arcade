import { PROGRESS } from "@/constants";
import { getSelectorFromTag, Progress } from "@/models";
import { graphqlClient, queryClient, queryKeys } from "@/queries";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import {
  createCollection,
  liveQueryCollectionOptions,
  useLiveQuery,
} from "@tanstack/react-db";
import { editionsQuery } from "./arcade";
import { useMemo } from "react";
import type { Progressions } from "@/lib/achievements";

const PROGRESSION_QUERY = `query Progressions($projects: [Project!]!) {
  playerAchievements(projects: $projects) {
    items {
      meta {
        project
        model
        namespace
        count
      }
      achievements {
        playerId
        achievementId
        points
        taskId
        taskTotal
        total
        completionTime
      }
    }
  }
}`;

export const progressionProjectQuery = createCollection(
  liveQueryCollectionOptions({
    query: (q) =>
      q.from({ e: editionsQuery }).fn.select(({ e }) => ({
        project: e.config.project,
        namespace: e.namespace,
        model: getSelectorFromTag(e.namespace as string, PROGRESS),
      })),
    getKey: (item) => item.project,
  }),
);

type ProgressionItem = {
  project: string;
  progressions: { [key: string]: Progress };
};

export const progressionsCollection = createCollection(
  queryCollectionOptions({
    queryKey: queryKeys.progressions.all,
    queryFn: async () => {
      await progressionProjectQuery.stateWhenReady();
      const projects = progressionProjectQuery.toArray;
      const res = await graphqlClient(PROGRESSION_QUERY, {
        projects,
      });

      if (!res?.playerAchievements) return [];

      const result: ProgressionItem[] = [];

      for (const item of res.playerAchievements.items) {
        const project = item.meta.project;
        const progressions = item.achievements
          .map(Progress.parse)
          .reduce((acc: { [key: string]: Progress }, achievement: Progress) => {
            acc[achievement.key] = achievement;
            return acc;
          }, {});

        result.push({ project, progressions });
      }

      return result;
    },
    queryClient,
    getKey: (item) => item.project,
  }),
);

export function useProgressions() {
  const result = useLiveQuery(progressionsCollection);

  const data = useMemo(() => {
    if (!result.data) return {};
    return result.data.reduce(
      (acc, item) => {
        acc[item.project as string] = item.progressions;
        return acc;
      },
      {} as { [key: string]: { [key: string]: Progress } },
    );
  }, [result.data]);

  return {
    ...result,
    data: data as Progressions,
  };
}
