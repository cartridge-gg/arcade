import { useMediaQuery } from "@cartridge/ui";
import { GamesView } from "@/components/ui/games/GamesView";
import { useGamesViewModel } from "./useGamesViewModel";

export const GamesContainer = () => {
  const isMobile = useMediaQuery("(max-width: 1024px)");
  const isPWA = useMediaQuery("(display-mode: standalone)");

  const viewModel = useGamesViewModel({ isMobile, isPWA });

  return <GamesView {...viewModel} />;
};
