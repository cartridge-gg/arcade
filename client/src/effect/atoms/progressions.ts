import { Atom } from "@effect-atom/atom-react";
import { Effect } from "effect";
import { CartridgeInternalGqlClient, graphqlLayer } from "../layers/graphql";
import { type RawProgress, Progress } from "@/models";
import { mapResult } from "../utils/result";
import type { Progressions } from "@/lib/achievements";

const PROGRESSIONS_QUERY = `query Progressions($projects: [Project!]!) {
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

export type ProgressionProject = {
  project: string;
  namespace: string;
  model: string;
};

export type ProgressionMeta = {
  project: string;
  model: string;
  namespace: string;
  count: number;
};

export type ProgressionItem = {
  project: string;
  progressions: { [key: string]: Progress };
};

type ProgressionsResponse = {
  playerAchievements: {
    items: Array<{
      meta: ProgressionMeta;
      achievements: RawProgress[];
    }>;
  };
};

const fetchProgressionsEffect = (projects: ProgressionProject[]) =>
  Effect.gen(function* () {
    if (projects.length === 0) return [];

    const client = yield* CartridgeInternalGqlClient;
    const data = yield* client.query<ProgressionsResponse>(PROGRESSIONS_QUERY, {
      projects,
    });

    if (!data?.playerAchievements) return [];

    const result: ProgressionItem[] = [];

    for (const item of data.playerAchievements.items) {
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
  });

const progressionsRuntime = Atom.runtime(graphqlLayer);

const progressionsFamily = Atom.family((key: string) => {
  const projects: ProgressionProject[] = JSON.parse(key);
  return progressionsRuntime
    .atom(fetchProgressionsEffect(projects))
    .pipe(Atom.keepAlive);
});

export const progressionsAtom = (projects: ProgressionProject[]) => {
  const sorted = [...projects].sort((a, b) =>
    a.project.localeCompare(b.project),
  );
  return progressionsFamily(JSON.stringify(sorted));
};

const progressionsDataFamily = Atom.family((key: string) => {
  const baseAtom = progressionsFamily(key);
  return baseAtom.pipe(
    Atom.map((result) =>
      mapResult(result, (items) =>
        items.reduce((acc, item) => {
          acc[item.project] = item.progressions;
          return acc;
        }, {} as Progressions),
      ),
    ),
  );
});

export const progressionsDataAtom = (projects: ProgressionProject[]) => {
  const sorted = [...projects].sort((a, b) =>
    a.project.localeCompare(b.project),
  );
  return progressionsDataFamily(JSON.stringify(sorted));
};

export type { Progress };
