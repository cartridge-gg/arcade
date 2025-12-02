import { useAtomValue } from "@effect-atom/atom-react";
import {
  trophiesAtom,
  type TrophyProject,
  type TrophyItem,
  type Trophy,
} from "../atoms/trophies";
import {
  progressionsAtom,
  type ProgressionProject,
  type ProgressionItem,
  type Progress,
} from "../atoms/progressions";
import { editionsAtom } from "../atoms/registry";
import { unwrapOr } from "../utils/result";
import { getSelectorFromTag } from "@/models";
import { TROPHY, PROGRESS } from "@/constants";
import type { Progressions, Trophies } from "@/lib/achievements";

const useTrophyProjects = (): TrophyProject[] => {
  const editionsResult = useAtomValue(editionsAtom);
  const editions = unwrapOr(editionsResult, []);

  return editions.map((e) => ({
    project: e.config.project,
    namespace: e.namespace as string,
    model: getSelectorFromTag(e.namespace as string, TROPHY),
  }));
};

const useProgressionProjects = (): ProgressionProject[] => {
  const editionsResult = useAtomValue(editionsAtom);
  const editions = unwrapOr(editionsResult, []);

  return editions.map((e) => ({
    project: e.config.project,
    namespace: e.namespace as string,
    model: getSelectorFromTag(e.namespace as string, PROGRESS),
  }));
};

export const useTrophies = (projectsOverride?: TrophyProject[]) => {
  const derivedProjects = useTrophyProjects();
  const projects = projectsOverride ?? derivedProjects;

  const atom = trophiesAtom(projects);
  const result = useAtomValue(atom);
  const items = unwrapOr(result, [] as TrophyItem[]);

  const data = items.reduce(
    (acc, item) => {
      acc[item.project] = item.trophies;
      return acc;
    },
    {} as Trophies,
  );

  const isLoading = result._tag === "Initial";
  const isError = result._tag === "Failure";

  return { data, isLoading, isError };
};

export const useProgressions = (projectsOverride?: ProgressionProject[]) => {
  const derivedProjects = useProgressionProjects();
  const projects = projectsOverride ?? derivedProjects;

  const atom = progressionsAtom(projects);
  const result = useAtomValue(atom);
  const items = unwrapOr(result, [] as ProgressionItem[]);

  const data = items.reduce(
    (acc, item) => {
      acc[item.project] = item.progressions;
      return acc;
    },
    {} as Progressions,
  );

  const isLoading = result._tag === "Initial";
  const isError = result._tag === "Failure";

  return { data, isLoading, isError };
};

export type {
  Trophy,
  TrophyProject,
  TrophyItem,
  Progress,
  ProgressionProject,
  ProgressionItem,
};
