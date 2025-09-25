import { useCallback, useMemo, useState } from "react";
import {
  Project,
  useProgressionsQuery,
} from "@cartridge/ui/utils/api/cartridge";
import { Progress, RawProgress, getSelectorFromTag } from "@/models";
import { TrophiesProps } from "./trophies";

interface Response {
  items: { meta: { project: string }; achievements: RawProgress[] }[];
}

export function useProgressions({
  props,
  parser,
}: {
  props: TrophiesProps[];
  parser: (node: RawProgress) => Progress;
}) {
  const [progressions, setProgressions] = useState<{
    [key: string]: { [key: string]: Progress };
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
    ({ playerAchievements }: { playerAchievements: Response }) => {
      if (!playerAchievements?.items) return;
      const progressions: { [key: string]: { [key: string]: Progress } } = {};
      playerAchievements.items.forEach((item) => {
        const project = item.meta.project;
        const achievements = item.achievements
          .map(parser)
          .reduce((acc: { [key: string]: Progress }, achievement: Progress) => {
            acc[achievement.key] = achievement;
            return acc;
          }, {});
        progressions[project] = achievements;
      });
      setProgressions(progressions);
    },
    [parser, setProgressions],
  );

  const { isLoading, isError } = useProgressionsQuery(
    {
      projects,
    },
    {
      enabled: projects.length > 0,
      queryKey: ["progressions", projects],
      refetchInterval: 600_000, // Refetch every 10 minutes
      refetchOnWindowFocus: false,
      onSuccess,
      onError: onSuccess,
    },
  );

  return { progressions, isLoading, isError };
}
