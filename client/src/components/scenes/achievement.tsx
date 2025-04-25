import { Achievements } from "@/components/achievements";
import { useArcade } from "@/hooks/arcade";
import { useProject } from "@/hooks/project";
import { EditionModel, GameModel } from "@bal7hazar/arcade-sdk";
import { useMemo } from "react";

export const AchievementScene = () => {
  const { games, editions } = useArcade();

  const { gameId, project, namespace } = useProject();

  const game: GameModel | undefined = useMemo(() => {
    return games.find((game) => game.id === gameId);
  }, [gameId, games]);

  const edition: EditionModel | undefined = useMemo(() => {
    return Object.values(editions).find(
      (edition) =>
        edition.config.project === project && edition.namespace === namespace,
    );
  }, [editions, project, namespace]);

  return <Achievements game={game} edition={edition} />;
};
