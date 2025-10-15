import { type ReactNode, useEffect } from "react";
import { GamesContainer } from "@/features/games";
import { MarketplaceFiltersContainer } from "@/features/marketplace/filters";
import { HeaderContainer } from "@/features/header";
import { SceneLayout } from "@/components/scenes/layout";
import { cn } from "@cartridge/ui/utils";
import { useSidebar } from "@/hooks/sidebar";
import { useProject } from "@/hooks/project";
import { ThemeProvider } from "@/context/theme";
import { useArcade } from "@/hooks/arcade";
import { useDevice } from "@/hooks/device";
import { UserCard } from "./user/user-card";

interface TemplateProps {
  children: ReactNode;
}

export function Template({ children }: TemplateProps) {
  const { isOpen, toggle, handleTouchMove, handleTouchStart } = useSidebar();
  const { setPlayer } = useArcade();
  const { player, collection } = useProject();

  const { isPWA, isMobile } = useDevice();

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
              "2xl:max-w-[1720px] w-full px-0 lg:px-6 lg:pb-6 2xl:pb-10 2xl:px-10 gap-3 lg:gap-6 2xl:gap-10 flex items-stretch m-auto h-full overflow-clip",
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

            <div className="lg:space-y-4 h-full flex flex-col">
              {!isMobile && <UserCard />}
              <div className="flex-1 overflow-hidden">
                {!collection ? (
                  <GamesContainer />
                ) : (
                  <MarketplaceFiltersContainer />
                )}
              </div>
            </div>

            <div
              className={cn(
                "fixed lg:relative h-full w-full flex flex-col overflow-hidden px-0 lg:pb-0",
                "transition-transform duration-300 ease-in-out",
                isPWA ? "pb-[77px]" : "pb-[71px]",
                isOpen
                  ? "translate-x-[min(calc(100vw-64px),360px)]"
                  : "translate-x-0",
              )}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
            >
              <div className="lg:hidden w-full p-3">
                <HeaderContainer />
              </div>
              <div
                className={cn(
                  "relative grow h-full flex flex-col rounded-none lg:rounded-xl lg:gap-3 overflow-hidden border border-background-200 bg-background-100",
                  player &&
                    "bg-background-125 shadow-[0px_0px_8px_0px_rgba(15,20,16,_0.50)]",
                )}
              >
                {children}
              </div>
            </div>
          </div>
        </div>
      </SceneLayout>
    </ThemeProvider>
  );
}
