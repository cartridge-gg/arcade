import React, { useCallback, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { useAccountByAddress } from "@/effect";
import { usePlayerStats } from "@/hooks/achievements";
import { useProject } from "@/hooks/project";
import { useShare } from "@/hooks/useShare";
import { AnalyticsEvents } from "@/hooks/useAnalytics";
import { cn } from "@/lib/utils";
import { useNavigationManager } from "@/features/navigation/useNavigationManager";
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
import { UserAvatar } from "./avatar";
import { type AccountInterface, getChecksumAddress } from "starknet";
import { ShareIcon } from "lucide-react";
import { ContextCloser } from "../ui/modules/context-closer";
import { useDevice } from "@/hooks/device";

export const UserCard = React.memo(
  React.forwardRef<
    HTMLAnchorElement,
    React.HTMLAttributes<HTMLAnchorElement> & {
      account?: AccountInterface;
    }
  >((props, ref) => {
    const { account: externalAccount } = props;

    const { account: internalAccount } = useAccount();

    const account = externalAccount ?? internalAccount;

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
  }),
);

const UserCardInner = React.memo(
  (
    props: React.ComponentPropsWithRef<typeof UserCard> & {
      address: string;
      isPlayer: boolean;
    },
  ) => {
    const { className, address, isPlayer } = props;

    const { data: username } = useAccountByAddress(address);
    const { isMobile } = useDevice();

    const usernameStr = username?.username ?? "";

    const Icon = useMemo(() => {
      return (
        <UserAvatar
          username={usernameStr}
          className="h-full w-full"
          size={"sm"}
        />
      );
    }, [usernameStr]);

    const { earnings: totalEarnings } = usePlayerStats(address);

    const navManager = useNavigationManager();

    const target = useMemo(() => {
      if (!usernameStr && !address) return "/";
      const playerName = !usernameStr
        ? address.toLowerCase()
        : usernameStr.toLowerCase();
      return navManager.generatePlayerHref(playerName);
    }, [usernameStr, address, navManager]);

    const shareConfig = useMemo(
      () => ({
        title: usernameStr || "Player Profile",
        text: `Check out ${usernameStr} with ${totalEarnings} points`,
        url: `${window.location.origin}${target}`,
        analyticsEvent: {
          name: AnalyticsEvents.PROFILE_SHARED,
          properties: {
            profile_address: address,
            profile_username: usernameStr,
          },
        },
      }),
      [usernameStr, totalEarnings, target, address],
    );

    const { handleShare, isShareAvailable } = useShare(shareConfig);

    const profileUrl = useMemo(
      () => `${window.location.origin}/player/${address}`,
      [address],
    );

    const handleCopyAddress = useCallback(async () => {
      try {
        await navigator.clipboard.writeText(profileUrl);
      } catch (error) {
        console.error("Copy failed:", error);
      }
    }, [profileUrl]);

    if (!usernameStr && !address) {
      return null;
    }

    return (
      <div
        className={cn(
          "flex flex-col items-start p-3 lg:p-4 gap-2 self-stretch w-full bg-background-100 border-b border-spacer-100 lg:border lg:rounded-xl relative",
          "lg:border-background-200 lg:hover:border-background-200 overflow-hidden",
          className,
        )}
      >
        {isPlayer && (
          <div className="absolute top-5 right-5 z-10">
            <ContextCloser
              context="player"
              className="flex rounded-none rounded-bl rounded-tr-2 bg-background-100 hover:bg-background-200 p-2 w-8 h-8 border-r-0 border-t-0"
            />
          </div>
        )}
        <div
          id="player-label"
          className="flex items-center self-stretch gap-2 relative"
        >
          <div className="-translate-x-1">
            <AchievementPlayerBadge
              icon={Icon}
              variant="default"
              size={isMobile ? "2xl" : "3xl"}
              className="!w-14 !h-14 lg:!w-16 lg:!h-16"
            />
          </div>
          <div className="h-full flex-1 flex flex-col justify-between gap-2 lg:gap-0">
            <div className="flex flex-row justify-between">
              <Link to={profileUrl}>
                <p className="text-foreground-100 text-[16px]/[normal] lg:text-xl/6 font-semibold">
                  {usernameStr}
                </p>
              </Link>
              <div
                className={cn(
                  "flex items-center gap-1 p-0.5",
                  isPlayer && "pr-8",
                )}
              >
                <div className="flex items-center gap-0.5 bg-translucent-dark-100 rounded-xl">
                  <SparklesIcon variant="solid" size="xs" />
                  <p className="text-xs lg:text-sm font-normal text-foreground-100">
                    {totalEarnings}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-row justify-between">
              <div className="flex items-center font-sans text-foreground-200 gap-1 rounded-md bg-background-200 hover:bg-background-300 shrink-0 px-[6px] py-1">
                <CopyAddress
                  size="xs"
                  address={address}
                  className="text-sm font-sans  gap-[6px] rounded-md"
                  first={2}
                  last={2}
                />
              </div>
              <div className="flex-1 flex items-center justify-end gap-2">
                <Button
                  variant="tertiary"
                  size="icon"
                  className="px-1.5 py-1 w-auto h-auto hidden"
                >
                  <XIcon size={"sm"} />
                </Button>
                <Button
                  variant="tertiary"
                  size="icon"
                  className="px-1.5 py-1 w-auto h-auto hidden"
                >
                  <DiscordIcon size={"sm"} />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="tertiary"
                      size="icon"
                      className="px-1.5 py-1 w-auto h-auto"
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
        </div>
      </div>
    );
  },
);

UserCard.displayName = "UserCard";
