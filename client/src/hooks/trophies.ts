import { useCallback, useMemo, useState } from "react";
import {
  Project,
  useAchievementsQuery,
} from "@cartridge/ui/utils/api/cartridge";
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
      const raws: { [key: string]: { [key: string]: Trophy } } = {};
      achievements.items.forEach((item) => {
        const project = item.meta.project;
        const achievements = item.achievements
          .map(parser)
          .reduce((acc: { [key: string]: Trophy }, achievement: Trophy) => {
            acc[achievement.key] = achievement;
            return acc;
          }, {});
        raws[project] = achievements;
      });
      const trophies: { [game: string]: { [id: string]: Trophy } } = {};
      Object.keys(raws).forEach((game) => {
        trophies[game] = {};
        Object.values(raws[game]).forEach((trophy) => {
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
    },
    [parser, setTrophies],
  );

  const { isLoading, isError } = useAchievementsQuery(
    {
      projects,
    },
    {
      enabled: projects.length > 0,
      queryKey: ["achievements", projects],
      refetchInterval: 600_000, // Refetch every 10 minutes
      refetchOnWindowFocus: false,
      onSuccess,
    },
  );

  return { trophies, isLoading, isError };
}
