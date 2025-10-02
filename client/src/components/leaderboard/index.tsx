import { useRouterState } from "@tanstack/react-router";
import { cn, Empty, LayoutContent, Skeleton, TabsContent } from "@cartridge/ui";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useArcade } from "@/hooks/arcade";
import type { EditionModel } from "@cartridge/arcade";
import { getChecksumAddress } from "starknet";
import { useAchievements } from "@/hooks/achievements";
import { Connect } from "../errors";
import LeaderboardRow from "../modules/leaderboard-row";
import { useAccount } from "@starknet-react/core";
import ArcadeSubTabs from "../modules/sub-tabs";
import { joinPaths } from "@/helpers";

const DEFAULT_CAP = 30;
const ROW_HEIGHT = 44;

export function Leaderboard({ edition }: { edition?: EditionModel }) {
  const { isConnected, address } = useAccount();
  const { achievements, globals, players, usernames, isLoading, isError } =
    useAchievements();
  const { pins, follows } = useArcade();
  const [cap, setCap] = useState(DEFAULT_CAP);
  const parentRef = useRef<HTMLDivElement>(null);

  const following = useMemo(() => {
    if (!address) return [];
    const addresses = follows[getChecksumAddress(address)] || [];
    if (addresses.length === 0) return [];
    return [...addresses, getChecksumAddress(address)];
  }, [follows, address]);

  const { location } = useRouterState();

  const gamePlayers = useMemo(() => {
    return players[edition?.config.project || ""] || [];
  }, [players, edition]);

  const gameAchievements = useMemo(() => {
    return achievements[edition?.config.project || ""] || [];
  }, [achievements, edition]);

  const getPlayerTarget = useCallback(
    (nameOrAddress: string) => {
      const segments = location.pathname.split("/").filter(Boolean);
      const playerIndex = segments.indexOf("player");
      if (playerIndex !== -1) {
        segments.splice(playerIndex);
      }
      const player = nameOrAddress.toLowerCase();
      const targetSegments = [...segments, "player", player, "achievements"];
      return joinPaths(...targetSegments) || "/";
    },
    [location.pathname],
  );

  const gameData = useMemo(() => {
    let rank = 0;
    const data = gamePlayers.map((player, index) => {
      if (BigInt(player.address) === BigInt(address || "0x0")) rank = index + 1;
      const ids = pins[getChecksumAddress(player.address)] || [];
      const pinneds: { id: string; icon: string }[] = gameAchievements
        .filter(
          (item) =>
            player.completeds.includes(item.id) &&
            (ids.length === 0 || ids.includes(item.id)),
        )
        .sort((a, b) => a.id.localeCompare(b.id))
        .sort(
          (a, b) =>
            Number.parseFloat(a.percentage) - Number.parseFloat(b.percentage),
        )
        .slice(0, 3)
        .map((item) => {
          return {
            id: item.id,
            icon: item.icon,
          };
        });
      return {
        address: getChecksumAddress(player.address),
        name:
          usernames[getChecksumAddress(player.address)] ||
          player.address.slice(0, 9),
        rank: index + 1,
        points: player.earnings,
        highlight: BigInt(player.address) === BigInt(address || "0x0"),
        pins: pinneds,
        following: following.includes(getChecksumAddress(player.address)),
      };
    });
    const selfData = data.find(
      (player) => BigInt(player.address) === BigInt(address || "0x0"),
    );
    const newAll =
      rank < cap || !selfData
        ? data.slice(0, cap)
        : [...data.slice(0, cap - 1), selfData];
    const filtereds = data.filter((player) =>
      following.includes(getChecksumAddress(player.address)),
    );
    const position = filtereds.findIndex(
      (player) => BigInt(player.address) === BigInt(address || "0x0"),
    );
    const newFollowings =
      position < cap || !selfData
        ? filtereds.slice(0, cap)
        : [...filtereds.slice(0, cap - 1), selfData];
    return {
      all: newAll,
      following: newFollowings,
    };
  }, [gamePlayers, gameAchievements, address, pins, usernames, following, cap]);

  const gamesData = useMemo(() => {
    let rank = 0;
    const data = globals.map((player, index) => {
      if (BigInt(player.address) === BigInt(address || "0x0")) rank = index + 1;
      return {
        address: getChecksumAddress(player.address),
        name:
          usernames[getChecksumAddress(player.address)] ||
          player.address.slice(0, 9),
        rank: index + 1,
        points: player.earnings,
        highlight: BigInt(player.address) === BigInt(address || "0x0"),
        following: following.includes(getChecksumAddress(player.address)),
      };
    });
    const selfData = data.find(
      (player) => BigInt(player.address) === BigInt(address || "0x0"),
    );
    const newAll =
      rank < cap || !selfData
        ? data.slice(0, cap)
        : [...data.slice(0, cap - 1), selfData];
    const filtereds = data.filter((player) =>
      following.includes(getChecksumAddress(player.address)),
    );
    const position = filtereds.findIndex(
      (player) => BigInt(player.address) === BigInt(address || "0x0"),
    );
    const newFollowings =
      position < cap || !selfData
        ? filtereds.slice(0, cap)
        : [...filtereds.slice(0, cap - 1), selfData];
    return {
      all: newAll,
      following: newFollowings,
    };
  }, [globals, address, usernames, following, cap]);

  const filteredData = useMemo(() => {
    if (!edition) return gamesData;
    return gameData;
  }, [edition, gamesData, gameData]);

  const handleScroll = useCallback(() => {
    const parent = parentRef.current;
    if (!parent) return;
    const height = parent.clientHeight;
    const newCap = Math.ceil((height + parent.scrollTop) / ROW_HEIGHT);
    if (newCap < cap) return;
    setCap(newCap + 5);
  }, [parentRef, cap, setCap]);

  useEffect(() => {
    const parent = parentRef.current;
    if (parent) {
      parent.addEventListener("scroll", handleScroll);
    }
    return () => {
      if (parent) {
        parent.removeEventListener("scroll", handleScroll);
      }
    };
  }, [cap, parentRef, handleScroll]);

  useEffect(() => {
    // Reset scroll and cap on filter change
    const parent = parentRef.current;
    if (!parent) return;
    parent.scrollTop = 0;
    const height = parent.clientHeight;
    const cap = Math.ceil((height + parent.scrollTop) / ROW_HEIGHT);
    setCap(cap + 5);
  }, [parentRef, edition, setCap]);

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
              className={cn(
                "p-0 mt-0 lg:pb-6 grow w-full",
                filteredData.all.some((d) => d.highlight) ? "pb-3" : "pb-0",
              )}
              value="all"
            >
              {isLoading && filteredData.all.length === 0 ? (
                <LoadingState />
              ) : isError || filteredData.all.length === 0 ? (
                <EmptyState
                  className={cn(
                    filteredData.all.some((d) => d.highlight) ? "pb-0" : "pb-3",
                  )}
                />
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
                      to={getPlayerTarget(item.address)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
            <TabsContent
              className={cn(
                "p-0 mt-0 lg:pb-6 grow w-full",
                filteredData.following.some((d) => d.highlight)
                  ? "pb-3"
                  : "pb-0",
              )}
              value="following"
            >
              {!isConnected ? (
                <Connect
                  className={cn(
                    filteredData.all.some((d) => d.highlight) ? "pb-0" : "pb-3",
                  )}
                />
              ) : isLoading && gamesData.following.length === 0 ? (
                <LoadingState />
              ) : isError || filteredData.following.length === 0 ? (
                <EmptyState
                  className={cn(
                    filteredData.all.some((d) => d.highlight) ? "pb-0" : "pb-3",
                  )}
                />
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
                      to={getPlayerTarget(item.address)}
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

const EmptyState = ({ className }: { className?: string }) => {
  return (
    <Empty
      title="No leaderboard available for this game."
      icon="leaderboard"
      className={cn("h-full", className)}
    />
  );
};
