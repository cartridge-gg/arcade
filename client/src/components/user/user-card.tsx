import { useAccountByAddress } from "@/collections";
import { usePlayerStats } from "@/hooks/achievements";
import { useProject } from "@/hooks/project";
import { useArcade } from "@/hooks/arcade";
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
import { Link, useRouterState } from "@tanstack/react-router";
import React, { useCallback, useMemo } from "react";
import { UserAvatar } from "./avatar";
import { getChecksumAddress } from "starknet";
import { ShareIcon } from "lucide-react";

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

  const isShareAvailable = useMemo(() => {
    return typeof navigator !== "undefined" && !!navigator.share;
  }, []);

  const handleShare = useCallback(async () => {
    const profileUrl = `${window.location.origin}${target}`;
    const shareData = {
      title: username?.username ?? "Player Profile",
      text: `Check out ${username?.username} with ${totalEarnings} points`,
      url: profileUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        // trackEvent(events.PROFILE_SHARED, {
        //   profile_address: address,
        //   profile_username: username?.username,
        //   method: "native",
        // });
      } else {
        await navigator.clipboard.writeText(profileUrl);
        // trackEvent(events.PROFILE_SHARED, {
        //   profile_address: address,
        //   profile_username: username?.username,
        //   method: "clipboard",
        // });
      }
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        console.error("Share failed:", error);
      }
    }
  }, [username, target, totalEarnings]);

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
        isPlayer
          ? "lg:border-primary-100 lg:hover:border-primary-100"
          : "lg:border-background-150 lg:hover:border-background-200",
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
              <p className="text-foreground-100 text-lg/6 font-semibold">
                {username?.username}
              </p>
            </div>
            <div className="flex items-center gap-1 p-3">
              <div className="flex items-center gap-0.5">
                <SparklesIcon variant="solid" size="xs" />
                <p className="text-[14px] text-foreground-100">
                  {totalEarnings}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-row justify-between items-center">
            <div className="flex items-center text-xs font-normal text-foreground-300 gap-1 rounded-sm bg-background-150 p-1 shrink-0">
              <CopyAddress size="xs" className="text-sm" address={address} />
            </div>
            <div className="flex-1 flex items-center justify-end gap-1">
              <Button variant="tertiary" size="thumbnail" className="hidden">
                <XIcon />
              </Button>
              <Button variant="tertiary" size="thumbnail" className="hidden">
                <DiscordIcon />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="tertiary" size="icon">
                    <DotsIcon />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {isShareAvailable && (
                    <DropdownMenuItem onClick={handleShare}>
                      <ShareIcon className="h-6 w-6" /> Share via
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleCopyAddress}>
                    <CopyIcon />
                    Copy profile address
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
        {isPlayer && (
          <Link
            className="absolute w-5 h-5 cursor-pointer group -top-5 -right-5 rounded-full bg-background-150 border border-primary-100 p-4 center hidden lg:flex"
            to={navManager.getParentContextHref()}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[15px] h-0.5 bg-current rotate-45 group-hover:bg-foreground-100 transition-colors" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[15px] h-0.5 bg-current -rotate-45 group-hover:bg-foreground-100 transition-colors" />
          </Link>
        )}
      </div>
    </div>
  );
};

UserCard.displayName = "UserCard";
