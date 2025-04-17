import {
  BottomTab,
  ChestIcon,
  cn,
  LayoutBottomTabs,
  LeaderboardIcon,
  ListIcon,
  MetricsIcon,
  PulseIcon,
  ShoppingCartIcon,
  SwordsIcon,
  TrophyIcon,
} from "@cartridge/ui-next";
import { useNavigate, useSearchParams } from "react-router-dom";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { GameModel } from "@bal7hazar/arcade-sdk";
import { useSidebar } from "@/hooks/sidebar";
import { TabValue } from "./tabs";

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
    <LayoutBottomTabs className={cn("lg:hidden fixed bottom-0 left-0 z-50",
      "transition-all duration-300 ease-in-out",
      isOpen
        ? "translate-x-[min(calc(100vw-64px),360px)] lg:translate-x-0"
        : "lg:translate-x-0 translate-x-0",
    )}>
      <div className="w-full flex justify-around items-stretch shrink-0 bg-background-200 border-spacer-100 h-[72px] gap-x-2 px-0 py-0 border-t-0 shadow-none">
        {order.map((tab) => (
          <Tab
            key={tab}
            tab={tab}
            value={active}
            onTabClick={() => {
              setActive(tab);
              handleClick(tab);
            }}
          />
        ))}
      </div>
    </LayoutBottomTabs>
  );
};

const Tab = ({
  tab,
  value,
  onTabClick,
}: {
  tab: TabValue;
  value: string;
  onTabClick?: () => void;
}) => {
  const props = {
    value: tab,
    active: value === tab ? "active" as const : null,
    onClick: onTabClick,
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

interface NavButtonProps {
  value: string;
  active: "active" | null | undefined;
  onClick?: () => void;
}

const InventoryNavButton = React.forwardRef<
  HTMLDivElement,
  NavButtonProps
>(({ active, onClick }) => {
  return (
    <BottomTab status={active} onClick={onClick}>
      <ChestIcon
        size="lg"
        variant="solid"
      />
    </BottomTab>
  );
});

const AchievementsNavButton = React.forwardRef<
  HTMLDivElement,
  NavButtonProps
>(({ active, onClick }) => {
  return (
    <BottomTab status={active} onClick={onClick}>
      <TrophyIcon
        size="lg"
        variant="solid"
      />
    </BottomTab>
  );
});

const LeaderboardNavButton = React.forwardRef<
  HTMLDivElement,
  NavButtonProps
>(({ active, onClick }) => {
  return (
    <BottomTab status={active} onClick={onClick}>
      <LeaderboardIcon
        size="lg"
        variant="solid"
      />
    </BottomTab>
  );
});

const GuildsNavButton = React.forwardRef<
  HTMLDivElement,
  NavButtonProps
>(({ active, onClick }) => {
  return (
    <BottomTab status={active} onClick={onClick}>
      <SwordsIcon
        size="lg"
        variant="solid"
      />
    </BottomTab>
  );
});

const ActivityNavButton = React.forwardRef<
  HTMLDivElement,
  NavButtonProps
>(({ active, onClick }) => {
  return (
    <BottomTab status={active} onClick={onClick}>
      <PulseIcon
        size="lg"
        variant="solid"
      />
    </BottomTab>
  );
});

const MetricsNavButton = React.forwardRef<
  HTMLDivElement,
  NavButtonProps
>(({ active, onClick }) => {
  return (
    <BottomTab status={active} onClick={onClick}>
      <MetricsIcon
        size="lg"
        variant="solid"
      />
    </BottomTab>
  );
});

const AboutNavButton = React.forwardRef<
  HTMLDivElement,
  NavButtonProps
>(({ active, onClick }) => {
  return (
    <BottomTab status={active} onClick={onClick}>
      <ListIcon
        size="lg"
        variant="solid"
      />
    </BottomTab>
  );
});

const MarketplaceNavButton = React.forwardRef<
  HTMLDivElement,
  NavButtonProps
>(({ active, onClick }) => {
  return (
    <BottomTab status={active} onClick={onClick}>
      <ShoppingCartIcon
        size="lg"
        variant="solid"
      />
    </BottomTab>
  );
});
