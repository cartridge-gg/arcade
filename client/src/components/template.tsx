import { type ReactNode, useMemo } from "react";
import { GamesContainer } from "@/features/games";
import { HeaderContainer } from "@/features/header";
import { SceneLayout } from "@/components/scenes/layout";
import { cn } from "@cartridge/ui/utils";
import { useSidebar } from "@/hooks/sidebar";
import { useProject } from "@/hooks/project";
import { useTheme } from "@/hooks/context";
import { useDevice } from "@/hooks/device";
import { UserCard } from "./user/user-card";
import arcade from "@/assets/arcade-logo.png";
import { Socials } from "@cartridge/arcade";
import { GameHeader } from "./ui/games/GameHeader";
import { NavigationContainer } from "@/features/navigation";
import { ViewingAsPlayerBannerInformation } from "./user/viewing-as-player";

interface TemplateProps {
  children: ReactNode;
}

export function Template({ children }: TemplateProps) {
  useTheme();
  const { isOpen, handleTouchMove, handleTouchStart } = useSidebar();
  const { game, edition } = useProject();

  const { isMobile } = useDevice();

  const socials = useMemo(() => {
    return Socials.merge(edition?.socials, game?.socials);
  }, [edition, game]);

  const isDashboard = !(edition && game);

  return (
    <>
      <ViewingAsPlayerBannerInformation />
      <SceneLayout>
        <div
          className={cn("h-full w-full lg:px-6 lg:py-5 lg:pt-0")}
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
                "absolute inset-0 bg-transparent",
                !isOpen && "hidden",
              )}
            />

            <div
              className={cn(
                "lg:space-y-4 h-full flex flex-col",
                "fixed lg:relative left-0 w-[min(calc(100vw-64px),360px)]",
                "transition-all duration-300 ease-in-out",
                !isOpen && isMobile ? "-translate-x-full" : "translate-x-0",
              )}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
            >
              {!isMobile && <UserCard />}
              <div className="flex-1 overflow-hidden">
                <GamesContainer />
              </div>
            </div>

            <div
              className={cn(
                "fixed lg:relative h-full w-full flex flex-col px-0 lg:pb-0",
                "transition-all duration-300 ease-in-out max-w-[1320px]",
                "pb-[79px] lg:pb-0",
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
                )}
              >
                {children}
              </div>
            </div>
          </div>
        </div>
      </SceneLayout>
    </>
  );
}
