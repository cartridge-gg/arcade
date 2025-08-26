import { PROGRESS, TROPHY } from "@/constants";
import { useProgressionsQuery } from "./progressions";
import { useTrophiesQuery } from "./trophies";
import { EditionModel } from "@cartridge/arcade";
import { AchievementData, AchievementHelper } from "@/helpers/achievements";
import { useAddress } from "@/hooks/address";
import { getSelectorFromTag, Progress, Trophy } from "@/models";
import { useMemo } from "react";
import { getChecksumAddress } from "starknet";
import { useAccountNamesQuery } from "../users";

export * from "./trophies";
export * from "./progressions";

function convertedProjects(projects: EditionModel[], model: string) {
  return projects.map((p) => ({
    model: getSelectorFromTag(p.namespace, model),
    namespace: p.namespace,
    project: p.config.project,
  }));
}

export type AchievementModelParserCallback<I, O> = (input: I) => O;

export function useAchievementsQuery(projects: EditionModel[]) {
  const trophyProjects = useMemo(
    () => convertedProjects(projects, TROPHY),
    [projects],
  );

  const progressProjects = useMemo(
    () => convertedProjects(projects, PROGRESS),
    [projects],
  );

  const { data: trophies } = useTrophiesQuery(trophyProjects, Trophy.parse);
  const { data: progressions } = useProgressionsQuery(
    progressProjects,
    Progress.parse,
  );
  const { address } = useAddress();

  const data: AchievementData = useMemo(
    () => AchievementHelper.extract(progressions, trophies),
    [progressions, trophies],
  );

  const { stats, players, events, globals } = useMemo(
    () => AchievementHelper.computePlayers(data, trophies),
    [data, trophies],
  );

  const achievements = useMemo(
    () =>
      AchievementHelper.computeAchievements(
        data,
        trophies,
        players,
        stats,
        address,
      ),
    [data, trophies, players, stats, address],
  );

  const addresses = useMemo(() => {
    const addresses = Object.values(players).flatMap((gamePlayers) =>
      gamePlayers.map((player) => player.address),
    );
    const uniqueAddresses = [...new Set(addresses)];
    return uniqueAddresses;
  }, [players]);

  const { usernames } = useAccountNamesQuery(addresses);
  const usernamesData = useMemo(() => {
    const usernamesMap = new Map<string, string>();
    usernames.forEach((user) => {
      if (user.address) {
        usernamesMap.set(user.address, user.username);
      }
    });

    const data: { [key: string]: string | undefined } = {};
    addresses.forEach((address) => {
      data[getChecksumAddress(address)] = usernamesMap.get(address);
    });
    return data;
  }, [usernames, addresses]);

  return useMemo(() => {
    if (
      !Object.values(trophies).length ||
      !Object.values(progressions).length ||
      !address ||
      address === "0x0"
    )
      return {
        events: {},
        achievements: [],
        players: [],
        usernames: [],
        globals: [],
        isLoading: true,
        isError: false,
      };

    return {
      events: events ?? {},
      achievements: achievements ?? [],
      players: players ?? [],
      usernames: usernamesData ?? [],
      globals,
      isLoading: false,
      isError: false,
    };
  }, [
    trophies,
    progressions,
    address,
    events,
    achievements,
    players,
    usernamesData,
    globals,
  ]);
}

// Re-export common types
export type { TrophyProject, TrophyResponse } from "./trophies";
export type { ProgressionProject, ProgressionResponse } from "./progressions";
