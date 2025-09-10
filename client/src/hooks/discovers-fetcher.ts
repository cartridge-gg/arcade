import { fetchToriis } from "@cartridge/arcade";
import { useState, useEffect, useCallback } from "react";

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
  refetchInterval?: number;
}

// Optimized query with configurable lookback period
const PLAYTHROUGH_SQL = (limit: number = 10000, offset: number = 0, daysBack: number = 30) => `
				WITH recent_actions AS (
					SELECT
						tc.caller_address,
						t.executed_at,
						tc.entrypoint,
						LAG(t.executed_at) OVER (
							PARTITION BY tc.caller_address
							ORDER BY t.executed_at
						) AS prev_executed_at
					FROM transactions t
					INNER JOIN transaction_calls tc
						ON tc.transaction_hash = t.transaction_hash
					INNER JOIN transaction_contract tco
						ON tco.transaction_hash = t.transaction_hash
					INNER JOIN contracts c
						ON c.contract_address = tco.contract_address
					WHERE c.contract_type = 'WORLD'
					AND tc.entrypoint NOT IN (
						'execute_from_outside_v3', 'request_random', 'submit_random',
						'assert_consumed', 'deployContract', 'set_name', 'register_model',
						'entities', 'init_contract', 'upgrade_model', 'emit_events',
						'emit_event', 'set_metadata'
					)
					-- Filter to recent data only (configurable days back, default 30)
					AND t.executed_at >= datetime('now', '-${daysBack} days')
				),
				sessions_with_ids AS (
					SELECT
						caller_address,
						executed_at,
						entrypoint,
						SUM(
							CASE
								WHEN prev_executed_at IS NULL THEN 1
								-- Use julianday for better SQLite performance
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
  refetchInterval = 30000,
}: UseDiscoversFetcherParams) {
  const [playthroughs, setPlaythroughs] = useState<{
    [key: string]: Discover[];
  }>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);


  const processPlaythroughs = useCallback(
    (response: PlaythroughResponse) => {
      const newDiscovers: { [key: string]: Discover[] } = {};

      response.items.forEach((item) => {
        const project = item.meta.project;
        newDiscovers[project] = item.playthroughs.map((playthrough) => {
          const start = new Date(playthrough.sessionStart).getTime();
          const end = new Date(playthrough.sessionEnd).getTime();
          const player = playthrough.callerAddress;

          const playerAchievements = (achievements[project] || [])
            .filter((item) => {
              const isPlayer = BigInt(item.player) === BigInt(player);
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
    },
    [achievements]
  );

  const fetchData = useCallback(async () => {
    if (projects.length === 0) return;
    console.time('fetching torii sql');

    setIsLoading(true);
    setStatus("loading");
    setIsError(false);

    try {
      const response = await fetchToriis(projects.map(p => p.project), {
        sql: PLAYTHROUGH_SQL(100, 0, 30),
      });

      if (response) {
        // The response structure depends on fetchToriis implementation
        const responseData = Array.isArray(response)
          ? { items: response }
          : response;

        const processed = processPlaythroughs(responseData as PlaythroughResponse);
        setPlaythroughs(processed);
        setStatus("success");
      }
    } catch (error) {
      console.error("Error fetching playthroughs:", error);
      setIsError(true);
      setStatus("error");
    } finally {
      setIsLoading(false);
      console.timeEnd('fetching torii sql');
    }
  }, [projects, processPlaythroughs]);

  useEffect(() => {
    fetchData();

    const interval = setInterval(() => {
      fetchData();
    }, refetchInterval);

    return () => clearInterval(interval);
  }, [fetchData, refetchInterval]);

  return {
    playthroughs,
    status,
    isLoading,
    isError,
    refetch: fetchData,
  };
}
