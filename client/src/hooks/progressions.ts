import { useCallback, useMemo, useState } from "react";
import {
  type Project,
  useProgressionsQuery,
} from "@cartridge/ui/utils/api/cartridge";
import { type Progress, type RawProgress, getSelectorFromTag } from "@/models";
import type { TrophiesProps } from "./trophies";

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
    const computed = props.map(({ namespace, name, project }) => ({
      model: getSelectorFromTag(namespace, name),
      namespace,
      project,
    }));
    console.log("[Client Debug] Computed projects:", computed);
    return computed;
  }, [props]);

  const onSuccess = useCallback(
    ({ playerAchievements }: { playerAchievements: Response }) => {
      console.log("[Client Debug] Progressions response:", {
        itemsCount: playerAchievements?.items?.length || 0,
        totalAchievements: playerAchievements?.items?.reduce((sum, item) => sum + item.achievements.length, 0) || 0,
        sample: playerAchievements?.items?.[0],
      });
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
        if (item.achievements.length > 0) {
          console.log(`[Client Debug] ${project}: ${item.achievements.length} achievements`);
        }
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
