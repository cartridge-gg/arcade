import { useMemo } from 'react';
import { queryKeys } from '../keys';
import { queryConfigs } from '../queryClient';
import { PlaythroughProject, usePlaythroughsQuery as useCartridgePlaythroughsQuery } from '@cartridge/ui/utils/api/cartridge';
import { useAchievementsQuery } from '../achievements';
import { useEditionsQuery, useFollowsQuery } from '../games';
import { constants, getChecksumAddress } from 'starknet';
import { Discover } from '@/context/discovers';
import { useAccount } from '@starknet-react/core';

export interface Playthrough {
  id: string;
  playerAddress: string;
  gameId: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  achievementsEarned: string[];
  score?: number;
  metadata?: any;
}

export interface PlaythroughsResponse {
  playthroughs: {
    items: Array<{
      meta: {
        project: string;
      };
      sessions: Playthrough[];
    }>;
  };
}

export function usePlaythroughsQuery(projects: PlaythroughProject[], limit: number = 1000) {
  const { data: editions = [] } = useEditionsQuery(constants.StarknetChainId.SN_MAIN);
  const { events: achievements, usernames } = useAchievementsQuery(editions);
  const { address } = useAccount()
  const result = useCartridgePlaythroughsQuery(
    { projects },
    {
      queryKey: queryKeys.discovery.playthroughs(projects, limit),
      enabled: projects.length > 0,
      ...queryConfigs.discovery,
      staleTime: 0,
    }
  );

  const playthroughs = useMemo(() => {
    const newDiscovers: { [key: string]: Discover[] } = {};
    result.data?.playthroughs?.items.forEach((item) => {
      const project = item.meta.project;
      newDiscovers[project] = item.playthroughs.map((playthrough) => {
        const start = new Date(playthrough.sessionStart).getTime();
        const end = new Date(playthrough.sessionEnd).getTime();
        const player = playthrough.callerAddress;
        const playerAchievements = (achievements[project] || [])
          .filter((item) => {
            const isPlayer = BigInt(item.player) === BigInt(player);
            // const isPlayer = false
            const timestamp = new Date(item.timestamp * 1000).getTime();
            const inSession = timestamp >= start && timestamp <= end;
            return isPlayer && inSession;
          })
          .map((item) => item.achievement);
        return {
          identifier: `${project}-${playthrough.callerAddress}-${playthrough.sessionStart}`,
          project: project,
          callerAddress: playthrough.callerAddress,
          start: start,
          end: end,
          count: playthrough.actionCount,
          actions: playthrough.entrypoints.slice(1, -1).split(","),
          achievements: playerAchievements,
        };
      });
    });
    return newDiscovers;
  }, [result, achievements])

  const { data: follows = [] } = useFollowsQuery(address || '');

  const following = useMemo(() => {
    if (!address) return [];
    const addresses = follows[getChecksumAddress(address)] || [];
    if (addresses.length === 0) return [];
    return [...addresses, getChecksumAddress(address)];
  }, [follows, address]);

  return {
    ...result,
    data: playthroughs ?? {},
    usernames: usernames ?? [],
    follows: following ?? [],
  };
}

