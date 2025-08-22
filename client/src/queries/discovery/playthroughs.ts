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
    }
  );

  const playthroughs = useMemo(() => {
    if (!result.data?.playthroughs?.items) return {};

    const newDiscovers: { [key: string]: Discover[] } = {};
    result.data.playthroughs.items.forEach((item) => {
      const project = item.meta.project;
      const projectAchievements = achievements[project] || [];

      newDiscovers[project] = item.playthroughs.map((playthrough) => {
        const start = new Date(playthrough.sessionStart).getTime();
        const end = new Date(playthrough.sessionEnd).getTime();
        const player = playthrough.callerAddress;
        const playerAchievements = projectAchievements
          .filter((item) => {
            const isPlayer = item.player === player;
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
  }, [result.data, achievements])

  // Only query follows when address exists (useFollowsQuery already has enabled: !!address)
  const { data: follows = [] } = useFollowsQuery(address || '');

  const following = useMemo(() => {
    if (!address) return [];
    const checksumAddress = getChecksumAddress(address);
    const addresses = follows[checksumAddress] || [];
    if (addresses.length === 0) return [];
    return [...addresses, checksumAddress];
  }, [follows, address]);

  // Memoize the final return object to prevent unnecessary re-renders
  return useMemo(() => ({
    ...result,
    data: playthroughs,
    usernames: usernames ?? {},
    follows: following,
  }), [result, playthroughs, usernames, following]);
}

