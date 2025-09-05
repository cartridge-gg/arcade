import { Link } from "@tanstack/react-router";
import { Empty, LayoutContent, Skeleton, TabsContent } from "@cartridge/ui";
import { useCallback, useMemo, useRef, useState } from "react";
import { EditionModel } from "@cartridge/arcade";
import { constants, getChecksumAddress } from "starknet";
import { Connect } from "../errors";
import LeaderboardRow from "../modules/leaderboard-row";
import { useAccount } from "@starknet-react/core";
import ArcadeSubTabs from "../modules/sub-tabs";
import { usePathBuilder } from "@/hooks/path-builder";
import { useLeaderboard } from "@/collections";
import { useFollowsQuery } from "@/queries/games";

const DEFAULT_CAP = 30;

export function Leaderboard({ edition }: { edition?: EditionModel }) {
  const { isConnected, address: address = "" } = useAccount();

  const { data: followsData = [] } = useFollowsQuery(address);

  // Convert follows to array of addresses
  const following = useMemo(() => {
    return followsData.map(f => getChecksumAddress(f.followeeAddress || f.followed));
  }, [followsData]);

  const { global, game } = useLeaderboard(edition?.config.project, following);
  console.log(global, game)

  const [cap, setCap] = useState(DEFAULT_CAP);
  const parentRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();

  const { buildPlayerPath } = usePathBuilder();

  // Cache address conversions
  const addressBigInt = useMemo(() => BigInt(address || "0x0"), [address]);

  // Cache following set for O(1) lookups
  const followingSet = useMemo(() => new Set(following), [following]);

  // Determine which data to use
  const leaderboardData = useMemo(() => {
    return edition ? game : global;
  }, [edition, game, global]);

  const filteredData = useMemo(() => {
    const allPlayers = leaderboardData.all.map((player) => {
      const isCurrentUser = BigInt(player.address) === addressBigInt;
      return {
        address: player.address,
        name: player.username || player.address.slice(0, 9),
        rank: player.rank || 0,
        points: player.earnings,
        highlight: isCurrentUser,
        pins: [],
        following: followingSet.has(player.address),
      };
    });

    const followingPlayers = leaderboardData.following.map((player) => {
      const isCurrentUser = BigInt(player.address) === addressBigInt;
      return {
        address: player.address,
        name: player.username || player.address.slice(0, 9),
        rank: player.rank || 0,
        points: player.earnings,
        highlight: isCurrentUser,
        pins: [],
        following: true,
      };
    });

    // Find self in all players
    const selfIndex = allPlayers.findIndex(p => p.highlight);
    const selfData = selfIndex >= 0 ? allPlayers[selfIndex] : null;

    // Apply cap with self always visible
    const allCapped = selfIndex < cap || !selfData
      ? allPlayers.slice(0, cap)
      : [...allPlayers.slice(0, cap - 1), selfData];

    const followingCapped = followingPlayers.length <= cap
      ? followingPlayers
      : followingPlayers.slice(0, cap);

    return {
      all: allCapped,
      following: followingCapped,
    };
  }, [leaderboardData, addressBigInt, followingSet, cap]);


  const isLoading = leaderboardData.status === 'loading' || leaderboardData.status === 'initialCommit';
  const isError = leaderboardData.status === 'error';

  if (isLoading && leaderboardData.all.length === 0) {
    return (
      <LayoutContent className="select-none h-full overflow-clip p-0">
        <div
          className="p-0 pt-3 lg:pt-6 mt-0 h-full overflow-y-scroll"
          style={{ scrollbarWidth: "none" }}
        >
          <LoadingState />
        </div>
      </LayoutContent>
    );
  }

  return (
    <LayoutContent className="select-none h-full overflow-clip p-0">
      <div
        className="p-0 pt-3 lg:pt-6 mt-0 h-full overflow-y-scroll"
        style={{ scrollbarWidth: "none" }}
      >
        <ArcadeSubTabs tabs={["all", "following"]} className="mb-3 lg:mb-4">
          <div
            className="flex justify-center gap-8 w-full h-full overflow-y-scroll"
            style={{ scrollbarWidth: "none" }}
          >
            <TabsContent
              className="p-0 mt-0 pb-3 lg:pb-6 grow w-full"
              value="all"
            >
              {isError || filteredData.all.length === 0 ? (
                <EmptyState />
              ) : (
                <div
                  ref={parentRef}
                  className="relative flex flex-col gap-y-px h-full rounded overflow-y-scroll"
                  style={{ scrollbarWidth: "none" }}
                >
                  {filteredData.all.map((item, index) => {
                    const playerPath = buildPlayerPath(item.address, "achievements");
                    return (
                      <Link key={index} to={playerPath}>
                        <LeaderboardRow
                          pins={[]}
                          rank={item.rank}
                          name={item.name}
                          points={item.points}
                          highlight={item.highlight}
                          following={item.following}
                        />
                      </Link>
                    );
                  })}
                </div>
              )}
            </TabsContent>
            <TabsContent
              className="p-0 mt-0 pb-3 lg:pb-6 grow w-full"
              value="following"
            >
              {!isConnected ? (
                <Connect />
              ) : isError || filteredData.following.length === 0 ? (
                <EmptyState />
              ) : (
                <div
                  ref={parentRef}
                  className="relative flex flex-col gap-y-px h-full rounded overflow-y-scroll"
                  style={{ scrollbarWidth: "none" }}
                >
                  {filteredData.following.map((item, index) => {
                    const playerPath = buildPlayerPath(item.address, "achievements");
                    return (
                      <Link key={index} to={playerPath}>
                        <LeaderboardRow
                          pins={[]}
                          rank={item.rank}
                          name={item.name}
                          points={item.points}
                          highlight={item.highlight}
                        />
                      </Link>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </div>
        </ArcadeSubTabs>
      </div>
    </LayoutContent>
  );
}

const LoadingState = () => {
  return (
    <div className="flex flex-col gap-y-px overflow-hidden h-full">
      {Array.from({ length: 20 }).map((_, index) => (
        <Skeleton key={index} className="min-h-11 w-full" />
      ))}
    </div>
  );
};

const EmptyState = () => {
  return (
    <Empty
      title="No leaderboard available for this game."
      icon="leaderboard"
      className="h-full"
    />
  );
};
