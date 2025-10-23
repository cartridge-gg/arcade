import { TROPHY } from "@/constants";
import {
  createCollection,
  liveQueryCollectionOptions,
  useLiveQuery,
} from "@tanstack/react-db";
import { editionsQuery } from "./arcade";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { graphqlClient, queryClient, queryKeys } from "@/queries";
import { getSelectorFromTag, type RawTrophy, Trophy } from "@/models";
import { useMemo } from "react";

const TROPHIES_QUERY = `query Achievements($projects: [Project!]!) {
  achievements(projects: $projects) {
    items {
      meta {
        project
        model
        namespace
        count
      }
      achievements {
        id
        hidden
        page
        points
        start
        end
        achievementGroup
        icon
        title
        description
        taskId
        taskTotal
        taskDescription
        data
      }
    }
  }
}`;

interface Response {
  achievements: {
    items: { meta: { project: string }; achievements: RawTrophy[] }[];
  };
}

export const trophiesProjectQuery = createCollection(
  liveQueryCollectionOptions({
    query: (q) =>
      q.from({ e: editionsQuery }).fn.select(({ e }) => ({
        project: e.config.project,
        namespace: e.namespace,
        model: getSelectorFromTag(e.namespace as string, TROPHY),
      })),
    getKey: (item) => item.project,
  }),
);

export const trophiesCollection = createCollection(
  queryCollectionOptions({
    queryKey: queryKeys.achievements.all,
    queryFn: async () => {
      await trophiesProjectQuery.stateWhenReady();
      const projects = trophiesProjectQuery.toArray;
      const res = await graphqlClient<Response>(TROPHIES_QUERY, { projects });

      if (!res?.achievements) return [];

      const result: Array<{
        project: string;
        trophies: { [id: string]: Trophy };
      }> = [];

      for (const item of res.achievements.items) {
        const project = item.meta.project;
        const raws = item.achievements
          .map(Trophy.parse)
          .reduce((acc: { [key: string]: Trophy }, achievement: Trophy) => {
            acc[achievement.key] = achievement;
            return acc;
          }, {});

        const trophies: { [id: string]: Trophy } = {};
        for (const trophy of Object.values(raws)) {
          if (Object.keys(trophies).includes(trophy.id)) {
            for (const task of trophy.tasks) {
              if (!trophies[trophy.id].tasks.find((t) => t.id === task.id)) {
                trophies[trophy.id].tasks.push(task);
              }
            }
          } else {
            trophies[trophy.id] = trophy;
          }
        }

        result.push({ project, trophies });
      }

      return result;
    },
    queryClient,
    getKey: (item) => item.project,
  }),
);

export function useTrophies() {
  const result = useLiveQuery(trophiesCollection);

  const data = useMemo(() => {
    if (!result.data) return {};
    return result.data.reduce(
      (acc, item) => {
        acc[item.project] = item.trophies;
        return acc;
      },
      {} as { [game: string]: { [id: string]: Trophy } },
    );
  }, [result.data]);

  return {
    ...result,
    data,
  };
}
