import { useMediaQuery } from "@cartridge/ui";
import type { EditionModel, GameModel } from "@cartridge/arcade";
import { AchievementsView } from "@/components/ui/achievements/AchievementsView";
import { useAchievementsViewModel } from "./useAchievementsViewModel";

interface AchievementsContainerProps {
  game?: GameModel;
  edition?: EditionModel;
}

export const AchievementsContainer = ({
  game,
  edition,
}: AchievementsContainerProps) => {
  const isMobile = useMediaQuery("(max-width: 1024px)");

  const { status, summaryCards, showTrophies, trophies, multiEdition } =
    useAchievementsViewModel({ game, edition, isMobile });

  return (
    <AchievementsView
      status={status}
      summaryCards={summaryCards}
      showTrophies={showTrophies}
      trophies={trophies}
      multiEdition={multiEdition}
    />
  );
};
