import { Games } from "@/components/games";
import { SceneLayout } from "@/components/scenes/layout";
import { GamePage } from "./pages/game";
import { useEffect } from "react";
import { PlayerPage } from "./pages/player";
import { cn, useMediaQuery } from "@cartridge/ui-next";
import { useSidebar } from "@/hooks/sidebar";
import { Header } from "./header";
import { useProject } from "@/hooks/project";
import { ThemeProvider } from "@/context/theme";
import { useArcade } from "@/hooks/arcade";

export function App() {
  const { isOpen, toggle, handleTouchMove, handleTouchStart } = useSidebar();
  const { setPlayer } = useArcade();
  const { player } = useProject();

  const isPWA = useMediaQuery("(display-mode: standalone)");

  useEffect(() => {
    setPlayer(player);
  }, [player, setPlayer]);

  return (
    <ThemeProvider defaultScheme="dark">
      <SceneLayout>
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
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
            />
            <Games />
            <div
              className={cn(
                "fixed lg:relative h-full w-full flex flex-col overflow-hidden px-3 lg:px-0 lg:pb-0",
                "transition-transform duration-300 ease-in-out",
                isPWA ? "pb-[90px]" : "pb-[84px]",
                isOpen
                  ? "translate-x-[min(calc(100vw-64px),360px)]"
                  : "translate-x-0",
              )}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
            >
              <div className="lg:hidden w-full">
                <Header />
              </div>
              <div
                className={cn(
                  "relative grow h-full flex flex-col rounded-xl lg:gap-2 overflow-hidden border border-background-200 bg-background-100",
                  player &&
                    "bg-background-125 shadow-[0px_0px_8px_0px_rgba(15,20,16,_0.50)]",
                )}
              >
                {!player ? <GamePage /> : <PlayerPage />}
              </div>
            </div>
          </div>
        </div>
      </SceneLayout>
    </ThemeProvider>
  );
}
