import { cn } from "@/lib/utils";
import React, { useCallback, useMemo } from "react";
import { UserAvatar } from "./avatar";
import { AchievementPlayerBadge, SparklesIcon } from "@cartridge/ui";
import { usePlayerStats } from "@/hooks/achievements";
import { joinPaths } from "@/helpers";
import { Link, useRouterState } from "@tanstack/react-router";
import { useSidebar } from "@/hooks/sidebar";
import { useAccount } from "@starknet-react/core";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useAccountByAddress } from "@/collections";

export const UserCard = React.forwardRef<
  HTMLAnchorElement,
  React.HTMLAttributes<HTMLAnchorElement>
>((props, ref) => {
  const { account } = useAccount();

  if (!account) return null;

  return <UserCardInner ref={ref} {...props} address={account.address} />;
});

const UserCardInner = (
  props: React.ComponentPropsWithRef<typeof UserCard> & { address: string },
) => {
  const { className, address, ref, ...rest } = props;

  const { data: username } = useAccountByAddress(address);
  const { location } = useRouterState();
  const { close } = useSidebar();
  const { trackEvent, events } = useAnalytics();

  const Icon = useMemo(() => {
    return (
      <UserAvatar
        username={username?.username ?? ""}
        className="h-full w-full"
      />
    );
  }, [username]);

  const { earnings: totalEarnings } = usePlayerStats(address);

  const target = useMemo(() => {
    if (!username && !address) return "/";
    let pathname = location.pathname;
    const playerName = `${!username?.username ? address?.toLowerCase() : username.username.toLowerCase()}`;
    pathname = pathname.replace(/\/collection\/[^/]+/, "");
    pathname = pathname.replace(/\/player\/[^/]+/, "");
    pathname = pathname.replace(/\/tab\/[^/]+/, "");
    pathname = pathname.replace(/\/edition\/[^/]+/, "");
    pathname = joinPaths(pathname, `/player/${playerName}`);
    return pathname;
  }, [username, address, location.pathname]);

  const handleClick = useCallback(() => {
    trackEvent(events.AUTH_USER_CARD_CLICKED, {
      profile_address: address,
      profile_username: username?.username,
      from_page: location.pathname,
      total_points: totalEarnings,
    });
    close();
  }, [
    address,
    username,
    location.pathname,
    close,
    trackEvent,
    events,
    totalEarnings,
  ]);

  if (!username && !address) {
    return null;
  }

  return (
    <Link
      to={target}
      onClick={handleClick}
      ref={ref}
      className={cn(
        "flex flex-col items-start p-4 gap-2 self-stretch w-full bg-background-100 lg:hover:bg-background-150 border-b border-spacer-100 lg:border lg:border-background-200 lg:hover:border-background-300 lg:rounded-xl",
        className,
      )}
      {...rest}
    >
      <div
        id="player-label"
        className="flex items-center justify-between self-stretch"
      >
        <div className="flex items-center gap-3">
          <AchievementPlayerBadge
            icon={Icon}
            variant="default"
            className="!w-10 !h-10"
          />
          <p className="text-foreground-100 text-lg/6 font-semibold">
            {username?.username}
          </p>
        </div>
        <div className="flex items-center gap-1 p-3">
          <div className="flex items-center gap-0.5">
            <SparklesIcon variant="solid" size="xs" />
            <p className="text-xs font-medium text-foreground-100">
              {totalEarnings}
            </p>
          </div>
          <p className="text-xs font-normal text-foreground-200">Points</p>
        </div>
      </div>
    </Link>
  );
};

UserCard.displayName = "UserCard";
