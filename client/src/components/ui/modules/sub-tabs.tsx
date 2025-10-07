import { Tabs, TabsList, UsersIcon } from "@cartridge/ui";
import { cn } from "@cartridge/ui/utils";
import React, { useState } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import ArcadeSubTab from "./sub-tab";
import { UserCheck } from "lucide-react";
import { useAnalytics } from "@/hooks/useAnalytics";

const arcadeSubTabsVariants = cva(
  "flex justify-between items-end w-full p-0 rounded-none w-full",
  {
    variants: {
      variant: {
        default: "bg-background-100 border-background-200",
        light: "bg-background-125 border-background-200",
      },
      size: {
        default: "gap-4 h-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export type SubTabValue = "all" | "following";

export interface ArcadeSubTabsProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof arcadeSubTabsVariants> {
  defaultValue?: SubTabValue;
  tabs?: SubTabValue[];
  onTabClick?: (tab: SubTabValue) => void;
}

export const ArcadeSubTabs = ({
  defaultValue = "all",
  tabs = ["all", "following"],
  onTabClick,
  variant,
  size,
  className,
  children,
}: ArcadeSubTabsProps) => {
  const [active, setActive] = useState<SubTabValue>(defaultValue);
  const { trackEvent, events } = useAnalytics();

  const handleTabChange = (value: string) => {
    const newTab = value as SubTabValue;
    if (newTab !== active) {
      trackEvent(events.DISCOVERY_TAB_SWITCHED, {
        from_tab: active,
        to_tab: newTab,
        discovery_tab: newTab,
      });
    }
    setActive(newTab);
  };

  return (
    <Tabs
      defaultValue={defaultValue}
      onValueChange={handleTabChange}
      className="h-full flex flex-col overflow-hidden"
    >
      <TabsList
        className={cn(arcadeSubTabsVariants({ variant, size }), className)}
      >
        {tabs.map((tab) => (
          <Tab
            key={tab}
            tab={tab}
            value={active}
            size={size}
            onTabClick={() => onTabClick?.(tab as SubTabValue)}
          />
        ))}
      </TabsList>
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
}: {
  tab: SubTabValue;
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
    case "all":
      return <AllNavButton key={tab} {...props} />;
    case "following":
      return <FollowingNavButton key={tab} {...props} />;
    default:
      return null;
  }
};

const AllNavButton = React.forwardRef<
  HTMLButtonElement,
  {
    value: string;
    active: boolean;
    size: "default" | null | undefined;
    onClick?: () => void;
  }
>(({ value, active, size, onClick }, ref) => {
  return (
    <ArcadeSubTab
      ref={ref}
      value={value}
      Icon={<UsersIcon variant="solid" size="sm" />}
      label="All Players"
      active={active}
      size={size}
      onClick={onClick}
    />
  );
});

const FollowingNavButton = React.forwardRef<
  HTMLButtonElement,
  {
    value: string;
    active: boolean;
    size: "default" | null | undefined;
    onClick?: () => void;
  }
>(({ value, active, size, onClick }, ref) => {
  return (
    <ArcadeSubTab
      ref={ref}
      value={value}
      Icon={<UserCheck className="h-5 w-5 p-0.5" />}
      label="Following"
      active={active}
      size={size}
      onClick={onClick}
    />
  );
});

export default ArcadeSubTabs;
