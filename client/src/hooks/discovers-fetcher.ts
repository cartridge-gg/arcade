import { useAccounts, useEditionsMap } from "@/collections";
import { useEventStore } from "@/store";
import { fetchToriisStream } from "@cartridge/arcade";
import { useEffect, useCallback } from "react";
import { getChecksumAddress } from "starknet";
import {
  useFetcherState,
  processToriiStream
} from "./fetcher-utils";

export type Discover = {
  identifier: string;
  project: string;
  callerAddress: string;
  start: number;
  end: number;
  count: number;
  actions: string[];
  achievements: {
    title: string;
    icon: string;
    points: number;
  }[];
  name: string;
  address: string;
  duration: number;
  timestamp: number;
  logo?: string;
  color?: string;
};

interface Project {
  project: string;
  limit: number;
}

interface PlaythroughResponse {
  items: {
    meta: { project: string };
    playthroughs: {
      callerAddress: string;
      sessionStart: string;
      sessionEnd: string;
      actionCount: number;
      entrypoints: string;
    }[];
  }[];
}

interface AchievementEvent {
  player: string;
  timestamp: number;
  achievement: {
    title: string;
    icon: string;
    points: number;
  };
}

interface UseDiscoversFetcherParams {
  projects: Project[];
  achievements: { [key: string]: AchievementEvent[] };
  editionFilter: string[];
  follows: string[];
  refetchInterval?: number;
}

const PLAYTHROUGH_SQL = (limit: number = 1000, offset:number =0,daysBack: number = 30) => `
  WITH world_contracts AS (
      SELECT contract_address
      FROM contracts
      WHERE contract_type = 'WORLD'
  ),
  filtered_transactions AS (
      SELECT DISTINCT t.transaction_hash, t.executed_at
      FROM transactions t
      WHERE t.executed_at >= datetime('now', '-${daysBack} days')
  ),
  recent_actions AS (
      SELECT
          tc.caller_address,
          ft.executed_at,
          tc.entrypoint,
          LAG(ft.executed_at) OVER (
              PARTITION BY tc.caller_address
              ORDER BY ft.executed_at
          ) AS prev_executed_at
      FROM filtered_transactions ft
      INNER JOIN transaction_calls tc ON tc.transaction_hash = ft.transaction_hash
      INNER JOIN transaction_contract tco ON tco.transaction_hash = ft.transaction_hash
      INNER JOIN world_contracts wc ON wc.contract_address = tco.contract_address
      WHERE tc.entrypoint NOT IN (
          'execute_from_outside_v3', 'request_random', 'submit_random',
          'assert_consumed', 'deployContract', 'set_name', 'register_model',
          'entities', 'init_contract', 'upgrade_model', 'emit_events',
          'emit_event', 'set_metadata'
      )
  ),
  sessions_with_ids AS (
      SELECT
          caller_address,
          executed_at,
          entrypoint,
          SUM(
              CASE
                  WHEN prev_executed_at IS NULL THEN 1
                  WHEN (julianday(executed_at) - julianday(prev_executed_at)) * 86400 > 3600 THEN 1
                  ELSE 0
              END
          ) OVER (
              PARTITION BY caller_address
              ORDER BY executed_at
              ROWS UNBOUNDED PRECEDING
          ) AS session_id
      FROM recent_actions
  )
  SELECT
      '[' || GROUP_CONCAT(entrypoint, ',') || ']' AS entrypoints,
      caller_address AS callerAddress,
      MIN(executed_at) AS sessionStart,
      MAX(executed_at) AS sessionEnd,
      COUNT(*) AS actionCount
  FROM sessions_with_ids
  GROUP BY caller_address, session_id
  HAVING COUNT(*) > 0
  ORDER BY MAX(executed_at) DESC
  LIMIT ${limit} OFFSET ${offset};
`;

export function useDiscoversFetcher({
  projects,
  achievements,
  editionFilter,
  follows,
  refetchInterval = 30000,
}: UseDiscoversFetcherParams) {
  const {
    status,
    isLoading,
    isError,
    editionError,
    loadingProgress,
    startLoading,
    setSuccess,
    setError,
    setLoadingProgress,
  } = useFetcherState();

  const all = useEventStore((s) => s.getAllEvents);
  const following = useEventStore((s) => s.getFollowingEvents);
  const setEvents = useEventStore((s) => s.addEvents);
  const { data: activitiesUsernames } = useAccounts();
  const editions = useEditionsMap();

  const processPlaythroughs = useCallback(
    (response: PlaythroughResponse) => {
      const newDiscovers: { [key: string]: Discover[] } = {};

      response.items.forEach((item) => {
        const project = item.meta.project;
        newDiscovers[project] = item.playthroughs.map((playthrough) => {
          const start = new Date(playthrough.sessionStart).getTime();
          const end = new Date(playthrough.sessionEnd).getTime();
          const player = getChecksumAddress(playthrough.callerAddress);

          const playerAchievements = (achievements[project] || [])
            .filter((item) => {
              const isPlayer = BigInt(item.player) === BigInt(player);
              const timestamp = new Date(item.timestamp * 1000).getTime();
              const inSession = timestamp >= start && timestamp <= end;
              return isPlayer && inSession;
            })
            .map((item) => item.achievement);
          const edition = editions.get(project);
          const username = activitiesUsernames.get(player);

          return {
            identifier: `${project}-${playthrough.callerAddress}-${playthrough.sessionStart}`,
            project: project,
            callerAddress: player,
            start: start,
            end: end,
            count: playthrough.actionCount,
            actions:
              typeof playthrough.entrypoints === "string"
                ? playthrough.entrypoints.slice(1, -1).split(",")
                : [],
            achievements: playerAchievements,
            name: username || "",
            address: player,
            duration: end - start,
            timestamp: Math.floor(end / 1000),
            logo: edition?.properties.icon,
            color: edition?.color || "#000000",
          };
        });
      });

      return newDiscovers;
    },
    [achievements],
  );

  const fetchData = useCallback(
    async (daysBack: number) => {
      if (projects.length === 0) return;

      startLoading();

      try {
        const stream = fetchToriisStream(
          projects.map((p) => p.project),
          {
            sql: PLAYTHROUGH_SQL(100000, 0, daysBack),
          },
        );

        await processToriiStream(stream, {
          onData: (data: any, endpoint: string) => {
            const playthroughsData = data;

            const singleResponseData: PlaythroughResponse = {
              items: [
                {
                  meta: { project: endpoint },
                  playthroughs: Array.isArray(playthroughsData)
                    ? playthroughsData
                    : [],
                },
              ],
            };

            setEvents({ ...processPlaythroughs(singleResponseData) });
          },
          onProgress: (completed, total) => {
            setLoadingProgress({ completed, total });
          },
          onError: (endpoint, error) => {
            console.error(
              `Error fetching from ${endpoint}:`,
              error,
            );
            const edition = editions.get(endpoint);
            setError(edition, `Error fetching from ${endpoint}`)
          },
          onComplete: () => {
            setSuccess();
          },
        });
      } catch (error) {
        console.error("Error fetching playthroughs:", error);
        // Set error for all editions
        for (const project of projects) {
          const e = editions.get(project);
          if (e) {
            setError(e, "Error fetching playthroughs");
          }
        }
      }
    },
    [projects, processPlaythroughs, setEvents, startLoading, setSuccess, setError, setLoadingProgress, editions],
  );

  useEffect(() => {
    // Quick load: 1 day of data for immediate display
    fetchData(1);
    // Background load: Full 30 days of historical data
    fetchData(30);


    const interval = setInterval(() => {
      fetchData(1);
    }, refetchInterval);

    return () => clearInterval(interval);
  }, [fetchData, refetchInterval]);

  return {
    events: {
      all: all(editionFilter),
      following: following(editionFilter, follows),
    },
    status,
    isLoading,
    isError,
    editionError,
    loadingProgress,
    refetch: fetchData,
  };
}
