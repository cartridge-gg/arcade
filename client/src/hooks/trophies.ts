import { useCallback, useEffect, useMemo, useState } from "react";
import { Project, useAchievementsQuery } from "@cartridge/utils/api/cartridge";
import { RawTrophy, Trophy, getSelectorFromTag } from "@/models";

interface Response {
  items: { meta: { project: string }; achievements: RawTrophy[] }[];
}

export interface TrophiesProps {
  namespace: string;
  name: string;
  project: string;
}

export function useTrophies({
  props,
  parser,
}: {
  props: TrophiesProps[];
  parser: (node: RawTrophy) => Trophy;
}) {
  const [rawTrophies, setRawTrophies] = useState<{
    [key: string]: { [key: string]: Trophy };
  }>({});
  const [trophies, setTrophies] = useState<{
    [key: string]: { [key: string]: Trophy };
  }>({});

  // Fetch achievement creations from raw events
  const projects: Project[] = useMemo(() => {
    return props.map(({ namespace, name, project }) => ({
      model: getSelectorFromTag(namespace, name),
      namespace,
      project,
    }));
  }, [props]);

  const onSuccess = useCallback(
    ({ achievements }: { achievements: Response }) => {
      if (!achievements?.items) return;
      const trophies: { [key: string]: { [key: string]: Trophy } } = {};
      achievements.items.forEach((item) => {
        const project = item.meta.project;
        const achievements = item.achievements
          .map(parser)
          .reduce((acc: { [key: string]: Trophy }, achievement: Trophy) => {
            acc[achievement.key] = achievement;
            return acc;
          }, {});
        trophies[project] = achievements;
      });
      setRawTrophies(trophies);
    },
    [parser, setRawTrophies],
  );

  const { data, refetch: fetchAchievements, isFetching, error } = useAchievementsQuery(
    {
      projects,
    },
    {
      enabled: props.length > 0,
      queryKey: ["achievements", props],
      refetchInterval: 600_000, // Refetch every 10 minutes
      keepPreviousData: true,
    },
  );

  // TODO wip this should return partial data 😡
  console.log('data', data, 'error', error, 'isFetching', isFetching);

  useEffect(() => {
    if (props.length === 0) return;
    try {
      fetchAchievements();
    } catch (error) {
      // Could happen if the indexer is down or wrong url
      console.error(error);
    }
  }, [props, fetchAchievements]);

  useEffect(() => {
    if (isFetching) return;
    // Merge trophies
    const trophies: { [game: string]: { [id: string]: Trophy } } = {};
    Object.keys(rawTrophies).forEach((game) => {
      trophies[game] = {};
      Object.values(rawTrophies[game]).forEach((trophy) => {
        if (Object.keys(trophies[game] || {}).includes(trophy.id)) {
          trophy.tasks.forEach((task) => {
            if (
              !trophies[game][trophy.id].tasks.find((t) => t.id === task.id)
            ) {
              trophies[game][trophy.id].tasks.push(task);
            }
          });
        } else {
          trophies[game][trophy.id] = trophy;
        }
      });
    });
    setTrophies(trophies);
  }, [rawTrophies, isFetching, setTrophies]);

  return { trophies };
}
