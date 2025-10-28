import { GamePage } from "./pages/game";
import { PlayerPage } from "./pages/player";
import { useProject } from "@/hooks/project";
import { MarketPage } from "./pages/market";
import { usePageTracking } from "@/hooks/usePageTracking";
import { StarterpackClaimPage } from "./pages/starterpack-claim";

export function App() {
  // Initialize page tracking
  usePageTracking();
  const { player, collection, starterpackId } = useProject();

  if (starterpackId) {
    return <StarterpackClaimPage />;
  }

  if (player) {
    return <PlayerPage />;
  }

  if (collection) {
    return <MarketPage />;
  }

  return <GamePage />;
}
