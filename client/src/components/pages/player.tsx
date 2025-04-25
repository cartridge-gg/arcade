import { InventoryScene } from "../scenes/inventory";
import { AchievementScene } from "../scenes/achievement";
import { useCallback, useMemo, useState } from "react";
import { useAchievements } from "@/hooks/achievements";
import {
  Button,
  cn,
  TabsContent,
  TabValue,
  TimesIcon,
} from "@cartridge/ui-next";
import { ActivityScene } from "../scenes/activity";
import { ArcadeTabs } from "../modules";
import { useNavigate, useSearchParams } from "react-router-dom";
import { EditionModel, GameModel } from "@bal7hazar/arcade-sdk";
import { useUsername, useUsernames } from "@/hooks/account";
import { useAddress } from "@/hooks/address";
import AchievementPlayerHeader from "../modules/player-header";
import { UserAvatar } from "../user/avatar";
import { useAccount } from "@starknet-react/core";
import { useArcade } from "@/hooks/arcade";
import ControllerConnector from "@cartridge/connector/controller";
import { constants, getChecksumAddress } from "starknet";
import { toast } from "sonner";

export function PlayerPage({ edition }: { edition: EditionModel | undefined }) {
  const [searchParams] = useSearchParams();
  const { address, isSelf, self } = useAddress();
  const { usernames, globals, players } = useAchievements();
  const [loading, setLoading] = useState(false);
  const { account, connector, isConnected } = useAccount();
  const { provider, follows } = useArcade();

  const navigate = useNavigate();

  const defaultValue = useMemo(() => {
    return searchParams.get("playerTab") || "inventory";
  }, [searchParams, address]);

  const handleClick = useCallback(
    (value: string) => {
      // Clicking on a tab updates the url param tab to the value of the tab
      // So the tab is persisted in the url and the user can update and share the url
      const url = new URL(window.location.href);
      url.searchParams.set("playerTab", value);
      navigate(url.toString().replace(window.location.origin, ""));
    },
    [navigate],
  );

  const handleClose = useCallback(() => {
    // On close, remove address from url
    const url = new URL(window.location.href);
    url.searchParams.delete("address");
    navigate(url.toString().replace(window.location.origin, ""));
  }, [navigate]);

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

  const { usernames: followerUsernames } = useUsernames({
    addresses: intersection,
  });

  const followers = useMemo(() => {
    return followerUsernames
      .map((user) => user.username)
      .filter((name) => !!name) as string[];
  }, [followerUsernames]);

  const { username } = useUsername({ address });
  const name = useMemo(() => {
    return usernames[address] || username;
  }, [usernames, address, username]);

  const Icon = useMemo(() => {
    return <UserAvatar username={name} className="h-full w-full" />;
  }, [name]);

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
          controller.switchStarknetChain(constants.StarknetChainId.SN_MAIN);
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
        className="relative p-3 pb-2 lg:p-6 lg:pb-0 gap-y-2 border-b border-background-200 lg:border-none"
      />
      <div className="absolute flex gap-3 top-3 right-3 lg:top-6 lg:right-6">
        {!isSelf && isConnected && (
          <FollowButton
            following={following}
            loading={loading}
            handleFollow={() => handleFollow(following, address)}
          />
        )}
        <CloseButton handleClose={handleClose} />
      </div>
      <ArcadeTabs
        order={["inventory", "achievements", "activity"]}
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
        </div>
      </ArcadeTabs>
    </>
  );
}

function CloseButton({ handleClose }: { handleClose: () => void }) {
  return (
    <Button
      variant="secondary"
      size="icon"
      onClick={handleClose}
      className="bg-background-200 hover:bg-background-300 h-9 w-9 rounded-full"
    >
      <TimesIcon size="sm" />
    </Button>
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
  return (
    <Button
      variant="secondary"
      onClick={handleFollow}
      disabled={loading}
      isLoading={loading}
      className={cn(
        "bg-background-125 disabled:bg-background-125 h-8 normal-case font-medium tracking-normal font-sans text-sm",
        "px-3 py-1.5",
      )}
    >
      {following ? "Unfollow" : "Follow"}
    </Button>
  );
}
