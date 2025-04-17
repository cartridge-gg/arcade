import { useCallback, useEffect, useMemo } from "react";
import {
  TabsContent,
  Thumbnail,
  TabValue,
  ActivitySocialWebsite,
} from "@cartridge/ui-next";
import { DiscoverScene } from "../scenes/discover";
import { LeaderboardScene } from "../scenes/leaderboard";
import { useNavigate, useSearchParams } from "react-router-dom";
import { GameModel } from "@bal7hazar/arcade-sdk";
import cartridge from "@/assets/cartridge-logo.png";
import { ArcadeTabs } from "../modules";
import { MarketplaceScene } from "../scenes/marketplace";
import { GuildsScene } from "../scenes/guild";
import { AboutScene } from "../scenes/about";
import GameSocials from "../modules/game-socials";

export function GamePage({ game }: { game: GameModel | undefined }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const handleClick = useCallback(
    (value: string) => {
      // Clicking on a tab updates the url param tab to the value of the tab
      // So the tab is persisted in the url and the user can update and share the url
      const url = new URL(window.location.href);
      url.searchParams.set("gameTab", value);
      navigate(url.toString().replace(window.location.origin, ""));
    },
    [navigate],
  );

  const order: TabValue[] = useMemo(() => {
    if (!game) return ["activity", "leaderboard", "marketplace"];
    return ["activity", "leaderboard", "marketplace", "guilds", "about"];
  }, [game]);

  const defaultValue = useMemo(() => {
    // Default tab is ignored if there is no address,
    // meanning the user is not connected and doesnt inspect another user
    const value = searchParams.get("gameTab") || "activity";
    if (!order.includes(value as TabValue)) return "activity";
    return value as TabValue;
  }, [searchParams, order]);

  useEffect(() => {
    const value = searchParams.get("gameTab") || "activity";
    if (!order.includes(value as TabValue)) {
      const url = new URL(window.location.href);
      url.searchParams.set("gameTab", "activity");
      navigate(url.toString().replace(window.location.origin, ""));
    }
  }, [searchParams, order, navigate]);

  return (
    <>
      <div className="relative flex items-center justify-between p-3 lg:p-6 pb-0">
        <div className="flex gap-3 items-center">
          <Thumbnail icon={game?.metadata.image || cartridge} size="xl" />
          <div className="flex flex-col gap-0.5">
            <p className="font-semibold text-lg/[22px] text-foreground-100">
              {game?.metadata.name ?? "All Games"}
            </p>
            {game?.socials.website && (
              <ActivitySocialWebsite
                website={game.socials.website}
                certified
                className="text-foreground-300"
              />
            )}
          </div>
        </div>
        <GameSocials socials={game?.socials} />
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
            value="activity"
          >
            <DiscoverScene />
          </TabsContent>
          <TabsContent
            className="p-0 px-3 lg:px-6 mt-0 grow w-full"
            value="leaderboard"
          >
            <LeaderboardScene />
          </TabsContent>
          <TabsContent
            className="p-0 px-3 lg:px-6 mt-0 grow w-full"
            value="marketplace"
          >
            <MarketplaceScene />
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
        </div>
      </ArcadeTabs>
    </>
  );
}
