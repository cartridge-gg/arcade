import {
  ClockIcon,
  cn,
  CoinsIcon,
  StateIconProps,
  TrophyIcon,
} from "@cartridge/ui-next";
import { useMemo } from "react";
import { Link, useLocation, useMatch } from "react-router-dom";

export function Navigation() {
  return (
    <div className="flex overflow-hidden shrink-0 gap-x-4">
      <Item Icon={CoinsIcon} variant="inventory" title="Inventory" />
      <Item Icon={TrophyIcon} variant="achievements" title="Achievements" />
      <Item Icon={ClockIcon} variant="activity" title="Activity" />
    </div>
  );
}

function Item({
  Icon,
  title,
  variant,
}: {
  Icon: React.ComponentType<StateIconProps>;
  title: string;
  variant: string;
}) {
  const { pathname } = useLocation();

  const isActive = useMemo(() => {
    if (pathname.split("/").includes(variant)) return true;
    return variant === "inventory" && pathname === "/";
  }, [pathname, variant]);

  return (
    <Link
      className={cn(
        "flex gap-2 px-4 py-3 h-11 justify-center items-center cursor-pointer hover:opacity-[0.8] rounded border border-secondary",
        isActive ? "bg-secondary" : "bg-background",
      )}
      to={`/${variant}`}
    >
      <Icon size="sm" variant={isActive ? "solid" : "line"} />
      <span>{title}</span>
    </Link>
  );
}
