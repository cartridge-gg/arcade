import { useCallback, useMemo } from "react";
import { TabsContent, Thumbnail, type TabValue } from "@cartridge/ui";
import { cn } from "@cartridge/ui/utils";
import { LeaderboardScene } from "../scenes/leaderboard";
import { useLocation, useNavigate } from "react-router-dom";
import { Socials } from "@cartridge/arcade";
import { ArcadeTabs } from "../modules";
import { MarketplaceScene } from "../scenes/marketplace";
import { GuildsScene } from "../scenes/guild";
import { AboutScene } from "../scenes/about";
import { Editions } from "../editions";
import arcade from "@/assets/arcade-logo.png";
import { useProject } from "@/hooks/project";
import { joinPaths } from "@/helpers";
import { useDevice } from "@/hooks/device";
import { PredictScene } from "../scenes/predict";
import { GameSocialWebsite } from "../modules/game-social";

export function GamePage() {
  const { game, edition } = useProject();
  const { tab } = useProject();
  const { isMobile } = useDevice();

  const location = useLocation();
  const navigate = useNavigate();
  const handleClick = useCallback(
    (value: string) => {
      let pathname = location.pathname;
      pathname = pathname.replace(/\/tab\/[^/]+/, "");
      pathname = joinPaths(pathname, `/tab/${value}`);
      navigate(pathname || "/");
    },
    [location, navigate],
  );

  const order: TabValue[] = useMemo(() => {
    const tabs: TabValue[] = game
      ? ["marketplace", "leaderboard", "predict", "about"]
      : ["marketplace", "leaderboard", "predict"];

    if (process.env.NODE_ENV !== "development") {
      // Remove predict tab in production for now
      const predictIndex = tabs.indexOf("predict");
      tabs.splice(predictIndex, 1);
    }

    return tabs;
  }, [game]);

  const defaultValue = useMemo(() => {
    if (!order.includes(tab as TabValue)) return "marketplace";
    return tab;
  }, [tab, order]);

  const socials = useMemo(() => {
    return Socials.merge(edition?.socials, game?.socials);
  }, [edition, game]);

  const isDashboard = !(edition && game);

  return (
    <>
      <div
        className={cn(
          "lg:h-[88px] w-full flex flex-col gap-4 lg:p-6 lg:pb-0 border-b border-background-200 lg:border-none",
          isDashboard ? "p-0" : "p-4",
        )}
      >
        <div className="flex items-start justify-between">
          <div
            className={cn(
              "flex gap-4 items-center overflow-hidden",
              isDashboard && isMobile && "hidden",
            )}
          >
            <Thumbnail
              icon={edition?.properties.icon || game?.properties.icon || arcade}
              size="xl"
              className="min-w-16 min-h-16"
            />
            <div className="flex flex-col gap-2 overflow-hidden">
              <p className="font-semibold text-xl/[24px] text-foreground-100 truncate">
                {game?.name || "Dashboard"}
              </p>
              <Editions />
            </div>
          </div>
          {game ? (
            <div className=" hidden lg:block">
              <GameSocialWebsite website={socials?.website || ""} label />
            </div>
          ) : null}
        </div>
        {game ? (
          <div className="block lg:hidden">
            <GameSocialWebsite website={socials?.website || ""} label />
          </div>
        ) : null}
      </div>

      <ArcadeTabs
        order={order}
        defaultValue={defaultValue as TabValue}
        onTabClick={(tab: TabValue) => handleClick(tab)}
      >
        <div
          className="flex justify-center gap-8 w-full h-full overflow-y-scroll"
          style={{ scrollbarWidth: "none" }}
        >
          <TabsContent
            className="p-0 px-3 lg:px-6 mt-0 grow w-full"
            value="marketplace"
          >
            <MarketplaceScene />
          </TabsContent>
          <TabsContent
            className="p-0 px-3 lg:px-6 mt-0 grow w-full"
            value="leaderboard"
          >
            <LeaderboardScene />
          </TabsContent>
          <TabsContent
            className="p-0 px-3 lg:px-6 mt-0 grow w-full"
            value="guilds"
          >
            <GuildsScene />
          </TabsContent>
          <TabsContent
            className="p-0 px-3 lg:px-6 mt-0 grow w-full"
            value="about"
          >
            <AboutScene />
          </TabsContent>
          <TabsContent
            className="p-0 px-3 lg:px-6 mt-0 grow w-full"
            value="predict"
          >
            <PredictScene />
          </TabsContent>
        </div>
      </ArcadeTabs>
    </>
  );
}
