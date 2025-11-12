import { useAccountByAddress } from "@/collections";
import { usePlayerStats } from "@/hooks/achievements";
import { useProject } from "@/hooks/project";
import { useArcade } from "@/hooks/arcade";
import { useShare } from "@/hooks/useShare";
import { AnalyticsEvents } from "@/hooks/useAnalytics";
import { cn } from "@/lib/utils";
import { NavigationContextManager } from "@/features/navigation/NavigationContextManager";
import {
  AchievementPlayerBadge,
  Button,
  CopyAddress,
  DiscordIcon,
  DotsIcon,
  SparklesIcon,
  XIcon,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuContent,
  CopyIcon,
} from "@cartridge/ui";
import { useAccount } from "@starknet-react/core";
import { useRouterState } from "@tanstack/react-router";
import React, { useCallback, useMemo } from "react";
import { UserAvatar } from "./avatar";
import { getChecksumAddress } from "starknet";
import { ShareIcon } from "lucide-react";
import { ContextCloser } from "../ui/modules/context-closer";

export const UserCard = React.forwardRef<
  HTMLAnchorElement,
  React.HTMLAttributes<HTMLAnchorElement>
>((props, ref) => {
  const { account } = useAccount();
  const { player } = useProject();

  const isPlayer = useMemo(
    () =>
      getChecksumAddress(account?.address ?? "0x0") !==
      getChecksumAddress(player ?? "0x0"),
    [account?.address, player],
  );

  if (!account && !player) return null;

  return (
    <UserCardInner
      ref={ref}
      {...props}
      address={isPlayer ? (player ?? "0x0") : (account?.address ?? "0x0")}
      isPlayer={isPlayer}
    />
  );
});

const UserCardInner = (
  props: React.ComponentPropsWithRef<typeof UserCard> & {
    address: string;
    isPlayer: boolean;
  },
) => {
  const { className, address, isPlayer } = props;

  const { data: username } = useAccountByAddress(address);
  const { location } = useRouterState();
  const { games, editions } = useArcade();
  const { isConnected } = useAccount();

  const Icon = useMemo(() => {
    return (
      <UserAvatar
        username={username?.username ?? ""}
        className="h-full w-full"
      />
    );
  }, [username]);

  const { earnings: totalEarnings } = usePlayerStats(address);

  const navManager = useMemo(
    () =>
      new NavigationContextManager({
        pathname: location.pathname,
        games,
        editions,
        isLoggedIn: Boolean(isConnected),
      }),
    [location.pathname, games, editions, isConnected],
  );

  const target = useMemo(() => {
    if (!username && !address) return "/";
    const playerName = !username?.username
      ? address.toLowerCase()
      : username.username.toLowerCase();
    return navManager.generatePlayerHref(playerName);
  }, [username, address, navManager]);

  const { handleShare, isShareAvailable } = useShare({
    title: username?.username ?? "Player Profile",
    text: `Check out ${username?.username} with ${totalEarnings} points`,
    url: `${window.location.origin}${target}`,
    analyticsEvent: {
      name: AnalyticsEvents.PROFILE_SHARED,
      properties: {
        profile_address: address,
        profile_username: username?.username,
      },
    },
  });

  const handleCopyAddress = useCallback(async () => {
    const profileUrl = `${window.location.origin}/player/${address}`;
    try {
      await navigator.clipboard.writeText(profileUrl);
      // trackEvent(events.PROFILE_ADDRESS_COPIED, {
      //   profile_address: address,
      //   profile_username: username?.username,
      // });
    } catch (error) {
      console.error("Copy failed:", error);
    }
  }, [address]);

  if (!username && !address) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex flex-col items-start py-2 px-3 gap-2 self-stretch w-full bg-background-100 border-b border-spacer-100 lg:border lg:rounded-xl",
        "lg:border-background-200 lg:hover:border-background-200",
        className,
      )}
    >
      <div
        id="player-label"
        className="flex items-center self-stretch gap-3 relative"
      >
        <div className="p-3">
          <AchievementPlayerBadge
            icon={Icon}
            variant="default"
            size="3xl"
            className="!w-10 !h-10"
          />
        </div>
        <div className="flex-1">
          <div className="flex flex-row justify-between">
            <div className="flex items-center gap-3">
              <p className="text-foreground-100 text-[20px] font-semibold">
                {username?.username}
              </p>
            </div>
            <div className="flex items-center gap-1 p-3">
              <div className="flex items-center gap-0.5 bg-translucent-dark-100 rounded-xl">
                <SparklesIcon variant="solid" size="xs" />
                <p className="text-[14px] text-foreground-100">
                  {totalEarnings}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-row justify-between items-center">
            <div className="flex items-center font-sans text-foreground-200 gap-1 rounded-sm bg-background-150 p-1 shrink-0">
              <CopyAddress
                size="xs"
                address={address}
                className="text-sm font-sans px-[6px] gap-[6px] rounded-md"
                first={2}
                last={2}
              />
            </div>
            <div className="flex-1 flex items-center justify-end gap-1">
              <Button
                variant="tertiary"
                size="icon"
                className="px-[6px] py-1 w-auto h-auto hidden"
              >
                <XIcon size={"sm"} />
              </Button>
              <Button
                variant="tertiary"
                size="icon"
                className="px-[6px] py-1 w-auto h-auto hidden"
              >
                <DiscordIcon size={"sm"} />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="tertiary"
                    size="icon"
                    className="px-[6px] py-1 w-auto h-auto"
                  >
                    <DotsIcon size={"sm"} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {isShareAvailable && (
                    <DropdownMenuItem
                      onClick={handleShare}
                      className="text-foreground-300 cursor-pointer"
                    >
                      <ShareIcon className="h-4 w-4 mr-1" size={"sm"} /> Share
                      via
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    onClick={handleCopyAddress}
                    className="text-foreground-300 cursor-pointer"
                  >
                    <CopyIcon className="h-4 w-4 mr-1" size={"sm"} />
                    Copy profile address
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
        {isPlayer && <ContextCloser />}
      </div>
    </div>
  );
};

UserCard.displayName = "UserCard";
