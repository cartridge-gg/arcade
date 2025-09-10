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

const PLAYTHROUGH_SQL = (limit: number = 10000, offset: number = 0) => `
				WITH ordered_actions AS (
					SELECT
						transaction_calls.caller_address,
						transactions.executed_at,
						transaction_calls.entrypoint,
						transaction_calls.transaction_hash,
						LAG(transactions.executed_at) OVER (
							PARTITION BY transaction_calls.caller_address
							ORDER BY transactions.executed_at
						) AS prev_executed_at
					FROM contracts
					JOIN transaction_contract
						ON transaction_contract.contract_address = contracts.contract_address
					JOIN transaction_calls
						ON transaction_calls.transaction_hash = transaction_contract.transaction_hash
					JOIN transactions
						ON transactions.transaction_hash = transaction_calls.transaction_hash
					WHERE contracts.contract_type = 'WORLD'
					AND entrypoint NOT IN (
						'execute_from_outside_v3', 'request_random', 'submit_random',
						'assert_consumed', 'deployContract', 'set_name', 'register_model',
						'entities', 'init_contract', 'upgrade_model', 'emit_events',
						'emit_event', 'set_metadata'
					)
				),
				marked_sessions AS (
					SELECT *,
						CASE
							WHEN prev_executed_at IS NULL THEN 1
							WHEN strftime('%%s', executed_at) - strftime('%%s', prev_executed_at) > 3600 THEN 1
							ELSE 0
						END AS new_session_flag
					FROM ordered_actions
				),
				session_ids AS (
					SELECT *,
						SUM(new_session_flag) OVER (
							PARTITION BY caller_address
							ORDER BY executed_at
							ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
						) AS session_id
					FROM marked_sessions
				)
				SELECT
					-- '[' || GROUP_CONCAT(entrypoint, ',') || ']' AS entrypoints,
					'[' || entrypoint || ']' AS entrypoints,
					caller_address AS callerAddress,
					MIN(executed_at) AS sessionStart,
					MAX(executed_at) AS sessionEnd,
					COUNT(*) AS actionCount
				FROM session_ids
				GROUP BY caller_address, session_id
				ORDER BY sessionEnd DESC
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
        sql: PLAYTHROUGH_SQL(10, 0),
      });
      // console.log(response); debugger;

      if (response?.items) {
        const processed = processPlaythroughs({
          items: response.items
        });
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
