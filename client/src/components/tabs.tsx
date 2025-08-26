import { useCallback, useMemo } from "react";
import { Thumbnail } from "@cartridge/ui";
import { cn } from "@cartridge/ui/utils";
import { Link, useRouterState } from "@tanstack/react-router";
import { Socials } from "@cartridge/arcade";
import arcade from "@/assets/arcade-logo.png";
import { GameSocialWebsite } from "./modules/game-social";
import GameSocials from "./modules/game-socials";
import { Editions } from "./editions";
import { useProject } from "@/hooks/project";
import { useDevice } from "@/hooks/device";
import {
  PulseIcon,
  LeaderboardIcon,
  ShoppingCartIcon,
  SwordsIcon,
  ListIcon,
  UsersIcon,
  ScrollIcon,
} from "@cartridge/ui";
import { useCollection } from "@/hooks/market-collections";

type TabValue =
  | ""
  | "activity"
  | "leaderboard"
  | "marketplace"
  | "guilds"
  | "about"
  | "inventory"
  | "achievements"
  | "items"
  | "holders";

interface NavItem {
  value: TabValue;
  label: string;
  Icon: React.ComponentType<any>;
}

export function Tabs() {
  const { game, edition, collection: collectionAddress } = useProject();
  const { collection } = useCollection(collectionAddress || "", 1);

  const { isMobile } = useDevice();
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;

  const getNavPath = useCallback(
    (value: string) => {
      if (edition) {
        const gameName =
          game?.name.toLowerCase().replace(/ /g, "-") || game?.id.toString();
        const editionName =
          edition.name.toLowerCase().replace(/ /g, "-") ||
          edition.id.toString();
        return `/game/${gameName}/edition/${editionName}/${value}`;
      }
      if (game) {
        const gameName =
          game.name.toLowerCase().replace(/ /g, "-") || game.id.toString();
        return `/game/${gameName}/${value}`;
      }
      return `/${value}`;
    },
    [game, edition],
  );

  const pageTitle = useMemo(() => {
    if (collectionAddress) {
      return collection[0]?.name || "";
    }
    return game?.name || "Dashboard";
  }, [collection, game, collectionAddress]);

  const navItems: NavItem[] = useMemo(() => {
    let baseItems: NavItem[] = [
      { value: "activity", label: "Activity", Icon: PulseIcon },
      { value: "leaderboard", label: "Leaderboard", Icon: LeaderboardIcon },
      { value: "marketplace", label: "Marketplace", Icon: ShoppingCartIcon },
    ];

    if (game) {
      baseItems.push(
        { value: "guilds", label: "Guilds", Icon: SwordsIcon },
        { value: "about", label: "About", Icon: ListIcon },
      );
    }
    if (collectionAddress) {
      baseItems = [
        { value: "activity", label: "Activity", Icon: PulseIcon },
        { value: "items", label: "Items", Icon: ScrollIcon },
        { value: "holders", label: "Holders", Icon: UsersIcon },
      ];
    }

    return baseItems;
  }, [game, collectionAddress]);

  const isActive = useCallback(
    (value: string) => pathname.endsWith(`/${value}`),
    [pathname],
  );

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
                {pageTitle}
              </p>
              <Editions />
            </div>
          </div>
          <GameSocials socials={socials} />
        </div>
        <div className={cn("lg:hidden", !socials?.website && "hidden")}>
          <GameSocialWebsite website={socials?.website || ""} label />
        </div>
      </div>

      <nav
        className={cn(
          "hidden lg:flex justify-start items-end w-full p-0 px-4 border-b rounded-none bg-background-100 border-background-200 gap-3 h-10",
        )}
      >
        {navItems.map((item) => (
          <Link
            key={item.value}
            to={getNavPath(item.value)}
            className={cn(
              "flex justify-center items-center text-foreground-300 hover:text-foreground-200 transition-colors p-2 pt-[10px] gap-1 text-sm cursor-pointer select-none border-b-2 border-transparent",
              isActive(item.value) && "text-primary",
              isActive(item.value) &&
              "border-b-2 border-primary hover:text-primary hover:border-primary",
            )}
          >
            <div className="flex gap-1 items-center">
              <item.Icon variant="solid" size="sm" />
              <p className="font-normal">{item.label}</p>
            </div>
          </Link>
        ))}
      </nav>

      {isMobile && (
        <nav
          className={cn(
            "fixed bottom-0 left-0 right-0 z-50 w-full bg-background-100 border-t border-background-200",
            "h-[72px]",
          )}
        >
          <div className="h-full w-full p-0 flex gap-2 items-start justify-around">
            {navItems.map((item) => (
              <Link
                key={item.value}
                to={getNavPath(item.value)}
                className={cn(
                  "flex flex-col items-center justify-center p-2 grow",
                  "text-foreground-300 hover:text-foreground-200 transition-colors",
                  isActive(item.value) && "text-primary",
                )}
              >
                <item.Icon variant="solid" size="lg" />
                <span className="text-xs mt-1">{item.label}</span>
              </Link>
            ))}
          </div>
        </nav>
      )}
    </>
  );
}
