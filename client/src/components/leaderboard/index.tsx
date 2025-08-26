import { useNavigate, useRouterState } from "@tanstack/react-router";
import { Empty, LayoutContent, Skeleton, TabsContent } from "@cartridge/ui";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useArcade } from "@/hooks/arcade";
import { EditionModel } from "@cartridge/arcade";
import { constants, getChecksumAddress } from "starknet";
import { useAchievements } from "@/hooks/achievements";
import { Connect } from "../errors";
import LeaderboardRow from "../modules/leaderboard-row";
import { useAccount } from "@starknet-react/core";
import ArcadeSubTabs from "../modules/sub-tabs";
import { joinPaths } from "@/helpers";
import { useAchievementsQuery } from "@/queries/achievements";
import {
  usePinsQuery,
  useFollowsQuery,
  useEditionsQuery,
} from "@/queries/games";

const DEFAULT_CAP = 30;
const ROW_HEIGHT = 44;
const SCROLL_THROTTLE_MS = 100;

export function Leaderboard({ edition }: { edition?: EditionModel }) {
  const { isConnected, address: address = "" } = useAccount();

  const { data: editions = [] } = useEditionsQuery(
    constants.StarknetChainId.SN_MAIN,
  );
  const { achievements, globals, players, usernames, isLoading, isError } =
    useAchievementsQuery(editions);
  const { data: following = [] } = useFollowsQuery(address);
  const { data: pins = [] } = usePinsQuery(address);

  const [cap, setCap] = useState(DEFAULT_CAP);
  const parentRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();

  const navigate = useNavigate();

  // Cache address conversions
  const addressBigInt = useMemo(() => BigInt(address || "0x0"), [address]);

  // Cache following set for O(1) lookups
  const followingSet = useMemo(() => new Set(following), [following]);

  const gamePlayers = useMemo(() => {
    return players[edition?.config.project || ""] || [];
  }, [players, edition]);

  const gameAchievements = useMemo(() => {
    return achievements[edition?.config.project || ""] || [];
  }, [achievements, edition]);

  // Cache checksum addresses for all players
  const playerChecksums = useMemo(() => {
    const checksums = new Map();
    [...gamePlayers, ...globals].forEach((player) => {
      checksums.set(player.address, getChecksumAddress(player.address));
    });
    return checksums;
  }, [gamePlayers, globals]);

  const routerState = useRouterState();
  const location = { pathname: routerState.location.pathname };
  const handleClick = useCallback(
    (nameOrAddress: string) => {
      let pathname = location.pathname;
      pathname = pathname.replace(/\/player\/[^/]+/, "");
      pathname = pathname.replace(/\/tab\/[^/]+/, "");
      const player = nameOrAddress.toLowerCase();
      pathname = joinPaths(pathname, `/player/${player}/tab/achievements`);
      navigate({ to: pathname || "/" });
    },
    [location, navigate],
  );

  // Helper function to process player data
  const processPlayerData = useCallback(
    (players: any[], includeAchievements: boolean = false) => {
      let selfRank = -1;
      let selfIndex = -1;

      const data = players.map((player, index) => {
        const playerBigInt = BigInt(player.address);
        const isCurrentUser = playerBigInt === addressBigInt;
        if (isCurrentUser) {
          selfRank = index + 1;
          selfIndex = index;
        }

        const checksumAddress =
          playerChecksums.get(player.address) ||
          getChecksumAddress(player.address);
        const playerPins = pins[checksumAddress] || [];

        let pinnedAchievements = [];
        if (includeAchievements && gameAchievements.length > 0) {
          const completedAchievements = gameAchievements.filter(
            (item) =>
              player.completeds?.includes(item.id) &&
              (playerPins.length === 0 || playerPins.includes(item.id)),
          );

          pinnedAchievements = completedAchievements
            .sort((a, b) => {
              const percentageDiff =
                parseFloat(a.percentage) - parseFloat(b.percentage);
              return percentageDiff !== 0
                ? percentageDiff
                : a.id.localeCompare(b.id);
            })
            .slice(0, 3)
            .map((item) => ({ id: item.id, icon: item.icon }));
        }

        return {
          address: checksumAddress,
          name: usernames[checksumAddress] || player.address.slice(0, 9),
          rank: index + 1,
          points: player.earnings,
          highlight: isCurrentUser,
          pins: pinnedAchievements,
          following: followingSet.has(checksumAddress),
        };
      });

      const selfData = selfIndex >= 0 ? data[selfIndex] : null;
      const followingData = data.filter((player) => player.following);
      const followingPosition = followingData.findIndex(
        (player) => player.highlight,
      );

      return {
        data,
        selfData,
        selfRank,
        followingData,
        followingPosition,
      };
    },
    [
      addressBigInt,
      playerChecksums,
      pins,
      gameAchievements,
      usernames,
      followingSet,
    ],
  );

  const gameData = useMemo(() => {
    const { data, selfData, selfRank, followingData, followingPosition } =
      processPlayerData(gamePlayers, true);

    const all =
      selfRank < cap || !selfData
        ? data.slice(0, cap)
        : [...data.slice(0, cap - 1), selfData];

    const following =
      followingPosition < cap || !selfData
        ? followingData.slice(0, cap)
        : [...followingData.slice(0, cap - 1), selfData];

    return { all, following };
  }, [gamePlayers, processPlayerData, cap]);

  const gamesData = useMemo(() => {
    const { data, selfData, selfRank, followingData, followingPosition } =
      processPlayerData(globals, false);

    const all =
      selfRank < cap || !selfData
        ? data.slice(0, cap)
        : [...data.slice(0, cap - 1), selfData];

    const following =
      followingPosition < cap || !selfData
        ? followingData.slice(0, cap)
        : [...followingData.slice(0, cap - 1), selfData];

    return { all, following };
  }, [globals, processPlayerData, cap]);

  const filteredData = useMemo(() => {
    return edition ? gameData : gamesData;
  }, [edition, gamesData, gameData]);

  const handleScroll = useCallback(() => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    scrollTimeoutRef.current = setTimeout(() => {
      const parent = parentRef.current;
      if (!parent) return;
      const height = parent.clientHeight;
      const newCap = Math.ceil((height + parent.scrollTop) / ROW_HEIGHT);
      if (newCap > cap) {
        setCap(newCap + 5);
      }
    }, SCROLL_THROTTLE_MS);
  }, [cap]);

  useEffect(() => {
    const parent = parentRef.current;
    if (parent) {
      parent.addEventListener("scroll", handleScroll);
    }
    return () => {
      if (parent) {
        parent.removeEventListener("scroll", handleScroll);
      }
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [handleScroll]);

  useEffect(() => {
    const parent = parentRef.current;
    if (!parent) return;
    parent.scrollTop = 0;
    const height = parent.clientHeight;
    const newCap = Math.ceil(height / ROW_HEIGHT) + 5;
    setCap(newCap);
  }, [edition]);

  if (isLoading && !gamePlayers.length && !globals.length) {
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
                  {filteredData.all.map((item, index) => (
                    <LeaderboardRow
                      key={index}
                      pins={[]}
                      rank={item.rank}
                      name={item.name}
                      points={item.points}
                      highlight={item.highlight}
                      following={item.following}
                      onClick={() => handleClick(item.address)}
                    />
                  ))}
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
                  {filteredData.following.map((item, index) => (
                    <LeaderboardRow
                      key={index}
                      pins={[]}
                      rank={item.rank}
                      name={item.name}
                      points={item.points}
                      highlight={item.highlight}
                      onClick={() => handleClick(item.address)}
                    />
                  ))}
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
