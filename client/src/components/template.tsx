import { Games } from "@/components/games";
import { SceneLayout } from "@/components/scenes/layout";
import { useEffect } from "react";
import { cn } from "@cartridge/ui/utils";
import { useSidebar } from "@/hooks/sidebar";
import { Header } from "./header";
import { useProject } from "@/hooks/project";
import { ThemeProvider } from "@/context/theme";
import { useArcade } from "@/hooks/arcade";
import { useDevice } from "@/hooks/device";
import { Filters } from "./filters";
import { Tabs } from "./tabs";
import { useParams } from "@tanstack/react-router";
import { PlayerHeader } from "./player-header";

export function Template({ children }: { children: React.ReactNode }) {
  const { isOpen, toggle, handleTouchMove, handleTouchStart } = useSidebar();
  const { setPlayer } = useArcade();
  const { player, collection } = useProject();
  const { player: playerParam } = useParams({ strict: true });

  const isPWA = useDevice();

  useEffect(() => {
    setPlayer(player);
  }, [player, setPlayer]);

  return (
    <ThemeProvider defaultScheme="dark">
      <SceneLayout>
        <div
          className={cn("h-full overflow-hidden w-full lg:px-0")}
          style={{ scrollbarWidth: "none" }}
        >
          <div
            className={cn(
              "lg:w-[1112px] lg:pb-6 gap-3 lg:gap-8 flex items-stretch m-auto h-full overflow-clip",
              "transition-all duration-300 ease-in-out",
            )}
          >
            <div
              className={cn(
                "absolute inset-0 bg-transparent z-10",
                !isOpen && "hidden",
              )}
              onClick={() => toggle()}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
            />
            {!collection ? <Games /> : <Filters />}
            <div
              className={cn(
                "fixed lg:relative h-full w-full flex flex-col overflow-clip px-3 lg:px-0 lg:pb-0",
                "transition-transform duration-300 ease-in-out",
                isPWA ? "pb-[90px]" : "pb-[84px]",
                isOpen
                  ? "translate-x-[min(calc(100vw-64px),360px)]"
                  : "translate-x-0",
              )}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
            >
              <div className="lg:hidden w-full p-3">
                <Header />
              </div>
              <div
                className={cn(
                  "relative grow h-full flex flex-col rounded-xl lg:gap-3 overflow-hidden border border-background-200 bg-background-100",
                  player &&
                  "bg-background-125 shadow-[0px_0px_8px_0px_rgba(15,20,16,_0.50)]",
                )}
              >
                {!playerParam ? <Tabs /> : <PlayerHeader address={playerParam} />}

                <div
                  className="p-0 px-3 lg:px-6 mt-0 grow w-full overflow-y-scroll"
                  style={{ scrollbarWidth: "none" }}
                >
                  {children}
                </div>
              </div>
            </div>
          </div>
        </div>
      </SceneLayout>
    </ThemeProvider>
  );
}
