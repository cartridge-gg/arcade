import { Atom } from "@effect-atom/atom-react";
import { Effect } from "effect";
import { ToriiGrpcClient, toriiRuntime } from "../runtime";
import { Progress } from "@/models";
import { mapResult } from "../utils/result";
import type { Progressions } from "@/lib/achievements";
import type { PlayerAchievementsPage } from "@dojoengine/grpc";

export type ProgressionProject = {
  project: string;
  namespace: string;
};

export type ProgressionItem = {
  project: string;
  progressions: { [key: string]: Progress };
};

const fetchProgressionsEffect = (projects: ProgressionProject[]) =>
  Effect.gen(function* () {
    if (projects.length === 0) return [];

    const { client } = yield* ToriiGrpcClient;

    const namespaces = projects.map((p) => p.namespace);

    const response: PlayerAchievementsPage = yield* Effect.tryPromise(() =>
      client.getPlayerAchievements({
        world_addresses: [],
        namespaces,
        player_addresses: [],
        pagination: {
          limit: 10000,
          cursor: undefined,
          direction: "Forward",
          order_by: [],
        },
      }),
    );

    const progressionsByProject: {
      [project: string]: { [key: string]: Progress };
    } = {};

    for (const project of projects) {
      progressionsByProject[project.project] = {};
    }

    for (const playerEntry of response.items) {
      const playerAddress = playerEntry.player_address;

      for (const achievementProgress of playerEntry.achievements) {
        const achievement = achievementProgress.achievement;
        if (!achievement) continue;

        const project = projects.find(
          (p) => p.namespace === achievement.namespace,
        );
        if (!project) continue;

        for (const taskProgress of achievementProgress.task_progress) {
          const progress = Progress.fromGrpc(
            playerAddress,
            achievement,
            taskProgress,
            playerEntry.stats?.last_achievement_at,
          );
          progressionsByProject[project.project][progress.key] = progress;
        }
      }
    }

    const result: ProgressionItem[] = projects.map((p) => ({
      project: p.project,
      progressions: progressionsByProject[p.project],
    }));

    return result;
  });

const progressionsFamily = Atom.family((key: string) => {
  const projects: ProgressionProject[] = JSON.parse(key);
  return toriiRuntime
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
