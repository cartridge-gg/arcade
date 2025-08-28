import { Empty, LayoutContent, Skeleton, TabsContent } from "@cartridge/ui";
import { useMemo, useRef } from "react";
import { EditionModel, GameModel } from "@cartridge/arcade";
import { Connect } from "../errors";
import { constants, getChecksumAddress } from "starknet";
import { ArcadeDiscoveryGroup } from "../modules/discovery-group";
import { ArcadeDiscoveryEventProps } from "../modules/discovery-event";
import ArcadeSubTabs from "../modules/sub-tabs";
import { useAccount } from "@starknet-react/core";
import { UserAvatar } from "../user/avatar";
import { usePathBuilder } from "@/hooks/path-builder";
import { usePlaythroughsQuery } from "@/queries/discovery";
import {
  useEditionsQuery,
  useFollowsQuery,
  useGamesQuery,
} from "@/queries/games";


export function Discover({ edition }: { edition?: EditionModel }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const { isConnected, address } = useAccount();

  const { data: gamesRaw = [] } = useGamesQuery(
    constants.StarknetChainId.SN_MAIN,
  );
  const games = useMemo(() => {
    return new Map(gamesRaw.map((g) => [g.id, g]));
  }, [gamesRaw]);
  const { data: editions = [] } = useEditionsQuery(
    constants.StarknetChainId.SN_MAIN,
  );
  const projects = useMemo(
    () => editions.map((e) => ({ project: e.config.project, limit: 1000 })),
    [editions],
  );

  const {
    data: playthroughs = {},
    usernames: activitiesUsernames = {},
    status: activitiesStatus,
  } = usePlaythroughsQuery(projects, 1000);


  // const { data: usernames } = useAccountNamesQuery(playerAddresses);
  const { data: followsData = [], isLoading: followsLoading } = useFollowsQuery(
    address || "",
  );

  // Transform Follow[] to { [playerId: string]: string[] }
  const follows = useMemo(() => {
    const followsMap: { [playerId: string]: string[] } = {};
    followsData.forEach((follow) => {
      const follower = getChecksumAddress(
        follow.followerAddress || follow.follower,
      );
      const followed = getChecksumAddress(
        follow.followeeAddress || follow.followed,
      );
      if (!followsMap[follower]) {
        followsMap[follower] = [];
      }
      followsMap[follower].push(followed);
    });
    return followsMap;
  }, [followsData]);

  // Memoize checksum computation
  const checksumAddress = useMemo(() => {
    return address ? getChecksumAddress(address) : null;
  }, [address]);

  // Convert following to Set for O(1) lookups
  const followingSet = useMemo(() => {
    if (!checksumAddress) return new Set<string>();
    const addresses = follows[checksumAddress] || [];
    if (addresses.length === 0) return new Set<string>();
    return new Set([...addresses, checksumAddress]);
  }, [follows, checksumAddress]);

  const filteredEditions = useMemo(() => {
    return !edition ? editions : [edition];
  }, [editions, edition]);

  const { buildPlayerPath, buildGamePath } = usePathBuilder();

  const createEventLink = useMemo(() => {
    return (game: GameModel, edition: EditionModel, nameOrAddress: string) => {
      // If there are several games displayed, then clicking a card links to the game
      if (filteredEditions.length > 1) {
        const gameName = game?.name || game.id.toString();
        const editionName = edition?.name || edition.id.toString();
        if (game.id !== 0) {
          return buildGamePath(gameName, editionName);
        }
        return "/";
      }
      // Otherwise it links to the player
      return buildPlayerPath(nameOrAddress, "activity");
    };
  }, [filteredEditions, buildPlayerPath, buildGamePath]);

  // Cache checksum addresses to avoid repeated computation
  const addressChecksumCache = useMemo(() => {
    const cache = new Map<string, string>();
    // Pre-compute checksums for all known addresses
    Object.values(playthroughs).forEach((activities) => {
      activities?.forEach((activity) => {
        if (!cache.has(activity.callerAddress)) {
          cache.set(
            activity.callerAddress,
            getChecksumAddress(activity.callerAddress),
          );
        }
      });
    });
    return cache;
  }, [playthroughs]);

  // Compute raw events without sorting first
  const rawEvents = useMemo(() => {
    const events: ArcadeDiscoveryEventProps[] = [];

    for (const edition of filteredEditions) {
      const activities = playthroughs[edition?.config.project];
      if (!activities) continue;

      const game = games.get(edition.gameId);
      if (!game) continue;

      for (const activity of activities) {
        const checksumAddr =
          addressChecksumCache.get(activity.callerAddress) ||
          getChecksumAddress(activity.callerAddress);
        const username = activitiesUsernames[checksumAddr];

        events.push({
          identifier: activity.identifier,
          name: username,
          address: checksumAddr,
          Icon: (
            <UserAvatar
              username={username ?? activity.callerAddress}
              size="sm"
            />
          ),
          duration: activity.end - activity.start,
          count: activity.count,
          actions: activity.actions,
          achievements: [...activity.achievements],
          timestamp: Math.floor(activity.end / 1000),
          logo: edition.properties.icon,
          color: edition.color,
          link: createEventLink(game, edition, username || checksumAddr),
        });
      }
    }

    return events;
  }, [
    activitiesUsernames,
    addressChecksumCache,
    filteredEditions,
    games,
    createEventLink,
    playthroughs,
  ]);

  // Sort events separately
  const sortedEvents = useMemo(() => {
    return [...rawEvents].sort((a, b) => b.timestamp - a.timestamp);
  }, [rawEvents]);

  // Filter following events using Set for O(1) lookups
  const events = useMemo(() => {
    const followingEvents =
      followingSet.size > 0
        ? sortedEvents.filter((event) => followingSet.has(event.address))
        : [];

    return {
      all: sortedEvents,
      following: followingEvents,
    };
  }, [sortedEvents, followingSet]);

  return (
    <LayoutContent className="h-full overflow-clip select-none p-0">
      <div
        className="p-0 pt-3 lg:pt-0 my-3 lg:my-6 mt-0 rounded h-full overflow-y-scroll"

        style={{ scrollbarWidth: "none" }}
      >
        <ArcadeSubTabs tabs={["all", "following"]} className="mb-3 lg:mb-4">
          <div
            ref={parentRef}
            className="flex justify-center gap-8 w-full overflow-y-scroll"
          >
            <TabsContent className="p-0 mt-0 grow w-full" value="all">
              {activitiesStatus === "loading" && events.all.length === 0 ? (
                <LoadingState />
              ) : activitiesStatus === "error" || events.all.length === 0 ? (
                <EmptyState />
              ) : (
                <ArcadeDiscoveryGroup
                  events={events.all.slice(0, 50)}
                  rounded
                  identifier={
                    filteredEditions.length === 1
                      ? filteredEditions[0].id
                      : undefined
                  }
                />
              )}
            </TabsContent>
            <TabsContent className="p-0 mt-0 grow w-full" value="following">
              {!isConnected ? (
                <Connect />
              ) : (activitiesStatus === "loading" || followsLoading) &&
                events.following.length === 0 ? (
                <LoadingState />
              ) : activitiesStatus === "error" ||
                followingSet.size === 0 ||
                events.following.length === 0 ? (
                <EmptyState />
              ) : (
                <ArcadeDiscoveryGroup
                  events={events.following.slice(0, cap)}
                  rounded
                  identifier={
                    filteredEditions.length === 1
                      ? filteredEditions[0].id
                      : undefined
                  }
                />
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
    <Empty title="It feels lonely in here" icon="discover" className="h-full" />
  );
};
