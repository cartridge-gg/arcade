import { useMemo } from "react";
import { useRouterState } from "@tanstack/react-router";
import { useAccount } from "@starknet-react/core";
import { useAccountByAddress } from "@/collections/users";
import { useArcade } from "@/hooks/arcade";
import {
  NavigationContextManager,
  type NavigationContext,
  type TabValue,
} from "./NavigationContextManager";
import {
  ChestIcon,
  LeaderboardIcon,
  LightbulbIcon,
  ListIcon,
  MetricsIcon,
  PulseIcon,
  ScrollIcon,
  ShoppingCartIcon,
  SwordsIcon,
  TrophyIcon,
  UsersIcon,
} from "@cartridge/ui";

export interface NavigationViewModel {
  tabs: TabItem[];
  activeTab: TabValue;
}

export const DEFAULT_TAB: TabValue = "marketplace";
export const DASHBOARD_ALLOWED_ROUTES = [DEFAULT_TAB, "leaderboard", "predict"];

export type TabItem = {
  name: string;
  icon: typeof ChestIcon;
  tab: TabValue;
  href: string;
};

const TabValueDisplayMap = (tab: TabValue) => {
  switch (tab) {
    case "inventory":
      return { name: "Inventory", icon: ChestIcon };
    case "achievements":
      return { name: "Achievements", icon: TrophyIcon };
    case "leaderboard":
      return { name: "Leaderboard", icon: LeaderboardIcon };
    case "guilds":
      return { name: "Guilds", icon: SwordsIcon };
    case "activity":
      return { name: "Activity", icon: PulseIcon };
    case "metrics":
      return { name: "Metrics", icon: MetricsIcon };
    case "about":
      return { name: "About", icon: ListIcon };
    case "marketplace":
      return { name: "Marketplace", icon: ShoppingCartIcon };
    case "items":
      return { name: "Items", icon: ScrollIcon };
    case "holders":
      return { name: "Holders", icon: UsersIcon };
    case "predict":
      return { name: "Predict", icon: LightbulbIcon };
    case "positions":
      return { name: "Positions", icon: LightbulbIcon };
    default:
      return null;
  }
};

export interface NavigationContextViewModel extends NavigationViewModel {
  context: NavigationContext;
  game: ReturnType<NavigationContextManager["getActiveGame"]>;
  edition: ReturnType<NavigationContextManager["getActiveEdition"]>;
  player: ReturnType<NavigationContextManager["getPlayerContext"]>;
}

export function useNavigationContext(): NavigationContextViewModel {
  const routerState = useRouterState();
  const { games, editions } = useArcade();
  const { account } = useAccount();
  const { data: username } = useAccountByAddress(account?.address);

  const isLoggedIn = useMemo(
    () => Boolean(account?.address && username),
    [account, username],
  );

  const pathname = useMemo(
    () =>
      routerState.location?.pathname ??
      routerState.resolvedLocation?.pathname ??
      (typeof window !== "undefined" ? window.location.pathname : "/"),
    [routerState],
  );

  const manager = useMemo(
    () =>
      new NavigationContextManager({
        pathname,
        games,
        editions,
        isLoggedIn,
      }),
    [pathname, games, editions, isLoggedIn],
  );

  const context = useMemo(() => manager.getActiveContext(), [manager]);
  const game = useMemo(() => manager.getActiveGame(), [manager]);
  const edition = useMemo(() => manager.getActiveEdition(), [manager]);
  const player = useMemo(() => manager.getPlayerContext(), [manager]);

  const tabs: TabItem[] = useMemo(() => {
    const availableTabs = manager.getAvailableTabs();

    return availableTabs
      .map((navTab) => {
        const displayInfo = TabValueDisplayMap(navTab.tab);
        if (!displayInfo) return null;

        return {
          ...displayInfo,
          tab: navTab.tab,
          href: navTab.href,
        };
      })
      .filter((item): item is TabItem => item !== null);
  }, [manager]);

  const activeTab = useMemo(() => {
    const currentTab = manager.getParams().tab;
    if (!currentTab || !tabs.some((item) => item.tab === currentTab)) {
      return "marketplace" as TabValue;
    }
    return currentTab as TabValue;
  }, [manager, tabs]);

  return {
    tabs,
    activeTab,
    context,
    game,
    edition,
    player,
  };
}
