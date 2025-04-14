import { Games } from "@/components/games";
import { SceneLayout } from "@/components/scenes/layout";
import { GamePage } from "./pages/game";
import { useEffect, useMemo } from "react";
import { useArcade } from "@/hooks/arcade";
import { useAddress } from "@/hooks/address";
import { PlayerPage } from "./pages/player";
import { cn } from "@cartridge/ui-next";
import { GameModel } from "@bal7hazar/arcade-sdk";
import { useProject } from "@/hooks/project";

export function App() {
  const { isZero } = useAddress();
  const { games, projects, setProjects } = useArcade();
  const { project, namespace } = useProject();

  const game: GameModel | undefined = useMemo(() => {
    return Object.values(games).find(
      (game) => game.namespace === namespace && game.config.project === project,
    );
  }, [games, project, namespace]);

  useEffect(() => {
    if (projects.length === Object.values(games).length) return;
    setProjects(
      games.map((game) => ({
        namespace: game.namespace,
        project: game.config.project,
      })),
    );
  }, [games, projects, setProjects]);

  return (
    <SceneLayout>
      <div
        className="h-full w-full overflow-y-scroll px-3 lg:px-0"
        style={{ scrollbarWidth: "none" }}
      >
        <div className="lg:w-[1112px] lg:pt-8 pb-6 gap-8 flex items-stretch m-auto h-full overflow-clip">
          <Games />
          <div
            className={cn(
              "relative grow h-full flex flex-col rounded-xl gap-2 overflow-hidden border border-background-200 bg-background-100",
              !isZero &&
              "bg-background-125 shadow-[0px_0px_8px_0px_rgba(15,20,16,_0.50)]",
            )}
          >
            {isZero ? <GamePage game={game} /> : <PlayerPage game={game} />}
          </div>
        </div>
      </div>
    </SceneLayout>
  );
}
