import {
  ClockIcon,
  cn,
  CoinsIcon,
  type StateIconProps,
  TrophyIcon,
} from "@cartridge/ui";
import { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";

export function Navigation() {
  return (
    <div className="flex overflow-hidden shrink-0 gap-x-4">
      <Item Icon={CoinsIcon} variant="inventory" title="Assets" />
      <Item Icon={TrophyIcon} variant="achievements" title="Achievements" />
      <Item Icon={ClockIcon} variant="activity" title="Activity" disabled />
    </div>
  );
}

function Item({
  Icon,
  title,
  variant,
  disabled = false,
}: {
  Icon: React.ComponentType<StateIconProps>;
  title: string;
  variant: string;
  disabled?: boolean;
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
        disabled && "opacity-50 cursor-not-allowed",
      )}
      to={disabled ? "#" : `/${variant}`}
    >
      <Icon size="sm" variant={isActive ? "solid" : "line"} />
      <span>{title}</span>
    </Link>
  );
}
