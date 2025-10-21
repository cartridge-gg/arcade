import { useCallback, useMemo } from "react";
import { TabsContent, type TabValue } from "@cartridge/ui";
import { LeaderboardScene } from "../scenes/leaderboard";
import { useRouterState } from "@tanstack/react-router";
import { Socials } from "@cartridge/arcade";
import { ArcadeTabs } from "../ui/modules/tabs";
import { MarketplaceScene } from "../scenes/marketplace";
import { GuildsScene } from "../scenes/guild";
import { AboutScene } from "../scenes/about";
import arcade from "@/assets/arcade-logo.png";
import { useProject, TAB_SEGMENTS } from "@/hooks/project";
import { joinPaths } from "@/lib/helpers";
import { useDevice } from "@/hooks/device";
import { PredictScene } from "../scenes/predict";
import { GameHeader } from "../ui/games/GameHeader";

export function GamePage() {
  const { game, edition, tab } = useProject();
  const { isMobile } = useDevice();

  const { location } = useRouterState();
  const handleClick = useCallback(
    (value: string) => {
      const segments = location.pathname.split("/").filter(Boolean);
      const last = segments[segments.length - 1];
      if (last === value) return;
      if (TAB_SEGMENTS.includes(last as (typeof TAB_SEGMENTS)[number])) {
        segments.pop();
      }
      segments.push(value as TabValue);
      const target = joinPaths(...segments);
      window.history.pushState({}, "", target || "/");
    },
    [location.pathname],
  );

  const order: TabValue[] = useMemo(() => {
    const tabs: TabValue[] = game
      ? ["marketplace", "leaderboard", "guilds", "predict", "about"]
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
      {/* <GameHeader */}
      {/*   isDashboard={isDashboard} */}
      {/*   isMobile={isMobile} */}
      {/*   arcade={arcade} */}
      {/*   edition={edition} */}
      {/*   game={game} */}
      {/*   socials={socials} */}
      {/* /> */}
      {/* <ArcadeTabs */}
      {/*   order={order} */}
      {/*   defaultValue={defaultValue as TabValue} */}
      {/*   onTabClick={(tab: TabValue) => handleClick(tab)} */}
      {/* > */}
      {/*   <div */}
      {/*     className="flex justify-center gap-8 w-full h-full overflow-y-scroll" */}
      {/*     style={{ scrollbarWidth: "none" }} */}
      {/*   > */}
      {/*     <TabsContent */}
      {/*       className="p-0 px-3 lg:px-6 mt-0 grow w-full" */}
      {/*       value="marketplace" */}
      {/*     > */}
      {/*       <MarketplaceScene /> */}
      {/*     </TabsContent> */}
      {/*     <TabsContent */}
      {/*       className="p-0 px-3 lg:px-6 mt-0 grow w-full" */}
      {/*       value="leaderboard" */}
      {/*     > */}
      {/*       <LeaderboardScene /> */}
      {/*     </TabsContent> */}
      {/*     <TabsContent */}
      {/*       className="p-0 px-3 lg:px-6 mt-0 grow w-full" */}
      {/*       value="guilds" */}
      {/*     > */}
      {/*       <GuildsScene /> */}
      {/*     </TabsContent> */}
      {/*     <TabsContent */}
      {/*       className="p-0 px-3 lg:px-6 mt-0 grow w-full" */}
      {/*       value="about" */}
      {/*     > */}
      {/*       <AboutScene /> */}
      {/*     </TabsContent> */}
      {/*     <TabsContent */}
      {/*       className="p-0 px-3 lg:px-6 mt-0 grow w-full" */}
      {/*       value="predict" */}
      {/*     > */}
      {/*       <PredictScene /> */}
      {/*     </TabsContent> */}
      {/*   </div> */}
      {/* </ArcadeTabs> */}
    </>
  );
}
