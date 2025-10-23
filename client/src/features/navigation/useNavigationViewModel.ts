import { useAccountByAddress } from "@/collections/users";
import { type TAB_SEGMENTS, parseRouteParams, useProject } from "@/hooks/project";
import { joinPaths } from "@/lib/helpers";
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
import { useAccount } from "@starknet-react/core";
import { useRouterState } from "@tanstack/react-router";
import { useMemo } from "react";

export interface NavigationViewModel {
  tabs: TabItem[];
  activeTab: TabValue;
}

export type TabValue = (typeof TAB_SEGMENTS)[number];
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
    case DEFAULT_TAB:
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

function getTabHref(
  routerStatus: ReturnType<typeof useRouterState>,
  tab: TabValue,
  _item: { name: string; icon: typeof ChestIcon } | null,
): string {
  const pathname =
    routerStatus.location?.pathname ??
    routerStatus.resolvedLocation?.pathname ??
    (typeof window !== "undefined" ? window.location.pathname : "/");

  const segments = pathname.split("/").filter(Boolean);
  const { tab: activeTab } = parseRouteParams(pathname);
  const hasTrailingTab =
    activeTab && segments[segments.length - 1] === activeTab;

  const baseSegments =
    hasTrailingTab && activeTab
      ? segments.slice(0, segments.length - 1)
      : segments;

  if (baseSegments.length === 0 && tab === DEFAULT_TAB) {
    return "/";
  }

  return joinPaths(
    ...baseSegments,
    DEFAULT_TAB === tab && undefined === activeTab ? "" : tab,
  );
}

export function useNavigationViewModel(): NavigationViewModel {
  const { game, tab } = useProject();
  const { account } = useAccount();
  const { data: username } = useAccountByAddress(account?.address);
  const isLoggedIn = useMemo(
    () => Boolean(account?.address && username),
    [account, username],
  );

  const routerStatus = useRouterState();
  const tabs: TabItem[] = useMemo(() => {
    const loggedOutAvailableTabs: TabValue[] = game
      ? [DEFAULT_TAB, "leaderboard", "guilds", "predict", "about"]
      : [DEFAULT_TAB, "leaderboard", "predict"];
    const loggedInAvailableTabs: TabValue[] = game
      ? [DEFAULT_TAB, "leaderboard", "guilds", "inventory", "predict", "about"]
      : [DEFAULT_TAB, "leaderboard", "inventory", "predict"];

    let availableTabs: TabValue[] = isLoggedIn
      ? loggedInAvailableTabs
      : loggedOutAvailableTabs;

    if (process.env.NODE_ENV !== "development") {
      availableTabs = availableTabs.filter((t) => t !== "predict");
    }

    return availableTabs
      .map((t) => {
        const item = TabValueDisplayMap(t);
        const href = getTabHref(routerStatus, t, item);
        return item ? { ...item, tab: t, href } : null;
      })
      .filter((item): item is TabItem => item !== null);
  }, [game, routerStatus, isLoggedIn]);

  const activeTab = useMemo(() => {
    if (!tab || !tabs.some((item) => item.tab === tab)) {
      return DEFAULT_TAB;
    }
    return tab as TabValue;
  }, [tab, tabs]);

  return {
    tabs,
    activeTab,
  } satisfies NavigationViewModel;
}
