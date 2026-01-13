import { InventoryScene } from "../scenes/inventory";
import { AchievementScene } from "../scenes/achievement";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAchievements } from "@/hooks/achievements";
import {
  Button,
  cn,
  TabsContent,
  TimesIcon,
  UserAddIcon,
  UserCheckIcon,
} from "@cartridge/ui";
import type { TabValue } from "@/hooks/project";
import { ActivityScene } from "../scenes/activity";
import { ArcadeTabs } from "../ui/modules/tabs";
import { Link, useRouterState } from "@tanstack/react-router";
import { useAddress } from "@/hooks/address";
import AchievementPlayerHeader from "../ui/modules/player-header";
import { UserAvatar } from "../user/avatar";
import { useAccount } from "@starknet-react/core";
import { useArcade } from "@/hooks/arcade";
import type ControllerConnector from "@cartridge/connector/controller";
import { getChecksumAddress } from "starknet";
import { toast } from "sonner";
import { useProject } from "@/hooks/project";
import { joinPaths } from "@/lib/helpers";
import { PositionsScene } from "../scenes/positions";
import { useAccountByAddress, useAccountsByAddresses } from "@/effect";

export function PlayerPage() {
  const { address, isSelf, self } = useAddress();
  const { usernames, globals, players } = useAchievements();
  const [loading, setLoading] = useState(false);
  const { account, connector, isConnected } = useAccount();
  const { provider, follows } = useArcade();
  const { edition, tab } = useProject();

  const order: TabValue[] = useMemo(() => {
    const order = [
      "inventory",
      "achievements",
      "activity",
      "positions",
    ] as TabValue[];

    if (process.env.NODE_ENV !== "development") {
      // Remove predict tab in production for now
      const predictIndex = order.indexOf("positions");
      order.splice(predictIndex, 1);
    }

    return order;
  }, []);

  const defaultValue = useMemo(() => {
    if (!order.includes(tab as TabValue)) return "inventory";
    return tab;
  }, [tab, order]);

  const { location } = useRouterState();
  const handleClick = useCallback(
    (value: string) => {
      const segments = location.pathname.split("/").filter(Boolean);
      const last = segments[segments.length - 1];
      if (last === value) return;
      if (order.includes(last as TabValue)) {
        segments.pop();
      }
      segments.push(value as TabValue);
      const target = joinPaths(...segments);
      window.history.pushState({}, "", target || "/");
    },
    [location.pathname, order],
  );

  const closeTarget = useMemo(() => {
    const segments = location.pathname.split("/").filter(Boolean);
    const playerIndex = segments.indexOf("player");
    const baseSegments =
      playerIndex === -1 ? segments : segments.slice(0, playerIndex);
    return baseSegments.length ? joinPaths(...baseSegments) : "/";
  }, [location.pathname]);

  const { rank, points } = useMemo(() => {
    if (edition) {
      const gamePlayers = players[edition?.config.project || ""] || [];
      const points =
        gamePlayers.find((player) => BigInt(player.address) === BigInt(address))
          ?.earnings || 0;
      const rank =
        gamePlayers.findIndex(
          (player) => BigInt(player.address) === BigInt(address),
        ) + 1;
      return { rank, points };
    }
    const points =
      globals.find((player) => BigInt(player.address) === BigInt(address))
        ?.earnings || 0;
    const rank =
      globals.findIndex(
        (player) => BigInt(player.address) === BigInt(address),
      ) + 1;
    return { rank, points };
  }, [globals, address, edition]);

  const following = useMemo(() => {
    const followeds = follows[getChecksumAddress(self || "0x0")] || [];
    return followeds.includes(getChecksumAddress(address));
  }, [follows, address, self]);

  const { follower, followerCount, followingCount, intersection } =
    useMemo(() => {
      const followeds = follows[getChecksumAddress(address)] || [];
      const follower = followeds.includes(getChecksumAddress(self || "0x0"));
      const followingCount = followeds.length;
      const followers = Object.keys(follows).filter((key) => {
        const followeds = follows[key] || [];
        return followeds.includes(getChecksumAddress(address));
      });
      const followerCount = followers.length;
      // Find intersection of addresses and self followeds
      const addresses = follows[getChecksumAddress(self || "0x0")] || [];
      const intersection = addresses
        .filter((address) => followers.includes(address))
        .map((address) => `0x${BigInt(address).toString(16)}`);
      return { follower, followerCount, followingCount, intersection };
    }, [follows, address, self]);

  const { data: followerUsernames } = useAccountsByAddresses(intersection);

  const followers = useMemo(() => {
    return followerUsernames
      .map((user) => user.username)
      .filter((name) => !!name) as string[];
  }, [followerUsernames]);

  const { data: username } = useAccountByAddress(address);
  const name = useMemo(() => {
    return (
      usernames[address] ||
      username?.username ||
      `0x${BigInt(address).toString(16)}`.slice(0, 9)
    );
  }, [usernames, address, username]);

  const Icon = useMemo(() => {
    return <UserAvatar username={name} className="h-full w-full" />;
  }, [name]);

  const handleFollowers = useCallback(() => {
    if (!isSelf) return;
    const controller = (connector as ControllerConnector)?.controller;
    if (!controller) {
      console.error("Connector not initialized");
      return;
    }
    controller.openProfileTo("inventory?social=followers&closable=true");
  }, [isSelf, connector]);

  const handleFollowing = useCallback(() => {
    if (!isSelf) return;
    const controller = (connector as ControllerConnector)?.controller;
    if (!controller) {
      console.error("Connector not initialized");
      return;
    }
    controller.openProfileTo("inventory?social=following&closable=true");
  }, [isSelf, connector]);

  const handleFollow = useCallback(
    (following: boolean, target: string) => {
      if (!account) return;
      const controller = (connector as ControllerConnector)?.controller;
      if (!controller) return;
      const process = async () => {
        setLoading(true);
        try {
          const calls = following
            ? provider.social.unfollow({ target })
            : provider.social.follow({ target });
          const res = await account.execute(calls);
          if (res) {
            toast.success(
              `Player ${following ? "unfollowed" : "followed"} successfully`,
            );
          }
        } catch (error) {
          console.error(error);
          toast.error(`Failed to ${following ? "unfollow" : "follow"} player`);
        } finally {
          setLoading(false);
        }
      };
      process();
    },
    [account, connector, setLoading],
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        window.location.href = closeTarget;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closeTarget]);

  return (
    <>
      <AchievementPlayerHeader
        username={name}
        address={address}
        points={points}
        icon={Icon}
        follower={follower}
        followerCount={followerCount}
        followingCount={followingCount}
        followers={followers}
        compacted={isSelf}
        rank={
          rank === 1
            ? "gold"
            : rank === 2
              ? "silver"
              : rank === 3
                ? "bronze"
                : "default"
        }
        onFollowersClick={isSelf ? handleFollowers : undefined}
        onFollowingClick={isSelf ? handleFollowing : undefined}
        className="relative p-3 pb-2 lg:p-6 lg:pb-0 gap-y-2 border-b border-background-200 lg:border-none pr-16"
      />
      <div className="absolute flex flex-col-reverse lg:flex-row gap-3 top-3 right-3 lg:top-6 lg:right-6">
        {!isSelf && isConnected && (
          <FollowButton
            following={following}
            loading={loading}
            handleFollow={() => handleFollow(following, address)}
          />
        )}
        <CloseButton closeTarget={closeTarget} />
      </div>
      <ArcadeTabs
        order={order}
        defaultValue={defaultValue as TabValue}
        onTabClick={(tab: TabValue) => handleClick(tab)}
        variant="light"
      >
        <div
          className="flex justify-center gap-8 w-full h-full overflow-y-scroll"
          style={{ scrollbarWidth: "none" }}
        >
          <TabsContent
            className="p-0 px-3 lg:px-6 mt-0 grow w-full"
            value="inventory"
          >
            <InventoryScene />
          </TabsContent>
          <TabsContent
            className="p-0 px-3 lg:px-6 mt-0 grow w-full"
            value="achievements"
          >
            <AchievementScene />
          </TabsContent>
          <TabsContent
            className="p-0 px-3 lg:px-6 mt-0 grow w-full h-full"
            value="activity"
          >
            <ActivityScene />
          </TabsContent>
          <TabsContent
            className="p-0 px-3 lg:px-6 mt-0 grow w-full h-full"
            value="positions"
          >
            <PositionsScene />
          </TabsContent>
        </div>
      </ArcadeTabs>
    </>
  );
}

function CloseButton({ closeTarget }: { closeTarget: string }) {
  return (
    <Link to={closeTarget}>
      <Button
        variant="secondary"
        size="icon"
        className="bg-background-200 hover:bg-background-300 h-9 w-9 rounded-full"
      >
        <TimesIcon size="sm" />
      </Button>
    </Link>
  );
}

function FollowButton({
  following,
  loading,
  handleFollow,
}: {
  following: boolean;
  loading: boolean;
  handleFollow: () => void;
}) {
  const [hover, setHover] = useState(false);
  if (!following) {
    return (
      <Button
        variant="secondary"
        onClick={handleFollow}
        disabled={loading}
        isLoading={loading}
        className={cn(
          "bg-background-200 hover:opacity-80 disabled:bg-background-125 normal-case font-normal tracking-normal font-sans text-sm transition-opacity",
          "h-9 px-2 lg:px-4 py-2 rounded-full",
        )}
      >
        <p className="hidden lg:block">Follow</p>
        <p className="block lg:hidden">
          <UserAddIcon variant="solid" size="sm" />
        </p>
      </Button>
    );
  }
  return (
    <Button
      variant="secondary"
      onClick={handleFollow}
      disabled={loading}
      isLoading={loading}
      className={cn(
        "group bg-background-125 border border-background-200 disabled:bg-background-125 normal-case font-normal tracking-normal font-sans text-sm transition-colors",
        "h-9 w-9 p-0 lg:px-4 lg:py-2 rounded-full lg:w-24 flex items-center justify-center",
        "text-destructive-100 bg-background-200 lg:text-foreground-300 lg:bg-background-125 hover:lg:text-destructive-100 hover:lg:bg-background-200",
      )}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {hover ? (
        <p className="hidden lg:block">Unfollow</p>
      ) : (
        <>
          <p className="text-center hidden lg:block">Following</p>
        </>
      )}
      <UserCheckIcon variant="solid" size="sm" className="lg:hidden" />
    </Button>
  );
}
