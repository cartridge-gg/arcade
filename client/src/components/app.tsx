import { GamePage } from "./pages/game";
import { PlayerPage } from "./pages/player";
import { useProject } from "@/hooks/project";
import { MarketPage } from "./pages/market";

export function App() {
  const { player, collection } = useProject();

  return (
    <>
      {!player ? (
        !collection ? (
          <GamePage />
        ) : (
          <MarketPage />
        )
      ) : (
        <PlayerPage />
      )}
    </>
  );
}
