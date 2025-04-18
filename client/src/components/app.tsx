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
import { SidebarProvider } from "@/context/sidebar";
import { useSidebar } from "@/hooks/sidebar";
import { Header } from "./header";

// Wrapper component to apply sidebar effects
const MainContent = ({ children }: { children: React.ReactNode }) => {
  const { isOpen } = useSidebar();
  const { isZero } = useAddress();

  return (
    <div
      className={cn(
        "grow flex flex-col overflow-hidden px-3 pb-[84px] lg:pb-0",
        "transition-transform duration-300 ease-in-out",
        isOpen && "translate-x-[min(calc(100vw-64px),360px)]",
      )}
    >
      <div className="lg:hidden w-full">
        <Header />
      </div>
      <div
        className={cn(
          "relative grow h-full flex flex-col rounded-xl lg:gap-2 overflow-hidden border border-background-200 bg-background-100",
          !isZero &&
            "bg-background-125 shadow-[0px_0px_8px_0px_rgba(15,20,16,_0.50)]",
        )}
      >
        {children}
      </div>
    </div>
  );
};

const AppContent = () => {
  const { isZero } = useAddress();
  const { games, projects, setProjects } = useArcade();
  const { project, namespace } = useProject();
  const { isOpen, toggle } = useSidebar();

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
    <div
      className={cn("h-full w-full overflow-y-scroll lg:px-0")}
      style={{ scrollbarWidth: "none" }}
    >
      <div
        className={cn(
          "lg:w-[1112px] lg:pt-8 lg:pb-6 gap-3 lg:gap-8 flex items-stretch m-auto h-full overflow-clip",
          "transition-all duration-300 ease-in-out",
        )}
      >
        <div
          className={cn(
            "absolute inset-0 bg-transparent z-10",
            !isOpen && "hidden",
          )}
          onClick={() => toggle()}
        />
        <Games />
        <MainContent>
          {isZero ? <GamePage game={game} /> : <PlayerPage game={game} />}
        </MainContent>
      </div>
    </div>
  );
};

export function App() {
  return (
    <SidebarProvider>
      <SceneLayout>
        <AppContent />
      </SceneLayout>
    </SidebarProvider>
  );
}
