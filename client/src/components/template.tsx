import { type ReactNode, useEffect, useMemo } from "react";
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
import arcade from "@/assets/arcade-logo.png";
import { Socials } from "@cartridge/arcade";
import { GameHeader } from "./ui/games/GameHeader";
import { NavigationContainer } from "@/features/navigation";

interface TemplateProps {
  children: ReactNode;
}

export function Template({ children }: TemplateProps) {
  const { isOpen, toggle, handleTouchMove, handleTouchStart } = useSidebar();
  const { setPlayer } = useArcade();
  const { player, collection, game, edition } = useProject();

  const { isPWA, isMobile } = useDevice();

  useEffect(() => {
    setPlayer(player);
  }, [player, setPlayer]);

  // const { location } = useRouterState();
  // const handleClick = useCallback(
  //   (value: string) => {
  //     const segments = location.pathname.split("/").filter(Boolean);
  //     const last = segments[segments.length - 1];
  //     if (last === value) return;
  //     if (TAB_SEGMENTS.includes(last as (typeof TAB_SEGMENTS)[number])) {
  //       segments.pop();
  //     }
  //     segments.push(value as TabValue);
  //     const target = joinPaths(...segments);
  //     window.history.pushState({}, "", target || "/");
  //   },
  //   [location.pathname],
  // );

  // const order: TabValue[] = useMemo(() => {
  //   const tabs: TabValue[] = game
  //     ? ["marketplace", "leaderboard", "guilds", "predict", "about"]
  //     : ["marketplace", "leaderboard", "predict"];
  //
  //   if (process.env.NODE_ENV !== "development") {
  //     // Remove predict tab in production for now
  //     const predictIndex = tabs.indexOf("predict");
  //     tabs.splice(predictIndex, 1);
  //   }
  //
  //   return tabs;
  // }, [game]);

  // const defaultValue = useMemo(() => {
  //   if (!order.includes(tab as TabValue)) return "marketplace";
  //   return tab;
  // }, [tab, order]);

  const socials = useMemo(() => {
    return Socials.merge(edition?.socials, game?.socials);
  }, [edition, game]);

  const isDashboard = !(edition && game);

  return (
    <ThemeProvider defaultScheme="dark">
      <SceneLayout>
        <div
          className={cn("h-full w-full overflow-y-scroll lg:px-6 lg:py-5")}
          style={{ scrollbarWidth: "none" }}
        >
          <div
            className={cn(
              "w-full px-0 gap-3 lg:gap-6 2xl:gap-10 flex items-stretch m-auto h-full overflow-clip",
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
