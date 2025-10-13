import { GamePage } from "./pages/game";
import { PlayerPage } from "./pages/player";
import { useProject } from "@/hooks/project";
import { MarketPage } from "./pages/market";
import { usePageTracking } from "@/hooks/usePageTracking";

export function App() {
  // Initialize page tracking
  usePageTracking();
  const { player, collection } = useProject();

  if (player) {
    return <PlayerPage />;
  }

  if (collection) {
    return <MarketPage />;
  }

  return <GamePage />;
}
