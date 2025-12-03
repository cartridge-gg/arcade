import { Atom } from "@effect-atom/atom-react";
import { Effect } from "effect";
import { CartridgeInternalGqlClient, graphqlLayer } from "../layers/graphql";
import { type RawTrophy, Trophy } from "@/models";
import { mapResult } from "../utils/result";
import type { Trophies } from "@/lib/achievements";

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

export type TrophyProject = {
  project: string;
  namespace: string;
  model: string;
};

export type TrophyMeta = {
  project: string;
  model: string;
  namespace: string;
  count: number;
};

export type TrophyItem = {
  project: string;
  trophies: { [id: string]: Trophy };
};

type TrophiesResponse = {
  achievements: {
    items: Array<{
      meta: TrophyMeta;
      achievements: RawTrophy[];
    }>;
  };
};

const fetchTrophiesEffect = (projects: TrophyProject[]) =>
  Effect.gen(function* () {
    if (projects.length === 0) return [];

    const client = yield* CartridgeInternalGqlClient;
    const data = yield* client.query<TrophiesResponse>(TROPHIES_QUERY, {
      projects,
    });

    if (!data?.achievements) return [];

    const result: TrophyItem[] = [];

    for (const item of data.achievements.items) {
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
  });

const trophiesRuntime = Atom.runtime(graphqlLayer);

const trophiesFamily = Atom.family((key: string) => {
  const projects: TrophyProject[] = JSON.parse(key);
  return trophiesRuntime
    .atom(fetchTrophiesEffect(projects))
    .pipe(Atom.keepAlive);
});

export const trophiesAtom = (projects: TrophyProject[]) => {
  const sorted = [...projects].sort((a, b) =>
    a.project.localeCompare(b.project),
  );
  return trophiesFamily(JSON.stringify(sorted));
};

const trophiesDataFamily = Atom.family((key: string) => {
  const baseAtom = trophiesFamily(key);
  return baseAtom.pipe(
    Atom.map((result) =>
      mapResult(result, (items) =>
        items.reduce((acc, item) => {
          acc[item.project] = item.trophies;
          return acc;
        }, {} as Trophies),
      ),
    ),
  );
});

export const trophiesDataAtom = (projects: TrophyProject[]) => {
  const sorted = [...projects].sort((a, b) =>
    a.project.localeCompare(b.project),
  );
  return trophiesDataFamily(JSON.stringify(sorted));
};

export type { Trophy };
