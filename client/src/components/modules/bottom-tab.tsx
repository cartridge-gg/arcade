import {
  ArcadeMenuItem,
  ArcadeTab,
  BottomTab,
  ChestIcon,
  ClockIcon,
  cn,
  LayoutBottomTabs,
  LeaderboardIcon,
  ListIcon,
  MetricsIcon,
  PulseIcon,
  ShoppingCartIcon,
  SwordsIcon,
  Tabs,
  TabsList,
  TrophyIcon,
  UsersIcon,
} from "@cartridge/ui-next";
import { useNavigate, useSearchParams } from "react-router-dom";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cva } from "class-variance-authority";
import { ArcadeTabsProps } from "./tabs";
import { GameModel } from "@bal7hazar/arcade-sdk";
import { useSidebar } from "@/hooks/sidebar";

export type TabValue =
  | "inventory"
  | "achievements"
  | "leaderboard"
  | "guilds"
  | "activity"
  | "metrics"
  | "about"
  | "marketplace";

export const ArcadeBottomTabs = ({
  game,
}: { game: GameModel | undefined }) => {
  const [searchParams] = useSearchParams();

  const order: TabValue[] = useMemo(() => {
    if (!game) return ["activity", "leaderboard", "marketplace"];
    return ["activity", "leaderboard", "marketplace", "guilds", "about"];
  }, [game]);

  const [active, setActive] = useState<TabValue>(() => {
    const value = searchParams.get("gameTab") || "activity";
    if (!order.includes(value as TabValue)) return "activity";
    return value as TabValue;
  });
  const navigate = useNavigate();
  const { isOpen } = useSidebar();

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

  useEffect(() => {
    const value = searchParams.get("gameTab") || "activity";
    if (!order.includes(value as TabValue)) {
      const url = new URL(window.location.href);
      url.searchParams.set("gameTab", "activity");
      navigate(url.toString().replace(window.location.origin, ""));
    }
  }, [searchParams, order, navigate]);

  return (
    <LayoutBottomTabs className={cn("fixed bottom-0 left-0 z-50",
      "transition-all duration-300 ease-in-out",
      isOpen
        ? "translate-x-[min(calc(100vw-64px),360px)] lg:translate-x-0"
        : "lg:translate-x-0 translate-x-0",
    )}>
      <div className="w-full flex justify-around items-stretch shrink-0 bg-background-200 border-spacer-100 h-[72px] gap-x-2 px-0 py-0 border-t-0 shadow-none">
        <BottomTab>
          <PulseIcon
            size="lg"
            variant="line"
          />
        </BottomTab>
        <BottomTab status="active">
          <ChestIcon
            size="lg"
            variant="solid"
          />
        </BottomTab>
        <BottomTab>
          <TrophyIcon
            size="lg"
            variant="line"
          />
        </BottomTab>
        <BottomTab>
          <SwordsIcon
            size="lg"
            variant="line"
          />
        </BottomTab>
        <BottomTab>
          <UsersIcon
            size="lg"
            variant="line"
          />
        </BottomTab>
        <BottomTab>
          <ClockIcon
            size="lg"
            variant="line"
          />
        </BottomTab>
      </div>
    </LayoutBottomTabs>
  );
};

const Tab = ({
  tab,
  value,
  size,
  onTabClick,
  item,
}: {
  tab: TabValue;
  value: string;
  size: "default" | null | undefined;
  onTabClick?: () => void;
  item?: boolean;
}) => {
  const props = {
    value: tab,
    active: value === tab,
    size,
    onClick: onTabClick,
    item,
  };
  switch (tab) {
    case "inventory":
      return <InventoryNavButton key={tab} {...props} />;
    case "achievements":
      return <AchievementsNavButton key={tab} {...props} />;
    case "leaderboard":
      return <LeaderboardNavButton key={tab} {...props} />;
    case "guilds":
      return <GuildsNavButton key={tab} {...props} />;
    case "activity":
      return <ActivityNavButton key={tab} {...props} />;
    case "metrics":
      return <MetricsNavButton key={tab} {...props} />;
    case "about":
      return <AboutNavButton key={tab} {...props} />;
    case "marketplace":
      return <MarketplaceNavButton key={tab} {...props} />;
    default:
      return null;
  }
};

const InventoryNavButton = React.forwardRef<
  HTMLButtonElement,
  {
    value: string;
    active: boolean;
    size: "default" | null | undefined;
    onClick?: () => void;
    item?: boolean;
  }
>(({ value, active, size, onClick, item }, ref) => {
  if (item) {
    return (
      <ArcadeMenuItem
        ref={ref}
        value={value}
        Icon={<ChestIcon variant="solid" size="sm" />}
        label="Inventory"
        active={active}
        size={size}
        onClick={onClick}
      />
    );
  }
  return (
    <ArcadeTab
      ref={ref}
      value={value}
      Icon={<ChestIcon variant="solid" size="sm" />}
      label="Inventory"
      active={active}
      size={size}
      onClick={onClick}
    />
  );
});

const AchievementsNavButton = React.forwardRef<
  HTMLButtonElement,
  {
    value: string;
    active: boolean;
    size: "default" | null | undefined;
    onClick?: () => void;
    item?: boolean;
  }
>(({ value, active, size, onClick, item }, ref) => {
  if (item) {
    return (
      <ArcadeMenuItem
        ref={ref}
        value={value}
        Icon={<TrophyIcon variant="solid" size="sm" />}
        label="Achievements"
        active={active}
        size={size}
        onClick={onClick}
      />
    );
  }
  return (
    <ArcadeTab
      ref={ref}
      value={value}
      Icon={<TrophyIcon variant="solid" size="sm" />}
      label="Achievements"
      active={active}
      size={size}
      onClick={onClick}
    />
  );
});

const LeaderboardNavButton = React.forwardRef<
  HTMLButtonElement,
  {
    value: string;
    active: boolean;
    size: "default" | null | undefined;
    onClick?: () => void;
    item?: boolean;
  }
>(({ value, active, size, onClick, item }, ref) => {
  if (item) {
    return (
      <ArcadeMenuItem
        ref={ref}
        value={value}
        Icon={<LeaderboardIcon variant="solid" size="sm" />}
        label="Leaderboard"
        active={active}
        size={size}
        onClick={onClick}
      />
    );
  }
  return (
    <ArcadeTab
      ref={ref}
      value={value}
      Icon={<LeaderboardIcon variant="solid" size="sm" />}
      label="Leaderboard"
      active={active}
      size={size}
      onClick={onClick}
    />
  );
});

const GuildsNavButton = React.forwardRef<
  HTMLButtonElement,
  {
    value: string;
    active: boolean;
    size: "default" | null | undefined;
    onClick?: () => void;
    item?: boolean;
  }
>(({ value, active, size, onClick, item }, ref) => {
  if (item) {
    return (
      <ArcadeMenuItem
        ref={ref}
        value={value}
        Icon={<SwordsIcon variant="solid" size="sm" />}
        label="Guilds"
        active={active}
        size={size}
        onClick={onClick}
      />
    );
  }
  return (
    <ArcadeTab
      ref={ref}
      value={value}
      Icon={<SwordsIcon variant="solid" size="sm" />}
      label="Guilds"
      active={active}
      size={size}
      onClick={onClick}
    />
  );
});

const ActivityNavButton = React.forwardRef<
  HTMLButtonElement,
  {
    value: string;
    active: boolean;
    size: "default" | null | undefined;
    onClick?: () => void;
    item?: boolean;
  }
>(({ value, active, size, onClick, item }, ref) => {
  if (item) {
    return (
      <ArcadeMenuItem
        ref={ref}
        value={value}
        Icon={<PulseIcon variant="solid" size="sm" />}
        label="Activity"
        active={active}
        size={size}
        onClick={onClick}
      />
    );
  }
  return (
    <ArcadeTab
      ref={ref}
      value={value}
      Icon={<PulseIcon variant="solid" size="sm" />}
      label="Activity"
      active={active}
      size={size}
      onClick={onClick}
    />
  );
});

const MetricsNavButton = React.forwardRef<
  HTMLButtonElement,
  {
    value: string;
    active: boolean;
    size: "default" | null | undefined;
    onClick?: () => void;
    item?: boolean;
  }
>(({ value, active, size, onClick, item }, ref) => {
  if (item) {
    return (
      <ArcadeMenuItem
        ref={ref}
        value={value}
        Icon={<MetricsIcon variant="solid" size="sm" />}
        label="Metrics"
        active={active}
        size={size}
        onClick={onClick}
      />
    );
  }
  return (
    <ArcadeTab
      ref={ref}
      value={value}
      Icon={<MetricsIcon variant="solid" size="sm" />}
      label="Metrics"
      active={active}
      size={size}
      onClick={onClick}
    />
  );
});

const AboutNavButton = React.forwardRef<
  HTMLButtonElement,
  {
    value: string;
    active: boolean;
    size: "default" | null | undefined;
    onClick?: () => void;
    item?: boolean;
  }
>(({ value, active, size, onClick, item }, ref) => {
  if (item) {
    return (
      <ArcadeMenuItem
        ref={ref}
        value={value}
        Icon={<ListIcon variant="solid" size="sm" />}
        label="About"
        active={active}
        size={size}
        onClick={onClick}
      />
    );
  }
  return (
    <ArcadeTab
      ref={ref}
      value={value}
      Icon={<ListIcon variant="solid" size="sm" />}
      label="About"
      active={active}
      size={size}
      onClick={onClick}
    />
  );
});

const MarketplaceNavButton = React.forwardRef<
  HTMLButtonElement,
  {
    value: string;
    active: boolean;
    size: "default" | null | undefined;
    onClick?: () => void;
    item?: boolean;
  }
>(({ value, active, size, onClick, item }, ref) => {
  if (item) {
    return (
      <ArcadeMenuItem
        ref={ref}
        value={value}
        Icon={<ShoppingCartIcon variant="solid" size="sm" />}
        label="Marketplace"
        active={active}
        size={size}
        onClick={onClick}
      />
    );
  }
  return (
    <ArcadeTab
      ref={ref}
      value={value}
      Icon={<ShoppingCartIcon variant="solid" size="sm" />}
      label="Marketplace"
      active={active}
      size={size}
      onClick={onClick}
    />
  );
});
