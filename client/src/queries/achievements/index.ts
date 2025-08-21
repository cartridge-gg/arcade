import { PROGRESS, TROPHY } from '@/constants';
import { useProgressionsQuery } from './progressions';
import { useTrophiesQuery } from './trophies';
import { EditionModel } from '@cartridge/arcade';
import { AchievementData, AchievementHelper } from '@/helpers/achievements';
import { useAddress } from '@/hooks/address';
import { getSelectorFromTag, Progress, Trophy } from '@/models';
import { useMemo } from 'react';
import { getChecksumAddress } from 'starknet';
import { useAccountNamesQuery } from '../users';

export * from './trophies';
export * from './progressions';

function convertedProjects(projects: EditionModel[], model: string) {
  return projects.map((p) => ({
    model: getSelectorFromTag(p.namespace, model),
    namespace: p.namespace,
    project: p.config.project,
  }));
}

export type AchievementModelParserCallback<I, O> = (input: I) => O

export function useAchievementsQuery(projects: EditionModel[]) {

  const { data: trophies } = useTrophiesQuery(convertedProjects(projects, TROPHY), Trophy.parse);
  const { data: progressions } = useProgressionsQuery(convertedProjects(projects, PROGRESS), Progress.parse);
  const { address } = useAddress();


  // Compute players and achievement stats
  const data: AchievementData = AchievementHelper.extract(
    progressions,
    trophies,
  );

  const { stats, players, events, globals } =
    AchievementHelper.computePlayers(data, trophies);
  // console.log(stats, players, events, globals);
  const achievements = AchievementHelper.computeAchievements(
    data,
    trophies,
    players,
    stats,
    address,
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
    const data: { [key: string]: string | undefined } = {};
    addresses.forEach((address) => {
      data[getChecksumAddress(address)] = usernames.find(
        (username) => BigInt(username.address || "0x0") === BigInt(address),
      )?.username;
    });
    return data;
  }, [usernames, addresses]);

  if (
    !Object.values(trophies).length ||
    !Object.values(progressions).length ||
    !address ||
    address === "0x0"
  )
    return { events: {} };

  return {
    events,
    achievements,
    players,
    usernames: usernamesData ?? [],
    globals,
  };
}

// Re-export common types
export type { TrophyProject, TrophyResponse } from './trophies';
export type { ProgressionProject, ProgressionResponse } from './progressions';
