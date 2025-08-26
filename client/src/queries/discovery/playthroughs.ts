import { useMemo } from "react";
import { queryKeys } from "../keys";
import { queryConfigs } from "../queryClient";
import {
  PlaythroughProject,
  usePlaythroughsQuery as useCartridgePlaythroughsQuery,
} from "@cartridge/ui/utils/api/cartridge";
import { useAchievementsQuery } from "../achievements";
import { useEditionsQuery, useFollowsQuery } from "../games";
import { constants, getChecksumAddress } from "starknet";
import { Discover } from "@/context/discovers";
import { useAccount } from "@starknet-react/core";

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

export function usePlaythroughsQuery(
  projects: PlaythroughProject[],
  limit: number = 1000,
) {
  const { data: editions = [] } = useEditionsQuery(
    constants.StarknetChainId.SN_MAIN,
  );
  const { events: achievements, usernames } = useAchievementsQuery(editions);
  const { address } = useAccount();
  const result = useCartridgePlaythroughsQuery(
    { projects },
    {
      queryKey: queryKeys.discovery.playthroughs(projects, limit),
      enabled: projects.length > 0,
      ...queryConfigs.discovery,
    },
  );

  const playthroughs = useMemo(() => {
    if (!result.data?.playthroughs?.items) return {};

    // Pre-compute achievement timestamps once to avoid creating Date objects in nested loops
    const achievementsWithTimestamps: {
      [key: string]: Array<{
        player: string;
        achievement: any;
        timestamp: number;
        timestampMs: number;
      }>;
    } = {};
    for (const [project, projectAchievements] of Object.entries(achievements)) {
      if (projectAchievements) {
        achievementsWithTimestamps[project] = projectAchievements.map(
          (item) => ({
            ...item,
            timestampMs: item.timestamp * 1000, // Pre-compute milliseconds once
          }),
        );
      }
    }

    const newDiscovers: { [key: string]: Discover[] } = {};
    result.data.playthroughs.items.forEach((item) => {
      const project = item.meta.project;
      const projectAchievements = achievementsWithTimestamps[project] || [];

      newDiscovers[project] = item.playthroughs.map((playthrough) => {
        const start = new Date(playthrough.sessionStart).getTime();
        const end = new Date(playthrough.sessionEnd).getTime();
        const player = playthrough.callerAddress;

        // Use pre-computed timestamps for filtering
        const playerAchievements = projectAchievements
          .filter((item) => {
            const isPlayer = item.player === player;
            const inSession =
              item.timestampMs >= start && item.timestampMs <= end;
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
  }, [result.data, achievements]);

  // Only query follows when address exists (useFollowsQuery already has enabled: !!address)
  const { data: following } = useFollowsQuery(address || "");

  // Memoize the final return object to prevent unnecessary re-renders
  return useMemo(
    () => ({
      ...result,
      data: playthroughs,
      usernames: usernames ?? {},
      follows: following,
    }),
    [result, playthroughs, usernames, following],
  );
}
