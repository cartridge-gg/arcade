import { useMemo, type ComponentProps } from "react";
import { useRouterState } from "@tanstack/react-router";
import { useAccount } from "@starknet-react/core";
import { useAccountByAddress } from "@/effect";
import { useArcade } from "@/hooks/arcade";
import {
  NavigationContextManager,
  type NavigationContext,
} from "./NavigationContextManager";
import type { TabValue } from "@/hooks/project";
import {
  ChestIcon,
  LeaderboardIcon,
  LightbulbIcon,
  MetricsIcon,
  PulseIcon,
  ScrollIcon,
  ShoppingCartIcon,
  SwordsIcon,
  TrophyIcon,
  UsersIcon,
  ArrowIcon,
} from "@cartridge/ui";
import { DashboardIcon } from "@/components/ui/icons";

export interface NavigationViewModel {
  tabs: TabItem[];
  activeTab: TabValue;
}

export const DEFAULT_TAB: TabValue = "about";
export const DASHBOARD_ALLOWED_ROUTES = [DEFAULT_TAB, "leaderboard", "predict"];

type TabIconType = React.FC<
  ComponentProps<typeof ChestIcon | typeof ArrowIcon>
>;

export type TabItem = {
  name: string;
  icon: TabIconType;
  tab: TabValue;
  href: string;
  props?: ComponentProps<TabIconType>;
};

const TabValueDisplayMap = (tab: TabValue): Partial<TabItem> | null => {
  switch (tab) {
    case "inventory":
      return { name: "Inventory", icon: ChestIcon as TabIconType };
    case "achievements":
      return { name: "Achievements", icon: TrophyIcon as TabIconType };
    case "leaderboard":
      return { name: "Leaderboard", icon: LeaderboardIcon as TabIconType };
    case "guilds":
      return { name: "Guilds", icon: SwordsIcon as TabIconType };
    case "activity":
      return { name: "Activity", icon: PulseIcon as TabIconType };
    case "metrics":
      return { name: "Metrics", icon: MetricsIcon as TabIconType };
    case "about":
      return { name: "Dashboard", icon: DashboardIcon as TabIconType };
    case "marketplace":
      return { name: "Marketplace", icon: ShoppingCartIcon as TabIconType };
    case "items":
      return { name: "Items", icon: ScrollIcon as TabIconType };
    case "holders":
      return { name: "Holders", icon: UsersIcon as TabIconType };
    case "predict":
      return { name: "Predict", icon: LightbulbIcon as TabIconType };
    case "positions":
      return { name: "Positions", icon: LightbulbIcon as TabIconType };
    case "collection":
      return { name: "Collection", icon: ScrollIcon as TabIconType };
    case "back":
      return {
        name: "Back",
        icon: ArrowIcon as TabIconType,
        props: { variant: "left" },
      };
    default:
      return null;
  }
};

export interface NavigationContextViewModel extends NavigationViewModel {
  context: NavigationContext;
  game: ReturnType<NavigationContextManager["getActiveGame"]>;
  edition: ReturnType<NavigationContextManager["getActiveEdition"]>;
  player: ReturnType<NavigationContextManager["getPlayerContext"]>;
  manager: NavigationContextManager;
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
      return "about" as TabValue;
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
    manager,
  };
}
