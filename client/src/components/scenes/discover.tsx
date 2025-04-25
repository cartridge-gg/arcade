import { Discover } from "@/components/discover";
import { useArcade } from "@/hooks/arcade";
import { useProject } from "@/hooks/project";
import { EditionModel, GameModel } from "@bal7hazar/arcade-sdk";
import { useMemo } from "react";

export const DiscoverScene = () => {
  const { games, editions } = useArcade();

  const { gameId, project, namespace } = useProject();

  const game: GameModel | undefined = useMemo(() => {
    return Object.values(games).find((game) => game.id === gameId);
  }, [games, gameId]);

  const edition: EditionModel | undefined = useMemo(() => {
    return Object.values(editions).find(
      (edition) =>
        edition.config.project === project && edition.namespace === namespace,
    );
  }, [editions, project, namespace]);

  if (!game) return <Discover />;

  if (!edition) return null;

  return <Discover edition={edition} />;
};
