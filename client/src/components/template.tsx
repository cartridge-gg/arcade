import { type ReactNode, useMemo } from "react";
import { GamesContainer } from "@/features/games";
import { MarketplaceFiltersContainer } from "@/features/marketplace/filters";
import { HeaderContainer } from "@/features/header";
import { SceneLayout } from "@/components/scenes/layout";
import { cn } from "@cartridge/ui/utils";
import { useSidebar } from "@/hooks/sidebar";
import { useProject } from "@/hooks/project";
import { ThemeProvider } from "@/context/theme";
import { useDevice } from "@/hooks/device";
import { UserCard } from "./user/user-card";
import arcade from "@/assets/arcade-logo.png";
import { Socials } from "@cartridge/arcade";
import { GameHeader } from "./ui/games/GameHeader";
import { NavigationContainer } from "@/features/navigation";

interface TemplateProps {
  children: ReactNode;
}

export function Template({ children }: TemplateProps) {
  const { isOpen, toggle, handleTouchMove, handleTouchStart } = useSidebar();
  const { player, collection, game, edition } = useProject();

  const { isMobile } = useDevice();

  const socials = useMemo(() => {
    return Socials.merge(edition?.socials, game?.socials);
  }, [edition, game]);

  const isDashboard = !(edition && game);

  return (
    <ThemeProvider defaultScheme="dark">
      <SceneLayout>
        <div
          className={cn("h-full w-full overflow-y-scroll lg:px-6 lg:py-5 ")}
          style={{ scrollbarWidth: "none" }}
        >
          <div
            className={cn(
              "w-full px-0 gap-3 lg:gap-6 2xl:gap-10 flex items-stretch m-auto h-full",
              "transition-all duration-300 ease-in-out justify-center",
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

            <div
              className={cn(
                "lg:space-y-4 h-full flex flex-col",
                "fixed lg:relative left-0 w-[min(calc(100vw-64px),360px)] lg:w-auto",
                "transition-all duration-300 ease-in-out",
                !isOpen && isMobile ? "-translate-x-full" : "translate-x-0",
              )}
            >
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
                "transition-all duration-300 ease-in-out max-w-[1320px]",
                "pb-[79px] lg:pb-[73px]",
                isOpen
                  ? "translate-x-[min(calc(100vw-64px),360px)]"
                  : "translate-x-0",
              )}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
            >
              <GameHeader
                isDashboard={isDashboard}
                isMobile={isMobile}
                arcade={arcade}
                edition={edition}
                game={game}
                socials={socials}
              />
              <NavigationContainer />

              <div className="lg:hidden w-full p-3">
                <HeaderContainer />
              </div>
              <div
                className={cn(
                  "relative grow h-full flex flex-col rounded-none lg:rounded-xl lg:gap-3 overflow-hidden border border-background-200 bg-background-100 p-3 lg:p-6 order-2 lg:order-3",
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
