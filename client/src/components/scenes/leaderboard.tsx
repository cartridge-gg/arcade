import { Leaderboard } from "@/components/leaderboard";
import { useArcade } from "@/hooks/arcade";
import { useProject } from "@/hooks/project";
import { EditionModel } from "@bal7hazar/arcade-sdk";
import { useMemo } from "react";

export const LeaderboardScene = () => {
  const { editions } = useArcade();

  const { project, namespace } = useProject();

  const edition: EditionModel | undefined = useMemo(() => {
    return Object.values(editions).find(
      (edition) =>
        edition.config.project === project && edition.namespace === namespace,
    );
  }, [editions, project, namespace]);

  return <Leaderboard edition={edition} />;
};
