import { Atom } from "@effect-atom/atom-react";
import { Effect } from "effect";
import { ToriiGrpcClient, toriiRuntime } from "../runtime";
import { Trophy } from "@/models";
import { mapResult } from "../utils/result";
import type { Trophies } from "@/lib/achievements";
import type { AchievementsPage } from "@dojoengine/grpc";

export type TrophyProject = {
  project: string;
  namespace: string;
};

export type TrophyItem = {
  project: string;
  trophies: { [id: string]: Trophy };
};

const fetchTrophiesEffect = (projects: TrophyProject[]) =>
  Effect.gen(function* () {
    if (projects.length === 0) return [];

    const { client } = yield* ToriiGrpcClient;

    const namespaces = projects.map((p) => p.namespace);

    const response: AchievementsPage = yield* Effect.tryPromise(() =>
      client.getAchievements({
        world_addresses: [],
        namespaces,
        hidden: undefined,
        pagination: {
          limit: 1000,
          cursor: undefined,
          direction: "Forward",
          order_by: [],
        },
      }),
    );

    const trophiesByProject: { [project: string]: { [id: string]: Trophy } } =
      {};

    for (const project of projects) {
      trophiesByProject[project.project] = {};
    }

    for (const item of response.items) {
      const project = projects.find((p) => p.namespace === item.namespace);
      if (!project) continue;

      const trophy = Trophy.fromGrpc(item);
      trophiesByProject[project.project][trophy.id] = trophy;
    }

    const result: TrophyItem[] = projects.map((p) => ({
      project: p.project,
      trophies: trophiesByProject[p.project],
    }));

    return result;
  });

const trophiesFamily = Atom.family((key: string) => {
  const projects: TrophyProject[] = JSON.parse(key);
  return toriiRuntime.atom(fetchTrophiesEffect(projects)).pipe(Atom.keepAlive);
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
