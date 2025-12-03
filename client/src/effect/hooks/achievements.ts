import { useAtomValue } from "@effect-atom/atom-react";
import { useMemo } from "react";
import {
  trophiesDataAtom,
  type TrophyProject,
  type TrophyItem,
  type Trophy,
} from "../atoms/trophies";
import {
  progressionsDataAtom,
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

  return useMemo(
    () =>
      editions.map((e) => ({
        project: e.config.project,
        namespace: e.namespace as string,
        model: getSelectorFromTag(e.namespace as string, TROPHY),
      })),
    [editions],
  );
};

const useProgressionProjects = (): ProgressionProject[] => {
  const editionsResult = useAtomValue(editionsAtom);
  const editions = unwrapOr(editionsResult, []);

  return useMemo(
    () =>
      editions.map((e) => ({
        project: e.config.project,
        namespace: e.namespace as string,
        model: getSelectorFromTag(e.namespace as string, PROGRESS),
      })),
    [editions],
  );
};

export const useTrophies = (projectsOverride?: TrophyProject[]) => {
  const derivedProjects = useTrophyProjects();
  const projects = projectsOverride ?? derivedProjects;

  const atom = useMemo(() => trophiesDataAtom(projects), [projects]);
  const result = useAtomValue(atom);

  return useMemo(
    () => ({
      data: unwrapOr(result, {} as Trophies),
      isLoading: result._tag === "Initial",
      isError: result._tag === "Failure",
    }),
    [result],
  );
};

export const useProgressions = (projectsOverride?: ProgressionProject[]) => {
  const derivedProjects = useProgressionProjects();
  const projects = projectsOverride ?? derivedProjects;

  const atom = useMemo(() => progressionsDataAtom(projects), [projects]);
  const result = useAtomValue(atom);

  return useMemo(
    () => ({
      data: unwrapOr(result, {} as Progressions),
      isLoading: result._tag === "Initial",
      isError: result._tag === "Failure",
    }),
    [result],
  );
};

export type {
  Trophy,
  TrophyProject,
  TrophyItem,
  Progress,
  ProgressionProject,
  ProgressionItem,
};
