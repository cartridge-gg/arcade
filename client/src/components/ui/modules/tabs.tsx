import {
  BottomTab,
  ChestIcon,
  cn,
  LayoutBottomTabs,
  LeaderboardIcon,
  ListIcon,
  MetricsIcon,
  PulseIcon,
  ScrollIcon,
  Select,
  SelectContent,
  ShoppingCartIcon,
  SwordsIcon,
  Tabs,
  TabsList,
  TabsTrigger,
  TrophyIcon,
  UsersIcon,
  LightbulbIcon,
} from "@cartridge/ui";
import ArcadeMenuButton from "@/components/ui/modules/menu-button";
import ArcadeMenuItem from "@/components/ui/modules/menu-item";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import ArcadeTab from "./tab";
import { useDevice } from "@/hooks/device";
import type { TabValue } from "@/hooks/project";

const arcadeTabsVariants = cva(
  "flex justify-start items-end w-full p-0 px-4 border-b rounded-none",
  {
    variants: {
      variant: {
        default: "bg-background-100 border-background-200",
        light: "bg-background-125 border-background-200",
      },
      size: {
        default: "gap-3 h-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ArcadeTabsProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof arcadeTabsVariants> {
  defaultValue?: TabValue;
  order?: TabValue[];
  onTabClick?: (tab: TabValue) => void;
}

export const ArcadeTabs = ({
  defaultValue = "activity",
  order = [
    "activity",
    "leaderboard",
    "about",
    "metrics",
    "marketplace",
    "inventory",
    "achievements",
    "positions",
    "guilds",
    "items",
    "holders",
  ],
  onTabClick,
  variant,
  size,
  className,
  children,
}: ArcadeTabsProps) => {
  const [active, setActive] = useState<TabValue>(defaultValue);
  const [visibleTabs, setVisibleTabs] = useState<TabValue[]>(order);
  const [overflowTabs, setOverflowTabs] = useState<TabValue[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const hiddenRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef(
    new Map<TabValue, { width: number; visible: boolean }>(),
  );

  const { isMobile, isPWA } = useDevice();

  useEffect(() => {
    if (isMobile) return;
    if (!hiddenRef.current) return;
    const tabWidths = new Map<TabValue, { width: number; visible: boolean }>();
    hiddenRef.current.childNodes.forEach((node) => {
      const element = node as HTMLDivElement;
      const tab = element.textContent?.toLowerCase();
      if (tab) {
        const visible = order.includes(tab as TabValue);
        tabWidths.set(tab as TabValue, { width: element.offsetWidth, visible });
      }
    });
    tabRefs.current = tabWidths;
  }, [tabRefs, hiddenRef, order, isMobile]);

  useEffect(() => {
    if (isMobile) return;
    const observer = new ResizeObserver(() => {
      if (!containerRef.current) return;
      const gap = 12;
      const buttonWidth = 32;
      const availableWidth =
        containerRef.current.offsetWidth - buttonWidth - gap;
      let usedWidth = 32;
      const newVisibleTabs: TabValue[] = [];
      const newOverflowTabs: TabValue[] = [];

      order.forEach((tab) => {
        const { width, visible } = tabRefs.current.get(tab) || {
          width: 0,
          visible: false,
        };
        if (!visible) return;
        if (
          usedWidth + width <= availableWidth &&
          newOverflowTabs.length === 0
        ) {
          newVisibleTabs.push(tab);
          usedWidth += width + gap;
        } else {
          newOverflowTabs.push(tab);
        }
      });

      if (visibleTabs.join(",") !== newVisibleTabs.join(",")) {
        setVisibleTabs(newVisibleTabs);
      }
      if (overflowTabs.join(",") !== newOverflowTabs.join(",")) {
        setOverflowTabs(newOverflowTabs);
      }
    });

    observer.observe(containerRef.current!);
    return () => observer.disconnect();
  }, [
    order,
    containerRef.current,
    visibleTabs,
    overflowTabs,
    tabRefs,
    isMobile,
  ]);

  useEffect(() => {
    if (order.includes(active)) return;
    setActive(defaultValue);
  }, [order, active, defaultValue]);

  const overflowActive = useMemo(
    () => overflowTabs.includes(active),
    [overflowTabs, active],
  );

  return (
    <Tabs
      defaultValue={defaultValue}
      value={active}
      onValueChange={(value: string) => setActive(value as TabValue)}
      className="h-full flex flex-col overflow-hidden"
    >
      {isMobile ? (
        <LayoutBottomTabs
          className={cn(
            "fixed bottom-0 left-0 right-0 z-50 w-full",
            isPWA ? "h-[78px]" : "h-[72px]",
          )}
        >
          <TabsList className="h-full w-full p-0 flex gap-2 items-start justify-around">
            {order.map((tab) => (
              <Tab
                key={tab}
                tab={tab}
                value={active}
                size={size}
                onTabClick={() => onTabClick?.(tab as TabValue)}
                isMobile={true}
              />
            ))}
          </TabsList>
        </LayoutBottomTabs>
      ) : (
        <TabsList
          ref={containerRef}
          className={cn(
            arcadeTabsVariants({ variant, size }),
            "hidden lg:flex",
            className,
          )}
        >
          <div ref={hiddenRef} className="flex gap-2 absolute invisible">
            {order.map((tab) => (
              <Tab key={tab} tab={tab} value={active} size={size} />
            ))}
          </div>
          {visibleTabs.map((tab) => (
            <Tab
              key={tab}
              tab={tab}
              value={active}
              size={size}
              onTabClick={() => onTabClick?.(tab as TabValue)}
            />
          ))}
          <Select>
            <div className="grow flex justify-end items-center self-center">
              <ArcadeMenuButton
                active={overflowActive}
                className={cn(overflowTabs.length === 0 && "hidden")}
              />
            </div>
            <SelectContent className="bg-background-100">
              {overflowTabs.map((tab) => (
                <Tab
                  key={tab}
                  tab={tab}
                  value={active}
                  size={size}
                  onTabClick={() => onTabClick?.(tab as TabValue)}
                  item={true}
                />
              ))}
            </SelectContent>
          </Select>
        </TabsList>
      )}
      {children}
    </Tabs>
  );
};

const Tab = ({
  tab,
  value,
  size,
  onTabClick,
  item,
  isMobile = false,
}: {
  tab: TabValue;
  value: string;
  size: "default" | null | undefined;
  onTabClick?: () => void;
  item?: boolean;
  isMobile?: boolean;
}) => {
  const props = {
    value: tab,
    active: value === tab,
    size,
    onClick: onTabClick,
    item,
    isMobile,
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
    case "items":
      return <ItemsNavButton key={tab} {...props} />;
    case "holders":
      return <HoldersNavButton key={tab} {...props} />;
    case "predict":
      return <PredictNavButton key={tab} {...props} />;
    case "positions":
      return <PositionsNavButton {...props} />;
    default:
      return null;
  }
};

interface NavButtonProps {
  value: string;
  active: boolean;
  size: "default" | null | undefined;
  onClick?: () => void;
  item?: boolean;
  isMobile?: boolean;
}

const InventoryNavButton = React.forwardRef<HTMLButtonElement, NavButtonProps>(
  ({ value, active, size, onClick, item, isMobile }, ref) => {
    if (isMobile) {
      return (
        <TabsTrigger
          className="p-0 grow data-[state=active]:bg-background-transparent data-[state=active]:shadow-none"
          value={value}
          ref={ref}
        >
          <BottomTab status={active ? "active" : null} onClick={onClick}>
            <ChestIcon variant="solid" size="lg" />
          </BottomTab>
        </TabsTrigger>
      );
    }

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
  },
);

const AchievementsNavButton = React.forwardRef<
  HTMLButtonElement,
  NavButtonProps
>(({ value, active, size, onClick, item, isMobile }, ref) => {
  if (isMobile) {
    return (
      <TabsTrigger
        className="p-0 grow data-[state=active]:bg-background-transparent data-[state=active]:shadow-none"
        value={value}
        ref={ref}
      >
        <BottomTab status={active ? "active" : null} onClick={onClick}>
          <TrophyIcon variant="solid" size="lg" />
        </BottomTab>
      </TabsTrigger>
    );
  }

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
  NavButtonProps
>(({ value, active, size, onClick, item, isMobile }, ref) => {
  if (isMobile) {
    return (
      <TabsTrigger
        className="p-0 grow data-[state=active]:bg-background-transparent data-[state=active]:shadow-none"
        value={value}
        ref={ref}
      >
        <BottomTab status={active ? "active" : null} onClick={onClick}>
          <LeaderboardIcon variant="solid" size="lg" />
        </BottomTab>
      </TabsTrigger>
    );
  }

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

const GuildsNavButton = React.forwardRef<HTMLButtonElement, NavButtonProps>(
  ({ value, active, size, onClick, item, isMobile }, ref) => {
    if (isMobile) {
      return (
        <TabsTrigger
          className="p-0 grow data-[state=active]:bg-background-transparent data-[state=active]:shadow-none"
          value={value}
          ref={ref}
        >
          <BottomTab status={active ? "active" : null} onClick={onClick}>
            <SwordsIcon variant="solid" size="lg" />
          </BottomTab>
        </TabsTrigger>
      );
    }

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
  },
);

const ActivityNavButton = React.forwardRef<HTMLButtonElement, NavButtonProps>(
  ({ value, active, size, onClick, item, isMobile }, ref) => {
    if (isMobile) {
      return (
        <TabsTrigger
          className="p-0 grow data-[state=active]:bg-background-transparent data-[state=active]:shadow-none"
          value={value}
          ref={ref}
        >
          <BottomTab status={active ? "active" : null} onClick={onClick}>
            <PulseIcon variant="solid" size="lg" />
          </BottomTab>
        </TabsTrigger>
      );
    }

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
  },
);

const MetricsNavButton = React.forwardRef<HTMLButtonElement, NavButtonProps>(
  ({ value, active, size, onClick, item, isMobile }, ref) => {
    if (isMobile) {
      return (
        <TabsTrigger
          className="p-0 grow data-[state=active]:bg-background-transparent data-[state=active]:shadow-none"
          value={value}
          ref={ref}
        >
          <BottomTab status={active ? "active" : null} onClick={onClick}>
            <MetricsIcon variant="solid" size="lg" />
          </BottomTab>
        </TabsTrigger>
      );
    }

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
  },
);

const AboutNavButton = React.forwardRef<HTMLButtonElement, NavButtonProps>(
  ({ value, active, size, onClick, item, isMobile }, ref) => {
    if (isMobile) {
      return (
        <TabsTrigger
          className="p-0 grow data-[state=active]:bg-background-transparent data-[state=active]:shadow-none"
          value={value}
          ref={ref}
        >
          <BottomTab status={active ? "active" : null} onClick={onClick}>
            <ListIcon variant="solid" size="lg" />
          </BottomTab>
        </TabsTrigger>
      );
    }

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
  },
);

const MarketplaceNavButton = React.forwardRef<
  HTMLButtonElement,
  NavButtonProps
>(({ value, active, size, onClick, item, isMobile }, ref) => {
  if (isMobile) {
    return (
      <TabsTrigger
        className="p-0 grow data-[state=active]:bg-background-transparent data-[state=active]:shadow-none"
        value={value}
        ref={ref}
      >
        <BottomTab status={active ? "active" : null} onClick={onClick}>
          <ShoppingCartIcon variant="solid" size="lg" />
        </BottomTab>
      </TabsTrigger>
    );
  }

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

const ItemsNavButton = React.forwardRef<HTMLButtonElement, NavButtonProps>(
  ({ value, active, size, onClick, item, isMobile }, ref) => {
    if (isMobile) {
      return (
        <TabsTrigger
          className="p-0 grow data-[state=active]:bg-background-transparent data-[state=active]:shadow-none"
          value={value}
          ref={ref}
        >
          <BottomTab status={active ? "active" : null} onClick={onClick}>
            <ScrollIcon variant="solid" size="lg" />
          </BottomTab>
        </TabsTrigger>
      );
    }

    if (item) {
      return (
        <ArcadeMenuItem
          ref={ref}
          value={value}
          Icon={<ScrollIcon variant="solid" size="sm" />}
          label="Items"
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
        Icon={<ScrollIcon variant="solid" size="sm" />}
        label="Items"
        active={active}
        size={size}
        onClick={onClick}
      />
    );
  },
);

const HoldersNavButton = React.forwardRef<HTMLButtonElement, NavButtonProps>(
  ({ value, active, size, onClick, item, isMobile }, ref) => {
    if (isMobile) {
      return (
        <TabsTrigger
          className="p-0 grow data-[state=active]:bg-background-transparent data-[state=active]:shadow-none"
          value={value}
          ref={ref}
        >
          <BottomTab status={active ? "active" : null} onClick={onClick}>
            <UsersIcon variant="solid" size="lg" />
          </BottomTab>
        </TabsTrigger>
      );
    }

    if (item) {
      return (
        <ArcadeMenuItem
          ref={ref}
          value={value}
          Icon={<UsersIcon variant="solid" size="sm" />}
          label="Holders"
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
        Icon={<UsersIcon variant="solid" size="sm" />}
        label="Holders"
        active={active}
        size={size}
        onClick={onClick}
      />
    );
  },
);

const PredictNavButton = React.forwardRef<HTMLButtonElement, NavButtonProps>(
  ({ value, active, size, onClick, item, isMobile }, ref) => {
    if (isMobile) {
      return (
        <TabsTrigger
          className="p-0 grow data-[state=active]:bg-background-transparent data-[state=active]:shadow-none"
          value={value}
          ref={ref}
        >
          <BottomTab status={active ? "active" : null} onClick={onClick}>
            <LightbulbIcon variant="solid" size="lg" />
          </BottomTab>
        </TabsTrigger>
      );
    }

    if (item) {
      return (
        <ArcadeMenuItem
          ref={ref}
          value={value}
          Icon={<LightbulbIcon variant="solid" size="sm" />}
          label="Predict"
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
        Icon={<LightbulbIcon variant="solid" size="sm" />}
        label="Predict"
        active={active}
        size={size}
        onClick={onClick}
      />
    );
  },
);

const PositionsNavButton = React.forwardRef<HTMLButtonElement, NavButtonProps>(
  ({ value, active, size, onClick, item, isMobile }, ref) => {
    if (isMobile) {
      return (
        <TabsTrigger
          className="p-0 grow data-[state=active]:bg-background-transparent data-[state=active]:shadow-none"
          value={value}
          ref={ref}
        >
          <BottomTab status={active ? "active" : null} onClick={onClick}>
            <LightbulbIcon variant="solid" size="lg" />
          </BottomTab>
        </TabsTrigger>
      );
    }

    if (item) {
      return (
        <ArcadeMenuItem
          ref={ref}
          value={value}
          Icon={<LightbulbIcon variant="solid" size="sm" />}
          label="Positions"
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
        Icon={<LightbulbIcon variant="solid" size="sm" />}
        label="Positions"
        active={active}
        size={size}
        onClick={onClick}
      />
    );
  },
);

export default ArcadeTabs;
